//==========================================Variable==========================================
const FromDate = document.getElementById("FromDate");
const ToDate = document.getElementById("ToDate");
const Products = document.getElementById("Products");
const SaveBtn = document.getElementById("SaveBtn");
const SearchBtn = document.getElementById("SearchBtn");
gobalChart = null;

//======================================Request Response======================================
class ListOrders_Request {
    constructor(fromDate, toDate) {
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    toJson() {
        const data = {};
        if (this.fromDate != null) data["from"] = this.fromDate;
        if (this.toDate != null) data["to"] = this.toDate;
        data["orderStatus"] = "COMPLETED";
        return data;
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

    async getProduct(productId)
    {
        let request = new Product_Request(productId);
        const token = getCookie("token");
        const res = await fetch("/manager_request/product_info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(request.toJson())
        });
        
        if (res.status == 302)
        {
            console.log("?")
            const data = await res.json();
            return new Product(data["id"], data["name"]);
        }
        else
        {
            const data = await res.json();
            console.error("Error: ", data["error"]);
            alert("Error, please reload the page!");
            return null;
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

class Product {
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
    }
}

window.onload = async function () 
{
    //===Check token and role valid===
    const token = getCookie("token");
    const username = encodeURIComponent(getCookie("username"));
    const request = new UserInfo_Request(username);

    const res = await fetch("/manager_request/user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(request.toJson())
    });

    if (res.status == 302 || res.status == 200) {
        const data = await res.json();
        const result = new UserInfo_Response(data);
        const isManager = result.roles.includes("MANAGER");

        if (!isManager) 
        {
            window.location.href = "/manager/login";
            return;
        }
    } 
    else 
    {
        const data = await res.json();
        console.error("Error:" + data["error"]);
        return;
    }



    //===get data during fromDate - toDate===
    const fromDate = FromDate.value ? new Date(FromDate.value) : null;
    const toDate = ToDate.value ? new Date(ToDate.value) : null;
    const req2 = new ListOrders_Request(fromDate, toDate);
    const res2 = await fetch("/manager_request/list_orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(req2.toJson())
    });

    if (res2.status == 302) 
    {
        const data = await res2.json();
        console.log(data);
        const result = new ListOrders_Response();
        await result.init(data);
        // createProductCheckBoxs(result.orders);
        createChart(result.orders);
        sessionStorage.setItem("list_orders", JSON.stringify(result.orders));
    }
    else 
    {
        const data = await res2.json();
        console.error("Server Error:", data["error"]);
    }
}

// SaveBtn.addEventListener("click", () => {
    
// });

SearchBtn.addEventListener("click", async () => {
    //===Check token and role valid===
    const token = getCookie("token");
    const username = encodeURIComponent(getCookie("username"));
    const request = new UserInfo_Request(username);

    const res = await fetch("/manager_request/user_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(request.toJson())
    });

    if (res.status == 302 || res.status == 200) {
        const data = await res.json();
        const result = new UserInfo_Response(data);
        const isManager = result.roles.includes("MANAGER");

        if (!isManager) 
        {
            window.location.href = "/manager/login";
            return;
        }
    } 
    else 
    {
        const data = await res.json();
        console.error("Error:", data["error"]);
        return;
    }



    //===get data during fromDate - toDate===
    globalChart.destroy();
    const fromDate = FromDate.value ? new Date(FromDate.value + 'T00:00:00Z') : null;
    const toDate = ToDate.value ? new Date(ToDate.value + 'T23:59:59Z') : null;

    const fromTimestamp = fromDate ? fromDate.getTime() : null;
    const toTimestamp = toDate ? toDate.getTime() : null;

    console.log(fromTimestamp);
    console.log(toTimestamp);

    const req2 = new ListOrders_Request(fromTimestamp, toTimestamp);
    console.log(req2.toJson());

    const res2 = await fetch("/manager_request/list_orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(req2.toJson())
    });

    if (res2.status == 302) 
    {
        const data = await res2.json();
        console.log(data);
        const result = new ListOrders_Response();
        await result.init(data);
        // createProductCheckBoxs(result.orders);
        await createChart(result.orders);
        sessionStorage.setItem("list_orders", JSON.stringify(result.orders));
    } 
    else 
    {
        const data = await res2.json();
        console.error("Server Error:", data["error"]);
    }
})

// async function createProductCheckBoxs(orders) {
//     let productTypes = await getProductTypes();

//     for (let product of productTypes)
//     {
//         const productDiv = document.createElement("div");
//         productDiv.classList.add("ProductItem");
//         productDiv.innerHTML = `<input type="checkbox" value="${product["id"]}"><label>${product["name"]}</label>`;
//         Products.appendChild(productDiv);
//     }
// }

async function getProductTypes()
{
    productTypes = [];
    const res = await fetch("/manager_request/product_list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (res.status == 302)
    {
        const data = await res.json();
        productTypes = data["products"]
    }
    else
    {
        const data = await res.json();
        console.error("Server Error:", data["error"]);
    }

    return productTypes;
}

function getColor(index) {
    const colors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
        '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
        '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
        '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
    ];
    return colors[index % colors.length];
}

class ProductData {
    constructor(name) {
        this.name = name;
        this.quantityByTimes = [];
        for (let i = 0; i < 21; i++) {
            this.quantityByTimes.push(new QuantityByTimes(i, 0));
        }
    }

    addData(time, quantity) {
        for (let i = 0; i < this.quantityByTimes.length; i++) {
            if (this.quantityByTimes[i].time >= time) {
                this.quantityByTimes[i].quantity += quantity;
                return;
            }
        }
        // Nếu chưa có time >= time, có thể thêm mới hoặc bỏ qua
    }

    toJson() {
        const quantities = [];
        for (let i = 0; i < this.quantityByTimes.length; i++) {
            quantities.push(this.quantityByTimes[i].quantity); // sửa đúng key quantity
        }
        return {
            name: this.name,
            quantities: quantities
        }
    }
}

class QuantityByTimes {
    constructor(time, quantity) {
        this.time = time;
        this.quantity = quantity;
    }
}

async function createChart(orders) {
    //===Set time range===
    let beginDate = null;
    let endDate = null;

    for (let order of orders) {
        const orderTime = order.orderTimestamp;
        if (!beginDate || orderTime < beginDate) beginDate = orderTime;
        if (!endDate || orderTime > endDate) endDate = orderTime;
    }

    console.log(beginDate, endDate);

    const totalMilliseconds = endDate - beginDate;
    const bucketCount = 20;
    const bucketDuration = totalMilliseconds / bucketCount;

    //===Label===
    const labels = [];
    const productTypes = await getProductTypes();

    if (totalMilliseconds > 24 * 60 * 60 * 1000) {
        for (let i = 0; i < bucketCount + 1; i++) {
            const time = beginDate + i * bucketDuration;
            labels.push(new Date(time).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }));
        }
    }
    else {
        for (let i = 0; i < bucketCount + 1; i++) {
            const time = beginDate + i * bucketDuration;
            labels.push(new Date(time).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"}));
        }
    }

    //===Data===
    const datasets = [];
    const productDatas = [];

    for (let productType of productTypes) {
        productDatas.push(new ProductData(productType.id));
    }

    for (let order of orders) {
        const orderTime = order.orderTimestamp;
        for (let item of order.items) {
            const itemId = item.productId;
            console.log(itemId);
            for (let productData of productDatas) {
                if (productData.name == itemId) {
                    console.log(item.quantity);
                    for (let i = 0; i < bucketCount + 1; i++) {
                        const time = beginDate + i * bucketDuration;
                        if (orderTime <= time) {
                            console.log(time);
                            console.log(orderTime);
                            productData.quantityByTimes[i].quantity += item.quantity;
                            break;
                        }
                    };
                    break;
                }
            }
        }
    }

    for (let i = 0; i < productTypes.length; i++) {
        productDatas[i].name = productTypes[i].name;
    }

    console.log(productDatas);

    for (let productData of productDatas) {
        quantities = [];
        for (let i = 0; i < productData.quantityByTimes.length; i++) {
            quantities.push(productData.quantityByTimes[i].quantity);
        }
        console.log(quantities)
        datasets.push(getDataSet(productTypes.findIndex(product => product.name == productData.name), productTypes.length, productData.name, quantities));
    }


    //===Create Chart===
    const ctx = document.getElementById('SaleChart').getContext('2d');
    globalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Chart of Sold product'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                }
            }
        }
    });
}


// SaveBtn.addEventListener("click", async () => {
//     // Save logic here
// });

//==========================================Support===========================================
function getDataSet(index, total, name, revenues) {
    const color = randomHsl(index, total);
    return {
        label: name,
        data: revenues,
        backgroundColor: color.replace('50%', '80%'),
        borderColor: color,
        fill: false,
        tension: 0.2,
        borderWidth: 2
    };
}

function randomHsl(index, total) {
    const hue = Math.floor((360 / total) * index);
    return `hsl(${hue}, 70%, 50%)`;
}

function getDateTime(ms) {
    const date = new Date(ms);
    return new DateTime(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    );
}

//========================================Create Chart========================================
// function createChartInADay(productDbs, xLabelName, yLabelName)
// {
//     const labelCount = 24;
//     const xLabels = [];

//     // x label from 01h to 24h
//     for (let i = 0; i < labelCount; i++) 
//     {
//         const hour = i + 1;
//         const timeString = `${String(hour).padStart(2, '0')}:00`;
//         xLabels.push(timeString);
//     }

//     // revenue datas from 01h to 24h
//     const products = getProducts(productDbs);
//     const revenueDatas = [];
//     for (let i = 0; i < products.length; i++)
//     {
//         const revenues = Array(labelCount).fill(0);
//         for (let j = 0; j < products[i].productDatas.length; j++)
//         {
//             const prodData = products[i].productDatas[j];
//             const hour = prodData.time.hour;
//             revenues[hour] += prodData.revenue;
//         }
        
//         const dataset = getDataSet(products[i].productName, revenues);
//         revenueDatas.push(dataset);
//     }

//     createChart(xLabelName, yLabelName, xLabels, revenueDatas);
// }

// function createChartInAMonth(date, productDbs, xLabelName, yLabelName)
// {
//     let labelCount = 0;

//     if (date.day == 1 || date.day == 3 || date.day == 5 || date.day == 7 || date.day == 8 || date.day == 10 || date.day == 12)
//     {
//         labelCount = 31;
//     }

//     else if (date.day == 2)
//     {
//         labelCount = 29;
//     }

//     else
//     {
//         labelCount = 30;
//     }

//     const xLabels = [];

//     // x label from 01 to last day of month
//     for (let i = 1; i <= labelCount; i++) 
//     {
//         const day = i;
//         const timeString = `${String(day).padStart(2, '0')}`;
//         xLabels.push(timeString);
//     }

//     // revenue datas from 01 to last day of month
//     const products = getProducts(productDbs);
//     const revenueDatas = [];
//     for (let i = 0; i < products.length; i++)
//     {
//         const revenues = Array(labelCount).fill(0);
//         for (let j = 0; j < products[i].productDatas.length; j++)
//         {
//             const prodData = products[i].productDatas[j];
//             const day = prodData.time.day;
//             revenues[day - 1] += prodData.revenue;
//         }
        
//         const dataset = getDataSet(products[i].productName, revenues);
//         revenueDatas.push(dataset);
//     }

//     createChart(xLabelName, yLabelName, xLabels, revenueDatas);
// }

// function createChartInAYear(productDbs, xLabelName, yLabelName)
// {
//     const labelCount = 12;
//     const xLabels = [];

//     // x label from 01 to 12
//     for (let i = 1; i <= labelCount; i++) 
//     {
//         const month = i;
//         const timeString = `${String(month).padStart(2, '0')}`;
//         xLabels.push(timeString);
//     }

//     // revenue datas from 01 to 12
//     const products = getProducts(productDbs);
//     const revenueDatas = [];
//     for (let i = 0; i < products.length; i++)
//     {
//         const revenues = Array(labelCount).fill(0);
//         for (let j = 0; j < products[i].productDatas.length; j++)
//         {
//             const prodData = products[i].productDatas[j];
//             const month = prodData.time.month;
//             revenues[month - 1] += prodData.revenue;
//         }
        
//         const dataset = getDataSet(products[i].productName, revenues);
//         revenueDatas.push(dataset);
//     }

//     createChart(products, xLabelName, yLabelName, xLabels);
// }

// function createChart(xLabelName, yLabelName, xLabels, revenueDatas) 
// {
//     const ctx = document.getElementById('SaleChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'line',
//         data:
//         {
//             labels: xLabels,
//             datasets: revenueDatas
//         },
//         options: 
//         {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales:
//             {
//                 x: 
//                 {
//                     title: 
//                     {
//                         display: true,
//                         text: xLabelName
//                     }
//                 },
//                 y: 
//                 {
//                     title: 
//                     {
//                         display: true,
//                         text: yLabelName
//                     }
//                 }
//             },
//             plugins: 
//             {
//                 tooltip: 
//                 {
//                     callbacks: 
//                     {
//                         label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`
//                     }
//                 }
//             }
//         }
//     });
// }

//======================================Display Products======================================
// function createProductCheckBoxs(productNames)
// {
//     for (let i = 0; i < productNames.length; i++)
//     {
//         let product = document.createElement("div");
//         product.classList.add("ProductItem");
//         product.innerHTML = `<input type="checkbox" value="${productNames[i]}">
//         <label> ${productNames[i]} </label></input>`;
//         document.getElementById("Products").appendChild(product);
//     }
// }

//==========================================Display===========================================
// const productNames = ["Cappuccino", "Latte", "Espresso", "h", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh"];
// const productDbs = [
//     new ProductDb(10000000, "Cappuccino", 100),
//     new ProductDb(1, "Latte", 50),
//     new ProductDb(2, "Espresso", 20),
//     new ProductDb(50000000, "Cappuccino", 100),
//     new ProductDb(4, "Latte", 50),
//     new ProductDb(5, "Espresso", 20),
//     new ProductDb(6, "Cappuccino", 100),
//     new ProductDb(7, "Latte", 50),
//     new ProductDb(8, "Espresso", 20),
//     new ProductDb(9, "Cappuccino", 100),
//     new ProductDb(10, "Latte", 50),
//     new ProductDb(11, "Espresso", 20),
//     new ProductDb(12, "Cappuccino", 100),
//     new ProductDb(20000000, "Latte", 50),
//     new ProductDb(14, "Espresso", 20),
//     new ProductDb(15, "Cappuccino", 100),
//     new ProductDb(16, "Latte", 50),
//     new ProductDb(17, "Espresso", 20),
//     new ProductDb(9, "Cappuccino", 100),
//     new ProductDb(10, "Latte", 50),
//     new ProductDb(11, "Espresso", 20),
//     new ProductDb(12, "Cappuccino", 100),
//     new ProductDb(13, "Latte", 50),
//     new ProductDb(14, "Espresso", 20),
//     new ProductDb(15, "Cappuccino", 100),
//     new ProductDb(16, "Latte", 50),
//     new ProductDb(17, "Espresso", 20)
// ];

// function displayChart()
// {
//     createChartInADay(productDbs, "Time (hour)", "Revenue ($)");
// }

// function displayProducts()
// {
//     createProductCheckBoxs(productNames);
// }

// displayChart();
// displayProducts();