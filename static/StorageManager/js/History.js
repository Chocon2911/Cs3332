import { unix2date, getCookie } from './Utils.js';

// ================================ History Record ================================
class HistoryRecord {
  constructor(data) {
    this.itemStackID = data.itemStackID;
    this.name = data.ItemStackName;
    this.supplier = data.supplier;
    this.importQuantity = this.quantity > 0 ? this.quantity : 0;
    this.exportQuantity = this.quantity < 0 ? Math.abs(this.quantity) : 0;
    this.unit = data.unit;
    this.time = data.import_export_time;
  }

  formattedTime() {
    return unix2date(this.time);
  }
}

// ================================ Auth & Response handling ================================
const HISTORY_ENDPOINT = '/storage_manager/history';

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

async function fetchHistory(params = {}) {
  try {
      const qs = new URLSearchParams(params).toString();
      const url = HISTORY_ENDPOINT + (qs ? '?${qs' : '');
      const token = getCookie('token');
      const res = await fetch(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      const raw = await handleResponse(res);
      const list = Array.isArray(raw) ? raw : raw.items || [];
      return list.map(item => new HistoryRecord(item));
  } catch (e) {
      console.error('Fetch error:', e);
      return [];
  }
}

// ================================ Rendering ================================
function renderTable(records, table) {
  console.log('Rendering table with data:', records);
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No records found for selected date range.</td></tr>';
      return;
  }

  records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${r.formattedTime() || ''}</td>
          <td>${r.itemStackID || ''}</td>
          <td>${r.name || ''}</td>
          <td>${r.supplier || ''}</td>
          <td>${r.importQuantity || '0'}</td>
          <td>${r.exportQuantity || '0'}</td>
          <td>${r.unit || ''}</td>
      `;
      tbody.appendChild(tr);
  });
}

// ================================ Data Processing ================================
async function loadHistory() {
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
  
  const records = await fetchHistory(params);
  renderTable(records, table);
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  loadHistory();
  
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

  document.getElementById('confirm-yes').onclick = () => window.location.href = '/manager/login';
  document.getElementById('confirm-no').onclick  = () => document.getElementById('logout-modal').style.display = 'none';
});

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}   