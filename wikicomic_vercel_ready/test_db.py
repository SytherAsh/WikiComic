#!/usr/bin/env python3
"""
Test script to directly query the database
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Load environment variables
load_dotenv()

def test_database():
    """Test database connection and query comics"""
    try:
        # Get MongoDB URI
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            print("❌ MONGODB_URI not found in environment variables")
            return
        
        print(f"🔍 Connecting to MongoDB...")
        print(f"🔍 URI length: {len(mongodb_uri)}")
        
        # Connect to MongoDB
        client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
        
        # Test connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Get database and collections
        db_name = os.getenv('MONGODB_DB_NAME', 'Wikicomic')
        comics_collection_name = os.getenv('MONGODB_COLLECTION_COMICS', 'Comics')
        images_collection_name = os.getenv('MONGODB_COLLECTION_IMAGES', 'Images')
        
        print(f"🔍 Database: {db_name}")
        print(f"🔍 Comics collection: {comics_collection_name}")
        print(f"🔍 Images collection: {images_collection_name}")
        
        db = client[db_name]
        comics_collection = db[comics_collection_name]
        images_collection = db[images_collection_name]
        
        # List all collections
        collections = db.list_collection_names()
        print(f"🔍 Available collections: {collections}")
        
        # Count documents in comics collection
        comics_count = comics_collection.count_documents({})
        print(f"📊 Total comics in collection: {comics_count}")
        
        # Count documents in images collection
        images_count = images_collection.count_documents({})
        print(f"📊 Total images in collection: {images_count}")
        
        if comics_count > 0:
            print("\n📖 Sample comics:")
            for comic in comics_collection.find().limit(3):
                print(f"  - Title: {comic.get('title', 'No title')}")
                print(f"    ID: {comic.get('_id', 'No ID')}")
                print(f"    Style: {comic.get('style', 'No style')}")
                print(f"    Created: {comic.get('created_at', 'No date')}")
                print()
        
        if images_count > 0:
            print("\n🖼️ Sample images:")
            for img in images_collection.find().limit(3):
                print(f"  - Comic: {img.get('comic_title', 'No title')}")
                print(f"    Scene: {img.get('scene_number', 'No number')}")
                print(f"    ID: {img.get('_id', 'No ID')}")
                print()
        
        # Test the get_all_comics logic
        print("\n🔍 Testing get_all_comics logic:")
        comics = []
        for comic in comics_collection.find().sort("created_at", -1):
            comic_id = str(comic.get("_id", ""))
            comic_title = comic.get("title", "")
            
            print(f"  Processing comic: {comic_title}")
            
            # Get images for this comic
            images = images_collection.find({"comic_title": comic_title}).sort("scene_number", 1)
            
            # Convert images to list
            image_list = []
            for img in images:
                if img:
                    image_list.append({
                        "id": str(img.get("_id", "")),
                        "url": f"/api/images/{img.get('_id', '')}",
                        "scene_number": img.get("scene_number", 0),
                        "scene_text": img.get("scene_text", "")
                    })
            
            print(f"    Found {len(image_list)} images")
            
            comic["images"] = image_list
            comic["_id"] = comic_id
            comics.append(comic)
        
        print(f"\n✅ Successfully processed {len(comics)} comics")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e)}")

if __name__ == "__main__":
    test_database() 