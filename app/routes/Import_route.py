from flask import Blueprint, jsonify, request
from app.controllers.Import_controller import ImportController

import_bp = Blueprint('import', __name__)
controller = ImportController()

@import_bp.route('/all_ingredients', methods=['GET'])
def get_inventory():
    """API lấy danh sách inventory"""
    data = controller.get_inventory()
    return jsonify(data)

@import_bp.route('/new_ingredient', methods=['POST'])
def create_item():
    """API tạo item mới"""
    item_data = request.get_json()
    result = controller.create_item(item_data)
    return jsonify(result)

@import_bp.route('/ingredient_import', methods=['PUT'])
def update_item():
    """API cập nhật item"""
    item_data = request.get_json()
    result = controller.update_item(item_data)
    return jsonify(result)