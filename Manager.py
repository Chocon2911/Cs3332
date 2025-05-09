from flask import render_template, request, jsonify, url_for
from datetime import datetime
import requests

URL = "http://localhost:8080"



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
    
    #========================================Save Profile========================================
    @app.route('/manager/save_account_profile', methods=['POST'])
    def save_account_profile():
        token = request.headers.get("Authorization")
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error', 
                'errorMessage': 'Please fill in all the fields'
            })

        realName = data['name']
        username = data['username']
        password = data['password']
        birthDateUnixTime = data['birthTime']
        
        profile = Profile(realName, username, password, birthDateUnixTime)
        errorMessage = validateProfileData(profile)
        status = "error" if errorMessage != "" else "success"
        if status == "success":
            serverData = UserInformationUpdate_Request(token, username, realName, "abc@gmail.com", "0123456789", birthDateUnixTime, "male", ["MANAGER"])
            serverResponse = serverData.request()
            if serverResponse is None:
                status = "no permission"
                url = "/manager/login"
                return jsonify({
                    'status': status,
                    'url': url
                })

        res = {
            'status': status,
            'errorMessage': errorMessage
        }

        return jsonify(res)
    
    #========================================Get Profile=========================================
    @app.route('/manager/get_account_profile', methods=['POST'])
    def get_account_profile():
        token = request.headers.get("Authorization")
        data = request.get_json()
        if not data or token is None:
            return jsonify({
                'status': 'no permission',
                'url': url_for('manager_login')
            })
        
        username = data['username']
        requestData = UserInfo_Request(token, username)
        serverResponse = requestData.request()
        status = "success"
        if serverResponse is None:
            status = "no permission"
            url = "/manager/login"
            res = {
                'status': status,
                'url': url
            }
        else:
            username = serverResponse.username
            name = serverResponse.name
            email = serverResponse.email
            phone = serverResponse.phone
            dateOfBirth = serverResponse.dateOfBirth
            gender = serverResponse.gender
            roles = serverResponse.roles

            res = {
                'status': status,
                'username': username,
                'name': name,
                'email': email,
                'phone': phone,
                'dateOfBirth': dateOfBirth,
                'gender': gender,
                'roles': roles,
            }

        return jsonify(res)
    
    #===========================================Login============================================
    @app.route('/manager/login', methods=['POST'])
    def login():
        data = request.get_json()
        status = "success"
        errorMessage = ""
        if not data:
            status = "error"
            errorMessage = "Please fill in all the fields"
        
        username = data['username']
        password = data['password']
        req = Login_Request(username, password)
        serverResponse = req.request()
        if serverResponse is None:
            status = "error"
            errorMessage = "Your username or password is incorrect"
            return jsonify({
                'status': status,
                'errorMessage': errorMessage,
            })
        else:
            token = serverResponse.token
            return jsonify({
                'status': status,
                'token': token
            })
        
    #====================================Create Staff Account====================================
    @app.route('/manager/create_staff_account', methods=['POST'])
    def create_staff_account():
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({
                'status': 'no permission',
                'url': url_for('manager_login')
            })
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'errorMessage': 'Please fill in all the fields'
            })
        
        realName = data['name']
        username = data['username']
        password = data['password']
        rePassword = data['rePassword']
        dateOfBirth = data['birthDate']
        roles = data['roles']
        
        data = StaffAccount(realName, username, password, rePassword, dateOfBirth, roles)
        errorMessage = validateCreateAccountData(data)
        status = "error" if errorMessage != "" else "success"
        if status == "success":
            serverData = UserCreate_Request(username, password, realName, "abc@gmail.com", "0123456789", dateOfBirth, "male", roles)
            serverResponse = serverData.request()
            if serverResponse is None:
                status = "error"
                errorMessage = "Server Error"
        
        res = {
            'status': status,
            'errorMessage': errorMessage
        }

        return jsonify(res)



#============================================================================================
#========================================Server Data=========================================
#============================================================================================

#==========================================Request===========================================
class UserInformationUpdate_Request:
    def __init__(self, token, username, name, email, phone, dateOfBirth, gender, roles):
        self.token = token
        self.username = username
        self.name = name
        self.email = email
        self.phone = phone
        self.dateOfBirth = dateOfBirth
        self.gender = gender
        self.roles = roles
    
    def request(self):
        header = {
            'Content-Type': 'application/json',
            'User-Agent': '',
            'Authorization': self.token
        }

        payload = {
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'dateOfBirth': self.dateOfBirth,
            'gender': self.gender,
            'roles': self.roles
        }

        serverResponse = requests.post(URL + "/user_info_update", json=payload, headers=header)
        if serverResponse.status_code != 200:
            return None
        else:
            return UserInformationUpdate_Response(serverResponse)

class UserInfo_Request:
    def __init__(self, token, username):
        self.token = token
        self.username = username
    
    def request(self):
        header = {
            'Content-Type': 'application/json',
            'User-Agent': '',
            'Authorization': self.token
        }

        payload = {
            'username': self.username
        }

        serverResponse = requests.get(URL + "/user_info", params=payload, headers=header)
        if serverResponse.status_code != 200:
            return None
        else:
            return UserInfo_Response(serverResponse)
        
class Login_Request:
    def __init__(self, username, password):
        self.username = username
        self.password = password
    
    def request(self):
        header = {
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        payload = {
            'username': self.username,
            'password': self.password
        }

        serverResponse = requests.post(URL + "/login", json=payload, headers=header)
        if serverResponse.status_code != 200:
            return None
        else:
            return Login_Response(serverResponse)
        
class UserCreate_Request:
    def __init__(self, username, password, name, email, phone, dateOfBirth, gender, roles):
        self.username = username
        self.password = password
        self.name = name
        self.email = email
        self.phone = phone
        self.dateOfBirth = dateOfBirth
        self.gender = gender
        self.roles = roles

    def request(self):
        header = {
            'Content-Type': 'application/json',
            'User-Agent': ''
        }

        payload = {
            'username': self.username,
            'password': self.password,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'dateOfBirth': self.dateOfBirth,
            'gender': self.gender,
            'roles': self.roles
        }

        serverResponse = requests.post(URL + "/user_create", json=payload, headers=header)
        if serverResponse.status_code == 201:
            return UserCreate_Response(serverResponse)
        elif serverResponse.status_code >= 400:
            data = serverResponse.json()

#==========================================Response==========================================
class UserInformationUpdate_Response:
    def __init__(self, res):
        data = res.json()
        self.text = data['text']

class UserInfo_Response:
    def __init__(self, res):
        data = res.json()
        self.username = data['username']
        self.name = data['name']
        self.email = data['email']
        self.phone = data['phone']
        self.dateOfBirth = data['dateOfBirth']
        self.gender = data['gender']
        self.roles = data['roles']

class Login_Response:
    def __init__(self, res):
        data = res.json()
        self.token = data['token']
        self.name = data['name']
        self.email = data['email']
        self.phone = data['phone']
        self.dateOfBirth = data['dateOfBirth']
        self.gender = data['gender']
        self.roles = data['roles']

class UserCreate_Response:
    def __init__(self, res):
        data = res.json
        self.text = data['text']



#============================================================================================
#==========================================Handler===========================================
#============================================================================================

#=========================================Profile UI=========================================
class Profile:
    def __init__(self, name, username, password, birth_date):
        self.name = name
        self.username = username
        self.password = password
        self.birth_date = birth_date # unix time

def validateProfileData(data):
    if len(data.password) < 8:
        return "Please fill in all the fields"
    
    elif len(data.password) > 32:
        return "Please fill in all the fields"

    elif data.birth_date < 0:
        return "Your date of birth must be later than 1970"

    elif data.birth_date > (int)(datetime.now().timestamp() * 1000):
        return "Your date of birth must be earlier than today"

    for i in range(0, len(data.name)):
        if (data.name[i] == '1' or data.name[i] == '2' or data.name[i] == '3' or data.name[i] == '4' or data.name[i] == '5' or data.name[i] == '6' or data.name[i] == '7' or data.name[i] == '8' or data.name[i] == '9' or data.name[i] == '0'):
            return "Your name cannot contain numbers"
        
    return ""

#======================================Staff Account UI======================================
class StaffAccount:
    def __init__(self, name, username, rePassword, password, birthDate, roles):
        self.name = name # Le Xuan Huy
        self.username = username # LeHuy
        self.rePassword = rePassword # P@55w0rd
        self.password = password # P@55w0rd
        self.birthDate = birthDate # 199990000
        self.roles = roles # [STORAGE_MANAGER, CASHIER]

def validateCreateAccountData(data):
    if (data.password.length < 8):
        return "Password must be above 8 characters"

    elif (data.password.length > 32):
        return "Password must be below 32 characters"

    elif (data.birthDate < 0):
        return "Your date of birth must be later than 1970"

    elif (data.birthDate > (int)(datetime.now().timestamp() * 1000)):
        return "Your date of birth must be earlier than today"

    elif (data.rePassword != data.password):
        return "Your passwords do not match"
    
    for i in range(0, data.name.length):
        if (data.name[i] != '0' or data.name[i] != '1' or data.name[i] != '2' or data.name[i] != '3' or data.name[i] != '4' or data.name[i] != '5' or data.name[i] != '6' or data.name[i] != '7' or data.name[i] != '8' or data.name[i] != '9'):
            return "Your name cannot contain numbers"

    return ""