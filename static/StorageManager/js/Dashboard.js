// Các endpoint mới
const endpoints = {
  productTransaction: '/storage_manager/product_transaction',
  runningOut: '/storage_manager/running_out'
};

async function fetchData(url) {
  try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
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

function renderBar(data) {
  const barChart = document.getElementById('bar-chart');
  barChart.innerHTML = '';

  data.forEach(item => {
      const { name, import_percent, export_percent } = item;

      const bar = document.createElement('div');
      bar.className = 'bar';

      const label = document.createElement('div');
      label.className = 'bar-label';
      label.textContent = name;

      const container = document.createElement('div');
      container.className = 'bar-container';

      const exportDiv = document.createElement('div');
      exportDiv.className = 'bar-export';
      exportDiv.style.width = `${export_percent}%`;

      const importDiv = document.createElement('div');
      importDiv.className = 'bar-import';
      importDiv.style.width = `${import_percent}%`;

      container.append(exportDiv, importDiv);
      bar.append(label, container);
      barChart.appendChild(bar);
  });
}

window.onload = async () => {
  try {
      // Fetch data từ các endpoint mới
      const [prodData, runData] = await Promise.all([
          fetchData(endpoints.productTransaction),
          fetchData(endpoints.runningOut + '?limit=5')
      ]);

      // Render các component
      renderBar(prodData);
      renderCard('card-running', runData);

      // Xử lý logout modal
      document.getElementById('confirm-yes').onclick = () => {
          window.location.href = 'manager/login';
      };

      document.getElementById('confirm-no').onclick = () => {
          document.getElementById('logout-modal').style.display = 'none';
      };
  } catch (error) {
      console.error('Error initializing dashboard:', error);
  }
};

function navigateTo(tab) {
  window.location.href = `/storage_manager/inventory2?tab=${tab}`;
}

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}