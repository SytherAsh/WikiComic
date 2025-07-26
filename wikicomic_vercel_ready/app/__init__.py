from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db_manager
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Print startup banner
    logger.info("🚀 Starting WikiComic Flask Application...")
    logger.info("=" * 50)

    # Check environment variables
    logger.info("📋 Checking environment variables...")
    mongodb_uri = app.config.get('MONGODB_URI')
    groq_key = app.config.get('GROQ_API_KEY')
    gemini_key = app.config.get('GEMINI_API_KEY')
    
    logger.info(f"   MongoDB URI: {'✅ Configured' if mongodb_uri else '❌ Not configured'}")
    logger.info(f"   Groq API Key: {'✅ Configured' if groq_key else '❌ Not configured'}")
    logger.info(f"   Gemini API Key: {'✅ Configured' if gemini_key else '❌ Not configured'}")

    # Initialize MongoDB (will not crash if connection fails)
    logger.info("🗄️ Initializing MongoDB connection...")
    try:
        db_manager.init_app(app)
        if db_manager.connected:
            logger.info("✅ MongoDB initialized successfully")
            logger.info(f"   Database: {app.config.get('MONGODB_DB_NAME')}")
            logger.info(f"   Collections: {app.config.get('MONGODB_COLLECTION_COMICS')}, {app.config.get('MONGODB_COLLECTION_IMAGES')}")
        else:
            logger.warning("⚠️ MongoDB not connected - some features will be limited")
            logger.info("💡 Set MONGODB_URI environment variable to enable database features")
    except Exception as e:
        logger.error(f"❌ MongoDB initialization failed: {e}")
        logger.info("💡 App will start without MongoDB - set MONGODB_URI to enable database features")

    # Enable CORS for all routes, using environment-based origins
    logger.info("🌐 Configuring CORS...")
    CORS(app, origins=app.config['CORS_ORIGINS'])
    logger.info(f"   CORS Origins: {app.config['CORS_ORIGINS']}")

    # Register Blueprints
    logger.info("🔗 Registering blueprints...")
    from .routes.home import home_bp
    from .routes.search import search_bp
    from .routes.input import input_bp
    from .routes.comics import comics_bp
    from .routes.api import api_bp
    
    app.register_blueprint(home_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(input_bp)
    app.register_blueprint(comics_bp)
    app.register_blueprint(api_bp)
    
    logger.info("✅ All blueprints registered")

    # Startup complete
    logger.info("=" * 50)
    logger.info("🎉 WikiComic Flask Application started successfully!")
    logger.info("📱 Available endpoints:")
    logger.info("   - Home: /")
    logger.info("   - Search: /search")
    logger.info("   - Comics: /comics")
    logger.info("   - Health: /api/health")
    logger.info("   - Debug: /api/debug")
    logger.info("=" * 50)

    return app
