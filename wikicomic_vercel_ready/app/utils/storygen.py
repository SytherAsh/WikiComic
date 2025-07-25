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
            'prompt': 'manga art style, dynamic poses, expressive characters, clean lines, dramatic lighting, speed lines, emotion-focused panels',
            'tone': 'energetic and emotional'
        },
        'Western': {
            'name': 'RETRO COMICS',
            'prompt': 'classic comic book style, bold colors, strong outlines, halftone dots, vintage comic aesthetics, action-packed panels',
            'tone': 'nostalgic and bold'
        },
        'Minimalist': {
            'name': 'SLEEK STYLE',
            'prompt': 'minimalist art style, clean compositions, limited color palette, modern design, elegant simplicity, focused storytelling',
            'tone': 'sophisticated and modern'
        },
        'Cartoon': {
            'name': 'WACKY TOONS',
            'prompt': 'cartoon style, exaggerated expressions, bouncy animation style, vibrant colors, playful designs, fun visual elements',
            'tone': 'playful and energetic'
        },
        'Noir': {
            'name': 'DARK NOIR',
            'prompt': 'noir comic style, high contrast, dramatic shadows, moody lighting, gritty textures, cinematic angles',
            'tone': 'mysterious and dramatic'
        },
        'Indie': {
            'name': 'INDIE VIBES',
            'prompt': 'indie comic style, unique artistic flair, hand-drawn feel, experimental layouts, personal artistic touch',
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

        prompt = f"""Create an engaging comic book storyline titled '{title}' in {style_info['name']} style.
        
        Style Requirements:
        - Use a {style_info['tone']} narrative tone
        - Emphasize visual storytelling that matches: {style_info['prompt']}
        - Story length should be around {word_count} words
        - Structure the story into distinct, panel-ready scenes
        
        Context for story creation:
        - Summary of the topic: "{summary.strip()}"
        - Relevant categories: {categories_str}
        - Detailed content extracted from Wikipedia:
        {content}

        Ensure the comic story reflects the essence of the topic while adding engaging drama or excitement for a comic reader.
        """

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

Each scene must include:
- 'prompt': A vivid visual description (for the artist)
- 'dialogue': Natural and expressive character conversation

The comic is based on the following storyline (adapted from Wikipedia's summary, content, and categories). Focus on making each scene visually dynamic and emotionally engaging.

Storyline:
{storyline}
"""

        user_prompt = f"""Strictly return a JSON array of {num_scenes} scenes. Each object must have:
- 'prompt'
- 'dialogue'

No additional text outside the array. Begin with [ and end with ]."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama3-8b-8192",
                temperature=0.7,
                max_tokens=2000
            )

            content = response.choices[0].message.content
            logger.debug(f"Raw scene response:\n{content}")

            try:
                return json.loads(content)
            except json.JSONDecodeError:
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    raise ValueError("Could not parse valid JSON array from the response.")

        except Exception as e:
            logger.error(f"Error generating scenes: {e}")
            return [{'prompt': f"Scene {i+1}: {title}", 'dialogue': ''} for i in range(num_scenes)]
