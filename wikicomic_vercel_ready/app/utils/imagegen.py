import os
import logging
import json
from io import BytesIO
from PIL import Image, ImageEnhance
from google import genai
from google.genai import types
import re
from ..database import db_manager

logger = logging.getLogger(__name__)

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\/*?:"<>|]', "_", name).strip()

class ComicImageGenerator:
    STYLE_SETTINGS = {
        'Manga': {
            'prompt': "manga comic book style, dynamic action poses, large expressive eyes, flowing hair, speed lines, dramatic lighting, emotional facial expressions, clean line art, vibrant colors, multiple comic panels with speech bubbles, professional manga page layout",
            'negative_prompt': "western comic style, realistic, photographic, 3d rendered, flat colors, simple illustrations",
            'guidance_scale': 7.5,
            'steps': 50
        },
        'Western': {
            'prompt': "classic western comic book style, bold primary colors, strong black outlines, halftone dots, vintage comic aesthetics, muscular superhero poses, dramatic shadows, comic book panels with clear borders, speech bubbles with bold text, action-packed scenes, retro comic book feel",
            'negative_prompt': "manga, anime, photorealistic, 3d rendered, modern digital art, minimalist",
            'guidance_scale': 7.0,
            'steps': 45
        },
        'Minimalist': {
            'prompt': "minimalist comic layout, clean geometric panels, limited color palette with bold contrasts, simple expressive line work, modern design aesthetic, elegant typography, focused storytelling with clear visual hierarchy, sophisticated composition",
            'negative_prompt': "busy, cluttered, detailed, complex patterns, bright colors, traditional comic style",
            'guidance_scale': 8.0,
            'steps': 40
        },
        'Cartoon': {
            'prompt': "vibrant cartoon comic style, exaggerated character expressions, bouncy animation feel, bright cheerful colors, rounded shapes, fun visual elements, multiple panels with clear speech bubbles, playful design, family-friendly aesthetic, dynamic character poses",
            'negative_prompt': "realistic, photographic, serious, gritty, dark colors, complex details",
            'guidance_scale': 7.0,
            'steps': 45
        },
        'Noir': {
            'prompt': "noir comic layout, high contrast black and white with selective color, dramatic shadows and lighting, gritty urban atmosphere, cinematic angles, moody expressions, dark comic panels with white text bubbles, mysterious and dramatic mood, film noir aesthetic",
            'negative_prompt': "bright colors, cheerful, flat lighting, cartoon style, colorful, happy",
            'guidance_scale': 8.5,
            'steps': 55
        },
        'Indie': {
            'prompt': "indie comic style, hand-drawn artistic feel, experimental panel layouts, unique artistic touch, personal drawing style, creative use of space, artistic ink work, distinctive character designs, alternative comic book aesthetic, expressive dialogue bubbles",
            'negative_prompt': "commercial style, mainstream, polished, perfect, corporate, generic",
            'guidance_scale': 7.0,
            'steps': 45
        }
    }

    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        self.client = genai.Client(api_key=self.api_key)

    def _enhance_prompt(self, scene_prompt, style="Manga", dialogue=None):
        style_settings = self.STYLE_SETTINGS.get(style, self.STYLE_SETTINGS['Manga'])

        # Ensure dialogue is always present
        if not dialogue or len(dialogue.strip()) < 5:
            dialogue = "Narrator: This scene reveals important information about the topic."

        dialogue_text = f"""
        CRITICAL: Include the following dialogue as clear, readable comic-style speech bubbles:
        "{dialogue}"
        
        Dialogue Requirements:
        - Create distinct speech bubbles for different characters
        - Use thought bubbles for internal monologue
        - Make text large and readable
        - Position bubbles to not cover important visual elements
        - Use different bubble shapes for different types of dialogue
        """

        enhanced_prompt = f"""
        Create a professional comic book page in {style} style with 2-4 well-designed comic panels.

        SCENE DESCRIPTION:
        {scene_prompt}

        STYLE CHARACTERISTICS:
        {style_settings['prompt']}

        COMIC PANEL REQUIREMENTS:
        - Design as a proper comic page with clear panel borders
        - Include dynamic character poses and expressive faces
        - Show clear action and emotion in each panel
        - Use varied camera angles and compositions
        - Ensure high visual impact and storytelling clarity

        DIALOGUE INTEGRATION:
        {dialogue_text}

        OUTPUT REQUIREMENTS:
        - Generate a high-quality comic page image
        - Ensure all text is clearly readable
        - Maintain consistent style throughout
        - Create engaging visual storytelling
        """.strip()

        return enhanced_prompt

    def _post_process_image(self, image: Image.Image) -> Image.Image:
        try:
            image = ImageEnhance.Sharpness(image).enhance(1.2)
            image = ImageEnhance.Contrast(image).enhance(1.1)
        except Exception as e:
            logger.warning(f"Image post-processing failed: {e}")
        return image

    def generate_comic_image(self, prompt, style="Manga", dialogue=None):
        """
        Generate a comic image and return the image data as bytes
        """
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

                    # Convert to bytes
                    img_buffer = BytesIO()
                    image.save(img_buffer, format='PNG', quality=95)
                    img_buffer.seek(0)
                    
                    return img_buffer.getvalue()
                elif hasattr(part, "text") and part.text:
                    logger.info(f"Gemini Text Output: {part.text}")

            logger.error("No image found in Gemini response.")
        except Exception as e:
            logger.error(f"Error generating image with Gemini: {e}")

        return None

    def generate_all_images(self, title, scenes, style="Manga"):
        """
        Generate all images for a comic and store them in MongoDB
        """
        scene_data = []
        stored_image_ids = []

        for idx, scene in enumerate(scenes):
            prompt = scene.get("prompt", f"Scene {idx+1}")
            dialogue = scene.get("dialogue", "")
            
            # Generate image
            image_data = self.generate_comic_image(prompt, style, dialogue)
            
            if image_data:
                try:
                    # Store image in MongoDB
                    image_id = db_manager.store_image(
                        image_data=image_data,
                        comic_title=title,
                        scene_number=idx + 1,
                        scene_text=dialogue,
                        metadata={
                            "prompt": prompt,
                            "style": style,
                            "scene_index": idx
                        }
                    )
                    
                    stored_image_ids.append(image_id)
                    
                    scene_data.append({
                        "image_id": image_id,
                        "image_url": f"/api/images/{image_id}",
                        "dialogue": dialogue,
                        "prompt": prompt,
                        "scene_number": idx + 1
                    })
                    
                except Exception as e:
                    logger.error(f"Failed to store scene {idx+1}: {e}")
            else:
                logger.error(f"Failed to generate image for scene {idx+1}")

        # Store comic metadata
        if scene_data:
            try:
                comic_id = db_manager.store_comic(title, scene_data, style)
                return scene_data
            except Exception as e:
                logger.error(f"Failed to store comic metadata: {e}")
                # Clean up stored images if comic metadata storage fails
                for image_id in stored_image_ids:
                    try:
                        db_manager.delete_comic(image_id)
                    except:
                        pass

        return scene_data
