//==========================================Variable==========================================
const FromDate = document.getElementById("FromDate");
const ToDate = document.getElementById("ToDate");
const Products = document.getElementById("Products");
const SaveBtn = document.getElementById("SaveBtn");

//======================================Request Response======================================
class ListOrders_Request {
    constructor(fromDate, toDate) {
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    toJson() {
        const data = {};
        if (this.fromDate != null) data["fromDate"] = this.fromDate;
        if (this.toDate != null) data["toDate"] = this.toDate;
        data["orderStatus"] = "PENDING_CONFIRMATION";
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
                console.log(item["productID"]);
                items.push(item["productID"], item["quantity"], item["priceAtOrder"]);
            }

            this.orders.push(new Order_Response(order["tableID"], order["orderID"], order["items"], 
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
        console.error("Error:", data["error"]);
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
        createProductCheckBoxs(result.orders);
        createChart(result.orders);
        sessionStorage.setItem("list_orders", JSON.stringify(result.orders));
    } 
    else 
    {
        const data = await res2.json();
        console.error("Server Error:", data["error"]);
    }
}

async function createProductCheckBoxs(orders) {
    productTypes = [];
    const res = await fetch("/manager_request/list_products", {
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

    for (let product of productTypes) 
    {
        const productDiv = document.createElement("div");
        productDiv.classList.add("ProductItem");
        productDiv.innerHTML = `<input type="checkbox" value="${product["id"]}"><label>${product["name"]}</label>`;
        Products.appendChild(productDiv);
    }
}

function createChart(orders) {
    const fromDate = FromDate.value ? new Date(FromDate.value) : new Date(0);
    const toDate = ToDate.value ? new Date(ToDate.value) : new Date();
    const totalMilliseconds = toDate - fromDate;
    const bucketCount = 20;
    const bucketDuration = totalMilliseconds / bucketCount;

    const productMap = new Map();
    for (let order of orders) {
        for (let item of order.items) {
            if (!productMap.has(item.productId)) {
                productMap.set(item.productId, {
                    name: item.productName || item.productId,
                    sales: new Array(bucketCount).fill(0)
                });
            }
        }
    }

    for (let order of orders) {
        const orderTime = new Date(order.paymentTimestamp).getTime();
        const bucketIndex = Math.floor((orderTime - fromDate.getTime()) / bucketDuration);
        if (bucketIndex < 0 || bucketIndex >= bucketCount) continue;
        for (let item of order.items) {
            const productData = productMap.get(item.productId);
            if (productData) {
                productData.sales[bucketIndex] += item.quantity;
            }
        }
    }

    const labels = [];
    for (let i = 0; i < bucketCount; i++) {
        const labelTime = new Date(fromDate.getTime() + i * bucketDuration);
        labels.push(labelTime.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }));
    }

    const datasets = [];
    let i = 0;
    for (let [productId, productData] of productMap.entries()) {
        datasets.push(getDataSet(i++, productMap.size, productData.name, productData.sales));
    }

    const ctx = document.getElementById('SaleChart').getContext('2d');
    new Chart(ctx, {
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
                    text: 'Biểu đồ số lượng sản phẩm đã bán theo thời gian'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Thời gian'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Số lượng'
                    }
                }
            }
        }
    });
}

SaveBtn.addEventListener("click", async () => {
    // Save logic here
});

//==========================================Support===========================================
function getDataSet(index, total, name, revenues) {
    const color = randomHsl(index, total);
    return {
        label: name,
        data: revenues,
        backgroundColor: color.replace('50%', '80%'),
        borderColor: color,
        fill: false,
        tension: 0.4,
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