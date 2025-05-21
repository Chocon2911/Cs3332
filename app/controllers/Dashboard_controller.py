import json
from pathlib import Path
from flask import current_app
from datetime import datetime
from typing import Dict, List, Tuple

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class DashboardController:
    def __init__(self):
        self.data_dir = data_dir

    def get_product_transaction(self) -> List[Dict]:
        """Lấy và xử lý dữ liệu giao dịch sản phẩm"""
        try:
            file = self.data_dir/'product_transaction.json'
            with open(file, encoding='utf-8') as f:
                data = json.load(f)
            
            processed_data = []
            for item in data:
                import_quantity = item.get('import_quantity', 0)
                export_quantity = item.get('export_quantity', 0)
                total = import_quantity + export_quantity
                
                export_percent = round((export_quantity / total * 100), 0) if total > 0 else 0
                import_percent = 100 - export_percent
                
                processed_item = {
                    'name': item.get('name', ''),
                    'import_quantity': import_quantity,
                    'export_quantity': export_quantity,
                    'total': total,
                    'import_percent': import_percent,
                    'export_percent': export_percent
                }
                processed_data.append(processed_item)
            
            return processed_data
        except Exception as e:
            current_app.logger.error(f"Error processing product transaction: {str(e)}")
            return []

    def get_running_out_items(self, limit: int = 5) -> List[Dict]:
        """Lấy danh sách sản phẩm sắp hết hàng"""
        try:
            file = self.data_dir/'inventory.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)
            
            return items[:limit]
        except Exception as e:
            current_app.logger.error(f"Error reading running out items: {str(e)}")
            return []