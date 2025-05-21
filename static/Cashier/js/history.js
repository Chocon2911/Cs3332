document.addEventListener("DOMContentLoaded", () => {
    console.log("🔥 Đã load history.js thành công");
    loadHistoryBills();
});

function loadHistoryBills() {
    const container = document.getElementById("history-container");
    if (!container) {
        console.error("❌ Không tìm thấy container để render bill");
        return;
    }

    const historyBills = JSON.parse(localStorage.getItem('historyBills')) || [];

    if (historyBills.length === 0) {
        return;
    }

    const grid = document.createElement('div');
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
    grid.style.gap = "20px";

    historyBills.forEach(bill => {
        const card = document.createElement('div');
        card.className = 'bill';
        
        const title = document.createElement('h2');
        title.textContent = bill.tableName || "Không rõ bàn";
        card.appendChild(title);

        const itemList = document.createElement('div');
        itemList.className = 'bill-content';
        
        if (Array.isArray(bill.items)) {
            bill.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'bill-item';
                itemRow.innerHTML = `
                    <span>${item.name}</span>
                    <span>x${item.quantity}</span>
                `;
                itemList.appendChild(itemRow);
            });
        }
        else {
            console.warn("⚠️ Bill không có items hợp lệ:", bill);
        }

        const total = document.createElement('div');
        total.className = 'bill-total';
        total.innerHTML = `<strong>Total:</strong> $${(bill.total || 0).toFixed(2)}`;

        const time = document.createElement('p');
        time.style.fontSize = "12px";
        time.style.color = "#888";
        time.style.marginTop = "10px";
        time.textContent = `Thời gian: ${bill.timestamp ? new Date(bill.timestamp).toLocaleString() : 'Không xác định'}`;

        card.appendChild(itemList);
        card.appendChild(total);
        card.appendChild(time);

        grid.appendChild(card);
    });

    container.innerHTML = "";
    container.appendChild(grid);
}
