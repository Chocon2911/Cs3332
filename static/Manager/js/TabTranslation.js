const ManagerBtn = document.getElementById("ManagerBtn");
const StorageManagerBtn = document.getElementById("StorageManagerBtn");
const BartenderBtn = document.getElementById("BartenderBtn");
const CustomerBtn = document.getElementById("CustomerBtn");

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

//===========================================Event============================================
window.onload = async function ()
{
    try
    {
        const token = getCookie("token");
        const username = getCookie("username");
        const res = await fetch("/manager_request/user_info", {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json", 
                "Authorization": token,
            },
            body: JSON.stringify({ username: username })
        });

        if (res.status >= 400 && res.status <= 600)
        {
            window.location.href = "/manager/login";
            return;
        }

        else if (res.status == 302)
        {
            const result = await res.json();
            roles = result["roles"];
            for (let i = 0; i < roles.length; i++)
            {
                console.log(roles[i]);
                if (roles[i] == "MANAGER")
                {
                    ManagerBtn.classList.add("show");
                }
                else if (roles[i] == "STORAGE_MANAGER")
                {
                    StorageManagerBtn.classList.add("show");
                }
                else if (roles[i] == "BARTENDER")
                {
                    BartenderBtn.classList.add("show");
                }
                else if (roles[i] == "CASHIER")
                {
                    CustomerBtn.classList.add("show");
                }
            }
        }
    }
    catch (error)
    {
        console.log(error);
    }
};

ManagerBtn.addEventListener("click", function (event)
{
    window.location.href = "/manager/profile";
});

StorageManagerBtn.addEventListener("click", function (event)
{
    window.location.href = "/storage_manager/dashboard";
});

BartenderBtn.addEventListener("click", function (event)
{
    window.location.href = "...";
});

CustomerBtn.addEventListener("click", function (event)
{
    window.location.href = "...";
});