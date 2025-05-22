from flask import Blueprint, jsonify, request
from app.controllers.Dashboard_controller import DashboardController

# Blueprint riêng cho Dashboard
dashboard_bp = Blueprint('dashboard', __name__)
controller = DashboardController()

@dashboard_bp.route('/product_transaction', methods=['GET'])
def product_transaction():
    """GET product_transaction"""
    data = controller.get_product_transaction()
    return jsonify(data)

@dashboard_bp.route('/running_out', methods=['GET'])
def running_out():
    """GET running_out"""
    limit = request.args.get('limit', type = int)
    data = controller.get_running_out_items(limit)
    return jsonify(data)