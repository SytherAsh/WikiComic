from flask import Blueprint, jsonify, current_app
from ..database import db_manager
import logging

logger = logging.getLogger(__name__)
comics_bp = Blueprint('comics', __name__)

@comics_bp.route('/comics', methods=['GET'])
def list_comics():
    """
    Get all comics from MongoDB with their images and scenes
    """
    try:
        comics = db_manager.get_all_comics()
        return jsonify({'comics': comics})
    except Exception as e:
        logger.error(f"Error listing comics: {e}")
        return jsonify({'error': 'Failed to retrieve comics'}), 500