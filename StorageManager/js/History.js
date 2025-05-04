const endpoints = [
    '../json/History.json'
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
  
    // parse date inputs for filtering
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
    const fromDate = fromInput.value ? new Date(fromInput.value) : null;
    const toDate = toInput.value ? new Date(toInput.value) : null;
  
    // convert item.date to Date
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });
  
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No records found for selected date range.</td></tr>';
      return;
    }
  
    filtered.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.date}</td>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.supplier}</td>
        <td>${item.import_quantity} kg</td>
        <td>${item.export_quantity} kg</td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  async function loadTableData() {
    const table = document.querySelector('.table');
    const data = await fetchData(endpoints[0]);
    renderTable(data, table);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    loadTableData();
    document.getElementById('fromDate').addEventListener('change', loadTableData);
    document.getElementById('toDate').addEventListener('change', loadTableData);
  });
  