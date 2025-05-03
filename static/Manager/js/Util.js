function logout()
{
    window.location.href = "../../Manager/html/login.html";
}

function login(role)
{
    if (role == "manager")
    {
        window.location.href = "../../Manager/html/Profile.html";
    }
    else if (role == "storageManager")
    {
        window.location.href = "../../StorageManager/html/DashBoard.html";
    }
    else if (role == "bartender")
    {
        window.location.href = "../../Bartender/html/index.html";
    }
    else if (role == "customerCashier")
    {
        window.location.href = "../../CustomerCashier/html/index.html";
    }
}