import { unix2date, getCookie } from './Utils.js';

//===================================== Class for Ingredient =====================================
class Ingredient {
    constructor(data){
        this.id = data.id;
        this.itemStackID = data.itemStackID;
        this.itemStackName = data.ItemStackName;
        this.unit = data.unit;
        this.importExportTime = data.import_export_time || data.importExportTime;
        this.expirationDate = data.expiration_date || data.expirationDate;
        this.quantity = data.quantity;
        this.reason = data.reason;
        this.supplier = data.supplier;
    }
    formattedTime(){
        return unix2date(this.importExportTime);
    }
}

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


async function handleResponse(res) {
    if (res.status === 200 || res.status === 302) {
        return await res.json();
    } else if (res.status >= 400 && res.status < 600) {
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

async function fetchInventory() {
    try {
        const token = getCookie('token');
        const res = await fetch(INVENTORY_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
        const data = await handleResponse(res);
        const inventoryMap = new Map();

        data.forEach(item => {
            const key = item.itemStackID;
            if (!inventoryMap.has(key)) {
                inventoryMap.set(key, {
                    itemStackID: key,
                    itemStackName: item.ItemStackName,
                    unit: item.unit,
                    totalQuantity: 0
                });
            }
            inventoryMap.get(key).totalQuantity += item.quantity;
        });
        inventory = [];
        inventoryMap.forEach(val => {
            if (val.quantity > 0) {
                inventory.push(val);
            }
        });
    } catch (err) {
        console.error('Failed to fetch inventory:', err);
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

    matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <span>${item.itemStackID}</span>
            <span>${item.itemStackName}</span>
            <span>${item.supplier}</span>
            <span>Quantity: ${item.quantity}</span>
            <span>Import Date: ${item.formattedTime()}</span>`;
        div.addEventListener('click', () => selectSuggestion(item));
        suggestionsEl.appendChild(div);
    });
}

function selectSuggestion(item) {
    selectedItem = item;
    itemIdInput.value = item.itemStackID;
    unitInput.value = item.unit;
    ingredientInput.value = item.itemStackName;
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
        const token = getCookie('token');
        const res = await fetch(CREATE_ITEM_ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(newItem)
        });
        const createdData = await handleResponse(res);
        const created = new Ingredient(createdData);
        await fetchInventory();
        resultsEl.innerHTML = `<div class="entry success">New ingredient "${created.itemStackName}" (ID: ${created.id}) added successfully!</div>`;
    } catch (err) {
        console.error('Failed to create item:', err);
        resultsEl.innerHTML = `<div class="entry error">Failed to add new ingredient. Please try again.</div>`;
    } finally {
        addModal.style.display = 'none';
        newNameInput.value = '';
        newUnitInput.value = '';
    }
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

    const payload = {
        itemStackID: selectedItem.itemStackID,
        quantity: quantity,
        supplier: selectedItem.supplier,
        reason: "Restock"
    };

    try {
        const token = getCookie('token');
        const res = await fetch(UPDATE_ITEM_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(payload)
        });
        const updatedData = await handleResponse(res);
        const updated = new Ingredient(updatedData);

        const entry = document.createElement('div');
        entry.className = 'entry success';
        entry.innerHTML = `
            <span><b>ID:</b> ${updated.itemStackID}</span>
            <span><b>Name:</b> ${updated.itemStackName}</span>
            <span><b>Supplier:</b> ${updated.supplier}</span>
            <span><b>Quantity:</b> ${updated.quantity}</span>
            <span><b>Unit:</b> ${updated.unit}</span>
            <span><b>Import Date:</b> ${unix2date(updated.importExportTime)}</span>
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
    fetchInventory();
    
    ingredientInput.addEventListener('input', renderSuggestions);
    supplierInput.addEventListener('input', renderSuggestions);

    window.handleDone = handleDone;
    window.showLogoutModal = function() {
        closeAllModals();
        logoutModal.style.display = 'flex';
    };
});