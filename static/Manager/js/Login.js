const usernameField = document.getElementById("Username");
const passwordField = document.getElementById("Password");
const ErrorMessage = document.getElementById("ErrorMessage");

const loginBtn = document.getElementById("Login");
const logoBtn = document.getElementById("Logo");
const overlay = document.getElementById("Overlay");
const webRole = document.getElementById("WebRole");

const managerBtn = document.getElementById("ManagerBtn");
const storageManagerBtn = document.getElementById("StorageManagerBtn");
const bartenderBtn = document.getElementById("BartenderBtn");
const customerBtn = document.getElementById("CustomerBtn");
const togglePasswordBtn = document.getElementById("TogglePassword");

//===========================================Cookie===========================================
function setCookie(name, value) 
{
    document.cookie = name + "=" + value + ";path=/";
}

function getCookie(name) 
{
    const cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) 
        {
        const cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) 
            {
            return cookiePair[1];
        }
    }

    return null;
}

//===========================================Login============================================
loginBtn.addEventListener("click", function (event)
{
    username = usernameField.value;
    password = passwordField.value;

    if (username == "admin" && password == "1234")
    {
        setCookie("token", "1234");

        if (getCookie("token") == "1234")
        {
            login(getCookie("role"));
            return;
        }
    }

    ErrorMessage.classList.add("show");    
})

function login(role)
{
    if (role == "manager")
    {
        window.location.href = "../../manager/profile";
    }
    else if (role == "storageManager")
    {
        window.location.href = "../../StorageManager/html/DashBoard.html";
    }
    else if (role == "bartender")
    {
        window.location.href = "../../Bartender/html/index.html";
    }
    else if (role == "customerCashier")
    {
        window.location.href = "../../CustomerCashier/html/index.html";
    }
}

managerBtn.addEventListener("click", function (event)
{
    setCookie("role", "manager");
    hidePopUp();
});

storageManagerBtn.addEventListener("click", function (event)
{
    setCookie("role", "storageManager");
    hidePopUp();
});

bartenderBtn.addEventListener("click", function (event)
{
    setCookie("role", "bartender");
    hidePopUp();
});

customerBtn.addEventListener("click", function (event)
{
    setCookie("role", "customerCashier");
    hidePopUp();
});

//===========================================Other============================================
function showPopUp()
{
    overlay.classList.add("show");
    webRole.classList.add("show");
}

function hidePopUp()
{
    overlay.classList.remove("show");
    webRole.classList.remove("show");
}

function togglePassword(passwordId, btnId)
{
    const passwordInput = document.getElementById(passwordId);
    const togglePasswordButton = document.getElementById(btnId);
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    togglePasswordButton.classList.toggle("hide");
}

togglePasswordBtn.addEventListener("click", function (event)
{
    togglePassword("Password", "TogglePassword");
});