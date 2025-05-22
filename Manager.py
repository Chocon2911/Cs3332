from flask import render_template, request, jsonify, url_for, make_response
from datetime import datetime
import requests

URL = "http://localhost:8080" #https://quick-baboon-similarly.ngrok-free.app

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

#============================================================================================
#===========================================Route============================================
#============================================================================================
def register_manager_routes(app):
    #=======================================Tab Translate========================================
    @app.route('/manager/login')
    def manager_login():
        return render_template('Manager/Login.html')
    @app.route('/manager/profile')
    def manager_profile():
        return render_template('Manager/Profile.html')
    @app.route('/manager/staff_account')
    def manager_staff_account():
        return render_template('Manager/StaffAccount.html')
    @app.route('/manager/storage')
    def manager_storage():
        return render_template('Manager/Storage.html')
    @app.route('/manager/ingredient')
    def manager_ingredient():
        return render_template('Manager/Ingredient.html')
    @app.route('/manager/sale_data')
    def manager_sale_data():
        return render_template('Manager/SaleData.html')
    @app.route('/manager/new_item')
    def manager_new_item():
        return render_template('Manager/NewItem.html')
    @app.route('/manager/error')
    def manager_error():
        return render_template('Manager/Error.html')
    @app.route('/manager/tab_translation')
    def manager_tab_translation():
        return render_template('Manager/TabTranslation.html')
    
    #======================================Request Response======================================
    #===login===
    @app.route('/manager_request/login', methods=['POST'])
    def test_login():
        header = {
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        response = requests.post(URL + "/login", json=request.get_json(), headers=header)
        print("Login: " + str(response.status_code))
        return forward_response(response)
        
    #===user_info===
    @app.route('/manager_request/user_info', methods=['POST'])
    def user_info():
        token = request.headers.get("Authorization")
    
        header = {
            'Content-Type': 'application/json',
            'User-Agent': '',
            'Authorization': token
        }


        response = requests.get(URL + "/user_info", params=request.get_json(), headers=header)
        print("User Information: " + str(response.status_code))
        return forward_response(response)
    
    #===user_info_update===
    @app.route('/manager_request/user_info_update', methods=['POST'])
    def user_info_update():
        token = request.headers.get("Authorization")
        data = request.get_json()

        print(data)
        print(token)

        header = {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        response = requests.post(URL + "/user_info_update", json=data, headers=header)
        print("User Information Update: " + str(response.status_code))
        return forward_response(response)
    
    #===user_create===
    @app.route('/manager_request/user_create', methods=['POST'])
    def test_register():
        header = {
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        response = requests.post(URL + "/user_create", json=request.get_json(), headers=header)
        print("Register: " + str(response.status_code))
        return forward_response(response)
    
    #===item_stack_list===
    @app.route('/manager_request/item_stack_list', methods=['POST'])
    def item_stack_list():
        header = {
            'Content-Type': 'application/json',
        }

        response = requests.get(URL + "/item_stack_list", headers=header)
        print("Item Stack List: " + str(response.status_code))
        return forward_response(response)
    
    #===product_create===
    @app.route('/manager_request/product_create', methods=['POST'])
    def create_product():
        token = request.headers.get("Authorization")

        header = {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        response = requests.post(URL + "/product_create", json=request.get_json(), headers=header)
        print("Create Product: " + str(response.status_code))
        return forward_response(response)
    
    #===product_info===
    @app.route('/manager_request/product_info', methods=['POST'])
    def product_info():
        token = request.headers.get("Authorization")
        header = {
            'Content-Type': 'application/json',
            'Authorization': token
        }

        response = requests.get(URL + "/product_info", params=request.get_json(), headers=header)
        print("Product Info: " + str(response.status_code))
        return forward_response(response)
    
    #===product_list===
    @app.route('/manager_request/product_list', methods=['POST'])
    def product_list():
        header = {
            'Content-Type': 'application/json',
        }

        response = requests.get(URL + "product_list", headers=header)
        print("Product List: " + str(response.status_code))
        return forward_response(response) 

    #===item_list===
    @app.route('/manager_request/item_list', methods=['POST'])
    def item_list():
        header = {
            'Content-Type': 'application/json',
        }

        response = requests.get(URL + "/item_list", headers=header)
        print ("Item List: " + str(response.status_code))
        return forward_response(response)

    #===list_orders===
    @app.route('/manager_request/list_orders', methods=['POST'])
    def list_orders():
        token = request.headers.get("Authorization")
        
        header = {
            'Content-Type': 'application/json',
            'Authorization': token,
        }

        response = requests.get(URL + "/order_list", params=request.get_json(), headers=header)
        print("List Orders: " + str(response.status_code))
        return forward_response(response)

    return app