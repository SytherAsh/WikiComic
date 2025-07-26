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
            'prompt': 'manga art style, dynamic action poses, large expressive eyes, flowing hair, speed lines, dramatic lighting, emotional facial expressions, clean line art, vibrant colors, multiple comic panels with speech bubbles, professional manga page layout, character-driven storytelling',
            'tone': 'energetic and emotional'
        },
        'Western': {
            'name': 'RETRO COMICS',
            'prompt': 'classic western comic book style, bold primary colors, strong black outlines, halftone dots, vintage comic aesthetics, muscular superhero poses, dramatic shadows, comic book panels with clear borders, speech bubbles with bold text, action-packed scenes, retro comic book feel, epic storytelling',
            'tone': 'nostalgic and bold'
        },
        'Minimalist': {
            'name': 'SLEEK STYLE',
            'prompt': 'minimalist comic layout, clean geometric panels, limited color palette with bold contrasts, simple expressive line work, modern design aesthetic, elegant typography, focused storytelling with clear visual hierarchy, sophisticated composition, refined narrative approach',
            'tone': 'sophisticated and modern'
        },
        'Cartoon': {
            'name': 'WACKY TOONS',
            'prompt': 'vibrant cartoon comic style, exaggerated character expressions, bouncy animation feel, bright cheerful colors, rounded shapes, fun visual elements, multiple panels with clear speech bubbles, playful design, family-friendly aesthetic, dynamic character poses, humorous storytelling',
            'tone': 'playful and energetic'
        },
        'Noir': {
            'name': 'DARK NOIR',
            'prompt': 'noir comic layout, high contrast black and white with selective color, dramatic shadows and lighting, gritty urban atmosphere, cinematic angles, moody expressions, dark comic panels with white text bubbles, mysterious and dramatic mood, film noir aesthetic, atmospheric storytelling',
            'tone': 'mysterious and dramatic'
        },
        'Indie': {
            'name': 'INDIE VIBES',
            'prompt': 'indie comic style, hand-drawn artistic feel, experimental panel layouts, unique artistic touch, personal drawing style, creative use of space, artistic ink work, distinctive character designs, alternative comic book aesthetic, expressive dialogue bubbles, artistic storytelling',
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

        prompt = f"""You are a master comic book storyteller. Create an engaging, dialogue-rich comic book storyline titled '{title}' in {style_info['name']} style.

CRITICAL REQUIREMENTS:
- Every scene MUST include character dialogue or narration
- Create 2-3 main characters who will drive the story
- Include emotional moments, conflicts, and character development
- Make the story educational while being entertaining
- Ensure each scene has clear visual and narrative progression

Style Requirements:
- Use a {style_info['tone']} narrative tone throughout
- Emphasize visual storytelling that matches: {style_info['prompt']}
- Story length should be around {word_count} words
- Structure the story into distinct, panel-ready scenes with clear beginnings, middles, and endings

Character Development Guidelines:
- Create a protagonist who learns or discovers something about the topic
- Include a mentor/guide character who explains concepts
- Add an antagonist or challenge that creates conflict
- Each character should have distinct personalities and speech patterns

Dialogue Requirements:
- Every scene must have meaningful character conversations
- Use dialogue to explain complex concepts naturally
- Include emotional reactions and character interactions
- Mix dialogue with narration for storytelling variety
- Ensure dialogue advances the plot and reveals character

Context for story creation:
- Summary of the topic: "{summary.strip()}"
- Relevant categories: {categories_str}
- Detailed content extracted from Wikipedia:
{content}

Story Structure:
1. Introduction: Introduce characters and the main topic
2. Development: Characters explore and learn about the topic
3. Conflict: Challenges or misunderstandings arise
4. Resolution: Characters overcome obstacles and gain understanding
5. Conclusion: Characters reflect on what they've learned

Output a compelling comic book storyline that educates while entertaining."""

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

        system_prompt = f"""You are a professional comic writer and artist. Create {num_scenes} scenes for a comic titled '{title}' in {style_info['name']} style.

CRITICAL REQUIREMENTS:
- Each scene MUST have both a visual prompt AND character dialogue
- Create scenes that flow logically from the storyline
- Include a mix of action, dialogue, and exposition scenes
- Ensure each scene advances the story and reveals character

Scene Structure for each scene:
1. VISUAL PROMPT: Detailed description of what the comic panel should show
2. DIALOGUE: Character conversations that explain or advance the story
3. NARRATION: Brief narrative text if needed for context

Style Guidelines:
- Visual prompts should match: {style_info['prompt']}
- Dialogue should be {style_info['tone']} in tone
- Include character emotions and reactions
- Create dynamic, visually interesting scenes

Storyline to adapt:
{storyline}

Output format for each scene:
Scene X:
- prompt: "Detailed visual description for the comic panel"
- dialogue: "Character conversations and interactions"
- narration: "Brief narrative text if needed"

Create exactly {num_scenes} scenes that tell the complete story."""

        try:
            response = self.client.chat.completions.create(
                messages=[{"role": "user", "content": system_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.8,
                max_tokens=3000,
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
                'prompt': f"Scene {len(scenes) + 1} continuation of the story",
                'dialogue': "Character: Let's continue our journey.",
                'narration': "The story continues..."
            })
        
        return scenes[:expected_scenes]
