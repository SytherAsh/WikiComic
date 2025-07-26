#!/usr/bin/env python3
"""
Test script that uses the same database manager as Flask app
"""

import os
import sys
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Load environment variables
load_dotenv()

def test_flask_db_manager():
    """Test the database manager used by Flask app"""
    try:
        from database import db_manager
        from config import Config
        
        print("🔍 Testing Flask database manager...")
        
        # Create a mock Flask app config
        class MockConfig:
            def __init__(self):
                self.config = {
                    'MONGODB_URI': os.getenv('MONGODB_URI'),
                    'MONGODB_DB_NAME': os.getenv('MONGODB_DB_NAME', 'Wikicomic'),
                    'MONGODB_COLLECTION_IMAGES': os.getenv('MONGODB_COLLECTION_IMAGES', 'Images'),
                    'MONGODB_COLLECTION_COMICS': os.getenv('MONGODB_COLLECTION_COMICS', 'Comics'),
                    'MONGODB_COLLECTION_SCENES': os.getenv('MONGODB_COLLECTION_SCENES', 'Scenes')
                }
            
            def get(self, key, default=None):
                return self.config.get(key, default)
        
        mock_app = MockConfig()
        
        # Initialize the database manager
        print("🔍 Initializing database manager...")
        db_manager.init_app(mock_app)
        
        if not db_manager.connected:
            print("❌ Database manager not connected")
            return
        
        print("✅ Database manager connected successfully")
        print(f"🔍 Database: {db_manager.db}")
        print(f"🔍 Comics collection: {db_manager.comics_collection}")
        print(f"🔍 Images collection: {db_manager.images_collection}")
        
        # Test get_all_comics method
        print("\n🔍 Testing get_all_comics method...")
        try:
            comics = db_manager.get_all_comics()
            print(f"✅ get_all_comics returned {len(comics)} comics")
            
            if comics:
                print("\n📖 Sample comics:")
                for i, comic in enumerate(comics[:3]):
                    print(f"  {i+1}. Title: {comic.get('title', 'No title')}")
                    print(f"     ID: {comic.get('_id', 'No ID')}")
                    print(f"     Images: {len(comic.get('images', []))}")
                    print()
            else:
                print("📭 No comics found in database")
                
        except Exception as e:
            print(f"❌ Error in get_all_comics: {e}")
            print(f"❌ Error type: {type(e)}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_flask_db_manager() 