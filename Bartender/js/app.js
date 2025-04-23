/* ====== DRINKS WITH GUARANTEED‑WORKING UNSPLASH LINKS =============== */
/* GUARANTEED‑WORKING café / cocktail shots */
/* ====== DRINKS ====================================================== */
const orders = [
  {
    id: 101,
    name: "Espresso Martini",
    formula: "Vodka • Kahlúa • Espresso • Coffee Liqueur",
    request: "Less ice, chilled glass",
    status: "Untaken",
    /* rich crema‑top shot */
    img: "../img/pexels-photo-312418.webp"
  },
  {
    id: 102,
    name: "Mojito",
    formula: "White Rum • Lime • Mint • Soda",
    request: "No sugar",
    status: "Untaken",
    /* bright pool‑side mojito */
    img: "../img/traditional-mojito-with-ice-mint-table_140725-867.avif"
  },
  {
    id: 103,
    name: "Old Fashioned",
    formula: "Bourbon • Bitters • Sugar Cube",
    request: "Add orange peel, no ice, mix with mineral water if available, no cow milk, use oat milk instead",
    status: "Taken",
    /* classic amber old‑fashioned */
    img: "../img/k_Photo_Recipes_2024-10-old-fashioned_old-fashioned-0898-vertical.jpg"
  }
];



/* selectors, renderOrders, modals, event handlers, init…               */


/* ========== SELECTORS =============================================== */
const container    = document.getElementById("orders-container");
/* detail modal */
const detailModal  = document.getElementById("detail-modal");
const detailTitle  = document.getElementById("detail-title");
const detailStatus = document.getElementById("detail-status");
const detailReq    = document.getElementById("detail-req");
const btnTake      = document.getElementById("btn-take");
/* work modal */
const workModal    = document.getElementById("work-modal");
const workTitle    = document.getElementById("work-title");
const workFormula  = document.getElementById("work-formula");
const workReq      = document.getElementById("work-req");
const btnCancel    = document.getElementById("btn-cancel");
const btnFinish    = document.getElementById("btn-finish");

/* ========== RENDER CARDS ============================================ */
function renderOrders(){
  container.innerHTML="";
  orders.forEach(o=>{
    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <img src="${o.img}" alt="${o.name}">
      <div class="info">
        <h3>${o.name}</h3>
        <small>#${o.id}</small><br>
        <span class="status ${o.status}">${o.status}</span>
      </div>`;
    card.onclick=()=>openDetail(o);
    container.appendChild(card);
  });
}

/* ========== DETAIL MODAL ============================================ */
let current=null;
function openDetail(order){
  current=order;
  detailTitle.textContent=`${order.name} (#${order.id})`;
  detailStatus.className=`badge ${order.status}`;
  detailStatus.textContent=order.status;
  detailReq.textContent=order.request||"—";
  btnTake.style.display = order.status==="Untaken" ? "block" : "none";
  detailModal.classList.remove("hidden");
}

btnTake.onclick=()=>{
  if(!current) return;
  current.status="Taken";
  renderOrders();
  closeModal(detailModal);
  openWorkModal(current);
};

/* ========== WORK MODAL (after Take) ================================= */
function openWorkModal(order){
  workTitle.textContent=`Working on ${order.name}`;
  workFormula.textContent=order.formula||"N/A";
  workReq.textContent   =order.request||"—";
  workModal.classList.remove("hidden");
}

btnCancel.onclick=()=>{
  if(!current) return;
  current.status="Untaken";
  renderOrders();
  closeModal(workModal);
};

btnFinish.onclick=()=>{
  if(!current) return;
  current.status="Finished";
  renderOrders();
  closeModal(workModal);
};

/* ========== UTILITIES =============================================== */
function closeModal(el){el.classList.add("hidden");}

/* close when background or close‑button clicked */
document.addEventListener("click",e=>{
  if(e.target.dataset.close!==undefined) closeModal(e.target.closest(".modal"));
  if(e.target.classList.contains("modal")) closeModal(e.target);
});

/* ========== INIT ==================================================== */
renderOrders();

