import json
from pathlib import Path
from flask import current_app
from typing import Dict, List
from datetime import datetime

data_dir = Path(current_app.root_path)/'storage_manager'/'json'
#data_dir = Path(current_app.root_path)/'storage_manager'/'database'

class DailyChecksController:
    def __init__(self):
        self.data_dir = data_dir
        self._init_files()
        
    def _init_files(self):
        # Kiểm tra và tạo file valid_checks.json nếu chưa tồn tại
        valid_checks_file = self.data_dir/'valid_checks.json'
        if not valid_checks_file.exists():
            with open(valid_checks_file, 'w', encoding='utf-8') as f:
                json.dump({'items': []}, f, indent=2)
                
        # Kiểm tra file daily_checks.json
        daily_checks_file = self.data_dir/'daily_checks.json'
        if not daily_checks_file.exists():
            raise FileNotFoundError("daily_checks.json file does not exist")

    def get_daily_checks(self) -> Dict:
        """Lấy dữ liệu daily checks"""
        try:
            file = self.data_dir/'daily_checks.json'
            if not file.exists():
                raise FileNotFoundError("daily_checks.json file does not exist")
            with open(file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            current_app.logger.error(f"Error reading daily checks: {str(e)}")
            return {'matched': [], 'unmatched': []}

    def process_valid_checks(self, valid_checks_data: Dict) -> Dict:
        """Xử lý dữ liệu valid checks từ input người dùng"""
        try:
            # Lưu valid checks
            file = self.data_dir/'valid_checks.json'
            with open(file, 'w', encoding='utf-8') as f:
                json.dump(valid_checks_data, f, indent=2)

            # Lấy dữ liệu inventory để so sánh
            daily_checks = self.get_daily_checks()

            # Xử lý dữ liệu
            matched = []
            unmatched = []
            
            for check_item in valid_checks_data['items']:
                found = False
                for daily_item in daily_checks:
                    if str(daily_item['id']) == str(check_item['id']):
                        found = True
                        # Tính toán các giá trị
                        initial = daily_item.get('initial', 0)
                        used = daily_item.get('used', 0)
                        remaining = daily_item.get('remaining', 0)
                        actual = check_item['actual']
                        
                        # Tạo warnings nếu có
                        warnings = []
                        if actual < remaining:
                            warnings.append("Actual quantity is less than calculated")
                        if actual > remaining:
                            warnings.append("Actual quantity is more than calculated")
                            
                        matched.append({
                            'id': check_item['id'],
                            'name': check_item['name'],
                            'initial': initial,
                            'used': used,
                            'remaining': remaining,
                            'actual': actual,
                            'unit': check_item['unit'],
                            'warnings': ', '.join(warnings) if warnings else ''
                        })
                        break
                
                if not found:
                    unmatched.append({
                        'id': check_item['id'],
                        'name': check_item['name'],
                        'warnings': 'Item not found in daily checks.'
                    })

            # Lưu kết quả
            result = {
                'matched': matched,
                'unmatched': unmatched
            }
            
            with open(self.data_dir/'daily_checks.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
                
            return result
            
        except Exception as e:
            current_app.logger.error(f"Error processing valid checks: {str(e)}")
            return {'matched': [], 'unmatched': []}