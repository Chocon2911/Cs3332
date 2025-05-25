//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const RePassword = document.getElementById("RePassword");
const Email = document.getElementById("Email");
const Phone = document.getElementById("Phone");
const BirthDate = document.getElementById("Date");
const ErrorMessage = document.getElementById("ErrorMessage");

const MaleRadio = document.getElementById("Male");
const FemaleRadio = document.getElementById("Female");
const OtherRadio = document.getElementById("Other");

const StorageManagerRole = document.getElementById("StorageManager");
const CashierRole = document.getElementById("Cashier");
const BartenderRole = document.getElementById("Bartender");

//===========================================Class============================================
class UserCreate_Request
{
    constructor(username, password, name, email, phone, dateOfBirth, gender, roles)
    {
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.roles = roles;
    }

    toJson()
    {
        return {
            username: this.username,
            password: this.password,
            name: this.name,
            email: this.email,
            phone: this.phone,
            dateOfBirth: this.dateOfBirth,
            gender: this.gender,
            roles: this.roles
        };
    }
}

class Account
{
    constructor(name, username, rePassword, password, birthDate, roles)
    {
        this.name = name;
        this.username = username;
        this.rePassword = rePassword;
        this.password = password;
        this.birthDate = birthDate;
        this.roles = roles;
    }

    toJson()
    {
        return {
            name: this.name,
            username: this.username,
            rePassword: this.rePassword,
            password: this.password,
            birthDate: this.birthDate,
            roles: this.roles
        };
    }
}

//======================================Toggle Password=======================================
function togglePassword(passwordId, btnId)
{
    const passwordInput = document.getElementById(passwordId);
    const togglePasswordButton = document.getElementById(btnId);
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    togglePasswordButton.classList.toggle("hide");
}

/*====================================Toggle Password Btn=====================================*/
document.getElementById("TogglePassword").addEventListener("click", function ()
{
    togglePassword("Password", "TogglePassword");
});

//===================================Toggle Re Password Btn===================================
document.getElementById("ToggleRePassword").addEventListener("click", function ()
{
    togglePassword("RePassword", "ToggleRePassword");
});

//=======================================Cancel Button========================================
// document.getElementById("CancelButton").addEventListener("click", function ()
// {
//     document.getElementById("Name").value = "";
//     document.getElementById("Username").value = "";
//     document.getElementById("Password").value = "";
//     document.getElementById("RePassword").value = "";
//     document.getElementById("BirthDay").value = "";
//     document.getElementById("BirthMonth").value = "";
//     document.getElementById("BirthYear").value = "";
//     document.getElementById("Cashier").checked = false;
//     document.getElementById("StorageManager").checked = false;
//     document.getElementById("Bartender").checked = false;
// });

//=======================================Create Button========================================
document.getElementById("CreateButton").addEventListener("click", async function ()
{
    roles = [];
    if (StorageManagerRole.checked)
        roles.push(StorageManagerRole.value);
    if (CashierRole.checked)
        roles.push(CashierRole.value);
    if (BartenderRole.checked)
        roles.push(BartenderRole.value);

    if (!RealName.value.trim() || !Username.value.trim() || !Password.value.trim() 
        || !RePassword.value.trim() || !Email.value.trim() || !Phone.value.trim()
        || !BirthDate.value.trim() || roles.length == 0)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "You must fill in all fields and choose at least one role";
        return;
    }

    realName = RealName.value;
    username = Username.value;
    phone = Phone.value;
    email = Email.value;
    rePassword = RePassword.value;
    password = Password.value;
    birthDate = BirthDate.value;    
    unixBirthTime = new Date(birthDate).getTime();

    gender = null;
    if (MaleRadio.checked) gender = "male";
    else if (FemaleRadio.checked) gender = "female";
    else if (OtherRadio.checked) gender = "other";

    request = new UserCreate_Request(username, password, realName, email, phone, unixBirthTime, gender, roles);
    
    if (!validateData(request)) return;
    try 
    {
        const token = getCookie("token");
        const res = await fetch("/manager_request/user_create", {
           method: "POST",
           headers:
           {
                "Content-Type": "application/json",
                "Authorization": token
           }, 
           body: JSON.stringify(request.toJson())
        }); 

        if (res.status == 201)
        {
            alert("New account has been created!");
            RealName.value = "";
            Username.value = "";
            Email.value = "";
            Phone.value = "";
            Password.value = "";
            RePassword.value = "";
            BirthDate.value = "";
            StorageManagerRole.checked = false;
            CashierRole.checked = false;
            BartenderRole.checked = false;
        }
        else if (res.status >= 400 && res.status <= 600)
        {
            if (res.status == 401)
            {
                window.location.href = "/manager/login";
                return;
            }
            else if (res.status == 500)
            {
                data = await res.json();
                ErrorMessage.classList.add("show");
                ErrorMessage.textContent = "Server Error: " + data["error"];
                return;
            }

            data = await res.json();
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Server Error: " + data["error"];
        }
        else
        {
            data = await res.json();
            console.log("Unexpected Error: " + data["error"]);
        }
    }
    catch (error)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Unexpected Error: " + error;
    }
});

function validateData(data)
{
    if (data.password.length < 8)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Password must be above 8 characters";
        return false;
    }

    else if (data.password.length > 32)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Password must be below 32 characters";
        return false;
    }

    else if (data.phone.length < 8)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your phone number must be at least 8 digits long";
        return false;
    }

    else if (data.phone.length > 16)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your phone number must be at most 16 digits long";
        return false;
    }

    else if (data.email.indexOf("@") == -1)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your email must contain @ symbol";
        return false;
    }

    else if (data.dateOfBirth < 0)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your date of birth must be later than 1970";
        return false;
    }

    else if (data.dateOfBirth > Date.now())
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your date of birth must be earlier than today";
        return false;
    }

    else if (RePassword.value != data.password)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your passwords do not match";
        return false;
    }

    for (i = 0; i < data.name.length; i++)
    {
        if (data.name[i] == "1" || data.name[i] == "2" || data.name[i] == "3" || data.name[i] == "4" || data.name[i] == "5" || data.name[i] == "6" || data.name[i] == "7" || data.name[i] == "8" || data.name[i] == "9")
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Your name cannot contain numbers";
            return false;
        }
    }

    ErrorMessage.classList.remove("show");
    ErrorMessage.textContent = "";
    return true;
}

//===========================================Other============================================
function getRandomString(length)
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = "";
    
    for (let i = 0; i < length; i++) 
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}
