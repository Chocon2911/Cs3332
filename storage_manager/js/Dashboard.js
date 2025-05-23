const endpoints = [
    '../json/product_transaction.json', // product transaction
    '../json/TestData.json',            // expiring
    '../json/TestData.json'             // running-out
  ];
  
  async function fetchData(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
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
      const { name, import_quantity, export_quantity } = item;
      const total = import_quantity + export_quantity;
      const exportPercent = ((export_quantity / total) * 100).toFixed(0);
      const importPercent = 100 - exportPercent;
  
      const bar = document.createElement('div');
      bar.className = 'bar';
  
      const label = document.createElement('div');
      label.className = 'bar-label';
      label.textContent = name;
  
      const container = document.createElement('div');
      container.className = 'bar-container';
  
      const exportDiv = document.createElement('div');
      exportDiv.className = 'bar-export';
      exportDiv.style.width = `${exportPercent}%`;
  
      const importDiv = document.createElement('div');
      importDiv.className = 'bar-import';
      importDiv.style.width = `${importPercent}%`;
  
      container.append(exportDiv, importDiv);
      bar.append(label, container);
      barChart.appendChild(bar);
    });
  }
  
  window.onload = async () => {
    // prodData để render bar-chart; expData & runData để render hai card
    const [prodData, expData, runData] = await Promise.all(
      endpoints.map(url => fetchData(url))
    );
  
    // 1) Render bar-chart “Product transaction”
    renderBar(prodData);
  
    // 2) Render hai bảng Expiring & Running-out (lấy 5 bản ghi đầu)
    renderCard('card-expiring', expData.slice(0, 5));
    renderCard('card-running', runData.slice(0, 5));
  };
  
  function navigateTo(tab) {
    window.location.href = `Inventory2.html?tab=${tab}`;
  }
  