//============================================Obj=============================================
class ProductDb
{
    constructor(ms, productName, price)
    {
        this.ms = ms;
        this.productName = productName;
        this.price = price;
    }
}

class DateTime
{
    constructor(year, month, day, hour, minute, second)
    {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }

    getTotalSecond()
    {
        yearSec = this.year * 365 * 24 * 3600;
        monthSec = this.month * 30 * 24 * 3600;
        daySec = this.day * 24 * 3600;
        minuteSec = this.minute * 60;
        hourSec = this.hour * 3600;
        return yearSec + monthSec + daySec + hourSec + minuteSec + this.second;
    }
}

class Product
{
    constructor(productName, productDatas)
    {
        this.productName = productName;
        this.productDatas = productDatas;
    }
}

class ProductData
{
    constructor(time, revenue)
    {
        this.time = time;
        this.revenue = revenue;
    }
}

class DataSet 
{
    constructor(label, data, bg, border, fill = false, tension = 0.4) 
    {
        this.label = label;
        this.data = data;
        this.backgroundColor = bg;
        this.borderColor = border;
        this.fill = fill;
        this.tension = tension;
    }
}

//==========================================Support===========================================
function getDataSet(name, revenues)
{
    const rgb = randomRgb();
    const dataset = new DataSet(
        name,
        revenues,
        randomColor(rgb),
        randomBorderColor(rgb),
        true,
        0
    );

    return dataset;
}

function randomRgb() 
{
    return [Math.floor(Math.random() * 200), Math.floor(Math.random() * 200), Math.floor(Math.random() * 200)];
}

function randomColor(rgb) 
{
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)`;
}

function randomBorderColor(rgb) 
{
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
}

function getDateTime(ms)
{
    const date = new Date(ms);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return new DateTime(year, month, day, hour, minute, second);
}

function getProducts(productDbs)
{
    const products = [];

    // go through all children in productDbs (input data)
    for (let i = 0; i < productDbs.length; i++)
    {
        // first product
        if (products.length == 0)
        {
            products.push(new Product(productDbs[i].productName, []));
            productData = new ProductData(getDateTime(productDbs[i].ms), productDbs[i].price);
            products[0].productDatas.push(productData);
        }

        // After first product
        else
        {
            // go through all product in products
            for (let j = 0; j < products.length; j++)
            {
                console.log(products[j].productName);
                // curr product has same name as products[i]
                if (products[j].productName.localeCompare(productDbs[i].productName) === 0)
                {
                    productData = new ProductData(getDateTime(productDbs[i].ms), productDbs[i].price);
                    products[j].productDatas.push(productData);
                    break;
                }

                // current product has different name and last check
                else if (j == products.length - 1) 
                {
                    products.push(new Product(productDbs[i].productName, []));
                    productData = new ProductData(getDateTime(productDbs[i].ms), productDbs[i].price);
                    products[products.length - 1].productDatas.push(productData);
                    break;
                }

                // current product has different name
                else continue;
            }
        }
    }

    return products;
}

//========================================Create Chart========================================
function createChartInADay(productDbs, xLabelName, yLabelName)
{
    const labelCount = 24;
    const xLabels = [];

    // x label from 01h to 24h
    for (let i = 0; i < labelCount; i++) 
    {
        const hour = i + 1;
        const timeString = `${String(hour).padStart(2, '0')}:00`;
        xLabels.push(timeString);
    }

    // revenue datas from 01h to 24h
    const products = getProducts(productDbs);
    const revenueDatas = [];
    for (let i = 0; i < products.length; i++)
    {
        const revenues = Array(labelCount).fill(0);
        for (let j = 0; j < products[i].productDatas.length; j++)
        {
            const prodData = products[i].productDatas[j];
            const hour = prodData.time.hour;
            revenues[hour] += prodData.revenue;
        }
        
        const dataset = getDataSet(products[i].productName, revenues);
        revenueDatas.push(dataset);
    }

    createChart(xLabelName, yLabelName, xLabels, revenueDatas);
}

function createChartInAMonth(date, productDbs, xLabelName, yLabelName)
{
    let labelCount = 0;

    if (date.day == 1 || date.day == 3 || date.day == 5 || date.day == 7 || date.day == 8 || date.day == 10 || date.day == 12)
    {
        labelCount = 31;
    }

    else if (date.day == 2)
    {
        labelCount = 29;
    }

    else
    {
        labelCount = 30;
    }

    const xLabels = [];

    // x label from 01 to last day of month
    for (let i = 1; i <= labelCount; i++) 
    {
        const day = i;
        const timeString = `${String(day).padStart(2, '0')}`;
        xLabels.push(timeString);
    }

    // revenue datas from 01 to last day of month
    const products = getProducts(productDbs);
    const revenueDatas = [];
    for (let i = 0; i < products.length; i++)
    {
        const revenues = Array(labelCount).fill(0);
        for (let j = 0; j < products[i].productDatas.length; j++)
        {
            const prodData = products[i].productDatas[j];
            const day = prodData.time.day;
            revenues[day - 1] += prodData.revenue;
        }
        
        const dataset = getDataSet(products[i].productName, revenues);
        revenueDatas.push(dataset);
    }

    createChart(xLabelName, yLabelName, xLabels, revenueDatas);
}

function createChartInAYear(productDbs, xLabelName, yLabelName)
{
    const labelCount = 12;
    const xLabels = [];

    // x label from 01 to 12
    for (let i = 1; i <= labelCount; i++) 
    {
        const month = i;
        const timeString = `${String(month).padStart(2, '0')}`;
        xLabels.push(timeString);
    }

    // revenue datas from 01 to 12
    const products = getProducts(productDbs);
    const revenueDatas = [];
    for (let i = 0; i < products.length; i++)
    {
        const revenues = Array(labelCount).fill(0);
        for (let j = 0; j < products[i].productDatas.length; j++)
        {
            const prodData = products[i].productDatas[j];
            const month = prodData.time.month;
            revenues[month - 1] += prodData.revenue;
        }
        
        const dataset = getDataSet(products[i].productName, revenues);
        revenueDatas.push(dataset);
    }

    createChart(products, xLabelName, yLabelName, xLabels);
}

function createChart(xLabelName, yLabelName, xLabels, revenueDatas) 
{
    const ctx = document.getElementById('SaleChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data:
        {
            labels: xLabels,
            datasets: revenueDatas
        },
        options: 
        {
            responsive: true,
            scales:
            {
                x: 
                {
                    title: 
                    {
                        display: true,
                        text: xLabelName
                    }
                },
                y: 
                {
                    title: 
                    {
                        display: true,
                        text: yLabelName
                    }
                }
            },
            plugins: 
            {
                tooltip: 
                {
                    callbacks: 
                    {
                        label: (ctx) => `$${ctx.parsed.y.toFixed(2)}`
                    }
                }
            }
        }
    });
}

//======================================Display Products======================================
function createProductCheckBoxs(productNames)
{
    for (let i = 0; i < productNames.length; i++)
    {
        let product = document.createElement("div");
        product.classList.add("ProductItem");
        product.innerHTML = `<input type="checkbox" value="${productNames[i]}">
        <label> ${productNames[i]} </label></input>`;
        document.getElementById("Products").appendChild(product);
    }
}

//==========================================Display===========================================
const productNames = ["Cappuccino", "Latte", "Espresso", "h", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh"];
const productDbs = [
    new ProductDb(10000000, "Cappuccino", 100),
    new ProductDb(1, "Latte", 50),
    new ProductDb(2, "Espresso", 20),
    new ProductDb(50000000, "Cappuccino", 100),
    new ProductDb(4, "Latte", 50),
    new ProductDb(5, "Espresso", 20),
    new ProductDb(6, "Cappuccino", 100),
    new ProductDb(7, "Latte", 50),
    new ProductDb(8, "Espresso", 20),
    new ProductDb(9, "Cappuccino", 100),
    new ProductDb(10, "Latte", 50),
    new ProductDb(11, "Espresso", 20),
    new ProductDb(12, "Cappuccino", 100),
    new ProductDb(20000000, "Latte", 50),
    new ProductDb(14, "Espresso", 20),
    new ProductDb(15, "Cappuccino", 100),
    new ProductDb(16, "Latte", 50),
    new ProductDb(17, "Espresso", 20),
    new ProductDb(9, "Cappuccino", 100),
    new ProductDb(10, "Latte", 50),
    new ProductDb(11, "Espresso", 20),
    new ProductDb(12, "Cappuccino", 100),
    new ProductDb(13, "Latte", 50),
    new ProductDb(14, "Espresso", 20),
    new ProductDb(15, "Cappuccino", 100),
    new ProductDb(16, "Latte", 50),
    new ProductDb(17, "Espresso", 20)
];

function displayChart()
{
    createChartInADay(productDbs, "Time (hour)", "Revenue ($)");
}

function displayProducts()
{
    createProductCheckBoxs(productNames);
}

displayChart();
displayProducts();