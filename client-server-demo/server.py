"""SERVER: nhận request từ client, xử lý, lưu dữ liệu và trả response (JSON)."""
import json
import os
import threading
from datetime import datetime

from flask import Flask, jsonify, request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data.json")

app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "static"), static_url_path="")
lock = threading.Lock()   # nhiều client gửi cùng lúc -> cần khóa khi ghi dữ liệu
server_log = []           # nhật ký mọi request mà server nhận được

CATEGORIES = ["Ăn uống", "Đi lại", "Học tập", "Giải trí", "Nhà trọ", "Lương", "Khác"]


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"next_id": 1, "items": []}


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.after_request
def log_request(response):
    if request.path.startswith("/api") and request.path != "/api/server-log":
        server_log.append({
            "time": datetime.now().strftime("%H:%M:%S"),
            "client": request.headers.get("X-Client-Id", request.remote_addr),
            "method": request.method,
            "path": request.full_path.rstrip("?"),
            "status": response.status_code,
        })
        del server_log[:-50]
    return response


@app.get("/")
def index():
    return app.send_static_file("index.html")


@app.get("/api/categories")
def categories():
    return jsonify(CATEGORIES)


@app.get("/api/transactions")
def list_transactions():
    with lock:
        items = load_data()["items"]
    return jsonify(sorted(items, key=lambda t: (t["date"], t["id"]), reverse=True))


@app.post("/api/transactions")
def add_transaction():
    body = request.get_json(silent=True) or {}
    kind = body.get("type")
    category = body.get("category")
    amount = body.get("amount")
    if kind not in ("income", "expense"):
        return jsonify(error="type phải là 'income' hoặc 'expense'"), 400
    if category not in CATEGORIES:
        return jsonify(error="Danh mục không hợp lệ"), 400
    if not isinstance(amount, int) or amount <= 0:
        return jsonify(error="Số tiền phải là số nguyên dương"), 400
    with lock:
        data = load_data()
        item = {
            "id": data["next_id"],
            "type": kind,
            "category": category,
            "amount": amount,
            "note": str(body.get("note", ""))[:100],
            "date": body.get("date") or datetime.now().strftime("%Y-%m-%d"),
        }
        data["next_id"] += 1
        data["items"].append(item)
        save_data(data)
    return jsonify(item), 201


@app.delete("/api/transactions/<int:item_id>")
def delete_transaction(item_id):
    with lock:
        data = load_data()
        before = len(data["items"])
        data["items"] = [t for t in data["items"] if t["id"] != item_id]
        if len(data["items"]) == before:
            return jsonify(error="Không tìm thấy giao dịch"), 404
        save_data(data)
    return jsonify(deleted=item_id)


@app.get("/api/summary")
def summary():
    with lock:
        items = load_data()["items"]
    income = sum(t["amount"] for t in items if t["type"] == "income")
    expense = sum(t["amount"] for t in items if t["type"] == "expense")
    by_category = {}
    for t in items:
        if t["type"] == "expense":
            by_category[t["category"]] = by_category.get(t["category"], 0) + t["amount"]
    return jsonify(income=income, expense=expense, balance=income - expense, by_category=by_category)


@app.get("/api/server-log")
def get_server_log():
    return jsonify(server_log[::-1])


if __name__ == "__main__":
    # host=0.0.0.0 để máy khác trong cùng mạng Wi-Fi cũng làm client được
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
