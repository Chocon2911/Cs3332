import { unix2date, date2unix } from './Utils.js';

let inventory = [];
let selectedItem = null;

// DOM references for suggestions and results
const suggestionsEl = document.getElementById("suggestions");
const resultsEl = document.getElementById("results");
const ingredientInput = document.getElementById("ingredient");
const supplierInput = document.getElementById("supplier");
const quantityInput = document.getElementById("quantity");
const itemIdInput = document.getElementById("item-id");
const unitInput = document.getElementById("unit");

// Add modal elements
const openAddBtn = document.getElementById('open-add-modal');
const addModal = document.getElementById('add-modal');
const newNameInput = document.getElementById('new-name');
const newUnitInput = document.getElementById('new-unit');
const confirmAddBtn = document.getElementById('confirm-add');

//Logout modal elements
const logoutModal = document.getElementById('logout-modal');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

// API endpoints
const INVENTORY_ENDPOINT = '/storage_manager/all_ingredients';
const CREATE_ITEM_ENDPOINT = '/storage_manager/new_ingredient';
const UPDATE_ITEM_ENDPOINT = '/storage_manager/ingredient_import';

async function fetchInventory() {
    try {
        const res = await fetch(INVENTORY_ENDPOINT);
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
        (!name || item.name.toLowerCase().includes(name)) &&
        (!supp || item.supplier.toLowerCase().includes(supp))
    );
    /*const matches = inventory.filter(item =>
        item.name.toLowerCase().includes(name) &&
        item.supplier.toLowerCase().includes(supp)
    );*/

    matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <span>${item.id}</span>
            <span>${item.name}</span>
            <span>${item.supplier}</span>
            <span>Quantity: ${item.quantity}</span>
            <span>Unit: ${item.unit}</span>`;
        div.addEventListener('click', () => selectSuggestion(item));
        suggestionsEl.appendChild(div);
    });
}

function selectSuggestion(item) {
    selectedItem = item;
    itemIdInput.value = item.id;
    unitInput.value = item.unit;
    ingredientInput.value = item.name;
    supplierInput.value = item.supplier;
    quantityInput.value = '';
    itemIdInput.style.display = 'inline-block';
    unitInput.style.display = 'inline-block';
    ingredientInput.setAttribute('readonly', true);
    supplierInput.setAttribute('readonly', true);
    suggestionsEl.innerHTML = '';
}

function closeAllModals() {
    addModal.style.display = 'none';
    logoutModal.style.display = 'none';
}

openAddBtn.addEventListener('click', () => {
    closeAllModals();
    addModal.style.display = 'flex'
});

addModal.addEventListener('click', e => {
    if (e.target === addModal) addModal.style.display = 'none';
});

confirmYes.addEventListener('click', () => window.location.href = '/manager/login');
confirmNo.addEventListener('click', () => logoutModal.style.display = 'none');
logoutModal.addEventListener('click', e => {
    if (e.target === logoutModal) logoutModal.style.display = 'none';
});

confirmAddBtn.addEventListener('click', async () => {
    const name = newNameInput.value.trim();
    const unit = newUnitInput.value.trim();
    if (!name || !unit) return;

    // Chỉ gửi name và unit khi tạo mới
    const newItem = { name, unit };

    try {
        const res = await fetch(CREATE_ITEM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        if (!res.ok) throw new Error('Create failed');
        
        // Sau khi tạo thành công, cập nhật lại inventory
        await fetchInventory();
        
        // Hiển thị thông báo thành công
        resultsEl.innerHTML = `<div class="entry success">New ingredient "${name}" has been added successfully!</div>`;
    } catch (err) {
        console.error('Failed to create item:', err);
        resultsEl.innerHTML = `<div class="entry error">Failed to add new ingredient. Please try again.</div>`;
    }

    addModal.style.display = 'none';
    newNameInput.value = '';
    newUnitInput.value = '';
});

async function handleDone() {
    const name = ingredientInput.value.trim();
    const supplier = supplierInput.value.trim();
    const quantity = parseInt(quantityInput.value, 10);
    if (!name || !supplier || isNaN(quantity)) return;

    if (!selectedItem) {
        resultsEl.innerHTML = `<div class="entry">You might want to add new ingredient</div>`;
        return;
    }

    const newQuantity = selectedItem.quantity + quantity;
    selectedItem.quantity = newQuantity;
    selectedItem.importDate = Date.now();

    try {
        const res = await fetch(UPDATE_ITEM_ENDPOINT, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedItem)
        });
        
        if (!res.ok) throw new Error('Update failed');
        
        const entry = document.createElement('div');
        entry.className = 'entry success';
        entry.innerHTML = `
            <span><b>ID:</b> ${selectedItem.id}</span>
            <span><b>Name:</b> ${name}</span>
            <span><b>Supplier:</b> ${supplier}</span>
            <span><b>Quantity:</b> ${newQuantity}</span>
            <span><b>Unit:</b> ${unitInput.value}</span>
            <span><b>Import Date:</b> ${unix2date(selectedItem.importDate)}</span>
        `;
        resultsEl.appendChild(entry);

        // Reset form
        selectedItem = null;
        ingredientInput.removeAttribute('readonly');
        supplierInput.removeAttribute('readonly');
        itemIdInput.style.display = 'none';
        unitInput.style.display = 'none';
        ingredientInput.value = '';
        supplierInput.value = '';
        quantityInput.value = '';
        
        // Cập nhật lại inventory
        await fetchInventory();
    } catch (err) {
        console.error('Failed to update item:', err);
        resultsEl.innerHTML = `<div class="entry error">Failed to update ingredient. Please try again.</div>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirm-yes').addEventListener('click', () => {
        window.location.href = '/manager/login';
    });
    document.getElementById('confirm-no').addEventListener('click', () => {
        document.getElementById('logout-modal').style.display = 'none';
    });

    fetchInventory();
    
    ingredientInput.addEventListener('input', renderSuggestions);
    supplierInput.addEventListener('input', renderSuggestions);

    window.handleDone = handleDone;
    window.showLogoutModal = function() {
        closeAllModals();
        logoutModal.style.display = 'flex';
    };
});