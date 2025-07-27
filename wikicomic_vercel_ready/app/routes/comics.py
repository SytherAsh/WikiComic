from flask import Blueprint, render_template, jsonify, request
from ..database import db_manager
import logging

logger = logging.getLogger(__name__)
comics_bp = Blueprint('comics', __name__)

@comics_bp.route('/comics')
def list_comics():
    """List all comics"""
    try:
        comics = db_manager.get_all_comics()
        
        # Always return JSON for API consistency
        # Check if it's an API request (from React frontend)
        if request.headers.get('Accept') == 'application/json' or request.headers.get('Origin'):
            return jsonify({"comics": comics})
        
        # Render HTML template for direct browser access
        return render_template('comics.html', comics=comics)
        
    except Exception as e:
        logger.error(f"❌ Error listing comics: {e}")
        error = "Failed to load comics"
        
        # Always return JSON error for API requests
        if request.headers.get('Accept') == 'application/json' or request.headers.get('Origin'):
            return jsonify({"error": error}), 500
        
        return render_template('comics.html', comics=[], error=error)