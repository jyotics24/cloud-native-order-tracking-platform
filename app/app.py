import uuid
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

orders = {}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/health")
def health():
    return {
        "status": "healthy"
    }

@app.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json(silent=True)

    if not data or "customer" not in data or "product" not in data:
        return jsonify({"error": "customer and product are required"}), 400

    order_id = str(uuid.uuid4())

    orders[order_id] = {
        "order_id": order_id,
        "customer": data.get("customer"),
        "product": data.get("product"),
        "status": "Created"
    }

    return jsonify(orders[order_id]), 201

@app.route("/orders", methods=["GET"])
def get_orders():
    return jsonify(list(orders.values()))

@app.route("/orders/<order_id>", methods=["GET"])
def get_order(order_id):
    if order_id not in orders:
        return jsonify({"error": "Order not found"}), 404

    return jsonify(orders[order_id])

@app.route("/orders/<order_id>/status", methods=["PUT"])
def update_status(order_id):
    if order_id not in orders:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json(silent=True)
    if not data or "status" not in data:
        return jsonify({"error": "status is required"}), 400

    orders[order_id]["status"] = data.get("status")

    return jsonify(orders[order_id])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
