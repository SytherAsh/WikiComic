import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///wikicomic.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Add your API keys here
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    HF_TOKEN = os.getenv('HF_TOKEN')
    # Add more as needed
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')