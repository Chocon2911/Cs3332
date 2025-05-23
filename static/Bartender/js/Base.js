//==========================================Variable==========================================
const OrderList = document.getElementById("OrderList");
const 

//==========================================On Load===========================================
window.onload = async function ()
{
    //===Check valid token and role===
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

    if (res.status == 302 || res.status == 200)
    {
        data = await res.json();
        const result = await new UserInfo_Response(data);
        for (let role of result.roles)
        {
            if (role == "BARTENDER" || role == "ADMIN") return;
        }

        window.location.href = "/manager/login";

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

    //===Get order list===
}


//===========================================Order============================================
function renderOrders() {
    OrderList.innerHTML = "";
    orders.forEach(order => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order");
        orderDiv.id = `order-${order.id}`;
        orderDiv.innerHTML = `
        <h3>Order #${order.id}: ${order.name}</h3>
        <div class="order-buttons">
            <button onclick="cancelOrder(${order.id})">Cancel</button>
            <button onclick="completeOrder(${order.id})">Confirm</button>
        </div>
        `;
        OrderList.appendChild(orderDiv);
});
}

function cancelOrder(id) {

}

function completeOrder(id) {

}

renderOrders();