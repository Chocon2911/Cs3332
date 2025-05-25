from flask import Blueprint, render_template

storage_ui_bp = Blueprint(
    'storage_ui',
    __name__,
    template_folder = 'templates/StorageManager'
)

@storage_ui_bp.route('/dashboard')
def dashboard():
    return render_template('StorageManager/Dashboard.html')

@storage_ui_bp.route('/inventory')
def inventory():
    return render_template('StorageManager/Inventory.html')

@storage_ui_bp.route('/import', endpoint = 'import')
def import_view():
    return render_template('StorageManager/Import.html')

@storage_ui_bp.route('/history_view')
def history():
    return render_template('StorageManager/History.html')

@storage_ui_bp.route('/daily-checks')
def daily_checks():
    return render_template('StorageManager/DailyChecks.html')

def register_storage_manager_routes(app):
    app.register_blueprint(storage_ui_bp, url_prefix='/storage_manager')
    
    from app.routes.Dashboard_route import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/storage_manager')
    
    from app.routes.DailyChecks_route import daily_checks_bp
    app.register_blueprint(daily_checks_bp, url_prefix='/storage_manager')
    
    from app.routes.History_route import history_bp
    app.register_blueprint(history_bp, url_prefix='/storage_manager')
    
    from app.routes.Inventory_route import inventory_bp
    app.register_blueprint(inventory_bp, url_prefix='/storage_manager')
    
    from app.routes.Import_route import import_bp
    app.register_blueprint(import_bp, url_prefix='/storage_manager')