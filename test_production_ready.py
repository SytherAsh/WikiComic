#!/usr/bin/env python3
"""
Production Readiness Test Script
This script tests all critical components before deployment
"""

import os
import sys
import importlib
import subprocess
from pathlib import Path

def test_imports():
    """Test all required imports"""
    print("🔍 Testing imports...")
    
    required_packages = [
        'flask',
        'flask_cors', 
        'pymongo',
        'gridfs',
        'bson',
        'PIL',
        'google.genai',
        'groq',
        'wikipedia',
        'requests',
        'python-dotenv'
    ]
    
    failed_imports = []
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"  ✅ {package}")
        except ImportError as e:
            print(f"  ❌ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed imports: {failed_imports}")
        return False
    
    print("✅ All imports successful")
    return True

def test_environment_variables():
    """Test environment variable configuration"""
    print("\n🔍 Testing environment variables...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        'MONGODB_URI',
        'GROQ_API_KEY', 
        'GEMINI_API_KEY'
    ]
    
    optional_vars = [
        'SECRET_KEY',
        'HF_TOKEN',
        'GOOGLE_API_KEY',
        'CORS_ORIGINS'
    ]
    
    missing_required = []
    for var in required_vars:
        if not os.getenv(var):
            print(f"  ❌ {var} (required)")
            missing_required.append(var)
        else:
            print(f"  ✅ {var}")
    
    for var in optional_vars:
        if not os.getenv(var):
            print(f"  ⚠️  {var} (optional)")
        else:
            print(f"  ✅ {var}")
    
    if missing_required:
        print(f"\n❌ Missing required environment variables: {missing_required}")
        return False
    
    print("✅ Environment variables configured")
    return True

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\n🔍 Testing MongoDB connection...")
    
    try:
        from pymongo import MongoClient
        from pymongo.server_api import ServerApi
        
        uri = os.getenv('MONGODB_URI')
        if not uri:
            print("  ❌ MONGODB_URI not set")
            return False
        
        client = MongoClient(uri, server_api=ServerApi('1'))
        client.admin.command('ping')
        
        db_name = os.getenv('MONGODB_DB_NAME', 'Wikicomic')
        db = client[db_name]
        collections = db.list_collection_names()
        
        print(f"  ✅ Connected to MongoDB")
        print(f"  ✅ Database: {db_name}")
        print(f"  ✅ Collections: {collections}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"  ❌ MongoDB connection failed: {e}")
        return False

def test_flask_app():
    """Test Flask app creation"""
    print("\n🔍 Testing Flask app creation...")
    
    try:
        # Add the Flask app directory to path
        sys.path.insert(0, str(Path(__file__).parent / 'wikicomic_flask'))
        
        from app import create_app
        app = create_app()
        
        print("  ✅ Flask app created successfully")
        print(f"  ✅ App name: {app.name}")
        print(f"  ✅ Debug mode: {app.debug}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Flask app creation failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    try:
        from app import create_app
        app = create_app()
        
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/health')
            if response.status_code == 200:
                print("  ✅ Health endpoint")
            else:
                print(f"  ❌ Health endpoint: {response.status_code}")
                return False
            
            # Test comics endpoint
            response = client.get('/api/comics')
            if response.status_code == 200:
                print("  ✅ Comics endpoint")
            else:
                print(f"  ❌ Comics endpoint: {response.status_code}")
                return False
        
        return True
        
    except Exception as e:
        print(f"  ❌ API endpoint test failed: {e}")
        return False

def test_image_generation():
    """Test image generation setup"""
    print("\n🔍 Testing image generation setup...")
    
    try:
        from app.utils.imagegen import ComicImageGenerator
        
        # Test initialization
        generator = ComicImageGenerator()
        print("  ✅ Image generator initialized")
        
        # Test style settings
        styles = list(generator.STYLE_SETTINGS.keys())
        print(f"  ✅ Available styles: {styles}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Image generation test failed: {e}")
        return False

def test_story_generation():
    """Test story generation setup"""
    print("\n🔍 Testing story generation setup...")
    
    try:
        from app.utils.storygen import StoryGenerator
        
        # Test initialization
        generator = StoryGenerator()
        print("  ✅ Story generator initialized")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Story generation test failed: {e}")
        return False

def test_wikipedia_extraction():
    """Test Wikipedia extraction setup"""
    print("\n🔍 Testing Wikipedia extraction setup...")
    
    try:
        from app.utils.wikiextract import WikipediaExtractor
        
        # Test initialization
        extractor = WikipediaExtractor()
        print("  ✅ Wikipedia extractor initialized")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Wikipedia extraction test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 WikiComic Production Readiness Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_environment_variables,
        test_mongodb_connection,
        test_flask_app,
        test_api_endpoints,
        test_image_generation,
        test_story_generation,
        test_wikipedia_extraction
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"  ❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your application is production-ready.")
        return 0
    else:
        print("❌ Some tests failed. Please fix the issues before deployment.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 