////////////////////////////////////////////Lấy thông tin các bill////////////////////////////////////////////////
let lastBillData = "";

async function fetchBills() {
    const orderList = document.getElementById("listBills");
    const request1 = new ListOrders_Request("COMPLETED");
    const res1 = await fetch("/order_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request1.toJson())
    });

    const result = await res1.json();

    if (res1.status === 302) {
        const ordersString = JSON.stringify(result.orders);

        // So sánh dữ liệu mới và cũ
        if (ordersString === lastBillData) {
            // Dữ liệu giống → bỏ qua, không cập nhật DOM
            return;
        }

        // Cập nhật dữ liệu mới
        lastBillData = ordersString;

        // Làm sạch danh sách cũ
        orderList.innerHTML = "";

        result.orders.forEach(ord => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("bill-card");

        // Tiêu đề trên cùng
        const header = document.createElement("div");
        header.classList.add("bill-header");
        header.textContent = `Table ${ord.tableID}`;
        orderDiv.appendChild(header);

        // Vùng scroll cho danh sách món
        const body = document.createElement("div");
        body.classList.add("bill-body");

        ord.items.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("bill-item");
            itemDiv.textContent = `${item.productName} x${item.quantity}`;
            body.appendChild(itemDiv);
        });

        orderDiv.appendChild(body);

        // Footer cố định dưới cùng
        const footer = document.createElement("div");
        footer.classList.add("bill-footer");

        const timeDiv = document.createElement("div");
        const dateObj = new Date(ord.orderTimestamp);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const formattedTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        timeDiv.classList.add("bill-time");
        timeDiv.textContent = `Time: ${formattedTime}`;

        const totalDiv = document.createElement("div");
        totalDiv.classList.add("bill-total");
        totalDiv.textContent = `Total: $${parseFloat(ord.total).toFixed(2)}`;

        footer.appendChild(timeDiv);
        footer.appendChild(totalDiv);
        orderDiv.appendChild(footer);

        orderList.appendChild(orderDiv);
    });

    } else if (res1.status >= 400 && res1.status <= 600) {
        if (ErrorMessage) {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = result.error;
        }
    }
}

fetchBills();

setInterval(fetchBills, 5000);