from flask import Blueprint, render_template, jsonify, request
from ..database import db_manager
import logging

logger = logging.getLogger(__name__)
comics_bp = Blueprint('comics', __name__)

@comics_bp.route('/comics')
def list_comics():
    """List all comics"""
    try:
        logger.info("🔍 Comics route: Starting to fetch comics...")
        comics = db_manager.get_all_comics()
        logger.info(f"🔍 Comics route: Retrieved {len(comics)} comics from database")
        
        # Always return JSON for API consistency
        # Check if it's an API request (from React frontend)
        if request.headers.get('Accept') == 'application/json' or request.headers.get('Origin'):
            logger.info("🔍 Comics route: Returning JSON response for API request")
            return jsonify({"comics": comics})
        
        # Render HTML template for direct browser access
        logger.info("🔍 Comics route: Rendering HTML template for browser")
        return render_template('comics.html', comics=comics)
        
    except Exception as e:
        logger.error(f"❌ Error listing comics: {e}")
        logger.error(f"❌ Error type: {type(e)}")
        logger.error(f"❌ Error details: {str(e)}")
        error = "Failed to load comics"
        
        # Always return JSON error for API requests
        if request.headers.get('Accept') == 'application/json' or request.headers.get('Origin'):
            return jsonify({"error": error}), 500
        
        return render_template('comics.html', comics=[], error=error)