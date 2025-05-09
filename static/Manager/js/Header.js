const accountBtn = document.getElementById("AccountButton");
const accountPopup = document.getElementById("AccountPopup");
const mainBody = document.getElementById("MainBody");

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
        if (result.status == "no permission")
        {
            window.location.href = result.url;
        }
    }
    catch (error)
    {
        console.log(error);
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