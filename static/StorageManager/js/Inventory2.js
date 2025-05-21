// Các endpoint mới
const endpoints = [
  '/storage_manager/all_ingredients',  // all ingredients
  '/storage_manager/running_out'       // running-out
];

async function fetchData(url) {
  try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log(`Fetched ${data.length} items from ${url}`);
      return data;
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
  console.log(`Rendered ${data.length} items in table ${table.id}`);
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
  // Hiển thị bảng mặc định (All ingredients)
  showTable(0);

  document.getElementById('confirm-yes').onclick = () => {
      window.location.href = 'manager/login';
  };

  document.getElementById('confirm-no').onclick = () => {
      document.getElementById('logout-modal').style.display = 'none';
  };
};

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}