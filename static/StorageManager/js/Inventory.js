// Các endpoint mới
const endpoints = {
  allIngredients: '/storage_manager/all_ingredients',
  runningOut: '/storage_manager/running_out'
};

async function fetchData(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      return await response.json();
  } catch (e) {
      console.error('Error fetching data:', e);
      return [];
  }
}

function renderCard(containerId, items) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  tbody.innerHTML = '';
  items.forEach(item => {
      const row = document.createElement('tr');
      [item.id, item.name, item.supplier, item.quantity, item.unit].forEach(text => {
          const td = document.createElement('td');
          td.textContent = text;
          row.appendChild(td);
      });
      tbody.appendChild(row);
  });
}

window.onload = async () => {
  try {
      const [allData, runData] = await Promise.all([
          fetchData(endpoints.allIngredients),
          fetchData(endpoints.runningOut)
      ]);

      renderCard('card-all', allData);
      renderCard('card-running', runData);

      document.getElementById('confirm-yes').onclick = () => {
          window.location.href = 'manager/login';
      };

      document.getElementById('confirm-no').onclick = () => {
          document.getElementById('logout-modal').style.display = 'none';
      };
  } catch (error) {
      console.error('Error initializing inventory:', error);
  }
};

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}

function navigateTo(tab) {
  window.location.href = `/storage_manager/inventory2?tab=${tab}`;
}