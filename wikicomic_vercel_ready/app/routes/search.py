from flask import Blueprint, render_template, request, jsonify, current_app
from ..utils.wikiextract import WikipediaExtractor
from ..utils.storygen import StoryGenerator
from ..utils.imagegen import ComicImageGenerator
from ..database import db_manager
import logging

logger = logging.getLogger(__name__)
search_bp = Blueprint('search', __name__)

# Initialize utilities
wiki = WikipediaExtractor()
storygen = StoryGenerator()
comicgen = ComicImageGenerator()

@search_bp.route('/search', methods=['GET', 'POST'])
def search():
    """Handle comic generation requests"""
    query = request.values.get('query', '').strip()
    style = request.values.get('style', 'Manga')
    length = request.values.get('length', 'medium')
    
    # Initialize variables
    result = None
    error = None
    storyline = None
    scenes = []
    comic_id = None
    success = None

    # Handle GET request - show form or search results
    if request.method == 'GET' and query:
        try:
            logger.info(f"🔍 Searching Wikipedia for: {query}")
            
            # Get Wikipedia page info
            page_info = wiki.get_page_info(query)
            if "error" in page_info:
                error = page_info.get("message", "Failed to fetch Wikipedia article")
                logger.error(f"❌ Wikipedia error: {error}")
            else:
                result = {
                    "title": page_info.get("title"),
                    "summary": page_info.get("summary"),
                    "url": page_info.get("url")
                }
                
                # Generate storyline and scenes
                content = page_info.get("content", "")
                summary = page_info.get("summary", "")
                categories = page_info.get("categories", [])[:5]
                
                logger.info(f"📝 Generating storyline for: {result['title']}")
                storyline = storygen.generate_storyline(
                    query, content, summary, categories, 
                    target_length=length, style=style
                )
                
                logger.info(f"🎬 Generating scenes for: {result['title']}")
                scenes = storygen.generate_scene_prompts_and_dialogues(
                    query, storyline, target_length=length, comic_style=style
                )
                
                logger.info(f"✅ Generated {len(scenes)} scenes")
                
        except Exception as e:
            error = f"Error processing request: {str(e)}"
            logger.error(f"❌ Search error: {e}")

    # Handle POST request - generate comic images
    elif request.method == 'POST' and query:
        try:
            logger.info(f"🎨 Starting comic generation for: {query}")
            
            # Check if MongoDB is connected
            if not db_manager.connected:
                error = "Database not connected. Please check MongoDB configuration."
                logger.error("❌ MongoDB not connected for comic generation")
            else:
                # Get Wikipedia page info
                page_info = wiki.get_page_info(query)
                if "error" in page_info:
                    error = page_info.get("message", "Failed to fetch Wikipedia article")
                else:
                    result = {
                        "title": page_info.get("title"),
                        "summary": page_info.get("summary"),
                        "url": page_info.get("url")
                    }
                    
                    # Generate storyline and scenes
                    content = page_info.get("content", "")
                    summary = page_info.get("summary", "")
                    categories = page_info.get("categories", [])[:5]
                    
                    storyline = storygen.generate_storyline(
                        query, content, summary, categories, 
                        target_length=length, style=style
                    )
                    
                    scenes = storygen.generate_scene_prompts_and_dialogues(
                        query, storyline, target_length=length, comic_style=style
                    )
                    
                    # Generate comic images and store in MongoDB
                    logger.info(f"🖼️ Generating {len(scenes)} comic images...")
                    comic_scenes = comicgen.generate_all_images(query, scenes, style=style)
                    
                    if comic_scenes:
                        success = f"Comic generated successfully with {len(comic_scenes)} scenes!"
                        logger.info(f"✅ Comic generated successfully: {len(comic_scenes)} scenes")
                    else:
                        error = "Failed to generate comic images"
                        logger.error("❌ Failed to generate comic images")
                        
        except Exception as e:
            error = f"Error generating comic: {str(e)}"
            logger.error(f"❌ Comic generation error: {e}")

    # Handle JSON requests (for API calls)
    if request.headers.get('Accept') == 'application/json' or request.is_json:
        return jsonify({
            "result": result,
            "error": error,
            "storyline": storyline,
            "scenes": scenes,
            "success": success,
            "comic_id": comic_id,
            "query": query,
            "style": style,
            "length": length
        })

    # Render HTML template
    return render_template(
        'search.html',
        result=result,
        error=error,
        storyline=storyline,
        scenes=scenes,
        success=success,
        comic_id=comic_id,
        query=query,
        style=style,
        length=length
    )

@search_bp.route('/suggest', methods=['GET'])
def suggest():
    """Get Wikipedia search suggestions"""
    query = request.args.get('query', '').strip()
    if not query or len(query) < 2:
        return jsonify([])
    
    try:
        suggestions = wiki.search(query, results_limit=7)
        return jsonify(suggestions)
    except Exception as e:
        logger.error(f"❌ Suggestion error: {e}")
        return jsonify([])
