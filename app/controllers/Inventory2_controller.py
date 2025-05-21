import json
from pathlib import Path
from flask import current_app
from typing import Dict, List
from datetime import datetime

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class Inventory2Controller:
    def __init__(self):
        self.data_dir = data_dir

    def format_date(self, timestamp: int) -> str:
        """Định dạng ngày tháng từ Unix timestamp (milliseconds) sang dd/mm/yyyy"""
        try:
            # Chuyển từ milliseconds sang seconds
            seconds = int(timestamp) / 1000
            date_obj = datetime.fromtimestamp(seconds)
            return date_obj.strftime('%d/%m/%Y')
        except Exception as e:
            current_app.logger.error(f"Error formatting date {timestamp}: {str(e)}")
            return str(timestamp)

    def format_items(self, items: List[Dict]) -> List[Dict]:
        """Định dạng ngày tháng cho tất cả các items"""
        for item in items:
            if 'importDate' in item:
                item['importDate'] = self.format_date(item['importDate'])
        return items

    def get_all_ingredients(self) -> List[Dict]:
        """Lấy danh sách tất cả nguyên liệu"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
            return self.format_items(items)
        except Exception as e:
            current_app.logger.error(f"Error reading all ingredients: {str(e)}")
            return []

    def get_running_out_items(self) -> List[Dict]:
        """Lấy danh sách sản phẩm sắp hết hàng"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
            return self.format_items(items)
        except Exception as e:
            current_app.logger.error(f"Error reading running out items: {str(e)}")
            return []