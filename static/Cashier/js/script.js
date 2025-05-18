const prices = {
    "Phin Coffee": 5.00,
    "Iced Latte": 4.50,
    "Green Tea": 3.50,
    "Bubble Tea": 6.00
};

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

function saveHistoryBillsToLocalStorage(historyBills) {
    localStorage.setItem('historyBills', JSON.stringify(historyBills));
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

    document.querySelectorAll(".area-btn").forEach(btn => {
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

function createTable(shape) {
    const tableArea = document.getElementById("tables");
    if (!areas[currentArea]) areas[currentArea] = [];
    if (!tableArea) return;

    const newTableIndex = areas[currentArea].length + 1;
    const left = tableArea.offsetWidth / 2 - 75;
    const top = tableArea.offsetHeight / 2 - 50;

    areas[currentArea].push({
        status: 0, // 0 = empty
        left,
        top,
        shape,
        name: `Table ${newTableIndex}`,
        bill: []
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

    document.getElementById("popupTitle").textContent = tableData.name || `Table ${id + 1}`;

    popup.style.display = "block";
    document.getElementById("popupOverlay").style.display = "block";

    // 🔥 Cập nhật enable / disable nút
    updateButtonStates(tableData.status);
}

function updateButtonStates(status) {
    const deleteBtn = document.getElementById("deleteBtn");
    const forceEmptyBtn = document.getElementById("forceEmptyBtn");
    const billBtn = document.getElementById("billBtn");
    const orderBtn = document.getElementById("orderBtn");

    if (!deleteBtn || !forceEmptyBtn || !billBtn || !orderBtn) return;

    if (status === 0) { // empty
        deleteBtn.disabled = false;
        orderBtn.disabled = false;
        billBtn.disabled = false;
        forceEmptyBtn.disabled = true;
    } else { // in_service
        deleteBtn.disabled = true;
        orderBtn.disabled = false;
        billBtn.disabled = false;
        forceEmptyBtn.disabled = false;
    }

    // 🛠 Thêm hoặc gỡ class mờ
    [deleteBtn, forceEmptyBtn, billBtn, orderBtn].forEach(btn => {
        if (btn.disabled) {
            btn.classList.add('disabled-button');
        } else {
            btn.classList.remove('disabled-button');
        }
    });
}

function handleBill() {
    const billData = areas[currentArea][currentTableId]?.bill || [];

    if (billData.length === 0) {
        showToast("No bill for this table!");
        return;
    }

    const tablePopup = document.getElementById("tablePopup");
    const overlay = document.getElementById("popupOverlay");
    const billPopup = document.getElementById("billPopup");
    const billContent = document.getElementById("billContent");
    const billTotal = document.getElementById("billTotal");

    if (tablePopup) tablePopup.style.display = "none";
    if (overlay) overlay.style.display = "block";

    // Xóa nội dung cũ
    billContent.innerHTML = "";
    billTotal.innerHTML = "";

    // Tạo nội dung mới
    let totalPrice = 0;
    billData.forEach(item => {
        const itemTotal = (prices[item.name] || 0) * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'bill-item';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
        billContent.appendChild(itemDiv);
        totalPrice += itemTotal;
    });

    billTotal.innerHTML = `<strong>Total:</strong> $${totalPrice.toFixed(2)}`;

    // Lưu để print dùng lại
    billPopup.dataset.total = totalPrice;
    billPopup.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", function () {
            document.getElementById("billPopup").style.display = "none";

            const tablePopup = document.getElementById("tablePopup");
            const overlay = document.getElementById("popupOverlay");

            if (tablePopup) tablePopup.style.display = "block";
            if (overlay) overlay.style.display = "block";
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const printBtn = document.getElementById("printBtn");
    if (printBtn) {
        printBtn.addEventListener("click", function () {
            const billPopup = document.getElementById("billPopup");
            const billData = areas[currentArea][currentTableId]?.bill || [];
            const totalPrice = parseFloat(billPopup.dataset.total || "0");

            let historyBills = JSON.parse(localStorage.getItem('historyBills')) || [];
            if (!Array.isArray(historyBills)) {
                historyBills = [];
            }

            const newBill = {
                tableName: areas[currentArea][currentTableId]?.name || `Table ${currentTableId + 1}`,
                items: Array.isArray(billData) ? billData.map(item => ({
                    name: item.name,
                    quantity: item.quantity
                })) : [],
                total: totalPrice,
                timestamp: new Date().toISOString()
            };

            historyBills.push(newBill);
            saveHistoryBillsToLocalStorage(historyBills);

            areas[currentArea][currentTableId].bill = [];
            areas[currentArea][currentTableId].status = "empty";
            saveAreasToLocalStorage();

            showToast('Done!!! ✅');

            setTimeout(() => {
                postRedirect("/cashier/goto_history");
            }, 1500);
        });
    }
});

function handleOrder() {
    if (areas[currentArea] && areas[currentArea][currentTableId]) {
        areas[currentArea][currentTableId].status = 1; // Đổi trạng thái bàn sang in_service
        saveAreasToLocalStorage();
        renderTables(); // Cập nhật lại màu bàn
    }
    postRedirect("/customer/goto_coffee");
}

function handleForceEmpty() {
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
