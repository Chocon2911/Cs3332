from flask import Blueprint, jsonify, request, make_response
import requests
from app.controllers.History_controller import HistoryController

history_bp = Blueprint('history', __name__)
controller = HistoryController()
BACKEND_URL = 'http://localhost:8080'

def forward_response(r):
    resp = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        resp.headers['Content-Type'] = r.headers['Content-Type']
    return resp

@history_bp.route('/history', methods=['GET'])
def get_history():
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers, params=request.args)
    return forward_response(resp)