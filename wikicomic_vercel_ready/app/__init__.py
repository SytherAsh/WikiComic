from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app)

    # Register Blueprints
    from .routes.home import home_bp
    from .routes.search import search_bp
    from .routes.input import input_bp
    from .routes.comics import comics_bp
    app.register_blueprint(home_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(input_bp)
    app.register_blueprint(comics_bp)


    return app
