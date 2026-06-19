async function createOrder() {

    const customer =
        document.getElementById("customer").value;

    const product =
        document.getElementById("product").value;

    await fetch("/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer,
            product
        })
    });

    loadOrders();
}

async function loadOrders() {

    const response =
        await fetch("/orders");

    const orders =
        await response.json();

    let html = "";

    orders.forEach(order => {

        html += `
        <div class="order">
            <b>Order ID:</b> ${order.order_id}<br>
            <b>Customer:</b> ${order.customer}<br>
            <b>Product:</b> ${order.product}<br>
            <b>Status:</b> ${order.status}
        </div>
        `;
    });

    document.getElementById("orders").innerHTML = html;
}