from flask import render_template, redirect, url_for, request

def register_customer_routes(app):
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