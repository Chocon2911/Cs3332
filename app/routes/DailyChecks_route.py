from flask import Blueprint, jsonify, request
from app.controllers.DailyChecks_controller import DailyChecksController

daily_checks_bp = Blueprint('daily_checks', __name__)
controller = DailyChecksController()

@daily_checks_bp.route('/daily_checks', methods=['POST'])
def validate_checks():
    """API validate dữ liệu kiểm tra"""
    items = request.get_json().get('items', [])
    result = controller.validate_checks(items)
    return jsonify(result)

@daily_checks_bp.route('/daily_checks', methods=['GET'])
def get_checks_result():
    """API lấy kết quả kiểm tra"""
    result = controller.get_checks_result()
    return jsonify(result)