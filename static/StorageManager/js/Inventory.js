const endpoints = [
    '/static/StorageManager/json/TestData.json', // all ingredients
    '/static/StorageManager/json/TestData.json', // expiring
    '/static/StorageManager/json/TestData.json'  // running-out
];

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
  } catch (e) {
    console.error('Error fetching inventory:', e);
    return [];
  }
}

function renderCard(containerId, items) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  tbody.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('tr');
    [item.id, item.name, item.supplier, item.quantity].forEach(text => {
      const td = document.createElement('td'); td.textContent = text; row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

window.onload = async () => {
    const [allData, expData, runData] = await Promise.all(
      endpoints.map(url => fetchData(url))
    );
    renderCard('card-all', allData.slice(0, 14));
    renderCard('card-expiring', expData.slice(0, 5));
    renderCard('card-running', runData.slice(0, 5));

    document.getElementById('confirm-yes').onclick = () => {
      window.location.href = 'manager/login';            // Giao diện sau khi log out
    };

    document.getElementById('confirm-no').onclick = () => {
      document.getElementById('logout-modal').style.display = 'none';
    };
};

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}

function navigateTo(tab) {
  window.location.href = `/storage_manager/inventory2?tab=${tab}`;
}