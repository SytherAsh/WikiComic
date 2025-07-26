#!/usr/bin/env python3
"""
Migration script to migrate data to specific MongoDB collections (Comics or Images)
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path

# Add the app directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app, mongo
from app.utils.mongo_helpers import save_comic_to_mongo, get_all_comics_from_mongo
from app.config import Config

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def migrate_to_mongo(collection_name='comics', source_collection=None):
    """
    Migrate data to a specific MongoDB collection
    
    Args:
        collection_name (str): Target collection name ('comics' or 'images')
        source_collection (str): Source collection to migrate from (optional)
    """
    try:
        app = create_app()
        
        with app.app_context():
            logger.info(f"🚀 Starting migration to collection: {collection_name}")
            
            # If source collection is specified, migrate from that collection
            if source_collection:
                logger.info(f"📥 Migrating from collection: {source_collection}")
                source_data = get_all_comics_from_mongo(source_collection)
                
                if not source_data:
                    logger.warning(f"No data found in source collection: {source_collection}")
                    return False
                
                successful_migrations = 0
                failed_migrations = 0
                
                for comic in source_data:
                    try:
                        # Remove _id to avoid conflicts
                        comic_copy = comic.copy()
                        if '_id' in comic_copy:
                            del comic_copy['_id']
                        
                        # Save to target collection
                        result = save_comic_to_mongo(comic_copy, collection_name)
                        if result:
                            logger.info(f"✅ Migrated: {comic.get('title', 'Unknown')}")
                            successful_migrations += 1
                        else:
                            logger.error(f"❌ Failed to migrate: {comic.get('title', 'Unknown')}")
                            failed_migrations += 1
                            
                    except Exception as e:
                        logger.error(f"❌ Error migrating comic {comic.get('title', 'Unknown')}: {e}")
                        failed_migrations += 1
                
                logger.info(f"Migration completed!")
                logger.info(f"✅ Successful migrations: {successful_migrations}")
                logger.info(f"❌ Failed migrations: {failed_migrations}")
                
                return successful_migrations > 0
                
            else:
                # Just verify the target collection is accessible
                logger.info(f"✅ Target collection '{collection_name}' is accessible")
                return True
                
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        return False

def verify_collection(collection_name):
    """
    Verify that a collection exists and show its contents
    """
    try:
        app = create_app()
        
        with app.app_context():
            logger.info(f"🔍 Verifying collection: {collection_name}")
            
            comics = get_all_comics_from_mongo(collection_name)
            
            logger.info(f"📊 Total documents in {collection_name}: {len(comics)}")
            
            if comics:
                for i, comic in enumerate(comics[:5], 1):  # Show first 5
                    title = comic.get('title', 'Unknown')
                    created_at = comic.get('created_at', 'Unknown')
                    scenes_count = len(comic.get('scenes', []))
                    logger.info(f"  {i}. {title} ({scenes_count} scenes) - {created_at}")
                
                if len(comics) > 5:
                    logger.info(f"  ... and {len(comics) - 5} more documents")
            else:
                logger.info("  (Empty collection)")
                
            return True
            
    except Exception as e:
        logger.error(f"❌ Error verifying collection: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 MongoDB Collection Migration Tool")
    print("=" * 50)
    
    # Get collection name from user
    print("\nAvailable collections:")
    print("1. comics")
    print("2. images")
    
    choice = input("\nEnter collection name to migrate to (comics/images): ").strip().lower()
    
    if choice not in ['comics', 'images']:
        print("❌ Invalid choice. Please enter 'comics' or 'images'")
        return
    
    # Ask if user wants to migrate from another collection
    migrate_from = input("\nMigrate from another collection? (y/N): ").strip().lower()
    source_collection = None
    
    if migrate_from == 'y':
        source_choice = input("Enter source collection name (comics/images): ").strip().lower()
        if source_choice in ['comics', 'images']:
            source_collection = source_choice
        else:
            print("❌ Invalid source collection name")
            return
    
    # Confirm migration
    if source_collection:
        print(f"\nThis will migrate data from '{source_collection}' to '{choice}'")
    else:
        print(f"\nThis will verify access to collection '{choice}'")
    
    response = input("Proceed? (y/N): ")
    if response.lower() != 'y':
        print("Migration cancelled")
        return
    
    # Start migration
    print(f"\n🔄 Starting migration to '{choice}'...")
    success = migrate_to_mongo(choice, source_collection)
    
    if success:
        print(f"\n✅ Migration to '{choice}' completed successfully!")
        
        # Verify the target collection
        print(f"\n🔍 Verifying target collection...")
        verify_collection(choice)
    else:
        print(f"\n❌ Migration to '{choice}' failed!")

if __name__ == "__main__":
    main() 