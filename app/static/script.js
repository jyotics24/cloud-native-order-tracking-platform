const STATUS_FLOW = [
"Created",
"Processing",
"Shipped",
"Delivered"
];

let allOrders = [];

function statusClass(status) {
const key = (status || "Created").toLowerCase();

if (key === "processing") return "status-processing";
if (key === "shipped") return "status-shipped";
if (key === "delivered") return "status-delivered";

return "status-created";
}

function showMessage(text, type) {
const el = document.getElementById("form-msg");

el.textContent = text;

if (type === "error") {
el.style.color = "#D32F2F";
} else if (type === "success") {
el.style.color = "#2E7D32";
} else {
el.style.color = "#555";
}
}

function renderTracker(status) {

const currentIndex = STATUS_FLOW.indexOf(status);

return ` <div class="order-progress">
  ${STATUS_FLOW.map((step, index) => `
    <div class="progress-step">
      <div class="progress-dot ${
        index <= currentIndex ? "active" : ""
      }"></div>
      <span>${step}</span>
    </div>
  `).join("")}
</div>
`;
}

async function createOrder() {

const customerInput = document.getElementById("customer");
const productInput = document.getElementById("product");

const customer = customerInput.value.trim();
const product = productInput.value.trim();

if (!customer || !product) {
showMessage(
"Please enter customer and product name.",
"error"
);
return;
}

showMessage("Creating order...");

try {
const response = await fetch("/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    customer,
    product
  })
});

if (!response.ok) {
  throw new Error();
}

customerInput.value = "";
productInput.value = "";

showMessage(
  "Order created successfully.",
  "success"
);

loadOrders();

} catch (e) {
showMessage(
  "Failed to create order.",
  "error"
);
}
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
  <div id="empty-state">
    No orders found
  </div>
`;

return;
}

const sorted = [...orders].reverse();

list.innerHTML = sorted.map(order => `
<div class="order-card">
  <div class="order-main">
    <span class="order-id">
      ORDER #${(order.order_id || "")
        .toString()
        .slice(0,8)}
    </span>
    <span class="order-title">
      📦 ${escapeHtml(order.product)}
    </span>
    <span class="order-customer">
      Customer: ${escapeHtml(order.customer)}
    </span>
  </div>
  ${renderTracker(
    order.status || "Created"
  )}
  <div class="status-pill ${
    statusClass(order.status)
  }">
    ${escapeHtml(
      order.status || "Created"
    )}
  </div>
</div>
`).join("");
}

function updateStats(orders) {

document.getElementById(
"stat-total"
).textContent = orders.length;

document.getElementById(
"stat-created"
).textContent =
orders.filter(
o => (o.status || "Created") === "Created"
).length;

document.getElementById(
"stat-shipped"
).textContent =
orders.filter(
o => o.status === "Shipped"
).length;

document.getElementById(
"stat-delivered"
).textContent =
orders.filter(
o => o.status === "Delivered"
).length;
}

function escapeHtml(str) {

if (!str) return "";

return String(str)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;");
}

document.addEventListener(
"DOMContentLoaded",
() => {
loadOrders();

const searchBox =
  document.getElementById(
    "search-order"
  );

if (searchBox) {
  searchBox.addEventListener(
    "input",
    e => {
      const search =
        e.target.value
          .toLowerCase()
          .trim();

      const filtered =
        allOrders.filter(order => {
          return (
            (order.customer || "")
              .toLowerCase()
              .includes(search)
            ||
            (order.product || "")
              .toLowerCase()
              .includes(search)
          );
        });

      renderOrders(filtered);
    }
  );
}
}
);