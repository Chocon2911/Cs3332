const endpoints = {
  history: '/storage_manager/history'
};

async function fetchData(url, params = {}) {
  try {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}${queryString ? '?' + queryString : ''}`;
      console.log('Fetching data from:', fullUrl);
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Received data:', data);
      return data;
  } catch (e) {
      console.error('Fetch error:', e);
      return [];
  }
}

function renderTable(data, table) {
  console.log('Rendering table with data:', data);
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No records found for selected date range.</td></tr>';
      return;
  }

  data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${item.date || ''}</td>
          <td>${item.id || ''}</td>
          <td>${item.name || ''}</td>
          <td>${item.supplier || ''}</td>
          <td>${item.import_quantity || '0'}</td>
          <td>${item.export_quantity || '0'}</td>
          <td>${item.unit || ''}</td>
      `;
      tbody.appendChild(tr);
  });
}

async function loadTableData() {
  console.log('Loading table data...');
  const table = document.querySelector('.table-container table');
  if (!table) {
    console.error('Table element not found!');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  const params = {};
  if (fromDate) params.from_date = fromDate;
  if (toDate) params.to_date = toDate;
  
  console.log('Date params:', params);
  
  const data = await fetchData(endpoints.history, params);
  renderTable(data, table);
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  loadTableData();
  
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  
  if (fromDateInput) {
    fromDateInput.addEventListener('change', loadTableData);
  } else {
    console.error('fromDate input not found!');
  }
  
  if (toDateInput) {
    toDateInput.addEventListener('change', loadTableData);
  } else {
    console.error('toDate input not found!');
  }

  const confirmYes = document.getElementById('confirm-yes');
  const confirmNo = document.getElementById('confirm-no');
  
  if (confirmYes) {
    confirmYes.onclick = () => {
      window.location.href = '/manager/login';
    };
  }
  
  if (confirmNo) {
    confirmNo.onclick = () => {
      document.getElementById('logout-modal').style.display = 'none';
    };
  }
});

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}   