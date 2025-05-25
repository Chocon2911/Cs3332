// ----- Khai báo đối tượng DOM ----- 
const menuBtn      = document.getElementById('menuBtn');
const sidebar      = document.getElementById('sidebar');
const cartBtn      = document.getElementById('cartBtn');
const cartSidebar  = document.getElementById('cartSidebar');
const orderBtn     = document.getElementById('orderBtn');
const orderSidebar = document.getElementById('orderSidebar');
const overlay      = document.getElementById('overlay');
const cartItems    = document.getElementById('cartItems');
const cartTotal    = document.getElementById('cartTotal');
const sendCartBtn  = document.querySelector('.send-cart-btn');
const clearCartBtn = document.querySelector('.clear-cart-btn');

//===========================================Cookie===========================================
function setCookie(name, value) 
{
    document.cookie = name + "=" + value + ";path=/";
}

function getCookie(name) 
{
    const cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) 
        {
        const cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) 
            {
            return cookiePair[1];
        }
    }

    return null;
}
//===========================================================================================

// ----- Hàm bật/tắt sidebar trái ----- 
menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  // Đảm bảo đóng các sidebar phải nếu đang mở
  cartSidebar.classList.remove('active');
  orderSidebar.classList.remove('active');
});

// ----- Hàm bật cart sidebar ----- 
cartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
  sidebar.classList.remove('active');
  orderSidebar.classList.remove('active');
});

// ----- Hàm bật order sidebar ----- 
orderBtn.addEventListener('click', () => {
  orderSidebar.classList.add('active');
  overlay.classList.add('active');
  sidebar.classList.remove('active');
  cartSidebar.classList.remove('active');
});

// ----- Click overlay sẽ đóng hết ----- 
overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  cartSidebar.classList.remove('active');
  orderSidebar.classList.remove('active');
  overlay.classList.remove('active');
});

// ----- Popup "Add successfully!" ----- 
function showSuccessPopup() {
  const popup = document.createElement('div');
  popup.className = 'success-popup active';
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.right = '20px';
  popup.style.backgroundColor = 'white';
  popup.style.padding = '10px 20px';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.gap = '10px';
  popup.innerHTML = `
    <div style="font-size:2rem; color: #28a745;">✔️</div>
    <div>Add successfully!</div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

// ----- Popup "Order successfully!" ----- 
function showOrderSuccessPopup() {
  const popup = document.createElement('div');
  popup.className = 'success-popup active';
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.right = '20px';
  popup.style.backgroundColor = 'white';
  popup.style.padding = '10px 20px';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.gap = '10px';
  popup.innerHTML = `
    <div style="font-size:2rem; color: #28a745;">✔️</div>
    <div>Order successfully!</div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

// ----- Active link sidebar tự động -----
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// ----- Highlight hiện tại trong sidebar khi dùng POST (form + button)
document.addEventListener('DOMContentLoaded', () => {
  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1]; // eg: "coffee", "tea", etc.

  document.querySelectorAll('.sidebar-link').forEach(button => {
    const page = button.dataset.page;
    if (page === currentPage) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
});

/////////////////////////////////////////////////// Hiển thị sản phẩm và xử lí giỏ hàng ////////////////////////////////////////////////
  window.onload = async function () {
  const productList = document.getElementById("productList");
  const res = await fetch("/customer/product_list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = await res.json();

  if (res.status === 302) {
    productList.innerHTML = "";

    result.products.forEach(product => {
      const item = document.createElement("div");
      item.className = "product-card";
      item.setAttribute("data-id", product.id);

      item.innerHTML = `
        <img src="https://static.vecteezy.com/system/resources/previews/010/856/650/non_2x/a-cup-of-coffee-with-coffee-beans-free-png.png" alt="${product.name}">
        <h3>${product.name}</h3>
        <div class="price">$${product.price}</div>
        <div class="quantity-control">
          <button onclick="decreaseQty(this)">−</button>
          <span>0</span>
          <button onclick="increaseQty(this)">+</button>
        </div>
        <button class="add-to-cart">Add to cart</button>
      `;

      // Gán sự kiện Add to cart
      const addToCartBtn = item.querySelector(".add-to-cart");
      addToCartBtn.addEventListener("click", () => {
        const qtySpan = item.querySelector(".quantity-control span");
        const quantity = parseInt(qtySpan.textContent);

        if (quantity > 0) {
          updateCart(product.id, quantity, product.name);

          // Reset số lượng về 0 sau khi thêm vào giỏ
          qtySpan.textContent = "0";
        }
      });

      productList.appendChild(item);
    });
  } else if (res.status >= 400 && res.status <= 600) {
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.classList.add("show");
      errorMessage.textContent = result.error;
    }
  }
};

// Quantity functions
function increaseQty(btn) {
  const span = btn.previousElementSibling;
  span.textContent = parseInt(span.textContent) + 1;
}

function decreaseQty(btn) {
  const span = btn.nextElementSibling;
  const current = parseInt(span.textContent);
  if (current > 0) span.textContent = current - 1;
}

// ✅ Hàm updateCart lưu vào localStorage
function updateCart(productId, quantity, productName) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity; // tăng số lượng nếu đã có
  } else {
    cart.push({ id: productId, name: productName, quantity });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Cart updated:", cart);
  showSuccessPopup("Add successfully item to cart!");
}

//Hiển thị cart
cartBtn.addEventListener("click", () => {
  showCartItems();  // thêm dòng này vào sự kiện mở cart
});

function showCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems.innerHTML = "";

  if (cart.length === 0){
    cartItems.innerHTML = `<p class="empty">Your cart is empty!</p>`;
    cartTotal.textContent = "0.00";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.style.position = "relative";
    itemEl.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-quantity">x${item.quantity}</span>
      <button class="remove-btn" onclick="removeCartItem(${index})">X</button>
    `;
    cartItems.appendChild(itemEl);
    total += item.quantity * 5; // cần thay bằng giá thực tế nếu có
  });

  cartTotal.textContent = total.toFixed(2);
}

//Xóa từng item
function removeCartItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCartItems();
}

//xóa giỏ hàng
clearCartBtn.addEventListener('click', () => {
  localStorage.removeItem("cart");
  showCartItems();
});

/////////////////////////////////////////////Tạo order//////////////////////////////////////////////////
class OrderCreate_Request
{
    constructor(items, tableID, approved) 
    {
        this.items = items;
        this.tableID = tableID;
        this.approved = approved;
    }

    toJson()
    {
        let tempProducts = [];

	for (let i = 0; i < this.items.length; i++) {
   	 	tempProducts[i] = this.items[i].toJson();
  	}
        return {
            items: tempProducts,
            tableID: this.tableID,  
            approved: this.approved,
        };
    }
}

class Product {
    constructor(id, quantity) {
        this.id = id;
        this.quantity = quantity;
    }

    toJson() {
        return {
            productID: this.id,
            quantity: this.quantity
        };
    }
}

function addProduct()
{
    const ingredientsContainer = document.getElementById("IngredientsContainer");
    const div = document.createElement("div");
    optionValues = getIngredientNames();
    div.className = "Ingredient";
    div.innerHTML = `
        <select class="IngredientSelect" id="IngredientName${ingredientIndex}" placeholder="-- Select Ingredient --">
            <option value="1">-- Select Ingredient --</option>
            ${optionValues}
        </select>
        <input type="number" min="1" class="QuantityInput InputFocus" placeholder="Amount (e.g., 200 ml)" id="Quantity${ingredientIndex}">
        <button class="RemoveButton" onclick="removeIngredient(this)">−</button>
        `;
    ingredientIndex++;
    ingredientsContainer.appendChild(div);
}

document.querySelector('.send-cart-btn').addEventListener("click", async function ()
{
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productIndex = cart.length;
    items = [];
    for (i = 0; i < productIndex; i++)
    {
        const id = cart[i].id;
        
        if (id == null) continue;
        const quantity = cart[i].quantity;
        
        if (!id || !quantity) continue
        items.push(new Product(id, quantity));
    }

	  const tableID = encodeURIComponent(getCookie("TableID"));
    console.log(tableID)
    const request = new OrderCreate_Request(items, tableID, false);
    
    console.log(request.toJson());

        const res = await fetch("/customer/order_create", {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request.toJson())
        });

        const result = await res.json();
    	if (res.status == 201)
    	{
        	alert("Order Send !!!");
          localStorage.removeItem("cart");
          showCartItems();
    	}
    	else if (res.status >= 400 && res.status <= 600)
    	{
        	if (result["error"] == "Unauthorized")
        	{
          	 	window.location.href = "/manager/login";
            		return;
        	}
        	console.log("Server Error: " + result["error"]);
    	}
    	else
    	{
       		console.log("Unexpected Error: " + result["error"]);
    	}

});

///////////////////////////////////////Gọi để hiển thị List Order/////////////////////////////////////
//===========================================Class============================================
class UserInfo_Request {
    constructor(username) {
        this.username = username;
    }
    toJson() {
        return {
            username: this.username
        };
    }
}

class ListOrders_Request {
    constructor(tableID) {
        // this.orderstatus = orderstatus;
        this.tableID = tableID;
    }
    toJson() {
        return {
            // orderStatus: this.orderstatus,
            tableID: this.tableID
        };
    }
}

class UserInfo_Response {
    constructor(data) {
        this.username = data['username'];
        this.name = data['name'];
        this.email = data['email'];
        this.phone = data['phone'];
        this.dateOfBirth = data['dateOfBirth'];
        this.gender = data['gender'];
        this.roles = data['roles'];
    }
}

////////////////////////////////////////////Lấy thông tin các order////////////////////////////////////////////////
let lastOrderBillData = "";

document.getElementById('orderBtn').addEventListener("click", async function () {
    const orderList = document.getElementById("listOrdered");
    const tableID = encodeURIComponent(getCookie("TableID"));
    const request1 = new ListOrders_Request(tableID);

    try {
        const res1 = await fetch("/cashier/order_list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request1.toJson())
        });

        const result = await res1.json();

        const emptyOrderMsg = document.querySelector(".empty-order");

        if (res1.status === 302) {
            const ordersString = JSON.stringify(result.orders);
            if (ordersString === lastOrderBillData) return;

            lastOrderBillData = ordersString;
            orderList.innerHTML = "";

            if (result.orders.length === 0) {
                if (emptyOrderMsg) emptyOrderMsg.style.display = "block"; // Hiện thông báo
                return;
            } else {
                if (emptyOrderMsg) emptyOrderMsg.style.display = "none"; // Ẩn thông báo
            }

            result.orders.forEach(order => {
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("order-block");

                // ✅ Format thời gian từ timestamp dạng milliseconds
                let orderTime = "Unknown time";
                if (order.orderTimestamp) {
                    const dateObj = new Date(order.orderTimestamp);
                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    orderTime = `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
                }

                // Header thời gian
                const header = document.createElement("div");
                header.classList.add("order-header-time");
                header.innerHTML = `<strong>Order at:</strong> ${orderTime}`;
                orderDiv.appendChild(header);

                // Sản phẩm trong đơn hàng
                order.items.forEach(item => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("order-item");

                    const price = item.priceAtOrder !== undefined ? item.priceAtOrder : 0;

                    itemDiv.innerHTML = `
                        <span>${item.productName}</span>
                        <span>${item.quantity} × $${price.toFixed(2)}</span>
                    `;
                    orderDiv.appendChild(itemDiv);
                });

                // Tổng tiền
                const totalDiv = document.createElement("div");
                totalDiv.classList.add("order-total");
                const total = order.total !== undefined ? order.total : 0;
                totalDiv.innerHTML = `<strong>Total:</strong> $${total.toFixed(2)}`;
                orderDiv.appendChild(totalDiv);

                // Append vào danh sách
                orderList.appendChild(orderDiv);
            });

        } else if (res1.status >= 400 && res1.status <= 600) {
            if (ErrorMessage) {
                ErrorMessage.classList.add("show");
                ErrorMessage.textContent = result.error;
            }
        }
    } catch (err) {
        console.error("Error fetching orders:", err);
        if (ErrorMessage) {
            ErrorMessage.classList.add("show");
            ErrorMessage.textContent = "Something went wrong while loading orders.";
        }
    }
});

