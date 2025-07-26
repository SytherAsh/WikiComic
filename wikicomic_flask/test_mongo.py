#!/usr/bin/env python3
"""
Test script to verify MongoDB connection and basic operations
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import MongoDBManager
from app.config import Config
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    
    print("🔍 Testing MongoDB Connection...")
    
    try:
        # Initialize config and database
        config = Config()
        db_manager = MongoDBManager()
        
        # Create a mock Flask app for initialization
        class MockApp:
            def __init__(self):
                self.config = {
                    'MONGODB_URI': config.MONGODB_URI,
                    'MONGODB_DB_NAME': config.MONGODB_DB_NAME,
                    'MONGODB_COLLECTION_IMAGES': config.MONGODB_COLLECTION_IMAGES,
                    'MONGODB_COLLECTION_COMICS': config.MONGODB_COLLECTION_COMICS,
                    'MONGODB_COLLECTION_SCENES': config.MONGODB_COLLECTION_SCENES
                }
        
        db_manager.init_app(MockApp())
        
        print("✅ MongoDB connection successful!")
        
        # Test basic operations
        print("\n🔍 Testing basic operations...")
        
        # Test storing a simple comic
        test_comic_title = "Test Comic"
        test_scenes = [
            {
                "image_id": "test_id_1",
                "image_url": "/api/images/test_id_1",
                "scene_number": 1,
                "scene_text": "This is a test scene"
            }
        ]
        
        comic_id = db_manager.store_comic(test_comic_title, test_scenes, "Manga")
        print(f"✅ Test comic stored with ID: {comic_id}")
        
        # Test retrieving the comic
        retrieved_comic = db_manager.get_comic(comic_id)
        if retrieved_comic:
            print(f"✅ Test comic retrieved: {retrieved_comic['title']}")
        else:
            print("❌ Failed to retrieve test comic")
        
        # Test getting all comics
        all_comics = db_manager.get_all_comics()
        print(f"✅ Retrieved {len(all_comics)} comics from database")
        
        # Clean up test data
        db_manager.delete_comic(comic_id)
        print("✅ Test data cleaned up")
        
        print("\n🎉 All tests passed! MongoDB is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    finally:
        if 'db_manager' in locals():
            db_manager.close()
    
    return True

if __name__ == "__main__":
    success = test_mongodb_connection()
    if success:
        print("\n🚀 MongoDB setup is ready for use!")
    else:
        print("\n⚠️ Please check your MongoDB configuration and try again.") 