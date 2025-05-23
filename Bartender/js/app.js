const orders = [
  {
    id: 101,
    name: "Ginger Lemongrass Honey Tea",
    formula: "1 QOA black tea bag • 200ml boiled water • 3 slices fresh ginger • 20g fresh lemongrass • 25ml honey",
    instructions: "Steep the tea bag in boiling water with crushed ginger and lemongrass for 3 minutes. Remove the tea bag. Add honey and stir well.",
    request: "Serve hot",
    customer: "Alice",
    quantity: 1,
    status: "Untaken",
    img: "../img/gingerTea.jpg"
  }, 
  {
    id: 102,
    name: "Espresso Martini",
    formula: "Vodka • 30ml Kahlúa • 30ml espresso • 10ml coffee liqueur",
    instructions: "Shake all ingredients with ice and strain into a chilled martini glass.",
    request: "Less ice, chilled glass",
    customer: "Bob",
    quantity: 2,
    status: "Untaken",
    img: "../img/pexels-photo-312418.webp"
  },
  {
    id: 103,
    name: "Mojito",
    formula: "50ml White Rum • 30ml lime juice • 8 mint leaves • Soda to top",
    instructions: "Muddle mint leaves and lime juice in a glass. Add rum and top with soda. Garnish with mint.",
    request: "No sugar",
    customer: "Charlie",
    quantity: 1,
    status: "Taken",
    img: "../img/traditional-mojito-with-ice-mint-table_140725-867.avif"
  },
  {
    id: 104,
    name: "Margarita",
    formula: "50ml Tequila • 30ml lime juice • 20ml triple sec",
    instructions: "Shake all ingredients with ice and strain into a salt-rimmed glass.",
    request: "Salt rim",
    customer: "David",
    quantity: 1,
    status: "Taken",
    img: "../img/margarita.jpg"
  },
  {
    id: 105,
    name: "Pina Colada",
    formula: "50ml White Rum • 30ml coconut cream • 30ml pineapple juice",
    instructions: "Blend all ingredients with ice until smooth. Serve in a chilled glass.",
    request: "Extra pineapple",
    customer: "Eve",
    quantity: 4,
    status: "Untaken",
    img: "../img/pinacolada.jpg"
  },
  {
    id: 106,
    name: "Old Fashioned",
    formula: "50ml Bourbon • 1 sugar cube • 2 dashes Angostura bitters",
    instructions: "Muddle sugar and bitters in a glass. Add bourbon and ice. Stir well.",
    request: "No garnish",
    customer: "Frank",
    quantity: 3,
    status: "Untaken",
    img: "../img/oldFashioned.jpg"
  }

];

const container = document.getElementById("orders-container");
const detailModal = document.getElementById("detail-modal");
const detailTitle = document.getElementById("detail-title");
const detailStatus = document.getElementById("detail-status");
const detailReq = document.getElementById("detail-req");
const btnTake = document.getElementById("btn-take");

const workModal = document.getElementById("work-modal");
const workTitle = document.getElementById("work-title");
const workFormula = document.getElementById("work-formula");
const workReq = document.getElementById("work-req");
const btnCancel = document.getElementById("btn-cancel");
const btnFinish = document.getElementById("btn-finish");

const toast = document.createElement("div");
toast.id = "toast";
document.body.appendChild(toast);

function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = `show ${type}`;
  setTimeout(() => toast.className = toast.className.replace("show", ""), 2500);
}

function renderOrders() {
  container.innerHTML = "";
  orders.forEach(o => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
  <img src="${o.img}" alt="${o.name}">
  <div class="info">
    <h3>${o.name}</h3>
    <small>#${o.id}</small><br>
    <p><strong>Customer:</strong> ${o.customer}</p>
    <p><strong>Quantity:</strong> ${o.quantity}</p>

    <span class="status ${o.status}">${o.status}</span>
  </div>`;

    card.onclick = () => openDetail(o);
    container.appendChild(card);
  });
}

let current = null;

function openDetail(order) {
  current = order;
  detailTitle.textContent = `${order.name} (#${order.id})`;
  detailStatus.className = `badge ${order.status}`;
  detailStatus.textContent = order.status;
  detailReq.textContent = order.request || "—";
  document.getElementById("detail-customer").textContent = order.customer;
  document.getElementById("detail-qty").textContent = order.quantity;
  btnTake.style.display = order.status === "Untaken" ? "block" : "none";
  detailModal.classList.remove("hidden");
}

btnTake.onclick = () => {
  if (!current) return;
  current.status = "Taken";
  renderOrders();
  closeModal(detailModal);
  openWorkModal(current);
};

function openWorkModal(order) {
  workTitle.textContent = `Working on ${order.name}`;
  workFormula.innerHTML = `
    <div class="recipe">
      <h3>Ingredients:</h3>
      <ul>
        ${order.formula.split("•").map(item => `<li>${item.trim()}</li>`).join("")}
      </ul>
      <h3>Instructions:</h3>
      <p>${order.instructions || "No instructions provided."}</p>
    </div>
  `;
  workReq.textContent = order.request || "—";
  workModal.classList.remove("hidden");
  workModal.querySelector(".modal-content").classList.add("work-modal");
  document.getElementById("work-customer").textContent = order.customer;
  document.getElementById("work-qty").textContent = order.quantity;
}


btnCancel.onclick = () => {
  if (!current) return;
  const id = current.id;
  orders.splice(orders.findIndex(o => o.id === id), 1);
  renderOrders();
  closeModal(workModal);
  showToast("Order canceled ❌", "error");
};

btnFinish.onclick = () => {
  if (!current) return;
  const id = current.id;
  orders.splice(orders.findIndex(o => o.id === id), 1);
  renderOrders();
  closeModal(workModal);
  showToast("Order completed ✅", "success");
};

function closeModal(el) {
  el.classList.add("hidden");
}

document.addEventListener("click", e => {
  if (e.target.dataset.close !== undefined) closeModal(e.target.closest(".modal"));
  if (e.target.classList.contains("modal")) closeModal(e.target);
});

renderOrders();
