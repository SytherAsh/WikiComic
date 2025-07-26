#!/usr/bin/env python3
"""
Simple MongoDB connection test
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Load environment variables
load_dotenv()

def test_connection():
    """Test MongoDB connection"""
    try:
        # Get MongoDB URI
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            print("❌ MONGODB_URI not found in environment variables")
            return
        
        print(f"🔍 Testing connection to MongoDB...")
        print(f"🔍 URI: {mongodb_uri[:20]}...{mongodb_uri[-20:]}")
        
        # Connect to MongoDB
        client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
        
        # Test connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # List databases
        databases = client.list_database_names()
        print(f"🔍 Available databases: {databases}")
        
        # Test specific database
        db_name = os.getenv('MONGODB_DB_NAME', 'Wikicomic')
        print(f"🔍 Testing access to database: {db_name}")
        
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"🔍 Collections in {db_name}: {collections}")
        
        client.close()
        print("✅ Connection test completed successfully!")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print(f"❌ Error type: {type(e)}")
        
        # Provide helpful suggestions
        if "authentication failed" in str(e).lower():
            print("\n💡 Authentication failed. Please check:")
            print("   1. Username and password in your MongoDB URI")
            print("   2. Database user permissions in MongoDB Atlas")
            print("   3. Network access settings in MongoDB Atlas")
        elif "timeout" in str(e).lower():
            print("\n💡 Connection timeout. Please check:")
            print("   1. Internet connection")
            print("   2. Network access settings in MongoDB Atlas")
            print("   3. Firewall settings")

if __name__ == "__main__":
    test_connection() 