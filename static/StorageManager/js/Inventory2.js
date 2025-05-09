const endpoints = [
    '/static/StorageManager/json/TestData.json', // all ingredients
    '/static/StorageManager/json/TestData.json', // expiring
    '/static/StorageManager/json/TestData.json'  // running-out
];
  
async function fetchData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return [];
    }
}
  
  function renderTable(data, table) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
  
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.supplier}</td>
        <td>${item.quantity}</td>
        <td>${item.importDate}</td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  async function loadTableData(index) {
    const table = document.getElementById(`table-${index}`);
    const data = await fetchData(endpoints[index]);
    renderTable(data, table);
  }
  
  function showTable(index) {
    document.querySelectorAll('.tab').forEach((tab, i) => {
      const tbl = document.getElementById(`table-${i}`);
      if (i === index) {
        tab.classList.add('active');
        tbl.style.display = 'table';
        loadTableData(i);
      } else {
        tab.classList.remove('active');
        tbl.style.display = 'none';
      }
    });
  }
  
  window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    let idx = 0;
    if (tab === 'expiring') idx = 1;
    else if (tab === 'running') idx = 2;
    showTable(idx);

    document.getElementById('confirm-yes').onclick = () => {
      window.location.href = 'manager/login';            // Giao diện sau khi log out
    };

    document.getElementById('confirm-no').onclick = () => {
      document.getElementById('logout-modal').style.display = 'none';
    };
  };

  function showLogoutModal() {
    document.getElementById('logout-modal').style.display = 'flex';
  }