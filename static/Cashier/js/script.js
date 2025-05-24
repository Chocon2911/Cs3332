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

let areas = {};
let currentArea = "Inside";
let selectedTable = null;
let currentTableId = null;

function postRedirect(url) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    document.body.appendChild(form);
    form.submit();
}

loadAreasFromLocalStorage();
if (Object.keys(areas).length === 0) {
    areas = { "Inside": [] };
}

function saveAreasToLocalStorage() {
    localStorage.setItem('areas', JSON.stringify(areas));
}

function loadAreasFromLocalStorage() {
    const savedAreas = localStorage.getItem('areas');
    if (savedAreas) {
        areas = JSON.parse(savedAreas);
    }
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function highlightSidebar() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.menu-button').forEach(button => {
        if (button.getAttribute('href') === path) {
            button.classList.add('active');
        }
    });
}

function addNewArea() {
    let name = prompt("Nhập tên khu vực mới:");
    if (name && !areas[name]) {
        areas[name] = [];
        renderAreas();
        renderTables();
    }
}

function deleteArea(name) {
    if (confirm(`Bạn có chắc muốn xóa khu vực "${name}" không?`)) {
        delete areas[name];
        const areaNames = Object.keys(areas);
        currentArea = areaNames.length > 0 ? areaNames[0] : "";
        renderAreas();
        renderTables();
    }
}

function changeArea(btn) {
    document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentArea = btn.getAttribute("data-area");
    renderTables();
}

function renderAreas() {
    const areaList = document.getElementById("area-list");
    if (!areaList) return;

    areaList.innerHTML = "";
    Object.keys(areas).forEach(name => {
        const div = document.createElement("div");
        div.className = "area-item";

        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "area-btn";
        btn.setAttribute("data-area", name);
        btn.onclick = () => changeArea(btn);
        div.appendChild(btn);

        const deleteBtn = document.createElement("span");
        deleteBtn.textContent = "-";
        deleteBtn.className = "delete-area";
        deleteBtn.onclick = () => deleteArea(name);
        div.appendChild(deleteBtn);

        areaList.appendChild(div);
    });

    document.querySelectorAll('.area-btn').forEach(btn => {
        if (btn.getAttribute("data-area") === currentArea) {
            btn.classList.add("active");
        }
    });
}

function renderTables() {
    const tableContainer = document.getElementById("tables");
    if (!tableContainer) return;

    tableContainer.innerHTML = "";

    const addTableBtn = document.createElement("button");
    addTableBtn.className = "add-table-btn";
    addTableBtn.textContent = "Add table";
    addTableBtn.onclick = addTable;
    tableContainer.appendChild(addTableBtn);

    const tables = areas[currentArea] || [];
    tables.forEach((tableData, index) => {
        const table = document.createElement("div");
        table.className = `table ${tableData.shape}`;

        // ⚡ Dựa trên status (0 hoặc 1) để set màu
        if (tableData.status === 1) {
            table.classList.add('in-service');
            table.style.backgroundColor = '#007bff';
            table.style.color = 'white';
        } else {
            table.classList.remove('in-service');
            table.style.backgroundColor = '#d3d3d3';
            table.style.color = 'black';
        }

        table.textContent = tableData.name || (index + 1);
        table.style.left = tableData.left + "px";
        table.style.top = tableData.top + "px";
        table.setAttribute("data-id", index);

        makeDraggable(table, index);
        tableContainer.appendChild(table);
    });

    saveAreasToLocalStorage();
}

function addTable() {
    if (!areas[currentArea]) {
        showToast(' No area for tables! ❌');
        return;
    }

    const popup = document.getElementById("shape-popup");
    if (popup) {
        popup.classList.toggle("hidden");
    }
}

function generateUUID() {
    // Fallback UUID generator (RFC4122 version 4 compliant)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createTable(shape) {
    const tableArea = document.getElementById("tables");
    if (!areas[currentArea]) areas[currentArea] = [];
    if (!tableArea) return;

    const newTableIndex = areas[currentArea].length + 1;
    const left = tableArea.offsetWidth / 2 - 75;
    const top = tableArea.offsetHeight / 2 - 50;

    const tableID = generateUUID();

    areas[currentArea].push({
        status: 0, // 0 = empty
        left,
        top,
        shape,
        name: `Table ${newTableIndex}`,
        bill: [],
        tableID
    });

    renderTables();
    const popup = document.getElementById("shape-popup");
    if (popup) popup.classList.add("hidden");
    saveAreasToLocalStorage();
}

function makeDraggable(el, index) {
    let isDragging = false;
    let offsetX, offsetY;

    el.onmousedown = function (e) {
        isDragging = false;
        offsetX = e.offsetX;
        offsetY = e.offsetY;

        document.onmousemove = function (e) {
            isDragging = true;
            const container = document.getElementById("tables");
            if (!container) return;
            const rect = container.getBoundingClientRect();

            let x = e.clientX - rect.left - offsetX;
            let y = e.clientY - rect.top - offsetY;

            x = Math.max(0, Math.min(rect.width - el.offsetWidth, x));
            y = Math.max(0, Math.min(rect.height - el.offsetHeight, y));

            el.style.left = x + "px";
            el.style.top = y + "px";

            if (areas[currentArea] && areas[currentArea][index]) {
                areas[currentArea][index].left = x;
                areas[currentArea][index].top = y;
                saveAreasToLocalStorage();
            }
        };

        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
            if (!isDragging) {
                openPopup(index);
            }
        };
    };
}

function openPopup(id) {
    currentTableId = id;
    const popup = document.getElementById("tablePopup");
    const tableData = areas[currentArea][id];

    const tableID = tableData["tableID"];
    setCookie("TableID", tableID);
    document.getElementById("popupTitle").textContent = tableData.name || `Table ${id + 1}`;

    popup.style.display = "block";
    document.getElementById("popupOverlay").style.display = "block";

    // 🔥 Cập nhật enable / disable nút
    updateButtonStates(tableData.status);
    fetchOrders();
}

function updateButtonStates(status) {
    const deleteBtn = document.getElementById("deleteBtn");
    const forceEmptyBtn = document.getElementById("forceEmptyBtn");
    const billBtn = document.getElementById("billBtn");
    const orderBtn = document.getElementById("orderBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    if (!deleteBtn || !forceEmptyBtn || !billBtn || !orderBtn || !cancelBtn) return;

    if (status === 0) { // empty
        deleteBtn.disabled = false;
        orderBtn.disabled = false;
        billBtn.disabled = true;
        forceEmptyBtn.disabled = true;
        cancelBtn.disabled = true;
    } else { // in_service
        deleteBtn.disabled = true;
        orderBtn.disabled = false;
        billBtn.disabled = false;
        forceEmptyBtn.disabled = false;
        cancelBtn.disabled = false;
    }

    // 🛠 Thêm hoặc gỡ class mờ
    [deleteBtn, forceEmptyBtn, billBtn, orderBtn, cancelBtn].forEach(btn => {
        if (btn.disabled) {
            btn.classList.add('disabled-button');
        } else {
            btn.classList.remove('disabled-button');
        }
    });
}
 
function deleteAllCookies() {
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
}

function handleLogout()
{
    deleteAllCookies();
    window.location.href = '/manager/login';
}

function handleOrder() {
    if (areas[currentArea] && areas[currentArea][currentTableId]) {
        areas[currentArea][currentTableId].status = 1; // Đổi trạng thái bàn sang in_service
        saveAreasToLocalStorage();
        renderTables(); // Cập nhật lại màu bàn
    }
    postRedirect("/customer/goto_coffee");
    localStorage.removeItem("cart");
}

async function handleComplete() {
    const orders = await fetchOrders();

    if (orders.length > 0) {
        for (const order of orders) {
            await completedOrder(order.orderID, true); // Hoàn tất từng đơn hàng
        }
        alert("✔️ Order Completed Successfully!");
        window.location.reload();
    }

    if (areas[currentArea] && areas[currentArea][currentTableId]) {
        areas[currentArea][currentTableId].status = 0; // Đổi trạng thái bàn về empty
        areas[currentArea][currentTableId].bill = [];
        saveAreasToLocalStorage();
        renderTables();
    }
    const overlay = document.getElementById("popupOverlay");
    const popup = document.getElementById("tablePopup");
    if (overlay) overlay.style.display = "none";
    if (popup) popup.style.display = "none";
}

async function handleCancel() {
    const orders = await fetchOrders();

    if (orders.length > 0) {
        for (const order of orders) {
            await cancelOrder(order.orderID, true); // Hoàn tất từng đơn hàng
        }
        alert("✔️ Order Cancelled!");
        window.location.reload();
    }

    if (areas[currentArea] && areas[currentArea][currentTableId]) {
        areas[currentArea][currentTableId].status = 0; // Đổi trạng thái bàn về empty
        areas[currentArea][currentTableId].bill = [];
        saveAreasToLocalStorage();
        renderTables();
    }

    const overlay = document.getElementById("popupOverlay");
    const popup = document.getElementById("tablePopup");
    if (overlay) overlay.style.display = "none";
    if (popup) popup.style.display = "none";
}


function handleDelete() {
    if (areas[currentArea]) {
        areas[currentArea].splice(currentTableId, 1);
        saveAreasToLocalStorage();
    }
    const overlay = document.getElementById("popupOverlay");
    const popup = document.getElementById("tablePopup");
    if (overlay) overlay.style.display = "none";
    if (popup) popup.style.display = "none";
    renderTables();
}

document.addEventListener("DOMContentLoaded", () => {
    loadAreasFromLocalStorage();
    renderAreas();
    renderTables();

    const popup = document.getElementById("shape-popup");
    if (popup) popup.classList.add("hidden");

    highlightSidebar();
});

document.addEventListener("click", function (e) {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    if (sidebar && menuBtn && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('show');
    }
});

const popupOverlay = document.getElementById("popupOverlay");
if (popupOverlay) {
    popupOverlay.addEventListener("click", function () {
        popupOverlay.style.display = "none";

        const billPopup = document.getElementById('billPopup');
        if (billPopup) billPopup.style.display = "none"; 

        const tablePopup = document.getElementById("tablePopup");
        if (tablePopup) tablePopup.style.display = "none";
    });
}

///////////////////////////////////////Gọi để hiển thị Order/Bill/////////////////////////////////////
//===========================================Class============================================
class UserInfo_Request {
    constructor(username) {
        this.username = username;
    }
    toJson() {
        return {
            username: this.username
        };
    }
}

class ListOrders_Request {
    constructor(orderstatus, tableID) {
        this.orderstatus = orderstatus;
        this.tableID = tableID;
    }
    toJson() {
        return {
            orderStatus: this.orderstatus,
            tableID: this.tableID
        };
    }
}

class UserInfo_Response {
    constructor(data) {
        this.username = data['username'];
        this.name = data['name'];
        this.email = data['email'];
        this.phone = data['phone'];
        this.dateOfBirth = data['dateOfBirth'];
        this.gender = data['gender'];
        this.roles = data['roles'];
    }
}

////////////////////////////////////////////Lấy thông tin bill theo bàn////////////////////////////////////////////////
let lastOrderBillData = "";

document.addEventListener("DOMContentLoaded", () => {
    // Gán sự kiện cho Back và Pay ngay khi DOM sẵn sàng
    const backBtn = document.getElementById("backBtn");
    const payBtn = document.getElementById("payBtn");

    if (backBtn && payBtn) {
        backBtn.addEventListener("click", function () {
            document.getElementById("billPopup").style.display = "none";
            document.getElementById("tablePopup").style.display = "block";
            document.getElementById("popupOverlay").style.display = "block";
        });

        payBtn.addEventListener("click", async function () {
            if (!window._latestOrderResult || !Array.isArray(window._latestOrderResult.orders)) {
                showToast("No orders to pay!");
                return;
            }

            for (const ord of window._latestOrderResult.orders) {
                await payOrder(ord.orderID, true);
            }
            alert("✔️ Order Paid!");
            window.location.reload();
        });
    } else {
        console.error("❗ Buttons not found: backBtn or payBtn");
    }
});

document.getElementById('billBtn').addEventListener("click", async function () {
    const orderList = document.getElementById("listOrderBills");
    if (!orderList) {
        console.error("listOrderBills not found in DOM!");
        return;
    }

    const request1 = new ListOrders_Request("PENDING_PAYMENT", areas[currentArea][currentTableId].tableID);
    const res1 = await fetch("/order_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request1.toJson())
    });

    const result = await res1.json();

    if (res1.status === 302) {
        if (!result.orders || result.orders.length === 0) {
            showToast("No bill for this table!");
            return;
        }

        const ordersString = JSON.stringify(result.orders);
        if (ordersString === lastOrderBillData) return;
        lastOrderBillData = ordersString;

        // Lưu tạm để nút Pay dùng
        window._latestOrderResult = result;

        // Xóa nội dung cũ
        orderList.innerHTML = "";

        // Render từng đơn hàng
        result.orders.forEach(ord => {
            const orderContainer = document.createElement("div");
            orderContainer.classList.add("orderbill-container");

            ord.items.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("orderbill-item-flex");
                itemDiv.innerHTML = `
                    <span class="item-name">${item.productName}</span>
                    <span class="item-qty">x${item.quantity}</span>
                `;
                orderContainer.appendChild(itemDiv);
            });

            const totalDiv = document.createElement("div");
            totalDiv.classList.add("order-total");
            totalDiv.textContent = `Total: $${ord.total}`;
            orderContainer.appendChild(totalDiv);

            orderList.appendChild(orderContainer);
        });

        // Hiển thị popup
        document.getElementById("tablePopup").style.display = "none";
        document.getElementById("billPopup").style.display = "block";
        document.getElementById("popupOverlay").style.display = "block";

        lastOrderBillData = "";
    } else {
        showToast(result.error || "Unable to fetch bill!");
    }
});

////////////////////////////////////////////Fetch orderlist////////////////////////////////////////////////
async function fetchOrders() {
    const request = new ListOrders_Request("PENDING_PAYMENT", areas[currentArea][currentTableId].tableID);

    try {
        const res = await fetch("/order_list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request.toJson())
        });

        const result = await res.json();

        if (res.status === 302) {
            return result.orders;  // Trả về danh sách đơn hàng
        } else {
            // Nếu có lỗi thì ném ra exception để xử lý bên ngoài
            throw new Error(result.error || `Request failed with status ${res.status}`);
        }
    } catch (err) {
        console.error("Fetch orders failed:", err);
        throw err;
    }
}

////////////////////////////////////////////Pay Order////////////////////////////////////////////////
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

async function payOrder(id, skipReload = false) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "PAID");
    const res = await fetch("/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        if (!skipReload) {
            window.location.reload();
        }
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

////////////////////////////////////////////Order Complete//////////////////////////////////////////////////
async function completedOrder(id, skipReload = false) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "COMPLETED");
    const res = await fetch("/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        if (!skipReload) {
            window.location.reload();
        }
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

////////////////////////////////////////////Order Cancel////////////////////////////////////////////////
async function cancelOrder(id, skipReload = false) {
    const token = getCookie("token");
    const req = new OrderUpdateStatus_Request(id, "CANCELLED");
    const res = await fetch("/update_order_status", {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.toJson())
    });

    if (res.status == 200)
    {
        if (!skipReload) {
            window.location.reload();
        }
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
