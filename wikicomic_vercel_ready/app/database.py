import os
import logging
import base64
from datetime import datetime
from io import BytesIO
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
from gridfs import GridFS
from PIL import Image
import json

logger = logging.getLogger(__name__)

class MongoDBManager:
    def __init__(self, app=None):
        self.client = None
        self.db = None
        self.fs = None
        self.images_collection = None
        self.comics_collection = None
        self.scenes_collection = None
        self.connected = False
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize MongoDB connection with Flask app"""
        try:
            # Check if MongoDB URI is configured
            mongodb_uri = app.config.get('MONGODB_URI')
            if not mongodb_uri:
                logger.error("❌ MONGODB_URI environment variable is not set")
                logger.info("💡 Please set up MongoDB Atlas and configure MONGODB_URI in your environment variables")
                self.connected = False
                return
            
            # Connect to MongoDB
            self.client = MongoClient(
                mongodb_uri,
                server_api=ServerApi('1'),
                serverSelectionTimeoutMS=10000,  # 10 second timeout
                connectTimeoutMS=10000
            )
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("✅ Successfully connected to MongoDB!")
            
            # Initialize database and collections
            self.db = self.client[app.config['MONGODB_DB_NAME']]
            self.fs = GridFS(self.db)
            
            self.images_collection = self.db[app.config['MONGODB_COLLECTION_IMAGES']]
            self.comics_collection = self.db[app.config['MONGODB_COLLECTION_COMICS']]
            self.scenes_collection = self.db[app.config['MONGODB_COLLECTION_SCENES']]
            
            # Create indexes for better performance
            self._create_indexes()
            
            self.connected = True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"❌ MongoDB connection failed: {e}")
            logger.info("💡 Please check your MONGODB_URI and ensure MongoDB Atlas is accessible")
            self.connected = False
            # Don't raise the exception - allow the app to start without MongoDB
        except Exception as e:
            logger.error(f"❌ MongoDB initialization error: {e}")
            self.connected = False
            # Don't raise the exception - allow the app to start without MongoDB
    
    def _check_connection(self):
        """Check if MongoDB is connected before performing operations"""
        if not self.connected:
            logger.error("❌ MongoDB is not connected. Please check your configuration.")
            return False
        return True
    
    def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Index for images collection
            self.images_collection.create_index([("comic_title", 1)])
            self.images_collection.create_index([("scene_number", 1)])
            self.images_collection.create_index([("created_at", -1)])
            
            # Index for comics collection
            self.comics_collection.create_index([("title", 1)])
            self.comics_collection.create_index([("created_at", -1)])
            
            # Index for scenes collection
            self.scenes_collection.create_index([("comic_id", 1)])
            self.scenes_collection.create_index([("scene_number", 1)])
            
            logger.info("✅ Database indexes created successfully")
        except Exception as e:
            logger.warning(f"⚠️ Index creation failed: {e}")
    
    def store_image(self, image_data: bytes, comic_title: str, scene_number: int, 
                   scene_text: str, metadata: Dict[str, Any] = None) -> str:
        """
        Store image in GridFS with metadata
        
        Args:
            image_data: Raw image bytes
            comic_title: Title of the comic
            scene_number: Scene number
            scene_text: Text/description for the scene
            metadata: Additional metadata
            
        Returns:
            ObjectId of the stored image
        """
        if not self._check_connection():
            raise ConnectionError("MongoDB is not connected")
            
        try:
            # Prepare metadata
            file_metadata = {
                "comic_title": comic_title,
                "scene_number": scene_number,
                "scene_text": scene_text,
                "content_type": "image/png",
                "created_at": datetime.utcnow(),
                **(metadata or {})
            }
            
            # Store in GridFS
            file_id = self.fs.put(
                image_data,
                filename=f"{comic_title}_scene_{scene_number}.png",
                metadata=file_metadata
            )
            
            # Store reference in images collection
            image_doc = {
                "_id": file_id,
                "comic_title": comic_title,
                "scene_number": scene_number,
                "scene_text": scene_text,
                "file_size": len(image_data),
                "created_at": datetime.utcnow(),
                "metadata": metadata or {}
            }
            
            self.images_collection.insert_one(image_doc)
            
            logger.info(f"✅ Image stored successfully: {file_id}")
            return str(file_id)
            
        except Exception as e:
            logger.error(f"❌ Failed to store image: {e}")
            raise
    
    def get_image(self, image_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve image from GridFS
        
        Args:
            image_id: ObjectId of the image
            
        Returns:
            Dictionary with image data and metadata
        """
        if not self._check_connection():
            logger.error("❌ Cannot retrieve image: MongoDB is not connected")
            return None
            
        try:
            # Get file from GridFS
            grid_out = self.fs.get(ObjectId(image_id))
            
            # Get metadata from images collection
            image_doc = self.images_collection.find_one({"_id": ObjectId(image_id)})
            
            if not image_doc:
                return None
            
            return {
                "image_data": grid_out.read(),
                "metadata": image_doc,
                "content_type": grid_out.content_type
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve image {image_id}: {e}")
            return None
    
    def store_comic(self, title: str, scenes: List[Dict], style: str = "Manga") -> str:
        """
        Store comic metadata
        
        Args:
            title: Comic title
            scenes: List of scene data
            style: Comic style
            
        Returns:
            ObjectId of the stored comic
        """
        if not self._check_connection():
            raise ConnectionError("MongoDB is not connected")
            
        try:
            comic_doc = {
                "title": title,
                "style": style,
                "scenes": scenes,
                "scene_count": len(scenes),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = self.comics_collection.insert_one(comic_doc)
            logger.info(f"✅ Comic stored successfully: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"❌ Failed to store comic: {e}")
            raise
    
    def get_comic(self, comic_id: str) -> Optional[Dict[str, Any]]:
        """Get comic by ID"""
        if not self._check_connection():
            logger.error("❌ Cannot retrieve comic: MongoDB is not connected")
            return None
            
        try:
            return self.comics_collection.find_one({"_id": ObjectId(comic_id)})
        except Exception as e:
            logger.error(f"❌ Failed to get comic {comic_id}: {e}")
            return None
    
    def get_all_comics(self) -> List[Dict[str, Any]]:
        """Get all comics with their scenes and images"""
        if not self._check_connection():
            logger.error("❌ Cannot retrieve comics: MongoDB is not connected")
            return []
            
        try:
            comics = []
            for comic in self.comics_collection.find().sort("created_at", -1):
                comic_id = str(comic["_id"])
                
                # Get images for this comic
                images = self.images_collection.find({"comic_title": comic["title"]}).sort("scene_number", 1)
                
                # Convert images to list with proper URLs
                image_list = []
                for img in images:
                    image_list.append({
                        "id": str(img["_id"]),
                        "url": f"/api/images/{img['_id']}",
                        "scene_number": img["scene_number"],
                        "scene_text": img["scene_text"]
                    })
                
                comic["images"] = image_list
                comic["_id"] = comic_id
                comics.append(comic)
            
            return comics
            
        except Exception as e:
            logger.error(f"❌ Failed to get all comics: {e}")
            return []
    
    def get_comic_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """Get comic by title"""
        if not self._check_connection():
            logger.error("❌ Cannot retrieve comic: MongoDB is not connected")
            return None
            
        try:
            comic = self.comics_collection.find_one({"title": title})
            if comic:
                comic["_id"] = str(comic["_id"])
                return comic
            return None
        except Exception as e:
            logger.error(f"❌ Failed to get comic by title {title}: {e}")
            return None
    
    def delete_comic(self, comic_id: str) -> bool:
        """Delete comic and all associated images"""
        if not self._check_connection():
            logger.error("❌ Cannot delete comic: MongoDB is not connected")
            return False
            
        try:
            # Get comic to find associated images
            comic = self.get_comic(comic_id)
            if not comic:
                return False
            
            # Delete all images for this comic
            images = self.images_collection.find({"comic_title": comic["title"]})
            for img in images:
                try:
                    self.fs.delete(img["_id"])
                except:
                    pass  # Image might already be deleted
            
            # Delete image documents
            self.images_collection.delete_many({"comic_title": comic["title"]})
            
            # Delete comic document
            result = self.comics_collection.delete_one({"_id": ObjectId(comic_id)})
            
            logger.info(f"✅ Comic deleted successfully: {comic_id}")
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"❌ Failed to delete comic {comic_id}: {e}")
            return False
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("✅ MongoDB connection closed")

# Global instance
db_manager = MongoDBManager() 