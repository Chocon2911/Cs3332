//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const BirthDate = document.getElementById("BirthDate");
const ErrorMessage = document.getElementById("ErrorMessage");

//===========================================Class============================================
class Profile
{
    constructor(name, username, password, birthDate)
    {
        this.name = name;
        this.username = username;
        this.password = password;
        this.birthDate = birthDate;
    }
}

//========================================Save Button=========================================
document.getElementById("SaveButton").addEventListener("click", function ()
{
    // must be init
    if (!RealName.value.trim() || !Username.value.trim() || !Password.value.trim() || !BirthDate.value.trim())
    {
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "You must fill in all fields";
        return;
    }

    realName = RealName.value;
    username = Username.value;
    password = Password.value;
    birthDate = BirthDate.value;
    unixBirthTime = new Date(birthDate).getTime();

    profile = new Profile(realName, username, password, unixBirthTime);
    validateData(profile);

    // const data = 
    // {
    //     name: document.getElementById("Name").value,
    //     username: document.getElementById("Username").value,
    //     password: document.getElementById("Password").value,
    //     birthDay: document.getElementById("BirthDay").value,
    //     birthMonth: document.getElementById("BirthMonth").value,
    //     birthYear: document.getElementById("BirthYear").value
    // }

    // const jsonString = JSON.stringify(data);

    // const blob = new Blob([jsonString], { type: "application/json" });
    // const url = URL.createObjectURL(blob);

    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "profile.json";
    // a.click();

    // URL.revokeObjectURL(url);

    // alert("Profile Saved!");
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