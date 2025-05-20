import json
from pathlib import Path
from flask import current_app
from typing import Dict, List
from datetime import datetime

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class HistoryController:
    def __init__(self):
        self.data_dir = data_dir
        self._init_files()
        
    def _init_files(self):
        files = {
            'History.json': []
        }
        for filename, default_data in files.items():
            file_path = self.data_dir/filename
            if not file_path.exists():
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(default_data, f, indent=2)

    def get_history(self, from_date: str = None, to_date: str = None) -> List[Dict]:
        """Lấy lịch sử nhập xuất"""
        try:
            file = self.data_dir/'History.json'
            with open(file, encoding='utf-8') as f:
                items = json.load(f)

            # Filter theo ngày nếu có
            if from_date or to_date:
                filtered_items = []
                for item in items:
                    # Chuyển đổi timestamp sang datetime để so sánh
                    item_date = datetime.fromtimestamp(item['date'])
                    
                    if from_date:
                        from_datetime = datetime.strptime(from_date, '%Y-%m-%d')
                        if item_date < from_datetime:
                            continue
                            
                    if to_date:
                        to_datetime = datetime.strptime(to_date, '%Y-%m-%d')
                        if item_date > to_datetime:
                            continue
                            
                    # Chuyển đổi timestamp sang định dạng dd/mm/yyyy
                    item['date'] = item_date.strftime('%d/%m/%Y')
                    filtered_items.append(item)
                return filtered_items
            
            # Nếu không có filter, chuyển đổi tất cả timestamps
            for item in items:
                item['date'] = datetime.fromtimestamp(item['date']).strftime('%d/%m/%Y')
                
            return items
        except Exception as e:
            current_app.logger.error(f"Error reading history: {str(e)}")
            return []