// ================================ History Record ================================
class HistoryRecord {
  constructor({ itemStackID, name, supplier, importQuantity, exportQuantity, unit, date }) {
    this.itemStackID = itemStackID;
    this.name = name;
    this.supplier = supplier;
    this.importQuantity = importQuantity;
    this.exportQuantity = exportQuantity;
    this.unit = unit;
    this.date = date; // yyyy-mm-dd
  }

  formattedTime() {
    return this.date;
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

async function fetchHistory() {
  try {
      const token = getCookie('token');
      const res = await fetch(HISTORY_ENDPOINT, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      const raw = await handleResponse(res);
      const list = raw["items"];
      return list;
  } catch (e) {
      console.error('Fetch error:', e);
      return [];
  }
}

// ================================ Data Processing ================================

function aggregateHistoryRecords (rawList) {
  const grouped = {};

  for (const item of rawList) {
    const day = unix2date(item.import_export_time);
    const key = `${item.itemStackID}|${day}`;
    if (!grouped[key]) {
      grouped[key] = {
        itemStackID: item.itemStackID,
        name: item.ItemStackName,
        supplier: item.supplier,
        importQuantity: 0,
        exportQuantity: 0,
        unit: item.unit,
        date: day,
      };
    }
    if (item.quantity > 0) {
      grouped[key].importQuantity += item.quantity;
    } else if (item.quantity < 0) {
      grouped[key].exportQuantity += Math.abs(item.quantity);
    }
  }

  return Object.values(grouped).map(g => new HistoryRecord(g))
}

// ================================ Rendering ================================
function renderTable(records, table) {
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No records found for selected date range.</td></tr>';
      return;
  }

  records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${r.date}</td>
          <td>${r.itemStackID}</td>
          <td>${r.name}</td>
          <td>${r.supplier}</td>
          <td>${r.importQuantity || '0'}</td>
          <td>${r.exportQuantity || '0'}</td>
          <td>${r.unit || ''}</td>
      `;
      tbody.appendChild(tr);
  });
}

// ================================ Data Processing ================================
async function loadHistory() {
  const table = document.querySelector('.table-container table');
  if (!table) {
    console.error('Table element not found!');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  const rawRecords = await fetchHistory();
  const records = aggregateHistoryRecords(rawRecords);

  let filtered = records;
  if (fromDate) {
    filtered = filtered.filter(r => r.date >= fromDate);
  }
  if (toDate) {
    filtered = filtered.filter(r => r.date <= toDate);
  }
  
  renderTable(filtered, table);
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  loadHistory();
  
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  
  if (fromDateInput) {
    fromDateInput.addEventListener('change', loadHistory);
  } else {
    console.error('fromDate input not found!');
  }
  
  if (toDateInput) {
    toDateInput.addEventListener('change', loadHistory);
  } else {
    console.error('toDate input not found!');
  }

  document.getElementById('confirm-yes').onclick = () => window.location.href = '/manager/login';
  document.getElementById('confirm-no').onclick  = () => document.getElementById('logout-modal').style.display = 'none';
});

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}   