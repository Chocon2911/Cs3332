from flask import render_template

def register_cashier_routes(app):
    @app.route('/cashier/cafetest')
    def cashier_cafetest():
        return render_template('Cashier/html/cafetest.html')

    @app.route('/cashier/customer_order')
    def cashier_customer_order():
        return render_template('Cashier/html/customer_order.html')

    @app.route('/cashier/history')
    def cashier_history():
        return render_template('Cashier/html/history.html')
