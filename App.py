from flask import Flask
import webbrowser
import threading
import os
from Manager import register_manager_routes 

#==========================================Variable==========================================
app = Flask(__name__)
port = 5000
url = f"http://127.0.0.1:{port}/manager/login"

#============================================Main============================================
def open_browser():
    webbrowser.open_new(url)

register_manager_routes(app)

if __name__ == '__main__':
    app.run(debug=True, port=port)
