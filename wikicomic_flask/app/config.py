import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://Sawash:1%403Sawash123@sytherash.qlpzo.mongodb.net/?retryWrites=true&w=majority&appName=SytherAsh')
    MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'Wikicomic')
    MONGODB_COLLECTION_IMAGES = os.getenv('MONGODB_COLLECTION_IMAGES', 'Images')
    MONGODB_COLLECTION_COMICS = os.getenv('MONGODB_COLLECTION_COMICS', 'Comics')
    MONGODB_COLLECTION_SCENES = os.getenv('MONGODB_COLLECTION_SCENES', 'Scenes')
    
    # API Keys
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    HF_TOKEN = os.getenv('HF_TOKEN')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Image Storage Configuration
    MAX_IMAGE_SIZE = int(os.getenv('MAX_IMAGE_SIZE', 10 * 1024 * 1024))  # 10MB default
    ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']