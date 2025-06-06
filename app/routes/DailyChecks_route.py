from flask import Blueprint, jsonify, request, make_response
import requests

daily_checks_bp = Blueprint('daily_checks', __name__)
BACKEND_URL = "http://localhost:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

@daily_checks_bp.route('/daily_checks', methods=['GET'])
def get_checks_result():
    token = request.headers.get('Authorization')
    headers = {
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers)
    return forward_response(resp)