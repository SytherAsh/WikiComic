from flask import Blueprint, render_template
from ..database import db_manager
from ..config import Config
import os

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def home():
    """Home page with status information"""
    # Check database status
    db_status = {
        'connected': db_manager.connected,
        'client_exists': db_manager.client is not None,
        'db_exists': db_manager.db is not None
    }
    
    # Check API keys configuration
    api_keys_configured = all([
        os.getenv('GROQ_API_KEY') is not None,
        os.getenv('GEMINI_API_KEY') is not None
    ])
    
    return render_template('home.html', 
                         db_status=db_status, 
                         api_keys_configured=api_keys_configured)
