from flask import Blueprint, render_template, request, jsonify
from app.utils.wikiextract import WikipediaExtractor
from app.utils.storygen import StoryGenerator
from app.utils.imagegen import ComicImageGenerator

search_bp = Blueprint('search', __name__)
wiki = WikipediaExtractor()
storygen = StoryGenerator()
comicgen = ComicImageGenerator()

@search_bp.route('/search', methods=['GET', 'POST'])
def search():
    query = request.values.get('query')
    style = request.values.get('style', 'Manga')
    length = request.values.get('length', 'medium')

    result, error, storyline, scenes, comic_images = None, None, None, [], []

    if query:
        page_info = wiki.get_page_info(query)
        if "error" in page_info:
            error = page_info.get("message", "Something went wrong.")
        else:
            result = {
                "title": page_info.get("title"),
                "summary": page_info.get("summary"),
                "url": page_info.get("url")
            }
            content = page_info.get("content", "")
            Summary = page_info.get("summary", "")
            categories = page_info.get("categories", [])[:5]
            storyline = storygen.generate_storyline(query, content, Summary, categories, target_length=length, style=style)
            scenes = storygen.generate_scene_prompts_and_dialogues(query, storyline, target_length=length, comic_style=style)
            if request.method == 'POST':
                # Generate comic images and store in MongoDB
                comic_scenes = comicgen.generate_all_images(query, scenes, style=style)
                
                # Convert to the format expected by the template
                # Template expects: [{"image": "url", "dialogue": "text"}]
                # MongoDB returns: [{"image_url": "url", "dialogue": "text", ...}]
                comic_images = []
                for scene in comic_scenes:
                    comic_images.append({
                        "image": scene.get("image_url", ""),  # Convert image_url to image
                        "dialogue": scene.get("dialogue", ""),
                        "prompt": scene.get("prompt", ""),
                        "scene_number": scene.get("scene_number", 0)
                    })

    # If the request is from React (expects JSON)
    if request.headers.get('Accept') == 'application/json' or request.is_json:
        return jsonify({
            "result": result,
            "error": error,
            "storyline": storyline,
            "scenes": scenes,
            "images": comic_images,  # This will be the MongoDB format for React
            "query": query,
            "style": style,
            "length": length
        })

    # Otherwise, render the HTML template (for debugging)
    return render_template(
        'search.html',
        result=result,
        error=error,
        storyline=storyline,
        scenes=scenes,
        images=comic_images,  # This will be the template format
        query=query,
        style=style,
        length=length
    )

@search_bp.route('/suggest', methods=['GET'])
def suggest():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([])
    suggestions = wiki.search(query, results_limit=7)
    return jsonify(suggestions)
