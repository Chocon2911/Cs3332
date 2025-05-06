from flask import render_template

def register_storage_manager_routes(app):
    @app.route('/storage_manager/dashboard')
    def dashboard():
        return render_template('StorageManager/Dashboard.html')
    
    @app.route('/storage_manager/inventory')
    def inventory():
        return render_template('StorageManager/Inventory.html')
    
    @app.route('/storage_manager/inventory2')
    def inventory2():
        return render_template('StorageManager/Inventory2.html')
    
    @app.route('/storage_manager/import')
    def _import():
        return render_template('StorageManager/Import.html')
    
    @app.route('/storage_manager/history')
    def history():
        return render_template('StorageManager/History.html')
    
    @app.route('/storage_manager/daily-checks')
    def daily_checks():
        return render_template('StorageManager/DailyChecks.html')