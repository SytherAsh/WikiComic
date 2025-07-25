from flask import Blueprint, request, jsonify

input_bp = Blueprint('input', __name__)

@input_bp.route('/input', methods=['GET', 'POST'])
def input():
    return jsonify({"message": "Hello, World!"})

@input_bp.route('/input/suggest', methods=['GET'])
def suggest():
    query = request.args.get('query', '').strip()
    return jsonify(query)