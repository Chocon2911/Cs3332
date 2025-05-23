const INVENTORY_ENDPOINT = '/storage_manager/all_ingredients';

class Ingredient {
  constructor(data){
      this.id = data.id;
      this.name = data.name;
      this.unit = data.unit;
      this.quantity = data.quantity;
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

async function fetchData(url) {
  try {
      const token = getCookie('token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      const raw = await handleResponse(res);
      const list = raw["itemStacks"];
      return list.map(item => new Ingredient(item));
  } catch (e) {
      console.error('Fetch error:', e);
      return [];
  }
}

// ================================ Rendering ================================
function renderTable(data, table) {
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
      `;
      tbody.appendChild(tr);
  });
}

async function loadTableData(index) {
  const table = document.getElementById(`table-${index}`);
  const ingredients = await fetchData(INVENTORY_ENDPOINT);

  console.log(ingredients);
  let displayData = ingredients;
  if (index === 0) {
    // Filter inventory
    displayData = ingredients;
  } else {
    // Filter Running out
    displayData = ingredients.filter(item => item.quantity <= 0);
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
  showTable(tabIndex); // ================== error here

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