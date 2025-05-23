import json
from pathlib import Path
from flask import current_app
from typing import Dict, List
from datetime import datetime

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class ImportController:
    def __init__(self):
        self.data_dir = data_dir
        self._init_files()
        
    def _init_files(self):
        files = {
            'NewIngredient.json': [],
            'UpdateIngredient.json': []
        }
        for filename, default_data in files.items():
            file_path = self.data_dir/filename
            if not file_path.exists():
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(default_data, f, indent=2)
                    
    def _clear_files(self, filename: str):
        file_path = self.data_dir/filename
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)

    def get_inventory(self) -> List[Dict]:
        """Lấy danh sách inventory"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
            return items
        except Exception as e:
            current_app.logger.error(f"Error reading inventory: {str(e)}")
            return []

    def create_item(self, item_data: Dict) -> Dict:
        """Tạo item mới"""
        try:
            file = self.data_dir/'NewIngredient.json'
            self._clear_files('NewIngredient.json')
            
            # Tạo item mới
            new_item = {
                'id': 0,
                'name': item_data['name'],
                'supplier': '',
                'quantity': 0,
                'importDate': 0,
                'unit': item_data['unit']
            }
            
            with open(file, 'w', encoding='utf-8') as f:
                json.dump([new_item], f, indent=2)
            
            return new_item
        except Exception as e:
            current_app.logger.error(f"Error creating item: {str(e)}")
            return {}

    def update_item(self, item_data: Dict) -> Dict:
        """Cập nhật item"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
                
            update_file = self.data_dir/'UpdateIngredient.json'
            self._clear_files('UpdateIngredient.json')
            
            # Tìm và cập nhật item
            for item in items:
                if item['id'] == item_data['id']:
                    with open(update_file, 'w', encoding='utf-8') as f:
                        json.dump([item_data], f, indent=2)
                    return item_data
            
            return {}
        except Exception as e:
            current_app.logger.error(f"Error updating item: {str(e)}")
            return {}