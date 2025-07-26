from flask import Blueprint, send_file, jsonify, request, current_app, Response
from io import BytesIO
from bson import ObjectId
from ..database import db_manager
import logging

logger = logging.getLogger(__name__)
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/images/<image_id>', methods=['GET'])
def serve_image(image_id):
    """
    Serve image from MongoDB GridFS
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(image_id):
            return jsonify({"error": "Invalid image ID"}), 400
        
        # Get image from database
        image_data = db_manager.get_image(image_id)
        
        if not image_data:
            return jsonify({"error": "Image not found"}), 404
        
        # Create BytesIO object for Flask to serve
        image_bytes = BytesIO(image_data["image_data"])
        image_bytes.seek(0)
        
        # Create response with proper headers
        response = send_file(
            image_bytes,
            mimetype=image_data.get("content_type", "image/png"),
            as_attachment=False,
            download_name=f"image_{image_id}.png"
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Cache-Control'] = 'public, max-age=31536000'  # Cache for 1 year
        
        return response
        
    except Exception as e:
        logger.error(f"Error serving image {image_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@api_bp.route('/images/<image_id>', methods=['OPTIONS'])
def serve_image_options(image_id):
    """Handle CORS preflight requests for images"""
    response = Response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@api_bp.route('/comics', methods=['GET'])
def get_comics():
    """
    Get all comics with their images
    """
    try:
        comics = db_manager.get_all_comics()
        return jsonify({"comics": comics})
    except Exception as e:
        logger.error(f"Error getting comics: {e}")
        return jsonify({"error": "Internal server error"}), 500

@api_bp.route('/comics/<comic_id>', methods=['GET'])
def get_comic(comic_id):
    """
    Get specific comic by ID
    """
    try:
        if not ObjectId.is_valid(comic_id):
            return jsonify({"error": "Invalid comic ID"}), 400
        
        comic = db_manager.get_comic(comic_id)
        if not comic:
            return jsonify({"error": "Comic not found"}), 404
        
        comic["_id"] = str(comic["_id"])
        return jsonify(comic)
        
    except Exception as e:
        logger.error(f"Error getting comic {comic_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@api_bp.route('/comics/<comic_id>', methods=['DELETE'])
def delete_comic(comic_id):
    """
    Delete comic and all associated images
    """
    try:
        if not ObjectId.is_valid(comic_id):
            return jsonify({"error": "Invalid comic ID"}), 400
        
        success = db_manager.delete_comic(comic_id)
        if not success:
            return jsonify({"error": "Comic not found"}), 404
        
        return jsonify({"message": "Comic deleted successfully"})
        
    except Exception as e:
        logger.error(f"Error deleting comic {comic_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    try:
        # Check MongoDB connection status
        if db_manager.connected:
            # Test actual connection
            try:
                db_manager.client.admin.command('ping')
                return jsonify({
                    "status": "healthy",
                    "database": "connected",
                    "message": "All systems operational",
                    "mongodb_uri_configured": db_manager.client is not None,
                    "collections_ready": db_manager.db is not None
                })
            except Exception as e:
                return jsonify({
                    "status": "unhealthy",
                    "database": "connection_failed",
                    "error": str(e),
                    "mongodb_uri_configured": db_manager.client is not None,
                    "collections_ready": False
                }), 500
        else:
            return jsonify({
                "status": "unhealthy",
                "database": "not_configured",
                "error": "MongoDB URI not configured or connection failed",
                "mongodb_uri_configured": False,
                "collections_ready": False,
                "help": "Please set MONGODB_URI environment variable with your MongoDB Atlas connection string"
            }), 500
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "mongodb_uri_configured": False,
            "collections_ready": False
        }), 500 

@api_bp.route('/debug', methods=['GET'])
def debug_info():
    """
    Debug endpoint to check configuration
    """
    try:
        from flask import current_app
        
        # Get configuration info (without exposing sensitive data)
        config_info = {
            "mongodb_uri_configured": current_app.config.get('MONGODB_URI') is not None,
            "mongodb_uri_length": len(current_app.config.get('MONGODB_URI', '')),
            "mongodb_db_name": current_app.config.get('MONGODB_DB_NAME'),
            "mongodb_collections": {
                "images": current_app.config.get('MONGODB_COLLECTION_IMAGES'),
                "comics": current_app.config.get('MONGODB_COLLECTION_COMICS'),
                "scenes": current_app.config.get('MONGODB_COLLECTION_SCENES')
            },
            "database_connected": db_manager.connected,
            "api_keys_configured": {
                "groq": current_app.config.get('GROQ_API_KEY') is not None,
                "gemini": current_app.config.get('GEMINI_API_KEY') is not None,
                "google": current_app.config.get('GOOGLE_API_KEY') is not None,
                "hf_token": current_app.config.get('HF_TOKEN') is not None
            },
            "cors_origins": current_app.config.get('CORS_ORIGINS'),
            "environment": {
                "debug": current_app.config.get('DEBUG', False),
                "secret_key_configured": current_app.config.get('SECRET_KEY') is not None
            }
        }
        
        return jsonify({
            "status": "debug_info",
            "configuration": config_info,
            "database_status": {
                "connected": db_manager.connected,
                "client_exists": db_manager.client is not None,
                "db_exists": db_manager.db is not None
            }
        })
        
    except Exception as e:
        logger.error(f"Debug endpoint error: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500 