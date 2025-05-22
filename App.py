from flask import Flask
import webbrowser
import threading
import os
from Manager import register_manager_routes 
from StorageManager import register_storage_manager_routes
from Cashier import register_cashier_routes
from Customer import register_customer_routes

#==========================================Variable==========================================
app = Flask(__name__)
port = 5000
url = f"http://127.0.0.1:{port}/manager/login"

#============================================Main============================================
def open_browser():
    webbrowser.open_new(url)

# Đăng ký các route trong application context
with app.app_context():
    register_manager_routes(app)
    register_storage_manager_routes(app)
    register_customer_routes(app)
    register_cashier_routes(app)

if __name__ == '__main__':
    threading.Timer(1.5, open_browser).start()
    app.run(debug=True, port=port)
