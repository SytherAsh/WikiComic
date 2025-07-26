import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB Configuration
class MongoDBConfig:
    # MongoDB credentials from environment variables with fallbacks
    USERNAME = os.getenv('MONGODB_USERNAME', 'Sawash')
    RAW_PASSWORD = os.getenv('MONGODB_PASSWORD', '1@3Sawash123')
    
    # Escape special characters in password
    PASSWORD = quote_plus(RAW_PASSWORD)
    
    # Build MongoDB URI
    URI = os.getenv('MONGODB_URI', f"mongodb+srv://{USERNAME}:{PASSWORD}@sytherash.qlpzo.mongodb.net/?retryWrites=true&w=majority&appName=SytherAsh")
    
    # Database and collection names
    DATABASE_NAME = os.getenv('MONGODB_DB', 'Wikicomic')
    COLLECTION_NAME = os.getenv('MONGODB_COLLECTION', 'Images')

# Application Configuration
class AppConfig:
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # API Keys
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    HF_TOKEN = os.getenv('HF_TOKEN')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',') 