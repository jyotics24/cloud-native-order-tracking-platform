const STATUS_FLOW = ["Created", "Processing", "Shipped", "Delivered"];
let allOrders = [];

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  document.getElementById('time-display').textContent = time;
}

function switchTab(tab) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(tab + '-view').classList.add('active');

  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  event.target.closest('.menu-item').classList.add('active');

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Live order tracking' },
    orders: { title: 'Orders', subtitle: 'Create and manage orders' },
    analytics: { title: 'Analytics', subtitle: 'Performance metrics' }
  };

  document.getElementById('page-title').textContent = titles[tab].title;
  document.getElementById('page-subtitle').textContent = titles[tab].subtitle;
}

function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

async function createOrder() {
  const customerInput = document.getElementById("customer");
  const productInput = document.getElementById("product");
  const btn = document.querySelector('.btn-submit');
  const btnText = document.querySelector('.btn-text');
  const loader = document.querySelector('.btn-loader');

  const customer = customerInput.value.trim();
  const product = productInput.value.trim();

  if (!customer || !product) {
    showFormMessage("❌ Please fill in all fields", "error");
    return;
  }

  btn.disabled = true;
  btnText.style.display = 'none';
  loader.style.display = 'inline';

  try {
    const response = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, product })
    });

    if (!response.ok) throw new Error();

    customerInput.value = "";
    productInput.value = "";
    showFormMessage("✅ Order created successfully!", "success");

    await new Promise(r => setTimeout(r, 800));
    await loadOrders();

  } catch (e) {
    showFormMessage("❌ Failed to create order", "error");
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    loader.style.display = 'none';
  }
}

function showFormMessage(text, type) {
  const el = document.getElementById("form-msg");
  el.textContent = text;
  el.style.color = type === "error" ? "#EF4444" : "#10B981";
  el.style.background = type === "error" ? "#FEE2E2" : "#ECFDF5";
  el.style.padding = "12px";
  el.style.borderRadius = "8px";
}

async function loadOrders() {
  try {
    const response = await fetch("/orders");
    allOrders = await response.json();
    updateStats(allOrders);
    renderOrders(allOrders);
  } catch (e) {
    console.error(e);
  }
}

function renderOrders(orders) {
  const list = document.getElementById("orders-list");

  if (!orders.length) {
    list.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">📭</div>
        <p>No orders yet</p>
        <span>Create your first order to get started</span>
      </div>
    `;
    return;
  }

  const sorted = [...orders].reverse();
  list.innerHTML = sorted.map((order, idx) => `
    <div style="animation-delay: ${idx * 0.05}s">
      <div class="col-id">#${(order.order_id || "").toString().slice(0, 8)}</div>
      <div class="col-customer">${escapeHtml(order.customer)}</div>
      <div class="col-product">${escapeHtml(order.product)}</div>
      <div class="col-status">
        <span class="status-badge status-${order.status ? order.status.toLowerCase() : 'created'}">
          ${escapeHtml(order.status || "Created")}
        </span>
      </div>
      <div class="col-time">Just now</div>
    </div>
  `).join("");
}

function updateStats(orders) {
  const animate = (el, value) => {
    el.style.animation = 'none';
    setTimeout(() => {
      el.style.animation = 'pulse 0.6s ease-out';
      el.textContent = value;
    }, 10);
  };

  animate(document.getElementById("stat-total"), orders.length);
  animate(document.getElementById("ana-total"), orders.length);

  const created = orders.filter(o => (o.status || "Created") === "Created").length;
  animate(document.getElementById("stat-created"), created);

  const shipped = orders.filter(o => o.status === "Shipped").length;
  animate(document.getElementById("stat-shipped"), shipped);

  const delivered = orders.filter(o => o.status === "Delivered").length;
  animate(document.getElementById("stat-delivered"), delivered);

  const completion = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;
  animate(document.getElementById("ana-completion"), completion + "%");

  // Update chart bars
  const total = orders.length || 1;
  document.getElementById("bar-created").style.width = (created / total * 100) + "%";
  document.getElementById("val-created").textContent = created;

  const processing = orders.filter(o => o.status === "Processing").length;
  document.getElementById("bar-processing").style.width = (processing / total * 100) + "%";
  document.getElementById("val-processing").textContent = processing;

  document.getElementById("bar-shipped").style.width = (shipped / total * 100) + "%";
  document.getElementById("val-shipped").textContent = shipped;

  document.getElementById("bar-delivered").style.width = (delivered / total * 100) + "%";
  document.getElementById("val-delivered").textContent = delivered;
}

function filterByStatus(status) {
  const filtered = allOrders.filter(o => o.status === status);
  renderOrders(filtered);
}

function exportOrders() {
  if (allOrders.length === 0) {
    alert("No orders to export");
    return;
  }
  const csv = "ID,Customer,Product,Status\n" + allOrders.map(o =>
    `${o.order_id},${o.customer},${o.product},${o.status}`
  ).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders.csv';
  a.click();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  updateClock();
  setInterval(updateClock, 1000);

  const searchBox = document.getElementById("search-order");
  if (searchBox) {
    let searchTimeout;
    searchBox.addEventListener("input", e => {
      clearTimeout(searchTimeout);
      const search = e.target.value.toLowerCase().trim();
      searchTimeout = setTimeout(() => {
        const filtered = allOrders.filter(order =>
          (order.customer || "").toLowerCase().includes(search) ||
          (order.product || "").toLowerCase().includes(search)
        );
        renderOrders(filtered);
      }, 200);
    });
  }

  // Auto-refresh every 5 seconds
  setInterval(() => { loadOrders(); }, 5000);

  // Set first menu item active
  document.querySelector('.menu-item').classList.add('active');
});
