const menuPrices = {
    "Phin Coffee": 5.00,
    "Iced Latte": 4.50,
    "Green Tea": 3.50,
    "Bubble Tea": 6.00
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.order-card').forEach(card => {
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Confirm";
        confirmBtn.className = "confirm-btn";
        card.appendChild(confirmBtn);

        confirmBtn.addEventListener('click', () => confirmOrder(card));
    });
});

function confirmOrder(card) {
    const tableName = card.querySelector('.order-table').textContent.trim();
    const items = Array.from(card.querySelectorAll('.item-row')).map(row => ({
        name: row.querySelector('.item-name').textContent.trim(),
        quantity: parseInt(row.querySelector('.item-quantity').textContent.replace('x', '').trim())
    }));

    let areas = JSON.parse(localStorage.getItem('areas')) || {};

    // 🔥 Tìm bàn tương ứng trong tất cả các khu vực
    for (let area in areas) {
        areas[area].forEach(table => {
            if (table.name === tableName) {
                if (!table.bill) table.bill = [];

                items.forEach(newItem => {
                    const existingItem = table.bill.find(item => item.name === newItem.name);
                    if (existingItem) {
                        existingItem.quantity += newItem.quantity;
                    } else {
                        table.bill.push(newItem);
                    }
                });
            }
        });
    }
    localStorage.setItem('areas', JSON.stringify(areas));

    // XÓA order khỏi Customer Order
    card.remove();
}
