from flask import Flask
import threading
import webbrowser
import socket
from waitress import serve
# import qrcode
import os

from Manager import register_manager_routes
from StorageManager import register_storage_manager_routes
from Bartender import register_bartender_routes
from Cashier import register_cashier_routes
from Customer import register_customer_routes

#====================== SETUP ======================
app = Flask(__name__)
port = 5000

# Lấy IP nội bộ của máy (để dùng cho truy cập LAN)
# host_ip = socket.gethostbyname(socket.gethostname())
host_ip = '127.0.0.1'
url = f"http://{host_ip}:{port}/manager/login"

#====================== ROUTES =====================
with app.app_context():
    register_manager_routes(app)
    register_storage_manager_routes(app)
    register_customer_routes(app)
    register_cashier_routes(app)
    register_bartender_routes(app)

print(url)
#====================== QR & BROWSER =====================
# def open_browser():
    # print(f"🌐 url: {url}\n")

    # qr = qrcode.QRCode()
    # qr.add_data(url)
    # qr.make(fit=True)
    # qr.print_ascii(invert=True)

#====================== MAIN =====================
if __name__ == '__main__':
    # threading.Timer(1.0, open_browser).start()
    serve(app, host="0.0.0.0", port=port)
