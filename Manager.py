from flask import render_template, abort

def register_manager_routes(app):
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
    @app.route('/manager/error')
    def manager_error():
        return render_template('Manager/Error.html')