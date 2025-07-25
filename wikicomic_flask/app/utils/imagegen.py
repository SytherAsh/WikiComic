import os
import logging
import json
from io import BytesIO
from PIL import Image, ImageEnhance
from google import genai
from google.genai import types
import re

logger = logging.getLogger(__name__)

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\/*?:"<>|]', "_", name).strip()

class ComicImageGenerator:
    STYLE_SETTINGS = {
        'Manga': {
            'prompt': "manga comic book style, multi-panel page, text bubbles, dynamic action poses, expressive characters",
            'negative_prompt': "western comic style, realistic, photographic, 3d rendered",
            'guidance_scale': 7.5,
            'steps': 50
        },
        'Western': {
            'prompt': "western comic book style, bold colors, halftone dots, strong outlines, multi-panel layout, expressive dialogue bubbles",
            'negative_prompt': "manga, anime, photorealistic, 3d rendered",
            'guidance_scale': 7.0,
            'steps': 45
        },
        'Minimalist': {
            'prompt': "minimalist comic layout, clean frames, limited color palette, simple expressive lines, comic panels",
            'negative_prompt': "busy, cluttered, detailed, complex patterns",
            'guidance_scale': 8.0,
            'steps': 40
        },
        'Cartoon': {
            'prompt': "cartoon comic book style, colorful, exaggerated expressions, multiple panels, text in speech bubbles",
            'negative_prompt': "realistic, photographic, serious, gritty",
            'guidance_scale': 7.0,
            'steps': 45
        },
        'Noir': {
            'prompt': "noir comic layout, dark tones, high contrast, dramatic shadows, gritty comic panels, monochrome with text bubbles",
            'negative_prompt': "bright colors, cheerful, flat lighting, cartoon",
            'guidance_scale': 8.5,
            'steps': 55
        },
        'Indie': {
            'prompt': "indie comic style, hand-drawn feel, experimental panel layout, artistic ink, dialogue bubbles",
            'negative_prompt': "commercial style, mainstream, polished, perfect",
            'guidance_scale': 7.0,
            'steps': 45
        }
    }

    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        self.client = genai.Client(api_key=self.api_key)
        self.static_base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static', 'comic'))

    def _enhance_prompt(self, scene_prompt, style="Manga", dialogue=None):
        style_settings = self.STYLE_SETTINGS.get(style, self.STYLE_SETTINGS['Manga'])

        dialogue_text = f"""
        Include the following dialogue as comic-style speech bubbles within the panels:
        "{dialogue}"
        """ if dialogue else ""

        enhanced_prompt = f"""
        Generate a full comic book page in {style} style with 2 to 4 comic panels.

        Scene Description:
        {scene_prompt}

        Style Characteristics:
        {style_settings['prompt']}

        Guidelines:
        - Include character dialogue using clear comic-style speech bubbles
        - Organize layout like a printed comic page with panel borders
        - Focus on action, emotion, and visual storytelling
        - Ensure high resolution, clear character expressions and dynamic poses
        - Avoid plain single-frame images – aim for full comic page format

        {dialogue_text}

        Output a high-quality image that looks like a comic page, not an illustration.
        """.strip()

        return enhanced_prompt

    def _post_process_image(self, image: Image.Image) -> Image.Image:
        try:
            image = ImageEnhance.Sharpness(image).enhance(1.2)
            image = ImageEnhance.Contrast(image).enhance(1.1)
        except Exception as e:
            logger.warning(f"Image post-processing failed: {e}")
        return image

    def generate_comic_image(self, prompt, output_path, style="Manga", dialogue=None):
        full_prompt = self._enhance_prompt(prompt, style, dialogue)

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
            )

            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data is not None:
                    image = Image.open(BytesIO(part.inline_data.data))
                    image = self._post_process_image(image)

                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    image.save(output_path, format='PNG', quality=95)
                    return True
                elif hasattr(part, "text") and part.text:
                    logger.info(f"Gemini Text Output: {part.text}")

            logger.error("No image found in Gemini response.")
        except Exception as e:
            logger.error(f"Error generating image with Gemini: {e}")

        return False

    def generate_all_images(self, title, scenes, style="Manga"):
        folder_name = sanitize_filename(title)
        comic_dir = os.path.join(self.static_base_dir, folder_name)
        os.makedirs(comic_dir, exist_ok=True)

        scene_data = []

        for idx, scene in enumerate(scenes):
            prompt = scene.get("prompt", f"Scene {idx+1}")
            dialogue = scene.get("dialogue", "")
            image_filename = f"scene_{idx+1}.png"
            json_filename = f"scene_{idx+1}.json"
            image_path = os.path.join(comic_dir, image_filename)
            json_path = os.path.join(comic_dir, json_filename)

            success = self.generate_comic_image(prompt, image_path, style, dialogue)
            if success:
                with open(json_path, 'w') as jf:
                    json.dump({"prompt": prompt, "dialogue": dialogue}, jf, indent=4)

                scene_data.append({
                    "image": f"/static/comic/{folder_name}/{image_filename}",
                    "dialogue": dialogue
                })
            else:
                logger.error(f"Failed to generate image for scene {idx+1}")

        return scene_data
