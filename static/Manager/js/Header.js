const accountBtn = document.getElementById("AccountButton");
const accountPopup = document.getElementById("AccountPopup");
const mainBody = document.getElementById("MainBody");

//===========================================Class============================================
class UserInfo_Request
{
    constructor(username)
    {
        this.username = username;
    }
    toJson()
    {
        return {
            username: this.username
        };
    }
}

class UserInfo_Response
{
    constructor(data)
    {
        this.username = data['username'];
        this.name = data['name'];
        this.email = data['email'];
        this.phone = data['phone'];
        this.dateOfBirth = data['dateOfBirth'];
        this.gender = data['gender'];
        this.roles = data['roles'];
    }
}

//===========================================Event============================================
accountBtn.addEventListener("click", function (event) 
{ 
    accountPopup.classList.toggle("show"); 
    event.stopPropagation();
    
});

accountBtn.addEventListener("click", function (event)
{
    if (!accountPopup.contains(event.target) && !accountBtn.contains(event.target))
    {
        accountPopup.classList.remove("show");
    }
});

mainBody.addEventListener("click", function (event)
{
    if (!accountPopup.contains(event.target) && !accountBtn.contains(event.target))
    {
        accountPopup.classList.remove("show");
    }
});

window.onload = async function ()
{
    try
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

        data = await res.json();
        if (res.status == 200)
        {
            const result = await new UserInfo_Response(data);
            for (let i = 0; i < result.roles.length; i++)
            {
                if (result.roles[i] == "MANAGER")
                {
                    console.log("Has permission");
                    return;
                } 
                if (i == result.roles.length - 1)
                {
                    console.log("No permission");
                    window.location.href = "/manager/login";
                    return;
                } 
            }
        }
        else if (res.status >= 400 && res.status <= 600)
        {
            console.log(data["error"]);
            window.location.href = "/manager/login";
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
    }
}

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