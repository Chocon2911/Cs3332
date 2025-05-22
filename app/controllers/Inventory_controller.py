import json
from pathlib import Path
from flask import current_app
from typing import Dict, List
from datetime import datetime

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class InventoryController:
    def __init__(self):
        self.data_dir = data_dir

    def get_all_ingredients(self) -> List[Dict]:
        """Lấy danh sách tất cả nguyên liệu"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
                
            for item in items:
                item['importDate'] = datetime.fromtimestamp(item['importDate']).strftime('%d/%m/%Y')
            return items
        
        except Exception as e:
            current_app.logger.error(f"Error reading all ingredients: {str(e)}")
            return []

    def get_running_out_items(self) -> List[Dict]:
        """Lấy danh sách sản phẩm sắp hết hàng"""
        try:
            file = self.data_dir/'running_out.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
            
            for item in items:
                item['importDate'] = datetime.fromtimestamp(item['importDate']).strftime('%d/%m/%Y')
            return items
        
        except Exception as e:
            current_app.logger.error(f"Error reading running out items: {str(e)}")
            return []