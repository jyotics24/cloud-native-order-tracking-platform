# from flask import Flask, request, jsonify

# app = Flask(__name__)

# orders = {}

# @app.route("/")
# def home():
#     return {
#         "message": "Cloud Native Order Tracking Platform Running on EKS"
#     }

# @app.route("/health")
# def health():
#     return {
#         "status": "healthy"
#     }

# @app.route("/orders", methods=["POST"])
# def create_order():
#     data = request.json
#     order_id = str(len(orders) + 1)

#     orders[order_id] = {
#         "order_id": order_id,
#         "customer": data.get("customer"),
#         "product": data.get("product"),
#         "status": "Created"
#     }

#     return jsonify(orders[order_id]), 201

# @app.route("/orders", methods=["GET"])
# def get_orders():
#     return jsonify(list(orders.values()))

# @app.route("/orders/<order_id>", methods=["GET"])
# def get_order(order_id):
#     if order_id not in orders:
#         return jsonify({"error": "Order not found"}), 404
#     return jsonify(orders[order_id])

# @app.route("/orders/<order_id>/status", methods=["PUT"])
# def update_status(order_id):
#     if order_id not in orders:
#         return jsonify({"error": "Order not found"}), 404
#     data = request.json
#     orders[order_id]["status"] = data.get("status")
#     return jsonify(orders[order_id])

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)
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
    data = request.json

    order_id = str(len(orders) + 1)

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

    data = request.json
    orders[order_id]["status"] = data.get("status")

    return jsonify(orders[order_id])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)