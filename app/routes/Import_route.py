from flask import Blueprint, jsonify, request, current_app, Response, make_response
import requests

import_bp = Blueprint('import', __name__)
BACKEND_URL = 'http://localhost:8080'

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

@import_bp.route('/all_ingredients', methods=['POST'])
def get_inventory():
    print("get_inventory")
    token = request.headers.get("Authorization")
    print("token:", token)
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    print("headers:", headers)
    response = requests.get(
        f"{BACKEND_URL}/item_stack_list",
        headers=headers
    )
    return forward_response(response)

@import_bp.route('/new_ingredient', methods=['POST'])
def create_item():
    token = request.headers.get("Authorization")
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    body = request.get_json(force=True)
    resp = requests.post(f"{BACKEND_URL}/item_stack_create", json=body, headers=headers)
    return forward_response(resp)

@import_bp.route('/ingredient_import', methods=['POST'])
def update_item():
    token = request.headers.get("Authorization")
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    body = request.get_json(force=True)
    print("body:", body)
    resp = requests.post(f"{BACKEND_URL}/item_import", json=body, headers=headers)
    return forward_response(resp)