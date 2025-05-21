from flask import Blueprint, jsonify, request
from app.controllers.History_controller import HistoryController

history_bp = Blueprint('history', __name__)
controller = HistoryController()

@history_bp.route('/history', methods=['GET'])
def get_history():
    """API lấy lịch sử nhập xuất"""
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    data = controller.get_history(from_date, to_date)
    return jsonify(data)