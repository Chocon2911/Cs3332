const productDbs = [
    new ProductDb(0, "Cappuccino", 100),
    new ProductDb(1, "Latte", 50),
    new ProductDb(2, "Espresso", 20),
    new ProductDb(3, "Cappuccino", 100),
    new ProductDb(4, "Latte", 50),
    new ProductDb(5, "Espresso", 20),
    new ProductDb(6, "Cappuccino", 100),
    new ProductDb(7, "Latte", 50),
    new ProductDb(8, "Espresso", 20),
    new ProductDb(9, "Cappuccino", 100),
    new ProductDb(10, "Latte", 50),
    new ProductDb(11, "Espresso", 20),
    new ProductDb(12, "Cappuccino", 100),
    new ProductDb(13, "Latte", 50),
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
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return new DateTime(year, month, day, hour, minute, second);
}

function getProducts(productDbs)
{
    const products = [];

    for (let i = 0; i < productDbs.length; i++)
    {
        for (let j = 0; j < productDbs[i].productDatas.length; j++)
        {
            if (products.find(p => p.productName == productDbs[i].productName) == null) 
            {
                products.push(new Product(productDbs[i].productName, []));
            }
            products.find(p => p.productName == productDbs[i].productName).productDatas.push(new ProductData(getDateTime(productDbs[i].ms), productDbs[i].price));
        }
    }
}

//========================================Create Chart========================================
function displayChart()
{

}

function createChartInADay(date, products, xLabelName, yLabelName)
{
    const labelCount = 24;
    const xLabels = [];

    // x label from 00h to 23h
    for (let i = 0; i < labelCount; i++) 
    {
        const hour = i;
        const timeString = `${String(hour).padStart(2, '0')}`;
        xLabels.push(timeString);
    }

    // revenue datas from 00h to 23h
    const products = getProducts(productDb);

    const revenues = [];
    for (let i = 0; i < productDbs.length; i++)
    {
        
    }

    createChart(date, date, products, xLabelName, yLabelName, xLabels);
}

function createChartInAMonth(date, products, xLabelName, yLabelName)
{
    labelCount = 0;

    if (date.day == 1 || date.day == 3 || date.day == 5 || date.day == 7 || date.day == 8 || date.day == 10 || date.day == 12)
    {
        labelCount = 31;
    }

    else if (date.day == 2)
    {
        labelCount = 28;
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

    createChart(date, date, products, xLabelName, yLabelName, xLabels);
}

function createChartInAYear(date, products, xLabelName, yLabelName)
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

    createChart(date, date, products, xLabelName, yLabelName, xLabels);
}

function createChart(fromDate, toDate, products, xLabelName, yLabelName, xLabels) 
{
    const labelCount = 25;
    const fromSec = fromDate.getTotalSecond();
    const toSec = toDate.getTotalSecond();

    const revenueDatas = [];

    // list data of drink for chart to draw
    for (let i = 0; i < products.length; i++) 
    {
        const revenues = Array(labelCount).fill(0);
        for (let j = 0; j < products[i].productDatas.length; j++) 
        {
            const prodData = products[i].productDatas[j];
            const t = prodData.time.getTotalSecond();
            const percent = (t - fromSec) / (toSec - fromSec);
            const idx = Math.floor(percent * labelCount);
            if (idx >= 0 && idx < labelCount) revenues[idx] += prodData.revenue;
        }

        const rgb = randomRgb();
        const dataSet = new DataSet(
            products[i].productName,
            revenues,
            randomColor(rgb),
            randomBorderColor(rgb),
            true,
            0);

        revenueDatas.push(dataSet);
    }

    // Draw chart from datas above
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
function displayProducts(productNames)
{
    for (let i = 0; i < productNames.length; i++)
    {
        let product = document.createElement("div");
        product.classList.add("ProductItem");
        product.innerHTML = `<input type="checkbox">${productNames[i]}</input>`;
        productContainer.appendChild(product);
    }
}

function displayProducts()
{

}

