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

Ensure the comic story is both educational and emotionally engaging, with every scene containing meaningful dialogue that advances the plot and educates the reader about '{title}'.
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

        system_prompt = f"""You are a professional comic writer and artist specializing in {style_info['name']} style. Create {num_scenes} detailed scenes for a comic titled '{title}'.

CRITICAL REQUIREMENTS FOR EACH SCENE:
1. DIALOGUE IS MANDATORY: Every scene MUST include meaningful character dialogue or narration
2. VISUAL DETAILS: Provide vivid, specific visual descriptions for the artist
3. CHARACTER INTERACTION: Include conversations between characters that advance the story
4. EMOTIONAL DEPTH: Show character emotions and reactions through dialogue
5. EDUCATIONAL VALUE: Use dialogue to explain concepts about the topic naturally

DIALOGUE GUIDELINES:
- Every scene must have at least 2-3 lines of dialogue or narration
- Use dialogue to explain complex concepts in simple terms
- Include character reactions and emotional responses
- Mix character conversations with narrative exposition
- If no character dialogue fits, use narrator commentary or thought bubbles

VISUAL PROMPT GUIDELINES:
- Describe specific character poses, expressions, and actions
- Include environmental details and setting descriptions
- Specify lighting, mood, and atmosphere
- Mention camera angles and panel composition
- Include visual elements that support the dialogue

Storyline Context:
{storyline}

Style Characteristics: {style_info['prompt']}
Tone: {style_info['tone']}

Remember: NO SCENE should be dialogue-free. Every scene must educate and entertain through character interaction and visual storytelling.
"""

        user_prompt = f"""Create exactly {num_scenes} scenes. Each scene object must contain:

{{
  "prompt": "Detailed visual description including character poses, expressions, setting, lighting, and mood. Be specific about what the artist should draw.",
  "dialogue": "2-3 lines of meaningful character dialogue or narration that explains concepts and advances the story. NEVER leave this empty."
}}

Return ONLY a valid JSON array. Each scene must have both 'prompt' and 'dialogue' fields populated with substantial content."""

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
                scenes = json.loads(content)
                # Validate and enhance scenes
                enhanced_scenes = []
                for i, scene in enumerate(scenes):
                    prompt = scene.get("prompt", f"Scene {i+1}: {title}")
                    dialogue = scene.get("dialogue", "")
                    
                    # If dialogue is empty or too short, add narration
                    if not dialogue or len(dialogue.strip()) < 10:
                        dialogue = f"Narrator: This scene shows important aspects of {title}. Let's explore what makes this topic fascinating and significant."
                    
                    # Enhance prompt if too basic
                    if len(prompt) < 50:
                        prompt = f"Scene {i+1}: A detailed view of {title} with characters engaged in learning and discovery. Dynamic poses, expressive faces, and educational atmosphere."
                    
                    enhanced_scenes.append({
                        "prompt": prompt,
                        "dialogue": dialogue
                    })
                
                return enhanced_scenes
                
            except json.JSONDecodeError:
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    scenes = json.loads(json_match.group())
                    # Apply same validation as above
                    enhanced_scenes = []
                    for i, scene in enumerate(scenes):
                        prompt = scene.get("prompt", f"Scene {i+1}: {title}")
                        dialogue = scene.get("dialogue", "")
                        
                        if not dialogue or len(dialogue.strip()) < 10:
                            dialogue = f"Narrator: This scene shows important aspects of {title}. Let's explore what makes this topic fascinating and significant."
                        
                        if len(prompt) < 50:
                            prompt = f"Scene {i+1}: A detailed view of {title} with characters engaged in learning and discovery. Dynamic poses, expressive faces, and educational atmosphere."
                        
                        enhanced_scenes.append({
                            "prompt": prompt,
                            "dialogue": dialogue
                        })
                    
                    return enhanced_scenes
                else:
                    raise ValueError("Could not parse valid JSON array from the response.")

        except Exception as e:
            logger.error(f"Error generating scenes: {e}")
            # Return enhanced fallback scenes with dialogue
            fallback_scenes = []
            for i in range(num_scenes):
                fallback_scenes.append({
                    'prompt': f"Scene {i+1}: A detailed comic panel showing characters learning about {title}. Dynamic poses, expressive faces, educational setting with visual elements that explain the topic.",
                    'dialogue': f"Character: Let me tell you about {title}. It's fascinating because... Narrator: This discovery changes everything we thought we knew."
                })
            return fallback_scenes
