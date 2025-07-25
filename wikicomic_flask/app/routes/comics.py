import os
import json
from flask import Blueprint, jsonify, current_app

comics_bp = Blueprint('comics', __name__)

@comics_bp.route('/comics', methods=['GET'])
def list_comics():
    comics_dir = os.path.join(current_app.root_path, 'static', 'comic')
    comics = []
    if os.path.exists(comics_dir):
        for comic_folder in os.listdir(comics_dir):
            folder_path = os.path.join(comics_dir, comic_folder)
            if os.path.isdir(folder_path):
                # Gather images and scenes
                images = []
                scenes = []
                for fname in sorted(os.listdir(folder_path)):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        img_url = f'/static/comic/{comic_folder}/{fname}'
                        images.append(img_url)
                        # Try to find a matching scene_X.json
                        scene_num = ''.join(filter(str.isdigit, fname))
                        json_fname = f'scene_{scene_num}.json'
                        json_path = os.path.join(folder_path, json_fname)
                        if os.path.exists(json_path):
                            with open(json_path, 'r', encoding='utf-8') as f:
                                scene_data = json.load(f)
                            # Add image URL to scene data
                            scene_data['image'] = img_url
                            scenes.append(scene_data)
                if images:
                    comics.append({
                        'title': comic_folder,
                        'images': images,
                        'scenes': scenes
                    })
    return jsonify({'comics': comics})