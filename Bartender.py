from flask import render_template, request, jsonify, url_for, make_response
from datetime import datetime
import requests

URL = "http://localhost:8080" #https://quick-baboon-similarly.ngrok-free.app

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

def register_bartender_routes(app):
    @app.route('/bartender/base')
    def bartender_base():
        return render_template('/Bartender/Base.html')
    
    @app.route('/bartender_request/user_info', methods=['POST'])
    def bartender_user_info():
        token = request.headers.get("Authorization")
        header = {
            'Content-Type': 'application/json',
            'User-Agent': '',
            'Authorization': token
        }

        response = requests.get(URL + "/user_info", params=request.get_json(), headers=header)
        print("User Information: " + str(response.status_code))
        return forward_response(response)

    @app.route('/bartender_request/update_order_status', methods=['POST'])
    def bartender_update_order_status():
        token = request.headers.get("Authorization")
        header = {
            'Content-Type': 'application/json',
            'Authorization': token
        }

        response = requests.post(URL + "/order_update_status", json=request.get_json(), headers=header)
        print("Update Order Status: " + str(response.status_code))
        return forward_response(response)
    
    return app