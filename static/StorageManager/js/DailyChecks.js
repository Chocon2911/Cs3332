// Backend endpoints
const VALIDATE_API = '/static/StorageManager/json/valid_checks.json';     // POST inputs
const RESPONSE_JSON = '/static/StorageManager/json/daily_checks.json'; // GET matched/unmatched data

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
  const inputs = Array.from(inputTableBody.querySelectorAll('tr')).map(row => ({
    id: row.cells[0].querySelector('input').value.trim(),
    name: row.cells[1].querySelector('input').value.trim(),
    actual: Number(row.cells[2].querySelector('input').value.trim()) || 0
  })).filter(item => item.id && item.name);

  try {
    // 1. Send inputs to backend
    await fetch(VALIDATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: inputs })
    });

    // 2. Fetch validated response
    const res = await fetch(RESPONSE_JSON);
    const result = await res.json();

    // Clear previous
    mainOutputBody.innerHTML = '';
    subOutputBody.innerHTML = '';
    subOutputTable.classList.add('hidden');

    // Render matched
    result.matched.forEach(item => {
      mainOutputBody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.initial}</td>
          <td>${item.used}</td>
          <td>${item.remaining}</td>
          <td>${item.actual}</td>
          <td>${item.warnings || ''}</td>
        </tr>
      `);
    });

    // Render unmatched if any
    if (result.unmatched?.length) {
      result.unmatched.forEach(item => {
        subOutputBody.insertAdjacentHTML('beforeend', `
          <tr><td>${item.id}</td><td>${item.name}</td><td>${item.warnings || ''}</td></tr>
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
    window.location.href = 'manager/login';  // Giao diện sau khi log out
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('logout-modal').style.display = 'none';
  });

  // Existing initialization
  inputTableBody.innerHTML = '';
  addRow();
});