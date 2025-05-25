from flask import render_template, request, jsonify, url_for, make_response, redirect
from datetime import datetime
import requests

URL = "http://localhost:8080"

def forward_response(r):
    response = make_response(r.content, r.status_code)
    if 'Content-Type' in r.headers:
        response.headers['Content-Type'] = r.headers['Content-Type']
    return response

#============================================================================================
#===========================================Route============================================
#============================================================================================
def register_customer_routes(app):
    #=======================================Tab Translate========================================
    @app.route('/customer/coffee')
    def customer_coffee():
        return render_template('Customer/html/Coffee.html')

    @app.route('/customer/espresso')
    def customer_espresso():
        return render_template('Customer/html/espresso.html')

    @app.route('/customer/tea')
    def customer_tea():
        return render_template('Customer/html/tea.html')

    @app.route('/customer/vietnamese-phin')
    def customer_vietnamese_phin():
        return render_template('Customer/html/vietnamese-phin.html')

    # 🔁 POST redirect
    @app.route('/goto/customer/coffee', methods=['POST'])
    def goto_customer_coffee():
        return redirect(url_for('customer_coffee'))

    @app.route('/goto/customer/espresso', methods=['POST'])
    def goto_customer_espresso():
        return redirect(url_for('customer_espresso'))

    @app.route('/goto/customer/tea', methods=['POST'])
    def goto_customer_tea():
        return redirect(url_for('customer_tea'))

    @app.route('/goto/customer/vietnamese-phin', methods=['POST'])
    def goto_customer_vietnamese_phin():
        return redirect(url_for('customer_vietnamese_phin'))
    
    # Điều hướng về trang Map
    @app.route('/cashier/goto_cafetest', methods=['POST'])
    def goto_cashier_cafetest_from_customer():
        return redirect(url_for('cashier_cafetest'))
    
    #======================================Request Response======================================
    #===list_products===
    @app.route('/customer/product_list', methods=['GET'])
    def customer_list_products():
        header = {
            'Content-Type': 'application/json',
        }
        response = requests.get(URL + "/product_list", headers=header)
        print ("List Products: " + str(response.status_code))
        return forward_response(response)

    #===create_order===
    @app.route('/customer/order_create', methods=['POST'])
    def customer_create_order():
        header = {
            'Content-Type': 'application/json',
            'User-Agent': '',
        }
        response = requests.post(URL + "/order_create", json=request.get_json(), headers=header)
        print ("Order: " + str(response.status_code))
        return forward_response(response)