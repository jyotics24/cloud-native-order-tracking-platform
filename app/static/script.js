const STATUS_FLOW = [
"Created",
"Processing",
"Shipped",
"Delivered"
];

let allOrders = [];

const animateOnScroll = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
};

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
el.style.animation = 'none';

setTimeout(() => {
  el.style.animation = 'fadeInUp .3s ease-out';
}, 10);

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
const btn = document.querySelector('.btn-create');
const btnText = document.querySelector('.btn-text');
const btnSpinner = document.querySelector('.btn-spinner');

const customer = customerInput.value.trim();
const product = productInput.value.trim();

if (!customer || !product) {
showMessage(
"Please enter customer and product name.",
"error"
);
return;
}

btn.disabled = true;
btnText.style.display = 'none';
btnSpinner.style.display = 'inline';

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
  "✓ Order created successfully!",
  "success"
);

await new Promise(resolve => setTimeout(resolve, 600));
await loadOrders();

} catch (e) {

showMessage(
  "✗ Failed to create order.",
  "error"
);

} finally {
btn.disabled = false;
btnText.style.display = 'inline';
btnSpinner.style.display = 'none';
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
    <div style="font-size:40px;margin-bottom:12px;">📭</div>
    No Orders Yet
  </div>
`;

return;
}

const sorted = [...orders].reverse();

list.innerHTML = sorted.map((order, idx) => `
<div class="order-card" style="animation-delay:${idx * 0.05}s">
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

const animateCount = (el, newValue) => {
  const current = parseInt(el.textContent) || 0;
  if (current === newValue) return;

  el.style.animation = 'none';
  setTimeout(() => {
    el.style.animation = 'pulse 0.5s ease-out';
    el.textContent = newValue;
  }, 10);
};

animateCount(
  document.getElementById("stat-total"),
  orders.length
);

animateCount(
  document.getElementById("stat-created"),
  orders.filter(o => (o.status || "Created") === "Created").length
);

animateCount(
  document.getElementById("stat-shipped"),
  orders.filter(o => o.status === "Shipped").length
);

animateCount(
  document.getElementById("stat-delivered"),
  orders.filter(o => o.status === "Delivered").length
);
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
animateOnScroll();

const searchBox =
  document.getElementById(
    "search-order"
  );

if (searchBox) {
  let searchTimeout;

  searchBox.addEventListener(
    "input",
    e => {
      clearTimeout(searchTimeout);

      const search =
        e.target.value
          .toLowerCase()
          .trim();

      searchTimeout = setTimeout(() => {
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
      }, 200);
    }
  );

}
}
);