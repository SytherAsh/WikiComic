from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db_manager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize MongoDB
    db_manager.init_app(app)

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
