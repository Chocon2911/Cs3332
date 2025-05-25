////////////////////////////////////////////Lấy thông tin các order////////////////////////////////////////////////
let lastOrderData = "";

function getTableNameById(tableId) {
  if (!tableId) {
    console.warn("Vui lòng truyền vào tableID");
    return null;
  }

  const areasStr = localStorage.getItem("areas");

  if (!areasStr) {
    console.warn("Không tìm thấy dữ liệu 'areas' trong localStorage");
    return null;
  }

  try {
    const areas = JSON.parse(areasStr);

    if (typeof areas !== "object" || areas === null) {
      console.warn("'areas' không phải là một object hợp lệ");
      return null;
    }

    // Duyệt qua từng khu vực (Inside, Outside, v.v.)
    for (const areaName in areas) {
      const tables = areas[areaName];

      if (!Array.isArray(tables)) continue;

      const foundTable = tables.find(table => table.tableID === tableId);

      if (foundTable) {
        return foundTable.name || null;
      }
    }

    console.warn(`Không tìm thấy tableID: ${tableId} trong bất kỳ khu vực nào`);
    return null;

  } catch (error) {
    console.error("Lỗi khi parse JSON từ 'areas':", error);
    return null;
  }
}

async function fetchOrders() {
    const orderList = document.getElementById("listOrders");
    const request1 = new ListOrders_Request("PENDING_CONFIRMATION");
    const res1 = await fetch("/cashier/order_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request1.toJson())
    });

    const result = await res1.json();

    if (res1.status === 302) {
        const ordersString = JSON.stringify(result.orders);

        // So sánh dữ liệu mới và cũ
        if (ordersString === lastOrderData) {
            // Dữ liệu giống → bỏ qua, không cập nhật DOM
            return;
        }

        // Cập nhật dữ liệu mới
        lastOrderData = ordersString;

        // Làm sạch danh sách cũ
        orderList.innerHTML = "";

        // Nhóm đơn hàng theo tableID
        const ordersByTable = {};
        result.orders.forEach(ord => {
            if (!ordersByTable[ord.tableID]) {
                ordersByTable[ord.tableID] = [];
            }
            ordersByTable[ord.tableID].push(ord);
        });

        for (const tableID in ordersByTable) {
        ordersByTable[tableID].forEach(ord => {
            const orderBox = document.createElement("div");
            orderBox.classList.add("order-box");

            // Header (Table name)
            const header = document.createElement("h3");
            const tableName = getTableNameById(tableID);
            header.textContent = `${tableName}`;
            orderBox.appendChild(header);

            // Item list container
            const itemList = document.createElement("div");
            itemList.classList.add("order-items");

            ord.items.forEach(item => {
                const itemRow = document.createElement("div");
                itemRow.classList.add("order-grid");

                const productName = document.createElement("div");
                productName.classList.add("product-name");
                productName.textContent = item.productName;

                const quantity = document.createElement("div");
                quantity.classList.add("product-quantity");
                quantity.textContent = `x${item.quantity}`;

                itemRow.appendChild(productName);
                itemRow.appendChild(quantity);
                itemList.appendChild(itemRow);
            });

            orderBox.appendChild(itemList);

            // Confirm button
            const confirmBtn = document.createElement("button");
            confirmBtn.classList.add("confirm-btn");
            confirmBtn.textContent = "Confirm";

            // Gán orderID vào button
            confirmBtn.dataset.id = ord.orderID;

            // Gán sự kiện onclick
            confirmBtn.addEventListener("click", function() {
                takeOrder(ord.orderID);
            });

            orderBox.appendChild(confirmBtn);

            orderList.appendChild(orderBox);
        });
    }

    } else if (res1.status >= 400 && res1.status <= 600) {
        if (ErrorMessage) {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = result.error;
        }
    }
}

fetchOrders();

setInterval(fetchOrders, 5000);

////////////////////////////////////////////Confirm Order////////////////////////////////////////////////
class OrderUpdateStatus_Request1
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
    const req = new OrderUpdateStatus_Request1(id, "PENDING_PAYMENT");
    const res = await fetch("/cashier/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        alert("Order Confirmed!!!");
        window.location.reload();
    }
    else if (res.status >= 400 && res.status <= 600) {
        if (res.status === 401) {
            window.location.href = '/manager/login';
            throw new Error('Unauthorized');
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
