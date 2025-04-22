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