from flask import Blueprint, jsonify, request, make_response
import requests
from app.controllers.Inventory_controller import InventoryController

inventory_bp = Blueprint('inventory', __name__)
controller = InventoryController()
BACKEND_URL = "https://localhost:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

@inventory_bp.route('/all_ingredients', methods=['GET'])
def all_ingredients():
    """API lấy danh sách tất cả nguyên liệu"""
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers, params = request.args)
    return forward_response(resp)

@inventory_bp.route('/running_out', methods=['GET'])
def running_out():
    """API lấy danh sách sản phẩm sắp hết hàng"""
    token = request.headers.get('Authorization')
    headers = {
        'Authorization': token,
        'Content-Type': 'application/json'
    }
    resp = requests.get(f"{BACKEND_URL}/item_list", headers=headers, params = request.args)
    return forward_response(resp)