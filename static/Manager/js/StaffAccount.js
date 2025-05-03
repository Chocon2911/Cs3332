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
document.getElementById("CreateButton").addEventListener("click", function ()
{
    const data = 
    {
        name: document.getElementById("Name").value,
        username: document.getElementById("Username").value,
        password: document.getElementById("Password").value,
        birthDay: document.getElementById("BirthDay").value,
        birthMonth: document.getElementById("BirthMonth").value,
        birthYear: document.getElementById("BirthYear").value,
        role: document.querySelector('input[name="role"]:checked').value,
        id: getRandomString(10)
    }

    const jsonString = JSON.stringify(data);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = getRandomString(10) + ".json";
    a.click();

    URL.revokeObjectURL(url);

    alert("Account created!");
});

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