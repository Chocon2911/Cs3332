let inventory = [];
let selectedItem = null;

// DOM references for suggestions and results
const suggestionsEl = document.getElementById("suggestions");
const resultsEl = document.getElementById("results");
const ingredientInput = document.getElementById("ingredient");
const supplierInput = document.getElementById("supplier");
const quantityInput = document.getElementById("quantity");

// Load initial inventory
window.onload = fetchInventory;

async function fetchInventory() {
  try {
    const res = await fetch("../json/TestData.json");
    if (!res.ok) throw new Error('Failed to fetch');
    inventory = await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Render dropdown-style suggestions under the input
function renderSuggestions() {
  const name = ingredientInput.value.trim().toLowerCase();
  const supp = supplierInput.value.trim().toLowerCase();
  suggestionsEl.innerHTML = '';
  if (!name && !supp) return;
  const matches = inventory.filter(item =>
    item.name.toLowerCase().includes(name) &&
    item.supplier.toLowerCase().includes(supp)
  );
  matches.forEach(item => {
    const div = document.createElement('div');
    div.className = 'entry';
    // Suggestion entries show id, name, supplier, quantity
    div.innerHTML = `
      <span>${item.id}</span>
      <span>${item.name}</span>
      <span>${item.supplier}</span>
      <span>Quantity (kg): ${item.quantity}</span>`;
    // On click, select suggestion and populate form
    div.addEventListener('click', () => selectSuggestion(item));
    suggestionsEl.appendChild(div);
  });
}

// When a suggestion is clicked
function selectSuggestion(item) {
  selectedItem = item;
  // Populate inputs
  ingredientInput.value = item.name;
  supplierInput.value = item.supplier;
  quantityInput.value = item.quantity;
  // Make name and supplier readonly
  ingredientInput.setAttribute('readonly', true);
  supplierInput.setAttribute('readonly', true);
  suggestionsEl.innerHTML = ''; // Clear dropdown
}

// Handle the "Done" button click
function handleDone() {
  const name = ingredientInput.value.trim();
  const supplier = supplierInput.value.trim();
  const quantity = parseInt(quantityInput.value);
  if (!name || !supplier || isNaN(quantity)) return;

  let id;
  if (selectedItem) {
    // Update existing item's quantity
    selectedItem.quantity += quantity;
    id = selectedItem.id;
  } else {
    // Create new inventory item
    id = String(Date.now()).slice(-6);
    inventory.push({ id, name, supplier, quantity });
  }

  // Build and append a result entry
  const now = new Date().toLocaleString();
  const entry = document.createElement('div');
  entry.className = 'entry';
  // Results show id, name, supplier, quantity, and import date
  entry.innerHTML = `
    <span><b>ID:</b> ${id}</span>
    <span><b>Name:</b> ${name}</span>
    <span><b>Supplier:</b> ${supplier}</span>
    <span><b>Quantity (kg):</b> ${quantity}</span>
    <span><b>Import Date:</b> ${now}</span>`;
  resultsEl.appendChild(entry);

  // Reset form for next import
  selectedItem = null;
  ingredientInput.removeAttribute('readonly');
  supplierInput.removeAttribute('readonly');
  ingredientInput.value = '';
  supplierInput.value = '';
  quantityInput.value = '';
}

// Wire up suggestion rendering
ingredientInput.addEventListener('input', renderSuggestions);
supplierInput.addEventListener('input', renderSuggestions);