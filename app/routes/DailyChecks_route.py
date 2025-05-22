from flask import Blueprint, jsonify, request, make_response
import requests
from app.controllers.DailyChecks_controller import DailyChecksController

daily_checks_bp = Blueprint('daily_checks', __name__)
controller = DailyChecksController()
BACKEND_URL = "https://localhost:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

@daily_checks_bp.route('/daily_checks', methods=['GET'])
def get_checks_result():
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers, params=request.args)
    return forward_response(resp)