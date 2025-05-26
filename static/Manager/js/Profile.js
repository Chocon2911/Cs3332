//==========================================Variable==========================================
const RealName = document.getElementById("Name");
const Username = document.getElementById("Username");
const Email = document.getElementById("Email");
const Phone = document.getElementById("Phone");
const BirthDate = document.getElementById("BirthDate");
const ErrorMessage = document.getElementById("ErrorMessage");

const MaleRadio = document.getElementById("Male");
const FemaleRadio = document.getElementById("Female");
const OtherRadio = document.getElementById("Other");

//===========================================Class============================================
class UserInformationUpdate_Request
{
    constructor(name, username, email, phone, gender, dateOfBirth, roles)
    {
        this.name = name;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.roles = roles;
    }

    toJSON() 
    {
        return {
            username: this.username,
            name: this.name,
            email: this.email,
            phone: this.phone,
            dateOfBirth: this.dateOfBirth,
            gender: this.gender,
            roles: this.roles
        };
    }
}

class ChangePassword_Request
{
    constructor(username, oldPassword, newPassword)
    {
        this.username = username;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    toJSon()
    {
        return {
            username: this.username,
            old_password: this.oldPassword,
            password: this.newPassword
        }
    }
}

//==========================================On Load===========================================
window.onload = async function ()
{
    const token = getCookie("token");
    const username = encodeURIComponent(getCookie("username"));
    request = new UserInfo_Request(username);
    const res = await fetch("/manager_request/user_info", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(request.toJson())
    });

    if (res.status == 302)
    {
        data = await res.json();
        const result = await new UserInfo_Response(data);
        RealName.value = result.name;
        Username.value = result.username;
        Email.value = result.email;
        Phone.value = result.phone;
        if (result.gender == "male") MaleRadio.checked = true;
        else if (result.gender == "female") FemaleRadio.checked = true;
        else if (result.gender == "other") OtherRadio.checked = true;

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
        ErrorMessage.classList.add("show");
        ErrorMessage.textContent = "Server Error: " + data["error"];
        console.log(data["error"]);
    }
    else
    {
        data = await res.json();
        console.log("Unexpected Error: " + data["error"]);
    }
};

//========================================Save Button=========================================
document.getElementById("SaveButton").addEventListener("click", async function ()
{
    ErrorMessage.classList.remove("show");
    // must be init
    if (!RealName.value.trim() || !Username.value.trim() || !BirthDate.value.trim()
        || !Email.value.trim() || !Phone.value.trim())
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
        const res = await fetch("/manager_request/user_info", {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(request.toJson())
        });

        data = await res.json();
        if (res.status == 302)
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
    phone = Phone.value;
    email = Email.value;
    
    gender = null;
    if (MaleRadio.checked) gender = "male";
    else if (FemaleRadio.checked) gender = "female";
    else if (OtherRadio.checked) gender = "other";

    birthDate = BirthDate.value;
    unixBirthTime = new Date(birthDate).getTime();
    
    request = new UserInformationUpdate_Request(realName, username, email, phone, gender, unixBirthTime, roles);
    
    if (!validateData(request)) return;
    try 
    {
        const token = getCookie("token");
        const res = await fetch("/manager_request/user_info_update", {
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
    if (data.dateOfBirth < 0)
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
        ErrorMessage.textContent = "Your email must contain an @ symbol";
        return false;
    }

    else 
    {
        ErrorMessage.classList.remove("show");
        ErrorMessage.textContent = "";
    }

    for (i = 0; i < data.phone.length; i++)
    {
        if (data.phone[i] < "0" || data.phone[i] > "9")
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Your phone number must only contain digits";
            return false;
        }
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

    for (i = 0; i <data.email.length; i++)
    {
        if (data.email[i] == " ")
        {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Your email cannot contain spaces";
            return false;
        }
    }

    return true;
}