from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db_manager
import logging

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize MongoDB (will not crash if connection fails)
    try:
        db_manager.init_app(app)
        if db_manager.connected:
            logger.info("✅ MongoDB initialized successfully")
        else:
            logger.warning("⚠️ MongoDB not connected - some features will be limited")
    except Exception as e:
        logger.error(f"❌ MongoDB initialization failed: {e}")
        logger.info("💡 App will start without MongoDB - set MONGODB_URI to enable database features")

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

    return app
