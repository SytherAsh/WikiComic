from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db_manager
import logging
import os

# Configure logging - Reduce verbose logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Set specific loggers to reduce noise
logging.getLogger('httpx').setLevel(logging.WARNING)  # Reduce HTTP request logging
logging.getLogger('urllib3').setLevel(logging.WARNING)  # Reduce HTTP request logging
logging.getLogger('requests').setLevel(logging.WARNING)  # Reduce HTTP request logging
logging.getLogger('google').setLevel(logging.WARNING)  # Reduce Google API logging
logging.getLogger('google.genai').setLevel(logging.WARNING)  # Reduce Gemini API logging

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize MongoDB (will not crash if connection fails)
    try:
        db_manager.init_app(app)
        if db_manager.connected:
            logger.info("MongoDB connected successfully")
        else:
            logger.warning("MongoDB not connected - some features will be limited")
    except Exception as e:
        logger.error(f"MongoDB initialization failed: {e}")

    # Enable CORS for all routes, using environment-based origins
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Register Blueprints
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

    logger.info("WikiComic Flask Application started")
    return app
