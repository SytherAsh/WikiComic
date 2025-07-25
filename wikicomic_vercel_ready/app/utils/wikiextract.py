import wikipedia
import os
import re
import logging
from datetime import datetime

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WikipediaExtractor:
    def __init__(self, language="en"):
        wikipedia.set_lang(language)

    def sanitize_filename(self, filename: str) -> str:
        sanitized = re.sub(r'[\\/*?:"<>|]', '_', filename)
        return sanitized[:200]

    def search(self, query: str, results_limit: int = 10):
        if not query or not query.strip():
            return []
        try:
            return wikipedia.search(query.strip(), results=results_limit)
        except Exception as e:
            logger.error(f"Wikipedia search error: {e}")
            return []

    def get_page_info(self, title: str):
        try:
            page = wikipedia.page(title, auto_suggest=False)
            return {
                "title": page.title,
                "url": page.url,
                "content": page.content,
                "summary": page.summary,
                "references": page.references,
                "categories": page.categories,
                "links": page.links,
                "images": page.images,
                "timestamp": datetime.now().isoformat()
            }
        except wikipedia.DisambiguationError as e:
            return {
                "error": "Disambiguation Error",
                "options": e.options,
                "message": "Multiple matches found. Please be more specific."
            }
        except wikipedia.PageError:
            return {
                "error": "Page Error",
                "message": f"Page '{title}' does not exist."
            }
        except Exception as e:
            logger.error(f"Wikipedia page error: {e}")
            return {
                "error": "General Error",
                "message": str(e)
            }

