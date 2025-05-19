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
loginBtn.addEventListener("click", async function (event)
{
    username = usernameField.value;
    password = passwordField.value;

    if (!username.trim() || !password.trim())
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "You must fill in all fields";
        return;
    }

    try
    {
        res = await fetch("/login", {
            method: "POST",
            headers: 
            { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                username: username, 
                password: password 
            })
        });

        const result = await res.json();
        if (res.status == 200)
        {
            setCookie("username", username);
            setCookie("token", result["token"]);
            window.location.href = "/manager/tab_translation";
        }
        else if (res.status >= 400 && res.status <= 600)
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = result.error;
        }
        else
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.value = result.error;
        }
    }
    catch (error)
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Unexpected Error: " + error;
        console.log(error);
    }
})

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