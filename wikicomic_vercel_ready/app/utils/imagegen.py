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
            'prompt': """professional manga comic book page, ultra-detailed manga art style, dynamic action poses with fluid motion lines, large expressive eyes with detailed iris and highlights, flowing hair with individual strands and movement, speed lines and motion effects, dramatic lighting with strong shadows and highlights, emotional facial expressions with clear emotion, clean precise line art with varying line weights, vibrant saturated colors with perfect contrast, multiple comic panels with clear borders and gutters, professional manga page layout with proper panel flow, detailed character designs with distinctive features, background details that enhance storytelling, atmospheric lighting effects, detailed clothing with folds and textures, expressive hand gestures and body language, cinematic camera angles and compositions, high-quality shading and highlights, professional comic book typography, clear visual hierarchy, balanced composition with proper use of negative space, manga-style character proportions, detailed environmental elements, mood-setting color palettes, professional inking techniques, clear visual storytelling flow""",
            'negative_prompt': "western comic style, realistic, photographic, 3d rendered, flat colors, simple illustrations, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style",
            'guidance_scale': 8.5,
            'steps': 40
        },
        'Western': {
            'prompt': """classic western comic book masterpiece, bold primary colors with perfect saturation, strong black outlines with varying line weights, halftone dots and screen effects, vintage comic aesthetics with retro charm, muscular superhero poses with dynamic anatomy, dramatic shadows with chiaroscuro lighting, comic book panels with clear borders and gutters, speech bubbles with bold readable text and proper spacing, action-packed scenes with motion lines, retro comic book feel with golden age influence, detailed character designs with heroic proportions, expressive faces with clear emotions, detailed backgrounds with depth and atmosphere, professional inking with cross-hatching, vibrant color palette with perfect contrast, cinematic compositions with dramatic angles, detailed clothing and accessories, atmospheric lighting effects, clear visual storytelling, professional typography with proper kerning, balanced panel layouts, detailed environmental elements, mood-setting color schemes, high-quality shading techniques, clear character expressions, professional comic book quality""",
            'negative_prompt': "manga, anime, photorealistic, 3d rendered, modern digital art, minimalist, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style",
            'guidance_scale': 8.0,
            'steps': 35
        },
        'Minimalist': {
            'prompt': """sophisticated minimalist comic layout, clean geometric panels with perfect proportions, limited color palette with bold high-contrast colors, simple expressive line work with precise strokes, modern design aesthetic with contemporary appeal, elegant typography with perfect readability, focused storytelling with clear visual hierarchy, sophisticated composition with balanced elements, refined narrative approach with clean layouts, detailed character expressions despite minimal style, clear dialogue presentation, professional minimalist design, clean panel borders and gutters, balanced use of negative space, modern color theory application, precise line weights and spacing, sophisticated visual flow, elegant character designs, clean environmental elements, professional minimalist quality, clear visual storytelling, refined artistic approach""",
            'negative_prompt': "busy, cluttered, detailed, complex patterns, bright colors, traditional comic style, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style, overly detailed backgrounds",
            'guidance_scale': 9.0,
            'steps': 30
        },
        'Cartoon': {
            'prompt': """vibrant cartoon comic masterpiece, exaggerated character expressions with maximum emotion, bouncy animation feel with dynamic poses, bright cheerful colors with perfect saturation, rounded shapes with smooth curves, fun visual elements with playful details, multiple panels with clear speech bubbles and perfect readability, playful design with family-friendly aesthetic, dynamic character poses with fluid motion, humorous storytelling with clear visual gags, detailed character designs with distinctive features, expressive faces with large eyes and clear emotions, detailed backgrounds with cartoon charm, professional cartoon quality, clear dialogue presentation, balanced color palette, smooth line work, professional typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting lighting, professional cartoon art style""",
            'negative_prompt': "realistic, photographic, serious, gritty, dark colors, complex details, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style",
            'guidance_scale': 8.0,
            'steps': 35
        },
        'Noir': {
            'prompt': """atmospheric noir comic masterpiece, high contrast black and white with selective color accents, dramatic shadows and lighting with chiaroscuro effects, gritty urban atmosphere with detailed cityscapes, cinematic angles with dramatic perspectives, moody expressions with deep emotional impact, dark comic panels with white text bubbles and perfect readability, mysterious and dramatic mood with film noir aesthetic, atmospheric storytelling with mood-setting elements, detailed character designs with noir style, expressive faces with shadow play, detailed backgrounds with urban details, professional noir quality, clear dialogue presentation despite dark theme, balanced contrast ratios, smooth line work, professional typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting lighting effects, professional noir art style""",
            'negative_prompt': "bright colors, cheerful, flat lighting, cartoon style, colorful, happy, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style",
            'guidance_scale': 9.0,
            'steps': 40
        },
        'Indie': {
            'prompt': """artistic indie comic masterpiece, hand-drawn artistic feel with personal touch, experimental panel layouts with creative compositions, unique artistic touch with distinctive style, personal drawing style with character, creative use of space with innovative layouts, artistic ink work with varied techniques, distinctive character designs with personality, alternative comic book aesthetic with artistic merit, expressive dialogue bubbles with creative typography, artistic storytelling with visual poetry, detailed character expressions with emotional depth, detailed backgrounds with artistic interpretation, professional indie quality, clear dialogue presentation, balanced artistic elements, smooth line work, creative typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting artistic style, professional indie art approach""",
            'negative_prompt': "commercial style, mainstream, polished, perfect, corporate, generic, blurry text, unclear dialogue, low quality, pixelated, distorted proportions, amateur art, messy composition, unclear speech bubbles, poor contrast, washed out colors, incomplete panels, broken lines, inconsistent style",
            'guidance_scale': 8.5,
            'steps': 35
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

        # Ensure dialogue is always present and properly formatted
        if not dialogue or len(dialogue.strip()) < 5:
            dialogue = "Narrator: This scene reveals important information about the topic."

        # Enhanced dialogue formatting with character separation
        dialogue_lines = dialogue.split('\n')
        formatted_dialogue = ""
        for line in dialogue_lines:
            if ':' in line:
                character, text = line.split(':', 1)
                formatted_dialogue += f"{character.strip()}: \"{text.strip()}\"\n"
            else:
                formatted_dialogue += f"Narrator: \"{line.strip()}\"\n"

        dialogue_text = f"""
        CRITICAL DIALOGUE REQUIREMENTS - MUST BE CRYSTAL CLEAR AND READABLE:
        
        DIALOGUE TO INCLUDE:
        {formatted_dialogue.strip()}
        
        DIALOGUE VISIBILITY REQUIREMENTS:
        - Create distinct, well-defined speech bubbles with clear borders
        - Use thought bubbles for internal monologue with cloud-like shapes
        - Make text EXTREMELY large, bold, and readable with perfect contrast
        - Use high-contrast colors: black text on white/light backgrounds, white text on dark backgrounds
        - Position bubbles strategically to NOT cover important visual elements
        - Use different bubble shapes for different characters and dialogue types
        - Ensure text has proper spacing and kerning for maximum readability
        - Add subtle shadows or outlines to text for better visibility
        - Use professional comic book typography with clear font choices
        - Make dialogue bubbles prominent but not overwhelming to the art
        - Ensure each character's dialogue is clearly distinguishable
        - Add visual indicators (arrows, tails) to connect bubbles to speakers
        """

        enhanced_prompt = f"""
        Create a PROFESSIONAL HIGH-QUALITY comic book page in {style} style with 2-4 expertly designed comic panels.

        SCENE DESCRIPTION:
        {scene_prompt}

        STYLE CHARACTERISTICS:
        {style_settings['prompt']}

        COMIC PANEL REQUIREMENTS:
        - Design as a professional comic page with clear panel borders and gutters
        - Include dynamic character poses with expressive faces and body language
        - Show clear action and emotion in each panel with dramatic impact
        - Use varied camera angles and compositions for visual interest
        - Ensure high visual impact and storytelling clarity
        - Create proper visual flow between panels
        - Include detailed backgrounds that enhance the story
        - Use atmospheric lighting and shadows for mood
        - Ensure each panel advances the narrative clearly

        DIALOGUE INTEGRATION:
        {dialogue_text}

        TECHNICAL REQUIREMENTS:
        - Generate a single high-quality comic page with professional standards
        - Optimize for maximum quality while maintaining reasonable generation time
        - Use {style_settings['steps']} steps for optimal quality
        - Focus on crystal clear, highly readable text in speech bubbles
        - Ensure perfect contrast and visibility for all text elements
        - Create balanced composition with proper use of space
        - Maintain consistent style throughout all panels
        - Include detailed character expressions and emotions
        - Use professional comic book layout principles
        - Ensure all visual elements support the story and dialogue

        QUALITY STANDARDS:
        - Ultra-high resolution with crisp, clear lines
        - Professional comic book quality suitable for publication
        - Perfect color balance and contrast
        - Clear visual hierarchy and storytelling flow
        - Expert-level artistic technique and composition
        - Crystal clear dialogue visibility and readability
        - Consistent character designs and proportions
        - Professional typography and text presentation
        - Balanced panel layouts with proper spacing
        - Engaging visual storytelling that complements the dialogue

        Output a complete, professional comic page that looks like it came from a published comic book, with crystal clear dialogue and exceptional artistic quality.
        """.strip()

        return enhanced_prompt

    def _post_process_image(self, image: Image.Image) -> Image.Image:
        """Optimize image for web delivery while maintaining quality"""
        try:
            # Resize if too large (max 1200px width for better quality)
            if image.width > 1200:
                ratio = 1200 / image.width
                new_height = int(image.height * ratio)
                image = image.resize((1200, new_height), Image.Resampling.LANCZOS)
            
            # Enhance contrast and sharpness for better text visibility
            image = ImageEnhance.Contrast(image).enhance(1.2)
            image = ImageEnhance.Sharpness(image).enhance(1.3)
            image = ImageEnhance.Color(image).enhance(1.1)
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

                    # Convert to bytes with high quality
                    img_buffer = BytesIO()
                    image.save(img_buffer, format='PNG', optimize=True, quality=95)
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
