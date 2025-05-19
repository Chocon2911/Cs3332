//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Password = document.getElementById("Password");
const BirthDate = document.getElementById("BirthDate");
const ErrorMessage = document.getElementById("ErrorMessage");

//===========================================Class============================================
class UserInformationUpdate_Request
{
    constructor(name, username, password, dateOfBirth, roles)
    {
        this.name = name;
        this.username = username;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.roles = roles;
    }

    toJSON() 
    {
        return {
            username: this.username,
            name: this.name,
            email: "abc@gmail.com",
            phone: "0123456789",
            dateOfBirth: this.dateOfBirth,
            gender: "male",
            roles: this.roles
        };
    }
}

//==========================================On Load===========================================
window.onload = async function ()
{
    const token = getCookie("token");
    const username = encodeURIComponent(getCookie("username"));
    request = new UserInfo_Request(username);
    const res = await fetch("/user_info", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(request.toJson())
    });

    if (res.status == 200)
    {
        data = await res.json();
        const result = await new UserInfo_Response(data);
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
    else if (res.status >= 400 && res.status <= 600)
    {
        if (res.status == 401)
        {
            window.location.href = "/manager/login";
            return;
        }

        data = await res.json();
        console.log(data["error"]);
    }
    else
    {
        data = await res.json();
        console.log("Unexpected Error: " + data["error"]);
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

    //===Get Roles===
    let roles = [];
    try
    {
        const token = getCookie("token");
        const username = encodeURIComponent(getCookie("username"));
        const request = new UserInfo_Request(username);
        const res = await fetch("/user_info", {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(request.toJson())
        });

        data = await res.json();
        if (res.status == 200)
        {
            const result = await new UserInfo_Response(data);
            roles = result.roles;
            for (let i = 0; i < roles.length; i++)
            {
                console.log(roles[i]);
            }
        }
        else if (res.status >= 400 && res.status <= 600)
        {
            if (res.status == 401)
            {
                window.location.href = "/manager/login";
                return;
            }

            console.log(data["error"]);
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Server Error: " + data["error"];
            return;
        }
        else
        {
            console.log("Unexpected Error: " + data["error"]);
            return;
        }
    }
    catch (error)
    {
        console.log("Error: " + error);
        return;
    }


    //===Save Profile===
    realName = RealName.value;
    username = Username.value;
    password = Password.value;
    birthDate = BirthDate.value;

    unixBirthTime = new Date(birthDate).getTime();
    request = new UserInformationUpdate_Request(realName, username, password, unixBirthTime, roles);
    
    if (!validateData(request)) return;
    try 
    {
        const token = getCookie("token");
        const res = await fetch("/user_info_update", {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json", 
                "Authorization": token,
            },
            body: JSON.stringify(request.toJSON())
        });

        data = await res.json();
        if (res.status == 200)
        {
            alert("New profile has been saved!");
        }
        else if (res.status >= 400 && res.status <= 600)
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Server Error: " + res["error"];
        }
        else
        {
            console.log("Bruh");
            console.log("Unexpected Error: " + res["error"]);
        }
    }
    catch (error) 
    {
        console.log("catch: " + error);
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
            return false;
        }
    }

    return true;
}