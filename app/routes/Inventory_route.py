from flask import Blueprint, jsonify, request, make_response
import requests

inventory_bp = Blueprint('inventory', __name__)
BACKEND_URL = "natsu-dev.space:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

@inventory_bp.route('/all_ingredients', methods=['GET'])
def all_ingredients():
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_stack_list", headers=headers, params = request.args)
    return forward_response(resp)