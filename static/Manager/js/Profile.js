//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const BirthDate = document.getElementById("BirthDate");
const ErrorMessage = document.getElementById("ErrorMessage");

//===========================================Class============================================
class Profile
{
    constructor(name, username, password, birthTime)
    {
        this.name = name;
        this.username = username;
        this.password = password;
        this.birthTime = birthTime;
    }

    toJSON() 
    {
        return {
            name: this.name,
            username: this.username,
            password: this.password,
            birthTime: this.birthTime
        };
    }
}

//==========================================On Load===========================================
window.onload = async function ()
{
    try 
    {
        const token = getCookie("token");
        const username = getCookie("username");
        const res = await fetch("/manager/get_account_profile", {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json", 
                "Authorization": token,
            },
            body: JSON.stringify({ username: username })
        });

        const result = await res.json();
        if (result.status == "success")
        {
            RealName.value = result.name;
            Username.value = result.username;
            Password.value = result.password;

            let unixTime = result.dateOfBirth; 
            console.log(unixTime); 
            let date = new Date(unixTime);
            console.log(date);
            let formattedDate = date.toISOString().split('T')[0];
            BirthDate.value = formattedDate;
        }
        else if (result.status == "no permission")
        {
            window.location.href = result.url;
        }
    }
    catch (error)
    {
        console.log(error);
    }
};

//======================================Toggle Password=======================================
document.getElementById("TogglePassword").addEventListener("click", function ()
{
    const passwordInput = document.getElementById("Password");
    const togglePasswordButton = document.getElementById("TogglePassword");
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    togglePasswordButton.classList.toggle("hide");
});

//========================================Save Button=========================================
document.getElementById("SaveButton").addEventListener("click", async function ()
{
    ErrorMessage.classList.remove("show");
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
    const token = getCookie("token");
    const role = getCookie("role");

    try 
    {
        const res = await fetch("/manager/save_account_profile", {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json", 
                "Authorization": token,
                "Role": role
            },
            body: JSON.stringify(profile.toJSON())
        });
        const result = await res.json();
        if (result.status == "success")
        {
            alert("New profile has been saved!");
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
        console.log(error);
    }

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

// function validateData(data)
// {
//     if (data.password.length < 8)
//     {
//         ErrorMessage.classList.add("show");
//         ErrorMessage.textContent = "Password must be above 8 characters";
//     }

//     else if (data.password.length > 32)
//     {
//         ErrorMessage.classList.add("show");
//         ErrorMessage.textContent = "Password must be below 32 characters";
//     }

//     else if (data.birthDate < 0)
//     {
//         ErrorMessage.classList.add("show");
//         ErrorMessage.textContent = "Your date of birth must be later than 1970";
//     }

//     else if (data.birthDate > Date.now())
//     {
//         ErrorMessage.classList.add("show");
//         ErrorMessage.textContent = "Your date of birth must be earlier than today";
//     }

//     else 
//     {
//         ErrorMessage.classList.remove("show");
//         ErrorMessage.textContent = "";
//     }

//     for (i = 0; i < data.name.length; i++)
//     {
//         if (data.name[i] == "1" || data.name[i] == "2" || data.name[i] == "3" || data.name[i] == "4" || data.name[i] == "5" || data.name[i] == "6" || data.name[i] == "7" || data.name[i] == "8" || data.name[i] == "9")
//         {
//             ErrorMessage.classList.add("show");
//             ErrorMessage.textContent = "Your name cannot contain numbers";
//         }
//     }
// }

//=======================================Cancel Button========================================
// document.getElementById("CancelButton").addEventListener("click", function ()
// {
//     defaultProfile();
// });

//==========================================On Load===========================================
// window.onload = function()
// {
//     // defaultProfile();
//     managerInit()
// };

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