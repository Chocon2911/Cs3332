from flask import Blueprint, jsonify
from app.controllers.Inventory_controller import InventoryController

inventory_bp = Blueprint('inventory', __name__)
controller = InventoryController()

@inventory_bp.route('/all_ingredients', methods=['GET'])
def all_ingredients():
    """API lấy danh sách tất cả nguyên liệu (14 items đầu tiên)"""
    data = controller.get_all_ingredients()
    return jsonify(data)

@inventory_bp.route('/running_out', methods=['GET'])
def running_out():
    """API lấy danh sách sản phẩm sắp hết hàng (5 items đầu tiên)"""
    data = controller.get_running_out_items()
    return jsonify(data)