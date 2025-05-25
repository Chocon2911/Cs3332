from flask import render_template, request, jsonify, url_for, make_response, redirect
from datetime import datetime
import requests

URL = "http://natsu-dev.space:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

#============================================================================================
#===========================================Route============================================
#============================================================================================
def register_cashier_routes(app):
    #=======================================Tab Translate========================================    
    @app.route('/cashier/cafetest', methods=['GET'])
    def cashier_cafetest():
        return render_template('Cashier/html/cafetest.html')

    @app.route('/cashier/customer_order', methods=['GET'])
    def cashier_customer_order():
        return render_template('Cashier/html/customer_order.html')

    @app.route('/cashier/history', methods=['GET'])
    def cashier_history():
        return render_template('Cashier/html/history.html') 
    
    @app.route('/cashier/qrcode', methods=["GET"])
    def qr_generator():     
        return render_template("Cashier/html/qrcode.html")

    # Các POST endpoint để điều hướng
    @app.route('/cashier/goto_cafetest', methods=['POST'])
    def goto_cafetest():
        return redirect(url_for('cashier_cafetest'))

    @app.route('/cashier/goto_customer_order', methods=['POST'])
    def goto_customer_order():
        return redirect(url_for('cashier_customer_order'))

    @app.route('/cashier/goto_history', methods=['POST'])
    def goto_history():
        return redirect(url_for('cashier_history'))
    
    # Điều hướng về trang order
    @app.route('/customer/goto_coffee', methods=['POST'])
    def goto_customer_coffee_from_cashier():
        return redirect(url_for('customer_coffee'))
    
    #======================================Request Response======================================
    #===list_orders===
    @app.route('/cashier/order_list', methods=['POST'])
    def cashier_list_orders():
        token = request.headers.get("Authorization")
        data = request.get_json()

        print(data)
        print(token)
        header = {
            'Authorization': token,
            'Content-Type': 'application/json',
        }

        response = requests.get(URL + "/order_list" , headers=header, params = data)
        print ("List Orders: " + str(response.status_code))
        return forward_response(response)

    #===update_order_status===
    @app.route('/cashier/update_order_status', methods=['POST'])
    def cashier_update_order_status():
        token = request.headers.get("Authorization")
        header = {
            'Content-Type': 'application/json',
            'Authorization': token
        }

        response = requests.post(URL + "/order_update_status", json=request.get_json(), headers=header)
        print("Update Order Status: " + str(response.status_code))
        return forward_response(response)
