from flask import render_template

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

