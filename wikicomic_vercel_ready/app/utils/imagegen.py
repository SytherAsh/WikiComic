import os
import logging
import json
from io import BytesIO
from PIL import Image, ImageEnhance
from google import genai
from google.genai import types
import re
from ..database import db_manager
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger(__name__)

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\/*?:"<>|]', "_", name).strip()

class ComicImageGenerator:
    STYLE_SETTINGS = {
        'Manga': {
            'prompt': "manga comic book style, dynamic action poses, large expressive eyes, flowing hair, speed lines, dramatic lighting, emotional facial expressions, clean line art, vibrant colors, multiple comic panels with speech bubbles, professional manga page layout",
            'negative_prompt': "western comic style, realistic, photographic, 3d rendered, flat colors, simple illustrations",
            'guidance_scale': 7.5,
            'steps': 30  # Reduced for faster generation
        },
        'Western': {
            'prompt': "classic western comic book style, bold primary colors, strong black outlines, halftone dots, vintage comic aesthetics, muscular superhero poses, dramatic shadows, comic book panels with clear borders, speech bubbles with bold text, action-packed scenes, retro comic book feel",
            'negative_prompt': "manga, anime, photorealistic, 3d rendered, modern digital art, minimalist",
            'guidance_scale': 7.0,
            'steps': 25
        },
        'Minimalist': {
            'prompt': "minimalist comic layout, clean geometric panels, limited color palette with bold contrasts, simple expressive line work, modern design aesthetic, elegant typography, focused storytelling with clear visual hierarchy, sophisticated composition",
            'negative_prompt': "busy, cluttered, detailed, complex patterns, bright colors, traditional comic style",
            'guidance_scale': 8.0,
            'steps': 20
        },
        'Cartoon': {
            'prompt': "vibrant cartoon comic style, exaggerated character expressions, bouncy animation feel, bright cheerful colors, rounded shapes, fun visual elements, multiple panels with clear speech bubbles, playful design, family-friendly aesthetic, dynamic character poses",
            'negative_prompt': "realistic, photographic, serious, gritty, dark colors, complex details",
            'guidance_scale': 7.0,
            'steps': 25
        },
        'Noir': {
            'prompt': "noir comic layout, high contrast black and white with selective color, dramatic shadows and lighting, gritty urban atmosphere, cinematic angles, moody expressions, dark comic panels with white text bubbles, mysterious and dramatic mood, film noir aesthetic",
            'negative_prompt': "bright colors, cheerful, flat lighting, cartoon style, colorful, happy",
            'guidance_scale': 8.5,
            'steps': 30
        },
        'Indie': {
            'prompt': "indie comic style, hand-drawn artistic feel, experimental panel layouts, unique artistic touch, personal drawing style, creative use of space, artistic ink work, distinctive character designs, alternative comic book aesthetic, expressive dialogue bubbles",
            'negative_prompt': "commercial style, mainstream, polished, perfect, corporate, generic",
            'guidance_scale': 7.0,
            'steps': 25
        }
    }

    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        self.client = genai.Client(api_key=self.api_key)
        self._executor = ThreadPoolExecutor(max_workers=3)  # Limit concurrent requests
        self._cache = {}

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

        TECHNICAL REQUIREMENTS:
        - Generate a single high-quality comic page
        - Optimize for fast generation while maintaining quality
        - Use {style_settings['steps']} steps for balanced speed/quality
        - Focus on clear, readable text in speech bubbles
        """

        return enhanced_prompt

    def _post_process_image(self, image: Image.Image) -> Image.Image:
        """Optimize image for web delivery"""
        try:
            # Resize if too large (max 1024px width)
            if image.width > 1024:
                ratio = 1024 / image.width
                new_height = int(image.height * ratio)
                image = image.resize((1024, new_height), Image.Resampling.LANCZOS)
            
            # Optimize contrast slightly
            image = ImageEnhance.Contrast(image).enhance(1.1)
        except Exception as e:
            logger.warning(f"Image post-processing failed: {e}")
        return image

    def generate_comic_image(self, prompt, style="Manga", dialogue=None):
        """
        Generate a comic image and return the image data as bytes
        """
        start_time = time.time()
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

                    # Convert to bytes with optimization
                    img_buffer = BytesIO()
                    image.save(img_buffer, format='PNG', optimize=True, quality=85)
                    img_buffer.seek(0)
                    
                    elapsed_time = time.time() - start_time
                    logger.info(f"Image generated in {elapsed_time:.2f}s")
                    return img_buffer.getvalue()
                elif hasattr(part, "text") and part.text:
                    logger.info(f"Gemini Text Output: {part.text}")

            logger.error("No image found in Gemini response.")
        except Exception as e:
            logger.error(f"Error generating image with Gemini: {e}")

        return None

    def generate_all_images(self, title, scenes, style="Manga"):
        """
        Generate all images for a comic with parallel processing
        """
        start_time = time.time()
        scene_data = []
        stored_image_ids = []

        # Process images in parallel with limited concurrency
        futures = []
        for idx, scene in enumerate(scenes):
            prompt = scene.get("prompt", f"Scene {idx+1}")
            dialogue = scene.get("dialogue", "")
            
            future = self._executor.submit(
                self._generate_and_store_image,
                title, prompt, dialogue, style, idx
            )
            futures.append((idx, future))

        # Collect results
        for idx, future in futures:
            try:
                result = future.result(timeout=60)  # 60 second timeout per image
                if result:
                    scene_data.append(result)
                    stored_image_ids.append(result["image_id"])
            except Exception as e:
                logger.error(f"Failed to generate image for scene {idx+1}: {e}")

        # Store comic metadata
        if scene_data:
            try:
                comic_id = db_manager.store_comic(title, scene_data, style)
                elapsed_time = time.time() - start_time
                logger.info(f"Comic generation completed: {len(scene_data)} scenes in {elapsed_time:.1f}s")
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

    def _generate_and_store_image(self, title, prompt, dialogue, style, idx):
        """Generate and store a single image"""
        try:
            # Generate image
            image_data = self.generate_comic_image(prompt, style, dialogue)
            
            if image_data:
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
                
                return {
                    "image_id": image_id,
                    "image_url": f"/api/images/{image_id}",
                    "dialogue": dialogue,
                    "prompt": prompt,
                    "scene_number": idx + 1
                }
        except Exception as e:
            logger.error(f"Failed to generate and store scene {idx+1}: {e}")
        
        return None
