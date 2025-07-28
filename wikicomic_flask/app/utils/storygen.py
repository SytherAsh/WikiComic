import os
import logging
import re
import json
import groq  # pip install groq
from flask import current_app

logger = logging.getLogger(__name__)

class StoryGenerator:
    STYLE_PROMPTS = {
        'Manga': {
            'name': 'MANGA MADNESS',
            'prompt': 'professional manga comic book page, ultra-detailed manga art style, dynamic action poses with fluid motion lines, large expressive eyes with detailed iris and highlights, flowing hair with individual strands and movement, speed lines and motion effects, dramatic lighting with strong shadows and highlights, emotional facial expressions with clear emotion, clean precise line art with varying line weights, vibrant saturated colors with perfect contrast, multiple comic panels with clear borders and gutters, professional manga page layout with proper panel flow, detailed character designs with distinctive features, background details that enhance storytelling, atmospheric lighting effects, detailed clothing with folds and textures, expressive hand gestures and body language, cinematic camera angles and compositions, high-quality shading and highlights, professional comic book typography, clear visual hierarchy, balanced composition with proper use of negative space, manga-style character proportions, detailed environmental elements, mood-setting color palettes, professional inking techniques, clear visual storytelling flow',
            'tone': 'energetic and emotional'
        },
        'Western': {
            'name': 'RETRO COMICS',
            'prompt': 'classic western comic book masterpiece, bold primary colors with perfect saturation, strong black outlines with varying line weights, halftone dots and screen effects, vintage comic aesthetics with retro charm, muscular superhero poses with dynamic anatomy, dramatic shadows with chiaroscuro lighting, comic book panels with clear borders and gutters, speech bubbles with bold readable text and proper spacing, action-packed scenes with motion lines, retro comic book feel with golden age influence, detailed character designs with heroic proportions, expressive faces with clear emotions, detailed backgrounds with depth and atmosphere, professional inking with cross-hatching, vibrant color palette with perfect contrast, cinematic compositions with dramatic angles, detailed clothing and accessories, atmospheric lighting effects, clear visual storytelling, professional typography with proper kerning, balanced panel layouts, detailed environmental elements, mood-setting color schemes, high-quality shading techniques, clear character expressions, professional comic book quality',
            'tone': 'nostalgic and bold'
        },
        'Minimalist': {
            'name': 'SLEEK STYLE',
            'prompt': 'sophisticated minimalist comic layout, clean geometric panels with perfect proportions, limited color palette with bold high-contrast colors, simple expressive line work with precise strokes, modern design aesthetic with contemporary appeal, elegant typography with perfect readability, focused storytelling with clear visual hierarchy, sophisticated composition with balanced elements, refined narrative approach with clean layouts, detailed character expressions despite minimal style, clear dialogue presentation, professional minimalist design, clean panel borders and gutters, balanced use of negative space, modern color theory application, precise line weights and spacing, sophisticated visual flow, elegant character designs, clean environmental elements, professional minimalist quality, clear visual storytelling, refined artistic approach',
            'tone': 'sophisticated and modern'
        },
        'Cartoon': {
            'name': 'WACKY TOONS',
            'prompt': 'vibrant cartoon comic masterpiece, exaggerated character expressions with maximum emotion, bouncy animation feel with dynamic poses, bright cheerful colors with perfect saturation, rounded shapes with smooth curves, fun visual elements with playful details, multiple panels with clear speech bubbles and perfect readability, playful design with family-friendly aesthetic, dynamic character poses with fluid motion, humorous storytelling with clear visual gags, detailed character designs with distinctive features, expressive faces with large eyes and clear emotions, detailed backgrounds with cartoon charm, professional cartoon quality, clear dialogue presentation, balanced color palette, smooth line work, professional typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting lighting, professional cartoon art style',
            'tone': 'playful and energetic'
        },
        'Noir': {
            'name': 'DARK NOIR',
            'prompt': 'atmospheric noir comic masterpiece, high contrast black and white with selective color accents, dramatic shadows and lighting with chiaroscuro effects, gritty urban atmosphere with detailed cityscapes, cinematic angles with dramatic perspectives, moody expressions with deep emotional impact, dark comic panels with white text bubbles and perfect readability, mysterious and dramatic mood with film noir aesthetic, atmospheric storytelling with mood-setting elements, detailed character designs with noir style, expressive faces with shadow play, detailed backgrounds with urban details, professional noir quality, clear dialogue presentation despite dark theme, balanced contrast ratios, smooth line work, professional typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting lighting effects, professional noir art style',
            'tone': 'mysterious and dramatic'
        },
        'Indie': {
            'name': 'INDIE VIBES',
            'prompt': 'artistic indie comic masterpiece, hand-drawn artistic feel with personal touch, experimental panel layouts with creative compositions, unique artistic touch with distinctive style, personal drawing style with character, creative use of space with innovative layouts, artistic ink work with varied techniques, distinctive character designs with personality, alternative comic book aesthetic with artistic merit, expressive dialogue bubbles with creative typography, artistic storytelling with visual poetry, detailed character expressions with emotional depth, detailed backgrounds with artistic interpretation, professional indie quality, clear dialogue presentation, balanced artistic elements, smooth line work, creative typography, clear visual hierarchy, engaging character interactions, detailed environmental elements, mood-setting artistic style, professional indie art approach',
            'tone': 'artistic and personal'
        }
    }

    LENGTH_SETTINGS = {
        'short': {'words': 500, 'scenes': 5},
        'medium': {'words': 1000, 'scenes': 7},
        'long': {'words': 2000, 'scenes': 10}
    }

    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.getenv('GROQ_API_KEY') or current_app.config.get('GROQ_API_KEY')
        self.client = groq.Client(api_key=api_key)

    def generate_storyline(self, title, content, summary, categories, target_length="medium", style="Manga"):
        style_info = self.STYLE_PROMPTS.get(style, self.STYLE_PROMPTS['Manga'])
        length_info = self.LENGTH_SETTINGS.get(target_length, self.LENGTH_SETTINGS['medium'])
        word_count = length_info['words']
        max_chars = 15000
        content = content[:max_chars] if len(content) > max_chars else content

        categories_str = ", ".join(categories[:10])  # Limit to top 10 for prompt brevity

        prompt = f"""You are a master comic book storyteller and visual artist. Create an engaging, dialogue-rich comic book storyline titled '{title}' in {style_info['name']} style.

CRITICAL REQUIREMENTS:
- Every scene MUST include character dialogue or narration
- Create 2-3 main characters who will drive the story with distinctive personalities
- Include emotional moments, conflicts, and character development
- Make the story educational while being entertaining and visually engaging
- Ensure each scene has clear visual and narrative progression
- Focus on creating scenes that will translate beautifully to comic panels

Style Requirements:
- Use a {style_info['tone']} narrative tone throughout
- Emphasize visual storytelling that matches: {style_info['prompt']}
- Story length should be around {word_count} words
- Structure the story into distinct, panel-ready scenes with clear beginnings, middles, and endings
- Create scenes with strong visual impact and clear character interactions

Character Development Guidelines:
- Create a protagonist who learns or discovers something about the topic
- Include a mentor/guide character who explains concepts clearly
- Add an antagonist or challenge that creates conflict and tension
- Each character should have distinct personalities, speech patterns, and visual characteristics
- Include character emotions and reactions that can be visually expressed

Dialogue Requirements:
- Every scene must have meaningful character conversations
- Use dialogue to explain complex concepts naturally and engagingly
- Include emotional reactions and character interactions
- Mix dialogue with narration for storytelling variety
- Ensure dialogue advances the plot and reveals character personality
- Create dialogue that will work well in speech bubbles

Visual Storytelling Guidelines:
- Create scenes with clear visual elements that can be drawn
- Include character poses, expressions, and body language
- Describe environments and settings that enhance the story
- Use lighting and mood to create atmosphere
- Include action and movement where appropriate
- Create scenes with varied compositions and camera angles

Context for story creation:
- Summary of the topic: "{summary.strip()}"
- Relevant categories: {categories_str}
- Detailed content extracted from Wikipedia:
{content}

Story Structure:
1. Introduction: Introduce characters and the main topic with visual impact
2. Development: Characters explore and learn about the topic through interaction
3. Conflict: Challenges or misunderstandings arise with dramatic tension
4. Resolution: Characters overcome obstacles and gain understanding
5. Conclusion: Characters reflect on what they've learned with emotional closure

Output a compelling comic book storyline that educates while entertaining, with strong visual elements and clear character interactions that will translate beautifully to comic panels."""

        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=2000,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating storyline: {e}")
            return None

    def generate_scene_prompts_and_dialogues(self, title, storyline, target_length="medium", comic_style='Manga'):
        style_info = self.STYLE_PROMPTS.get(comic_style, self.STYLE_PROMPTS['Manga'])
        length_info = self.LENGTH_SETTINGS.get(target_length, self.LENGTH_SETTINGS['medium'])
        num_scenes = length_info['scenes']

        system_prompt = f"""You are a professional comic writer and visual artist specializing in {style_info['name']} style. Create {num_scenes} highly detailed scenes for a comic titled '{title}'.

CRITICAL REQUIREMENTS:
- Each scene MUST have both an extremely detailed visual prompt AND meaningful character dialogue
- Create scenes that flow logically from the storyline with clear visual progression
- Include a mix of action, dialogue, and exposition scenes with strong visual impact
- Ensure each scene advances the story and reveals character personality
- Focus on creating scenes that will generate beautiful, professional comic panels

VISUAL PROMPT REQUIREMENTS (EXTREMELY DETAILED):
- Describe specific character poses, expressions, and body language in detail
- Include detailed environmental descriptions with specific visual elements
- Specify lighting, mood, and atmospheric effects
- Mention camera angles and panel composition with precision
- Include character clothing, accessories, and distinctive features
- Describe background elements that support the story
- Specify color schemes and visual mood
- Include motion lines, effects, and dynamic elements where appropriate
- Describe facial expressions and emotional states clearly
- Include hand gestures and character interactions
- Specify panel layout and visual flow

DIALOGUE REQUIREMENTS:
- Every scene must have meaningful character conversations
- Use dialogue to explain concepts naturally and engagingly
- Include emotional reactions and character personality
- Create dialogue that will work perfectly in speech bubbles
- Ensure each character has a distinct voice and speaking style
- Include both dialogue and narration where appropriate

Style Guidelines:
- Visual prompts should match: {style_info['prompt']}
- Dialogue should be {style_info['tone']} in tone
- Include character emotions and reactions that can be visually expressed
- Create dynamic, visually interesting scenes with strong composition
- Focus on scenes that will translate beautifully to comic art

Storyline to adapt:
{storyline}

Output format for each scene:
Scene X:
- prompt: "EXTREMELY detailed visual description including character poses, expressions, setting, lighting, mood, camera angles, panel composition, environmental details, character interactions, and all visual elements needed for professional comic art"
- dialogue: "Meaningful character conversations and interactions that advance the story and reveal character personality"

Create exactly {num_scenes} scenes that tell the complete story with maximum visual detail and engaging dialogue."""

        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": system_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.8,
                max_tokens=4000,
            )
            
            content = response.choices[0].message.content
            return self._parse_scenes(content, num_scenes)
            
        except Exception as e:
            logger.error(f"Error generating scenes: {e}")
            return []

    def _parse_scenes(self, content, expected_scenes):
        """Parse the AI response into structured scene data"""
        scenes = []
        lines = content.split('\n')
        current_scene = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.lower().startswith('scene'):
                if current_scene:
                    scenes.append(current_scene)
                current_scene = {'scene_number': len(scenes) + 1}
            elif line.startswith('- prompt:'):
                current_scene['prompt'] = line.replace('- prompt:', '').strip().strip('"')
            elif line.startswith('- dialogue:'):
                current_scene['dialogue'] = line.replace('- dialogue:', '').strip().strip('"')
            elif line.startswith('- narration:'):
                current_scene['narration'] = line.replace('- narration:', '').strip().strip('"')
        
        # Add the last scene
        if current_scene:
            scenes.append(current_scene)
        
        # Ensure we have the expected number of scenes
        while len(scenes) < expected_scenes:
            scenes.append({
                'scene_number': len(scenes) + 1,
                'prompt': f"Scene {len(scenes) + 1} continuation of the story with detailed visual elements, character interactions, and atmospheric details",
                'dialogue': "Character: Let's continue our journey and explore this fascinating topic.",
                'narration': "The story continues with new discoveries and insights..."
            })
        
        return scenes[:expected_scenes]
