// Backend endpoints
const ENDPOINT = 'storage_manager/daily_checks';

class IngredientCheck {
  constructor(data) {
    this.id = data.id;
    this.itemStackID = data.itemStackID;
    this.name = data.ItemStackName;
    this.unit = data.unit;
    this.time = data.import_export_time;
    this.supplier = data.supplier;
    this.reason = data.reason;
    this.quantity = data.quantity;
  }

  isImport() {
    return this.quantity > 0;
  }

  isExport() {
    return this.quantity < 0;
  }

  formattedTime() {
    return unix2date(this.time);
  }
}

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

async function fetchInventoryTransactions() {
  const token = getCookie('token');
  const res = await fetch(ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  });
  const raw = await handleResponse(res);
  const list = Array.isArray(raw) ? raw : raw.items || [];
  return list.map(item => new IngredientCheck(item));
}

// ================================ UI / Check Logic ================================

function getDayStartTimestamp(dateObj) {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getDayEndTimestamp(dateObj) {
  const d = new Date(dateObj);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

// DOM elements
const inputButton = document.getElementById('input-button');
const submitButton = document.getElementById('submit-button');
const inputTable = document.getElementById('input-table');
const inputTableBody = inputTable.querySelector('tbody');
const mainOutputTable = document.getElementById('main-output-table');
const mainOutputBody = mainOutputTable.querySelector('tbody');
const subOutputTable = document.getElementById('sub-output-table');
const subOutputBody = subOutputTable.querySelector('tbody');

// Add a new input row
function addRow() {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" placeholder="ID"></td>
    <td><input type="text" placeholder="Name"></td>
    <td><input type="text" placeholder="Actual Quantity"></td>
    <td><input type="text" placeholder="Unit"></td>
  `;
  inputTableBody.appendChild(newRow);
}

// Navigate and add rows on Enter
inputTable.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const cells = Array.from(e.target.closest('tr').children);
    const idx = cells.findIndex(td => td.contains(e.target));
    if (idx < cells.length - 1) {
      cells[idx + 1].querySelector('input').focus();
    } else {
      addRow();
      inputTableBody.lastElementChild.querySelector('input').focus();
    }
  }
});

// Submit handler: interact with backend
submitButton.addEventListener('click', async () => {
  // Collect inputs
  const today = new Date();
  const inputs = Array.from(inputTableBody.querySelectorAll('tr')).map(row => ({
    id: row.cells[0].querySelector('input').value.trim(),
    name: row.cells[1].querySelector('input').value.trim(),
    actual: Number(row.cells[2].querySelector('input').value.trim()) || 0,
    unit: row.cells[3].querySelector('input').value.trim()  // Added unit extraction
  })).filter(item => item.id && item.name);

  if (!inputs.length) {
    alert("Please enter at least one ingredient");
    return;
  }

  try {
    const records = await fetchInventoryTransactions();
    const dayStart = getDayStartTimestamp(today);
    const dayEnd = getDayEndTimestamp(today);

    const matched = [];
    const unmatched = [];

    for (const userInput of inputs) {
      const relevant = records.filter(
        rec => rec.name.trim().toLowerCase() === userInput.name.trim().toLowerCase()
      );
      
      if (!relevant.length) {
        unmatched.push({
          id: userInput.id,
          name: userInput.name,
          warnings: 'Ingredient not found'
        });
        continue;
      }

      let inventoryAtStart = 0;
      relevant.forEach(rec => {
        if (rec.time < dayStart) inventoryAtStart += rec.quantity;
      });

      let restockToday = 0;
      let usedToday = 0;
      relevant.forEach(rec => {
        if (rec.time >= dayStart && rec.time <= dayEnd) {
          if (rec.quantity > 0) restockToday += rec.quantity;
          else usedToday += Math.abs(rec.quantity);
        }
      });
      const remaining = inventoryAtStart + restockToday - usedToday;
      let warning = '';
      if (remaining > userInput.actual) warning = 'Warning: Actual quantity is less than expected';
      else if (remaining < userInput.actual) warning = 'Warning: Actual quantity is greater than expected';

      matched.push({
        id: userInput.id,
        name: userInput.name,
        initial: inventoryAtStart,
        restock: restockToday,
        used: usedToday,
        remaining: remaining,
        actual: userInput.actual,
        unit: userInput.unit,
        warnings: warning
      });
    }

    // Clear previous
    mainOutputBody.innerHTML = '';
    subOutputBody.innerHTML = '';
    subOutputTable.classList.add('hidden');

    // Render matched
    matched.forEach(item => {
      mainOutputBody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.initial}</td>
          <td>${item.restock}</td>
          <td>${item.used}</td>
          <td>${item.remaining}</td>
          <td>${item.actual}</td>
          <td>${item.unit || ''}</td>
          <td>${item.warnings || ''}</td>
        </tr>
      `);
    });

    // Render unmatched if any
    if (unmatched.length) {
      unmatched.forEach(item => {
        subOutputBody.insertAdjacentHTML('beforeend', `
          <tr><td>${item.id}</td><td>${item.name}</td><td>${item.warnings}</td></tr>
        `);
      });
      subOutputTable.classList.remove('hidden');
    }

    // Toggle views
    inputTable.classList.add('hidden');
    mainOutputTable.classList.remove('hidden');
    submitButton.classList.add('hidden');
    inputButton.classList.remove('hidden');
  } catch (err) {
    alert('An error occurred while submitting the form. Please try again.');
    console.error('Submit flow error:', err);
  }
});

// Reset to input mode
inputButton.addEventListener('click', () => {
  inputTable.classList.remove('hidden');
  mainOutputTable.classList.add('hidden');
  subOutputTable.classList.add('hidden');
  submitButton.classList.remove('hidden');
  inputButton.classList.add('hidden');
  inputTableBody.innerHTML = '';
  addRow();
});

// Logout Modal functions
function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirm-yes').addEventListener('click', () => {
    window.location.href = '/manager/login';
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('logout-modal').style.display = 'none';
  });
  // Existing initialization
  inputTableBody.innerHTML = '';
  addRow();
});