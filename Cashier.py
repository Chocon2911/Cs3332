from flask import render_template, redirect, url_for, request

def register_cashier_routes(app):
    @app.route('/cashier/cafetest', methods=['GET'])
    def cashier_cafetest():
        return render_template('Cashier/html/cafetest.html')

    @app.route('/cashier/customer_order', methods=['GET'])
    def cashier_customer_order():
        return render_template('Cashier/html/customer_order.html')

    @app.route('/cashier/history', methods=['GET'])
    def cashier_history():
        return render_template('Cashier/html/history.html')

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
    
    @app.route('/customer/goto_coffee', methods=['POST'])
    def goto_customer_coffee_from_cashier():
        return redirect(url_for('customer_coffee'))
