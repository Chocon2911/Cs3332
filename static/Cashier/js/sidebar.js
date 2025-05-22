document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('menuBtn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('show');
    });

    document.addEventListener("click", function (e) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.getElementById('menuBtn');
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('show');
        }
    });

    // Highlight trang hiện tại
    const path = window.location.pathname; // eg: "/cashier/customer_order"
    document.querySelectorAll('.menu-button').forEach(button => {
        const page = button.dataset.page; // eg: "customer_order"
        if (path.includes(page)) {
            button.classList.add('active');
        }
    });
});
