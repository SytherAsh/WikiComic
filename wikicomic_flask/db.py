#!/usr/bin/env python3
"""
Simple MongoDB connection test
This file is kept for backward compatibility but the main database operations
are now handled by app/database.py
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
# MongoDB Atlas URI
uri = os.getenv('MONGODB_URI')
def test_connection():
    """Test basic MongoDB connection"""
    try:
        client = MongoClient(uri, server_api=ServerApi('1'))
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Test database access
        db = client["Wikicomic"]
        collections = db.list_collection_names()
        print(f"✅ Database 'Wikicomic' accessible. Collections: {collections}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing MongoDB connection...")
    test_connection()
    print("\nNote: For full database operations, use the new app/database.py module")