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
const orderItems   = document.getElementById('orderItems');
const sendCartBtn  = document.querySelector('.send-cart-btn');
const clearOrdersBtn = document.querySelector('.clear-orders-btn');
const clearCartBtn = document.querySelector('.clear-cart-btn');

loadCartFromLocalStorage();
loadOrdersFromLocalStorage();

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

// ----- Hàm thêm sản phẩm vào giỏ ----- 
function addToCart(name, price, icon = '☕', quantity = 1) {
  let item = cartItems.querySelector(`[data-name="${name}"]`);
  if (item) {
    const qtyEl = item.querySelector('.qty');
    qtyEl.textContent = +qtyEl.textContent + quantity;
  } else {
    item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('data-name', name);
    item.innerHTML = `
      <div><span class="icon">${icon}</span> ${name}</div>
      <div>
        <span class="qty">${quantity}</span> × $${price.toFixed(2)}
        <button class="remove-item-btn" style="margin-left: 8px; background: #f44336; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer;">X</button>
      </div>
    `;
    cartItems.appendChild(item);

    // Gắn sự kiện cho nút "X" (xóa từng món)
    item.querySelector('.remove-item-btn').addEventListener('click', () => {
      item.remove();
      updateTotal();
      if (!cartItems.querySelector('.item')) {
        const emptyCart = document.createElement('p');
        emptyCart.className = 'empty';
        emptyCart.textContent = 'Your cart is empty!';
        cartItems.appendChild(emptyCart);
      }
      saveCartToLocalStorage();
    });
  }

  const emptyP = cartItems.querySelector('.empty');
  if (emptyP) emptyP.remove();

  updateTotal();
  showSuccessPopup();
  saveCartToLocalStorage(); // 🔥 thêm dòng này trong hàm đúng!
}

// ----- Xóa toàn bộ giỏ hàng -----
clearCartBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the cart?')) {
    while (cartItems.firstChild) {
      cartItems.removeChild(cartItems.firstChild);
    }
    const emptyCart = document.createElement('p');
    emptyCart.className = 'empty';
    emptyCart.textContent = 'Your cart is empty!';
    cartItems.appendChild(emptyCart);

    if (cartTotal) {
      cartTotal.textContent = '0.00';
    }
    saveCartToLocalStorage();
  }
});

// ----- Cập nhật tổng tiền ----- 
function updateTotal() {
  let total = 0;
  cartItems.querySelectorAll('.item').forEach(item => {
    const [qtyPart, pricePart] = item.querySelector('div:last-child').textContent.split('×');
    const qty   = parseInt(qtyPart);
    const price = parseFloat(pricePart.replace('$',''));
    total += qty * price;
  });
  
  // Kiểm tra xem cartTotal có tồn tại
  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2);
  } else {
    console.log('Cart total element not found!');
  }
}

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

// ----- Gắn sự kiện cho các nút "Add to cart" tự động (nếu có) ----- 
document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Tìm card cha để lấy tên + giá
      const card = btn.closest('.product-card');
      const name = card.querySelector('h3').textContent;
      const price = parseFloat(card.querySelector('.price').textContent.replace('$',''));
      const qty = parseInt(card.querySelector('.qty').textContent);  // Lấy số lượng từ input
      
      // Thêm vào giỏ với số lượng đã chọn
      addToCart(name, price, card.querySelector('.icon').textContent, qty);

      // Reset về 1 sau khi cho vào giỏ
      card.querySelector('.qty').textContent = '1';
    });
  });

// ----- Xử lý các nút tăng/giảm số lượng ----- 
document.querySelectorAll('.product-card').forEach(card => {
  const incBtn = card.querySelector('.inc');
  const decBtn = card.querySelector('.dec');
  const qtySpan = card.querySelector('.qty');
  
  incBtn.addEventListener('click', () => {
    qtySpan.textContent = parseInt(qtySpan.textContent) + 1;
  });
  
  decBtn.addEventListener('click', () => {
    if (parseInt(qtySpan.textContent) > 1) {
      qtySpan.textContent = parseInt(qtySpan.textContent) - 1;
    }
  });
});

// ----- Gửi giỏ hàng sang Orders ----- 
sendCartBtn.addEventListener('click', () => {
  // Kiểm tra xem giỏ hàng có trống không
  if (!cartItems.querySelector('.item')) {
    alert('Your cart is empty!');
    return;
  }
  
  // Tạo thẻ đơn hàng mới
  const orderDiv = document.createElement('div');
  orderDiv.className = 'order-group';
  
  // Tạo phần header đơn hàng với thời gian đặt hàng
  const orderHeader = document.createElement('div');
  orderHeader.className = 'order-header-item';
  const now = new Date();
  orderHeader.innerHTML = `
    <div style="font-weight: bold; padding: 8px 0;">
      Order at: ${now.toLocaleTimeString()} - ${now.toLocaleDateString()}
    </div>
  `;
  orderDiv.appendChild(orderHeader);
  
  // Copy các sản phẩm từ giỏ hàng sang
  cartItems.querySelectorAll('.item').forEach(item => {
    const orderItem = item.cloneNode(true);
    orderItem.className = 'order-item';
    orderItem.style.padding = '5px 0';
    orderItem.style.borderBottom = '1px solid #eee';

    // Xóa nút X 
    const removeBtn = orderItem.querySelector('.remove-item-btn');
    if (removeBtn) removeBtn.remove();
    
    orderDiv.appendChild(orderItem);
  });
  
  // Thêm tổng tiền
  const total = document.createElement('div');
  total.className = 'order-total';
  total.style.textAlign = 'right';
  total.style.fontWeight = 'bold';
  total.style.marginTop = '8px';
  total.textContent = `Total: $${cartTotal ? cartTotal.textContent : '0.00'}`;
  orderDiv.appendChild(total);
  
  // Xóa thông báo empty nếu có
  const emptyOrder = orderItems.querySelector('.empty-order');
  if (emptyOrder) {
    emptyOrder.remove();
  }
  
  // Thêm đơn hàng vào danh sách đơn
  orderItems.prepend(orderDiv);
  
  // Xóa sạch giỏ hàng
  while (cartItems.firstChild) {
    cartItems.removeChild(cartItems.firstChild);
  }
  
  // Thêm lại thông báo giỏ trống
  const emptyCart = document.createElement('p');
  emptyCart.className = 'empty';
  emptyCart.textContent = 'Your cart is empty!';
  cartItems.appendChild(emptyCart);
  
  // Cập nhật tổng tiền về 0
  if (cartTotal) {
    cartTotal.textContent = '0.00';
  }
  
  // Thông báo thành công
  showOrderSuccessPopup();
  
  // Tự động chuyển sang trang Order
  cartSidebar.classList.remove('active');
  orderSidebar.classList.add('active');

  saveOrdersToLocalStorage();
});

// ----- Xóa tất cả đơn hàng ----- 
clearOrdersBtn.addEventListener('click', () => {
  // Xác nhận trước khi xóa
  if (confirm('Are you sure you want to clear all orders?')) {
    // Xóa tất cả các đơn
    while (orderItems.firstChild) {
      orderItems.removeChild(orderItems.firstChild);
    }
    
    // Thêm lại thông báo không có đơn
    const emptyOrder = document.createElement('p');
    emptyOrder.className = 'empty-order';
    emptyOrder.textContent = 'You have not ordered yet!';
    orderItems.appendChild(emptyOrder);

    localStorage.removeItem('orders');
  }
});

// Lưu cart vào LocalStorage để không mất khi chuyển hướng
function saveCartToLocalStorage() {
  const items = [];
  cartItems.querySelectorAll('.item').forEach(item => {
    items.push({
      name: item.getAttribute('data-name'),
      qty: parseInt(item.querySelector('.qty').textContent),
      price: parseFloat(item.querySelector('div:last-child').textContent.split('×')[1].replace('$', '').trim()),
      icon: item.querySelector('.icon').textContent
    });
  });
  localStorage.setItem('cart', JSON.stringify(items));
}

function loadCartFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem('cart'));
  if (items && items.length > 0) {
    cartItems.innerHTML = ''; // clear trước
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      div.setAttribute('data-name', item.name);
      div.innerHTML = `
        <div><span class="icon">${item.icon}</span> ${item.name}</div>
        <div>
          <span class="qty">${item.qty}</span> × $${item.price.toFixed(2)}
          <button class="remove-item-btn" style="margin-left: 8px; background: #f44336; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer;">X</button>
        </div>
      `;
      cartItems.appendChild(div);

      // Gắn sự kiện xóa cho nút X
      div.querySelector('.remove-item-btn').addEventListener('click', () => {
        div.remove();
        updateTotal();
        if (!cartItems.querySelector('.item')) {
          const emptyCart = document.createElement('p');
          emptyCart.className = 'empty';
          emptyCart.textContent = 'Your cart is empty!';
          cartItems.appendChild(emptyCart);
        }
        saveCartToLocalStorage();
      });
    });
    updateTotal();
  }
}


// Lưu Order vào LocalStorage để không mất khi chuyển hướng
function saveOrdersToLocalStorage() {
  const orders = [];
  orderItems.querySelectorAll('.order-group').forEach(group => {
    const order = {
      time: group.querySelector('.order-header-item div').textContent.replace('Order at: ', '').trim(),
      items: []
    };
    group.querySelectorAll('.order-item').forEach(item => {
      order.items.push({
        name: item.getAttribute('data-name'),
        qty: parseInt(item.querySelector('.qty').textContent),
        price: parseFloat(item.querySelector('div:last-child').textContent.split('×')[1].replace('$', '').trim()),
        icon: item.querySelector('.icon').textContent
      });
    });
    order.total = group.querySelector('.order-total').textContent.replace('Total: $', '').trim();
    orders.push(order);
  });
  localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrdersFromLocalStorage() {
  const orders = JSON.parse(localStorage.getItem('orders'));
  if (orders && orders.length > 0) {
    orderItems.innerHTML = ''; // Xoá hết cũ
    orders.forEach(order => {
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-group';

      const orderHeader = document.createElement('div');
      orderHeader.className = 'order-header-item';
      orderHeader.innerHTML = `
        <div style="font-weight: bold; padding: 8px 0;">
          Order at: ${order.time}
        </div>
      `;
      orderDiv.appendChild(orderHeader);

      order.items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.setAttribute('data-name', item.name);
        orderItem.style.padding = '5px 0';
        orderItem.style.borderBottom = '1px solid #eee';
        orderItem.innerHTML = `
          <div><span class="icon">${item.icon}</span> ${item.name}</div>
          <div>
            <span class="qty">${item.qty}</span> × $${item.price.toFixed(2)}
          </div>
        `;
        orderDiv.appendChild(orderItem);
      });

      const total = document.createElement('div');
      total.className = 'order-total';
      total.style.textAlign = 'right';
      total.style.fontWeight = 'bold';
      total.style.marginTop = '8px';
      total.textContent = `Total: $${order.total}`;
      orderDiv.appendChild(total);

      orderItems.appendChild(orderDiv);
    });
  }
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
  const currentPath = window.location.pathname.split('/').pop(); // Lấy tên file
  document.querySelectorAll('.sidebar a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// ----- Back về Map -----
document.addEventListener("DOMContentLoaded", function() {
  const backBtn = document.getElementById('backBtn');
  backBtn.addEventListener('click', function() {
    window.location.href = '../../cafetest.html'; // 🔥 Đường dẫn về lại Map (quản lý quán cà phê)
  });
});