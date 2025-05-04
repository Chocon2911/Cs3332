const loginBtn = document.getElementById("Login");
const logoBtn = document.getElementById("Logo");
const overlay = document.getElementById("Overlay");
const webRole = document.getElementById("WebRole");

const managerBtn = document.getElementById("ManagerBtn");
const storageManagerBtn = document.getElementById("StorageManagerBtn");
const bartenderBtn = document.getElementById("BartenderBtn");
const customerBtn = document.getElementById("CustomerBtn");
const togglePasswordBtn = document.getElementById("TogglePassword");

loginBtn.addEventListener("click", function (event)
{
    showPopUp();
})



overlay.addEventListener("click", function (event)
{
    hidePopUp();
})

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