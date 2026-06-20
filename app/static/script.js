const STATUS_FLOW = ["Created", "Processing", "Shipped", "Delivered"];

function statusClass(status) {
  const key = (status || "Created").toLowerCase();
  if (key === "processing") return "status-processing";
  if (key === "shipped") return "status-shipped";
  if (key === "delivered") return "status-delivered";
  return "status-created";
}

function renderTracker(status) {
  const currentIndex = STATUS_FLOW.indexOf(status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  let html = "";
  STATUS_FLOW.forEach((step, i) => {
    const isDone = i <= activeIndex;
    html += `
      <div class="tracker-step">
        <div class="tracker-node ${isDone ? "is-done" : ""}"></div>
        ${i < STATUS_FLOW.length - 1
          ? `<div class="tracker-line ${i < activeIndex ? "is-done" : ""}"></div>`
          : ""
        }
      </div>
    `;
  });
  return html;
}

function showMessage(text, type) {
  const el = document.getElementById("form-msg");
  el.textContent = text;
  el.className = "form-msg" + (type ? ` is-${type}` : "");
}

async function createOrder() {
  const customerInput = document.getElementById("customer");
  const productInput = document.getElementById("product");
  const customer = customerInput.value.trim();
  const product = productInput.value.trim();

  if (!customer || !product) {
    showMessage("Enter both a customer name and a product.", "error");
    return;
  }

  showMessage("Creating order...", "");

  try {
    const response = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, product })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      showMessage(err.error || "Could not create order.", "error");
      return;
    }

    customerInput.value = "";
    productInput.value = "";
    showMessage("Order created.", "success");
    loadOrders();
  } catch (e) {
    showMessage("Network error — check the API connection.", "error");
  }
}

async function loadOrders() {
  let orders = [];
  try {
    const response = await fetch("/orders");
    orders = await response.json();
  } catch (e) {
    return;
  }

  updateStats(orders);

  const list = document.getElementById("orders-list");
  const emptyState = document.getElementById("empty-state");

  if (!orders.length) {
    list.innerHTML = "";
    list.appendChild(emptyState);
    return;
  }

  const sorted = [...orders].reverse();

  list.innerHTML = sorted.map(order => `
    <div class="order-card">
      <div class="order-main">
        <span class="order-id">#${(order.order_id || "").toString().slice(0, 8)}</span>
        <span class="order-title">${escapeHtml(order.product)}</span>
        <span class="order-customer">${escapeHtml(order.customer)}</span>
      </div>
      <div class="tracker">${renderTracker(order.status)}</div>
      <span class="status-pill ${statusClass(order.status)}">
        <span class="dot"></span> ${escapeHtml(order.status || "Created")}
      </span>
    </div>
  `).join("");
}

function updateStats(orders) {
  const total = orders.length;
  const created = orders.filter(o => (o.status || "Created") === "Created").length;
  const shipped = orders.filter(o => o.status === "Shipped").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-created").textContent = created;
  document.getElementById("stat-shipped").textContent = shipped;
  document.getElementById("stat-delivered").textContent = delivered;
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", loadOrders);