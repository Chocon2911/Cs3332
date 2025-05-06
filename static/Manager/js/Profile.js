//========================================Save Button=========================================
document.getElementById("SaveButton").addEventListener("click", function ()
{
    const data = 
    {
        name: document.getElementById("Name").value,
        username: document.getElementById("Username").value,
        password: document.getElementById("Password").value,
        birthDay: document.getElementById("BirthDay").value,
        birthMonth: document.getElementById("BirthMonth").value,
        birthYear: document.getElementById("BirthYear").value
    }

    const jsonString = JSON.stringify(data);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "profile.json";
    a.click();

    URL.revokeObjectURL(url);

    alert("Profile saved!");
});

//=======================================Cancel Button========================================
// document.getElementById("CancelButton").addEventListener("click", function ()
// {
//     defaultProfile();
// });

//==========================================On Load===========================================
window.onload = function()
{
    // defaultProfile();
    managerInit()
};

//===========================================Method===========================================
// function defaultProfile()
// {
//     fetch("../Db/profile.json")
//     .then(response => response.json())
//     .then(data => 
//     {
//         document.getElementById("Name").value = data.name;
//         document.getElementById("Username").value = data.username;
//         document.getElementById("Password").value = data.password;
//         document.getElementById("BirthDay").value = data.birthDay;
//         document.getElementById("BirthMonth").value = data.birthMonth;
//         document.getElementById("BirthYear").value = data.birthYear;
//     })
//     .catch(error)
//     {
//         console.log(error);
//     }
// }

//======================================Toggle Password=======================================
document.getElementById("TogglePassword").addEventListener("click", function ()
{
    const passwordInput = document.getElementById("Password");
    const togglePasswordButton = document.getElementById("TogglePassword");
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    togglePasswordButton.classList.toggle("hide");
});

//=======================================Validate Form========================================
function validateForm() {
    let isValid = true;
    let name = document.getElementById("Name");
    let nameError = document.getElementById("nameError");
    let emailError = document.getElementById("emailError");

    nameError.textContent = "";
    emailError.textContent = "";

    if (name.value.trim() === "") {
        nameError.textContent = "Tên không được để trống!";
        isValid = false;
    }

    if (email.value.trim() === "") {
        emailError.textContent = "Email không được để trống!";
        isValid = false;
    }

    return isValid;
}