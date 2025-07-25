from flask import Flask
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register Blueprints
    from .routes.home import home_bp
    from .routes.search import search_bp
    app.register_blueprint(home_bp)
    app.register_blueprint(search_bp)
    return app
