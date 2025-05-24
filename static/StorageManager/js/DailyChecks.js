// Backend endpoints
const CHECKS = '/storage_manager/daily_checks';

let records = [];
let isLoading = true;

class IngredientCheck {
  constructor({ itemStackID, name, initial, imported, used, remaining, actual, unit, warning }) {
    this.itemStackID = itemStackID;
    this.name = name;
    this.initial = initial;
    this.imported = imported
    this.used = used;
    this.remaining = remaining;
    this.actual = actual;
    this.unit = unit;
    this.warning = warning;
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

async function fetchChecks() {
  try {
    const token = getCookie('token');
    console.log(token);
    const res = await fetch(CHECKS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(res);
    const raw = await handleResponse(res);
    const list = raw["items"];
    return list;
  } catch (e) {
    console.error('Fetch error:', e);
    return [];
  }
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

inputButton.addEventListener('click', () => {
  inputTable.classList.remove('hidden');
  mainOutputTable.classList.add('hidden');
  subOutputTable.classList.add('hidden');

  submitButton.classList.remove('hidden');
  inputButton.classList.add('hidden');
});

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

window.addEventListener('DOMContentLoaded', async () => {
  const username = encodeURIComponent(getCookie("username"));
  const accountBtn = document.querySelector('.account');
  if (username) {
    accountBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${username}`;
  }
  submitButton.disabled = true;

  records = await fetchChecks();
  isLoading = false;
  console.log('DOMContentLoaded');

  submitButton.disabled = false;

  // Reset to input mode
  inputTable.classList.remove('hidden');
  mainOutputTable.classList.add('hidden');
  subOutputTable.classList.add('hidden');

  submitButton.classList.remove('hidden');
  inputButton.classList.add('hidden');

  // Existing initialization
  inputTableBody.innerHTML = '';
  addRow();

  document.getElementById('confirm-yes').addEventListener('click', () => {
    window.location.href = '/manager/login';
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('logout-modal').style.display = 'none';
  });
});

// Submit handler: interact with backend
submitButton.addEventListener('click', async () => {
  if (isLoading) {
    alert('Loading...');
    return;
  }
  // Collect inputs
  const today = new Date();
  const dayStart = getDayStartTimestamp(today);
  const dayEnd = getDayEndTimestamp(today);

  const inputs = Array.from(inputTableBody.querySelectorAll('tr')).map(row => ({
    id:            row.cells[0].querySelector('input').value.trim(),
    name:          row.cells[1].querySelector('input').value.trim(),
    actual: Number(row.cells[2].querySelector('input').value.trim()) || 0,
    unit:          row.cells[3].querySelector('input').value.trim()
  })).filter(item => item.id && item.name);

  if (!inputs.length) {
    alert("Please enter at least one ingredient");
    return;
  }

  try {
    const matched = [];
    const unmatched = [];

    for (const input of inputs) {
      const relevant = records.filter(rec => rec.itemStackID.trim() === input.id.trim());
      console.log(relevant);
      if (!relevant.length) {
        unmatched.push({
          id: input.id,
          name: input.name,
          warning: 'Ingredient not found'
        });
        continue;
      }

      let inventoryAtStart = 0, importedToday = 0, usedToday = 0;

      relevant.forEach(rec => {
        const t = rec.import_export_time;
        if (t < dayStart) {
          inventoryAtStart += rec.quantity;
        } else if (t<=dayEnd) {
          if (rec.quantity > 0) importedToday += rec.quantity;
          else usedToday += Math.abs(rec.quantity);
        }
      });
      console.log("Inventory at start: " + inventoryAtStart);
      console.log("Imported today: " + importedToday);
      console.log("Used today: " + usedToday);

      const remaining = inventoryAtStart + importedToday - usedToday;
      let warning = '';
      if (remaining > input.actual) warning = 'Warning: Actual quantity is less than expected';
      else if (remaining < input.actual) warning = 'Warning: Actual quantity is greater than expected';

      matched.push(new IngredientCheck({
        itemStackID: input.id,
        name: input.name,
        initial: inventoryAtStart,
        imported: importedToday,
        used: usedToday,
        remaining,
        actual: input.actual,
        unit: input.unit,
        warning
      }));
    }

    // Clear previous
    mainOutputBody.innerHTML = '';
    subOutputBody.innerHTML = '';

    // Render matched
    matched.forEach(item => {
      mainOutputBody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${item.itemStackID}</td>
          <td>${item.name}</td>
          <td>${item.initial}</td>
          <td>${item.imported}</td>
          <td>${item.used}</td>
          <td>${item.remaining}</td>
          <td>${item.actual}</td>
          <td>${item.unit || ''}</td>
          <td>${item.warning || ''}</td>
        </tr>
      `);
    });

    // Render unmatched if any
    if (unmatched.length) {
      unmatched.forEach(item => {
        subOutputBody.insertAdjacentHTML('beforeend', `
          <tr><td>${item.id}</td><td>${item.name}</td><td>${item.warning}</td></tr>
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

// Logout Modal functions
function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}