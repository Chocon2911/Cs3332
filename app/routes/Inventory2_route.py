from flask import Blueprint, jsonify
from app.controllers.Inventory2_controller import Inventory2Controller

inventory2_bp = Blueprint('inventory2', __name__)
controller = Inventory2Controller()

@inventory2_bp.route('/all_ingredients', methods=['GET'])
def all_ingredients():
    """API lấy danh sách tất cả nguyên liệu"""
    data = controller.get_all_ingredients()
    return jsonify(data)

@inventory2_bp.route('/running_out', methods=['GET'])
def running_out():
    """API lấy danh sách sản phẩm sắp hết hàng"""
    data = controller.get_running_out_items()
    return jsonify(data)