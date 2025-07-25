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
            categories = page_info.get("categories", [])[:5]  # Limit to top
            storyline = storygen.generate_storyline(query, content, Summary, categories,target_length=length, style=style)
            
            scenes = storygen.generate_scene_prompts_and_dialogues(query, storyline, target_length=length, comic_style=style)

            if request.method == 'POST':
                # Generate comic book only if user submits POST request
                comic_images = comicgen.generate_all_images(query, scenes, style=style)

    return render_template(
        'search.html',
        result=result,
        error=error,
        storyline=storyline,
        scenes=scenes,
        images=comic_images,
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
