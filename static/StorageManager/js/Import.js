//===================================== Class for Ingredient =====================================
class Ingredient {
    constructor(data){
        this.id = data.id;
        this.name = data.name;
        this.unit = data.unit;
        this.quantity = data.quantity;
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
    if (res.status === 200 || res.status === 302 || res.status === 201) {
        return await res.json();
    } 
    else if (res.status >= 400 && res.status < 600) {
        if (res.status === 401) {
            debugger;
            //window.location.href = '/manager/login';
            console.warn('401 Unauthorized – no redirect, để debug tiếp');
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
            method: 'POST',
            // headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': token
            // }
        });
        const data = await handleResponse(res);
        const inventoryMap = new Map();
        

        data["itemStacks"].forEach(item => {
            const key = item.id;
            if (!inventoryMap.has(key)) {
                inventoryMap.set(key, {
                    id: key,
                    name: item.name,
                    unit: item.unit,
                    quantity: item.quantity
                });
            }
        });
        var newInventory = [];
        inventoryMap.forEach(val => {
            newInventory.push(val);
        });
        return newInventory;
    } catch (err) {
        console.error('Failed to fetch inventory:', err);
    }
}

// Render dropdown-style suggestions under the input
async function renderSuggestions() {
    const name = ingredientInput.value.trim().toLowerCase();
    const supp = supplierInput.value.trim().toLowerCase();
    suggestionsEl.innerHTML = '';
    if (!name && !supp) return;
    inventory = await fetchInventory();

    console.log('Inventory:', inventory);
    const matches = inventory.filter(item =>
        (!name || item.name.toLowerCase().includes(name))
    );

    matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <span>${item.id}</span>
            <span>${item.name}</span>
            <span>${item.unit}</span>
            <span>${item.quantity}</span>`;
        div.addEventListener('click', () => selectSuggestion(item));
        suggestionsEl.appendChild(div);
    });
}

function selectSuggestion(item) {
    selectedItem = item;
    itemIdInput.value = item.id;
    unitInput.value = item.unit;
    ingredientInput.value = item.name;
    supplierInput.value = '';
    quantityInput.value = '';
    itemIdInput.style.display = 'inline-block';
    unitInput.style.display = 'inline-block';
    ingredientInput.setAttribute('readonly', true);
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
        resultsEl.innerHTML = `<div class="entry success">New ingredient "${created.name}" (ID: ${created.id}) added successfully!</div>`;
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
    resultsEl.querySelectorAll('.entry[style*="color:red"]').forEach(entry => entry.remove());
    const name = ingredientInput.value.trim();
    const supplier = supplierInput.value.trim();
    const rawQuantity = parseInt(quantityInput.value, 10);
    if (!name || !supplier) return;

    if (rawQuantity === '' || isNaN(rawQuantity)) {
        resultsEl.innerHTML = `<div class="entry" style="color:red">
            Warning: Quantity must be a valid number
        </div>`;
        return;
    }
    const quantity = parseFloat(rawQuantity);

    if (!selectedItem) {
        resultsEl.innerHTML = `<div class="entry" style="color:red">
            You might want to add new ingredient
        </div>`;
        return;
    }

    const payload = {
        itemStackID: selectedItem.id,
        quantity: quantity,
        supplier: supplier,
        reason: "Restock"
    };

    try {
        const token = getCookie('token');
        const res = await fetch(UPDATE_ITEM_ENDPOINT, {
            method: 'POST',
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
            <span><b>ID:</b> ${selectedItem.id}</span>
            <span><b>Name:</b> ${selectedItem.name}</span>
            <span><b>Supplier:</b> ${supplier}</span>
            <span><b>Quantity:</b> ${quantity}</span>
            <span><b>Unit:</b> ${selectedItem.unit}</span>
        `;
        resultsEl.appendChild(entry);

        // Reset form
        selectedItem = null;
        ingredientInput.removeAttribute('readonly');
        supplierInput.removeAttribute('readonly');

        itemIdInput.value = '';
        unitInput.value = '';
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
    const username = encodeURIComponent(getCookie("username"));
    const accountBtn = document.querySelector('.account');
    if (username) {
      accountBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${username}`;
    }
    fetchInventory();
    
    ingredientInput.addEventListener('input', renderSuggestions);
    supplierInput.addEventListener('input', renderSuggestions);

    window.handleDone = handleDone;
    window.showLogoutModal = function() {
        closeAllModals();
        logoutModal.style.display = 'flex';
    };
});