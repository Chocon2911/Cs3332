//==========================================Variable==========================================
const OrderList = document.getElementById("OrderList");

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

//==========================================On Load===========================================
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

class ListOrders_Response 
{
    constructor() {}

    async init(data)
    {
        this.orders = [];
        for (let order of data["orders"])
        {
            let items = [];
            for (let item of order["items"])
            {
                items.push(new Item( item["productID"], item["quantity"], item["priceAtOrder"]));
            }

            this.orders.push(new Order_Response(order["tableID"], order["orderID"], items, 
                order["orderTimestamp"], order["status"], order["userId"], order["paymentTimestamp"], 
                order["readyTimestamp"], order["preparedBy"], order["total"]));
        }
    }
}

class Order_Response {
    constructor(tableId, orderId, items, orderTimestamp, status, userId, paymentTimestamp, 
        readyTimestamp, preparedBy, total) 
    {
        this.tableId = tableId;
        this.orderId = orderId;
        this.items = items;
        this.orderTimestamp = orderTimestamp;
        this.status = status;
        this.userId = userId;
        this.paymentTimestamp = paymentTimestamp;
        this.readyTimestamp = readyTimestamp;
        this.preparedBy = preparedBy;
        this.total = total;    
    }
}

class Product_Request
{
    constructor(id) 
    {
        this.id = id;
    }

    toJson() 
    {
        const data = {};
        data["productID"] = this.id;
        return data;
    }
}

class Item {
    constructor(productId, quantity, priceAtOrder) 
    {
        this.productId = productId;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
    }
}

window.onload = async function ()
{
    await LoadData();
}

async function LoadData()
{
    OrderList.innerHTML = "";

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
        isValid = false;
        for (let role of result.roles)
        {
            if (role == "BARTENDER" || role == "ADMIN") 
            { 
                isValid = true; 
                break; 
            }
        }

        if (!isValid) window.location.href = "/manager/login";

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
    orders = [];

    // Paid Orders
    orders1 = [];
    const req2 =
    {
        orderStatus: "PAID"
    }
    const res2 = await fetch("/manager_request/list_orders", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(req2)
    });

    if (res2.status == 302)
    {
        data = await res2.json();
        const result = new ListOrders_Response();
        await result.init(data);
        orders1 = result.orders;
        await renderOrders(orders);
    }
    else if (res2.status >= 400 && res2.status <= 600)
    {
        if (res2.status == 401)
        {
            window.location.href = "/manager/login";
            return;
        }

        data = await res2.json();
        console.log("Server Error: " + data["error"]);
        return;
    }
    else
    {
        data = await res2.json();
        console.log("Unexpected Error: " + data["error"]);
        return;
    }

    // Preparing Orders
    orders2 = [];
    const req3 =
    {
        orderStatus: "PREPARING"
    }
    const res3 = await fetch("/manager_request/list_orders", {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(req3)
    });

    if (res3.status == 302)
    {
        data = await res3.json();
        const result = new ListOrders_Response();
        await result.init(data);
        orders2 = result.orders;
        console.log(orders);
        await renderOrders(orders);
    }
    else if (res3.status >= 400 && res3.status <= 600)
    {
        if (res3.status == 401)
        {
            window.location.href = "/manager/login";
            return;
        }

        data = await res3.json();
        console.log("Server Error: " + data["error"]);
        return;
    }
    else
    {
        data = await res3.json();
        console.log("Unexpected Error: " + data["error"]);
        return;
    }

    orders = mixOrdersByTime(orders1, orders2);
    await renderOrders(orders);
}

function mixOrdersByTime(orders1, orders2) 
{
    return orders1.concat(orders2).sort((a, b) => a.orderTimestamp - b.orderTimestamp);
}

//==========================================Support===========================================
class ProductList_Response
{
    constructor(data) 
    {
        this.products = [];
        for (let product of data["products"])
        {
            this.products.push(new Product(product["id"], product["name"], product["unit"], product["price"], product["ingredients"]));
        }
    }
}

class Product {
    constructor(id, name, unit, price, ingredients)
    {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.price = price;
        this.ingredients = [];
        for (let ingredient of ingredients)
        {
            this.ingredients.push(new Ingredient(ingredient["itemStackID"], ingredient["name"], 
                ingredient["unit"], ingredient["quantity"]));
        }
    }
}

class Ingredient
{
    constructor(itemStackId, name, unit, quantity)
    {
        this.itemStackId = itemStackId;
        this.name = name;
        this.unit = unit;
        this.quantity = quantity;
    }
}

async function getProductTypes()
{
    const res = await fetch("/manager_request/product_list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (res.status == 302)
    {
        const data = await res.json();
        productTypes = new ProductList_Response(data);
        return productTypes;
    }
    else
    {
        const data = await res.json();
        console.error("Server Error:", data["error"]);
    }

    return null;
}

 async function renderIngredients(ingredients) {
    const result = [];

    for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];

        const ingredientDiv = document.createElement("div");
        ingredientDiv.classList.add("FormulaRow");

        ingredientDiv.innerHTML = `
            <div class="ProductInfo">
                <label class="IngredientLabel">${ingredient.name}</label>
                <label class="IngredientLabel"> - </label>
                <label class="IngredientLabel">${ingredient.quantity} ${ingredient.unit}</label>
            </div>
        `;

        result.push(ingredientDiv);
    }

    return result;
}

async function renderProducts(items) {
    const result = [];
    const productTypes = await getProductTypes();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = productTypes.products.find(p => p.id === item.productId);
        if (!product) continue;

        const productDiv = document.createElement("div");
        productDiv.classList.add("Product");

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("ProductInfo");
        infoDiv.innerHTML = `
            <label class="ProductLabel">${product.name}</label>
            <label class="ProductLabel"> - </label>
            <label class="ProductLabel">${item.quantity} ${product.unit}</label>
        `;

        const formulaList = document.createElement("div");
        formulaList.classList.add("FormulaList");

        const ingredientDivs = await renderIngredients(product.ingredients || []);
        for (const ingDiv of ingredientDivs) {
            formulaList.appendChild(ingDiv);
        }

        productDiv.appendChild(infoDiv);
        productDiv.appendChild(formulaList);

        result.push(productDiv);
    }

    return result;
}

async function renderOrders(orders) {
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const orderDiv = document.createElement("div");
        const isTaken = order.status == "PAID";
        const isValid = order.preparedBy == getCookie("username") ? true : false; 
        orderDiv.className = isTaken ? "Order Untaken" : "Order Taken";


        orderDiv.innerHTML = `
            <!--Title-->
            <div class=OrderTitle>
                <div class="LeftOrderTitle">
                    <span class="OrderNumber">Order #${i + 1}: </span>
                    <span class="OrderId">${order.orderId}</span>
                </div>
                <div class="RightOrderTitle ${isTaken ? "waiting" : ""}">
                    <span class="OrderStatus">${isTaken ? "Waiting" : "Preparing"}</span>
                </div>
            </div>
            <!--Buttons-->
            <div class="OrderButtons">
                <button type="button" class="ContentButton TakeBtn ${isTaken ? "" : "hide"}" id="TakeBtn_${i+1}" value="${order.orderId}" onclick="takeOrder('${order.orderId}')">Take</button>
                <button type="button" class="ContentButton CancelBtn ${isTaken && isValid ? "hide" : ""}" id="CancelBtn_${i+1}" value="${order.orderId}" onclick="cancelOrder('${order.orderId}')">Cancel</button>
                <button type="button" class="ContentButton ConfirmBtn ${isTaken && isValid ? "hide" : ""}" id="ConfirmBtn_${i+1}" value="${order.orderId}" onclick="completeOrder('${order.orderId}')">Complete</button>
                <button type="button" class="ContentButton EmptyBtn" ${isTaken && !isValid ? "hide" : ""}>Empty</button>
                <button type="button" class="ToggleDetailBtn" id="ToggleDetailBtn_${i+1}" value="${order.orderId}" onclick="toggleOrderDetail('${i+1}')">
                    <img src= "/static/Manager/Image/PasswordEye.png" width="40" height="30">
                </button>
            </div>
            <!--Detail-->
            <div class="OrderDetail hide" id="OrderDetail_${i+1}">
                <div class="DetailTitleContainer">
                    <label class="DetailTitle">Products</label>
                </div>
            </div>
        `;

        const orderDetailDiv = orderDiv.querySelector(".OrderDetail");
        const productsDiv = await renderProducts(order.items);

        for (const pDiv of productsDiv) {
            orderDetailDiv.appendChild(pDiv);
        }

        OrderList.appendChild(orderDiv);
    }
}

function toggleOrderDetail(index)
{
    const detailDiv = document.getElementById("OrderDetail_" + index);
    detailDiv.classList.toggle("hide");
}

class OrderUpdateStatus_Request
{
    constructor(orderId, newStatus)
    {
        this.orderId = orderId;
        this.newStatus = newStatus;
    }

    toJson()
    {
        return {
            orderID: this.orderId,
            newStatus: this.newStatus
        }
    }
}

async function takeOrder(id) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "PREPARING");
    const res = await fetch("/bartender_request/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        await LoadData();
    }
    else if (res.status >= 400 && res.status <= 600) {
        if (res.status === 401) {
            window.location.href = '/manager/login';
        }
        const err = await res.json();
        console.error("Server error: " + err['error']);
    }
    else 
    {
        const data = await res.json();
        console.error("Unexpected error: " + data['error']);
    }
}

async function cancelOrder(id) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "PAID");
    const res = await fetch("/bartender_request/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        await LoadData();
    }
    else if (res.status >= 400 && res.status <= 600) {
        if (res.status === 401) {
            window.location.href = '/manager/login';
        }
        const err = await res.json();
        console.error("Server error: " + err['error']);
    }
    else 
    {
        const data = await res.json();
        console.error("Unexpected error: " + data['error']);
    }
}

async function completeOrder(id) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "READY");
    const res = await fetch("/bartender_request/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        await LoadData();
    }
    else if (res.status >= 400 && res.status <= 600) {
        if (res.status === 401) {
            window.location.href = '/manager/login';
        }
        const err = await res.json();
        console.error("Server error: " + err['error']);
    }
    else 
    {
        const data = await res.json();
        console.error("Unexpected error: " + data['error']);
    }
}