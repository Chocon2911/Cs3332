import { unix2date, getCookie } from './Utils.js';

const endpoints = [
  '/storage_manager/all_ingredients',  // all ingredients
  '/storage_manager/running_out'       // running-out
];

class TransactionItem {
  constructor(data) {
      this.id = data.id;
      this.itemStackID = data.itemStackID;
      this.name = data.ItemStackName;
      this.unit = data.unit;
      this.time = data.import_export_time;
      this.supplier = data.supplier;
      this.reason = data.reason;  // e.g. "Restock" or "Sold"
      this.quantity = data.quantity;
  }

  isImport() {
      return this.quantity > 0;
  }

  isExport() {
      return this.quantity < 0;
  }

  formattedTime(){
    return unix2date(this.time);
  }
}

const RUNOUT_THRESHOLD = 10;

// ================================ Auth & Response handling ================================

async function handleResponse(res) {
  if (res.status === 200 || res.status === 302) {
    return await res.json();
  } else if (res.status >= 400 && res.status <= 600) {
    if (res.status === 401) {
      window.location.href = '/manager/login';
      throw new Error('Unauthorized');
    }
    const err = await res.json();
    console.error(err.error || 'Error');
    throw new Error(err.error || 'Server error');
  } else {
    const data = await res.json();
    console.error('Unexpected status:', res.status, data.error);
    throw new Error(data.error || 'Unexpected error');
  }
}

async function fetchData(url) {
  try {
      const token = getCookie('token');
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      const raw = await handleResponse(res);
      const list = Array.isArray(raw) ? raw : raw.items || [];
      return list.map(item => new TransactionItem(item));
  } catch (e) {
      console.error('Fetch error:', e);
      return [];
  }
}

// ================================ Data Processing ================================
function aggregateTransactions(transactions) {
  const current = {};
  transactions.forEach(tx => {
    const key = tx.itemStackID;
    if (!current[key]) {
      current[key] = { ...tx, quantity: 0};
    }
    current[key].quantity += tx.quantity;
  });
  return Object.values(current);
}

// ================================ Rendering ================================
function renderTable(data, table) {
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${item.itemStackID}</td>
          <td>${item.name}</td>
          <td>${item.supplier}</td>
          <td>${item.quantity}</td>
          <td>${item.formattedTime()}</td>
          <td>${item.unit}</td>
      `;
      tbody.appendChild(tr);
  });
  console.log(`Rendered ${data.length} items in table ${table.id}`);
}

async function loadTableData(index) {
  const table = document.getElementById('table-${index}');
  const transactions = await fetchData(endpoints[index]);
  const agg = aggregateTransactions(transactions);
  let displayData = [];
  if (index === 0) {
    // Filter inventory
    displayData = agg;
  }
  else {
    // Filter Running out
    displayData = agg.filter(item => item.quantity <= RUNOUT_THRESHOLD);
  }
  renderTable(displayData, table);
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
  // Lấy tham số tab từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  
  // Xác định index của tab cần hiển thị
  let tabIndex = tab === 'running' ? 1 : 0;
  // Hiển thị bảng tương ứng
  showTable(tabIndex);

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