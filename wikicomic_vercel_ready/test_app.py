#!/usr/bin/env python3
"""
Simple test script for WikiComic Flask application
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_health_endpoint(base_url):
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data.get('status', 'unknown')}")
            print(f"   Database: {data.get('database', 'unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_debug_endpoint(base_url):
    """Test the debug endpoint"""
    print("🔍 Testing debug endpoint...")
    try:
        response = requests.get(f"{base_url}/api/debug", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug info retrieved:")
            print(f"   MongoDB configured: {data.get('configuration', {}).get('mongodb_uri_configured', False)}")
            print(f"   Database connected: {data.get('configuration', {}).get('database_connected', False)}")
            print(f"   Groq API configured: {data.get('configuration', {}).get('api_keys_configured', {}).get('groq', False)}")
            print(f"   Gemini API configured: {data.get('configuration', {}).get('api_keys_configured', {}).get('gemini', False)}")
            return True
        else:
            print(f"❌ Debug check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Debug check error: {e}")
        return False

def test_home_page(base_url):
    """Test the home page"""
    print("🔍 Testing home page...")
    try:
        response = requests.get(base_url, timeout=10)
        if response.status_code == 200:
            print("✅ Home page loaded successfully")
            return True
        else:
            print(f"❌ Home page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Home page error: {e}")
        return False

def test_search_page(base_url):
    """Test the search page"""
    print("🔍 Testing search page...")
    try:
        response = requests.get(f"{base_url}/search", timeout=10)
        if response.status_code == 200:
            print("✅ Search page loaded successfully")
            return True
        else:
            print(f"❌ Search page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Search page error: {e}")
        return False

def test_comics_page(base_url):
    """Test the comics page"""
    print("🔍 Testing comics page...")
    try:
        response = requests.get(f"{base_url}/comics", timeout=10)
        if response.status_code == 200:
            print("✅ Comics page loaded successfully")
            return True
        else:
            print(f"❌ Comics page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Comics page error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 WikiComic Application Test Suite")
    print("=" * 50)
    
    # Get base URL from environment or use default
    base_url = os.getenv('APP_URL', 'http://localhost:5000')
    print(f"Testing application at: {base_url}")
    print()
    
    # Run tests
    tests = [
        test_health_endpoint,
        test_debug_endpoint,
        test_home_page,
        test_search_page,
        test_comics_page
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test(base_url):
            passed += 1
        print()
    
    # Summary
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Application is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the application configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 