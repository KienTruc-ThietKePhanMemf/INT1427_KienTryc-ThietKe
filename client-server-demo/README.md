# Demo Client-Server: Quản lý chi tiêu sinh viên

## Chạy
```
pip install -r requirements.txt
python server.py
```
Mở trình duyệt: http://localhost:5000

## Kịch bản demo (khoảng 3 phút)
1. Thêm một khoản chi: nhìn bên phải thấy Client gửi `POST /api/transactions` và Server trả `201`.
2. Nhập số tiền âm hoặc bỏ trống: Server trả `400` kèm thông báo lỗi (server tự kiểm tra dữ liệu).
3. Mở tab thứ hai (hoặc điện thoại cùng Wi-Fi, vào http://<IP máy>:5000). Thêm dữ liệu ở tab này, tải lại tab kia: dữ liệu dùng chung vì lưu tập trung ở server.
4. Qua tab "Nhật ký server": thấy request của nhiều client (mỗi tab một mã).
5. Tắt server (Ctrl+C) rồi thêm giao dịch: client báo không kết nối được. Đây là minh họa nhược điểm single point of failure.

## Cấu trúc
- `server.py`: Server (Flask, REST API, lưu vào data.json)
- `static/index.html`: Client (HTML + JavaScript gọi API bằng fetch)
