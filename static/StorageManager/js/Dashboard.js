const endpoints = {
  productTransaction: '/storage_manager/product_transaction',
  runningOut: '/storage_manager/running_out'
};

class TransactionItem {
  constructor(data) {
      this.id = data.id;
      this.itemStackID = data.itemStackID;
      this.name = data.ItemStackName;
      this.unit = data.unit;
      this.time = data.import_export_time;
      this.supplier = data.supplier;
      this.reason = data.reason;  // e.g. "Restock" or "Sold"
      this.quantity = data.quantity;
  }
  

  isImport() {
    return this.quantity > 0;
  }

  isExport() {
    return this.quantity < 0;
  }

  formattedTime() {
    return unix2date(this.time);
  }
}

class ItemStack {
  constructor(data) {
    this.id = data.id;
      this.name = data.name;
      this.unit = data.unit;
      this.quantity = data.quantity;
    }
}

const RUNOUT_THRESHOLD = 10;

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
    return await handleResponse(res);
  } catch (e) {
    console.error('Error fetching data:', e);
    return [];
  }
}

function renderTransactionList(containerId, transactions) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  tbody.innerHTML = '';
  transactions.forEach(tx => {
    const row = document.createElement('tr');
    [
      tx.id,
      tx.name,
      tx.supplier,
      tx.quantity > 0 ? 'Import' : 'Export',
      Math.abs(tx.quantity),
      tx.unit,
      tx.formattedTime()
    ].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function renderCard(containerId, items) {
  const tbody = document.querySelector(`#${containerId} tbody`);
  tbody.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('tr');
    [
      item.id,
      item.name,
      item.quantity,
      item.unit
    ].forEach(text => {
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
    bar.innerHTML = `
      <div class="bar-label">${name}</div>
      <div class="bar-container">
        <div class="bar-export" style="width:${export_percent}%"></div>
        <div class="bar-import" style="width:${import_percent}%"></div>
      </div>`;
    barChart.appendChild(bar);
  });
}

window.onload = async () => {
  try {
      // Fetch data từ các endpoint mới
      const [rawTrans, rawRunout] = await Promise.all([
          fetchData(endpoints.productTransaction),
          fetchData(endpoints.runningOut + '?limit=8')
      ]);

      // Process transaction data
      const transactions = (rawTrans || []).map(d => new TransactionItem(d));
      renderTransactionList('product_transaction', transactions);

      //Aggregate by itemStackId for bar chart
      const agg = {};
      transactions.forEach(tx => {
        const key = tx.itemStackID;
        if (!agg[key]) {
          agg[key] = { name: tx.name, import: 0, export: 0 };
        }
        if (tx.isImport()) agg[key].import += tx.quantity;
        if (tx.isExport()) agg[key].export += Math.abs(tx.quantity);
      });

      const barData = Object.values(agg).map(item => {
        const total = item.import + item.export || 1;
        return {
          name: item.name,
          import_percent: Math.round((item.import / total) * 100),
          export_percent: Math.round((item.export / total) * 100)
        };
      });
      renderBar(barData);

      // Running-out card
      const stacks = (rawRunout || []).map(d => new ItemStack(d));
      const runningOutList = stacks.filter(item => item.quantity <= RUNOUT_THRESHOLD);
      renderCard('card-running', runningOutList);

      // Thêm sự kiện click cho card Running out
      document.getElementById('card-running').addEventListener('click', () => navigateTo('running-out'));
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
  window.location.href = `/storage_manager/inventory?tab=${tab}`;
}

function showLogoutModal() {
  document.getElementById('logout-modal').style.display = 'flex';
}