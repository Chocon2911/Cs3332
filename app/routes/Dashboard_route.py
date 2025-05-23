from flask import Blueprint, jsonify, request, make_response
import requests

# Blueprint riêng cho Dashboard
dashboard_bp = Blueprint('dashboard', __name__)
BACKEND_URL = "http://localhost:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response    

@dashboard_bp.route('/product_transaction', methods=['POST'])
def product_transaction():
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json',
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers, params = request.args)
    return forward_response(resp)

@dashboard_bp.route('/running_out', methods=['POST'])
def running_out():
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_stack_list", headers=headers, params = request.args)
    return forward_response(resp)