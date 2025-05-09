//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const RePassword = document.getElementById("RePassword");
const BirthDate = document.getElementById("Date");
const ErrorMessage = document.getElementById("ErrorMessage");
const StorageManagerRole = document.getElementById("StorageManager");
const CashierRole = document.getElementById("Cashier");
const BartenderRole = document.getElementById("Bartender");

//===========================================Class============================================
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
        || !RePassword.value.trim() || !BirthDate.value.trim() || roles.length == 0)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "You must fill in all fields and choose at least one role";
        return;
    }

    realName = RealName.value;
    username = Username.value;
    rePassword = RePassword.value;
    password = Password.value;
    birthDate = BirthDate.value;    
    unixBirthTime = new Date(birthDate).getTime();

    account = new Account(realName, username, rePassword, password, unixBirthTime, roles);
    try 
    {
        const token = getCookie("token");
        const res = await fetch("/manager/create_staff_account", {
           method: "POST",
           headers:
           {
                "Content-Type": "application/json",
                "Authorization": token
           }, 
           body: JSON.stringify(account.toJson())
        }); 

        const result = await res.json();
        if (result.status == "success")
        {
            alert("New account has been created!");
        }
        else if (result.status == "no permission")
        {
            window.location.href = result.url;
        }
        else
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = result.errorMessage;
        }
    }
    catch (error)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Unexpected Error: " + error;
    }

    // const data = 
    // {
    //     name: document.getElementById("Name").value,
    //     username: document.getElementById("Username").value,
    //     password: document.getElementById("Password").value,
    //     birthDay: document.getElementById("BirthDay").value,
    //     birthMonth: document.getElementById("BirthMonth").value,
    //     birthYear: document.getElementById("BirthYear").value,
    //     role: document.querySelector('input[name="role"]:checked').value,
    //     id: getRandomString(10)
    // }

    // const jsonString = JSON.stringify(data);

    // const blob = new Blob([jsonString], { type: "application/json" });
    // const url = URL.createObjectURL(blob);

    // const a = document.createElement("a");
    // a.href = url;
    // a.download = getRandomString(10) + ".json";
    // a.click();

    // URL.revokeObjectURL(url);

    // alert("Account created!");
});

function validateData(data)
{
    if (data.password.length < 8)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Password must be above 8 characters";
    }

    else if (data.password.length > 32)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Password must be below 32 characters";
    }

    else if (data.birthDate < 0)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your date of birth must be later than 1970";
    }

    else if (data.birthDate > Date.now())
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your date of birth must be earlier than today";
    }

    else if (RePassword.value != Password.value)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Your passwords do not match";
    }

    else 
    {
        ErrorMessage.classList.remove("show");
        ErrorMessage.textContent = "";
    }

    for (i = 0; i < data.name.length; i++)
    {
        if (data.name[i] == "1" || data.name[i] == "2" || data.name[i] == "3" || data.name[i] == "4" || data.name[i] == "5" || data.name[i] == "6" || data.name[i] == "7" || data.name[i] == "8" || data.name[i] == "9")
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Your name cannot contain numbers";
        }
    }
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
