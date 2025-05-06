const accountBtn = document.getElementById("AccountButton");
const accountPopup = document.getElementById("AccountPopup");
const mainBody = document.getElementById("MainBody");

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

function managerInit() 
{
    const token = getCookie("token");
    const role = getCookie("role");

    if (token !== "123" || role !== "manager") 
    {
        window.location.href = "/manager/error";
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