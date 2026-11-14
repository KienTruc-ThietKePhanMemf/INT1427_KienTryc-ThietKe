USE mini_inventory_db;

SET @user_id = (
  SELECT id FROM users WHERE email = 'admin@kho.vn' LIMIT 1
);

INSERT INTO suppliers (user_id, supplier_name, phone, email, address)
SELECT @user_id, 'Công ty Thiết bị Minh Khang', '0901000001',
       'minhkhang@example.com', 'Quận 1, TP. Hồ Chí Minh'
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE user_id = @user_id AND supplier_name = 'Công ty Thiết bị Minh Khang'
  );

INSERT INTO suppliers (user_id, supplier_name, phone, email, address)
SELECT @user_id, 'Phân phối Á Châu', '0901000002',
       'achau@example.com', 'Quận Hải Châu, Đà Nẵng'
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE user_id = @user_id AND supplier_name = 'Phân phối Á Châu'
  );

INSERT INTO suppliers (user_id, supplier_name, phone, email, address)
SELECT @user_id, 'Văn phòng phẩm Việt Nhật', '0901000003',
       'vietnhat@example.com', 'Quận Cầu Giấy, Hà Nội'
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE user_id = @user_id AND supplier_name = 'Văn phòng phẩm Việt Nhật'
  );

INSERT INTO suppliers (user_id, supplier_name, phone, email, address)
SELECT @user_id, 'Bao bì Thành Công', '0901000004',
       'thanhcong@example.com', 'TP. Thủ Đức, TP. Hồ Chí Minh'
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE user_id = @user_id AND supplier_name = 'Bao bì Thành Công'
  );

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-KB01', 'Bàn phím cơ không dây RK61 RGB', 'Cái',
       650000, 950000, 8, 5
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Linh kiện điện tử'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-KB01');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-MS02', 'Chuột Gaming Logitech G102 Lightsync', 'Cái',
       300000, 450000, 28, 10
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Linh kiện điện tử'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-MS02');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-MN03', 'Màn hình Dell UltraSharp 24 inch', 'Chiếc',
       4800000, 6200000, 2, 5
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Linh kiện điện tử'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-MN03');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-HD04', 'Tai nghe chống ồn Sony WH-1000XM4', 'Chiếc',
       5200000, 6990000, 12, 4
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Linh kiện điện tử'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-HD04');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-ST05', 'Giấy in văn phòng Double A A4 80gsm', 'Ream',
       68000, 95000, 1, 10
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Văn phòng phẩm'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-ST05');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-USB06', 'USB Kingston DataTraveler 64GB', 'Cái',
       125000, 190000, 40, 12
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Linh kiện điện tử'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-USB06');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-LD07', 'Đèn bàn LED chống cận', 'Cái',
       180000, 290000, 6, 5
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Đồ gia dụng'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-LD07');

INSERT INTO products
  (user_id, category_id, sku, product_name, unit, buy_price, sell_price, stock_quantity, min_threshold)
SELECT @user_id, c.id, 'SP-BOX08', 'Thùng carton đóng hàng 30x20x20cm', 'Thùng',
       8000, 15000, 15, 10
FROM categories c
WHERE @user_id IS NOT NULL
  AND c.user_id IS NULL AND c.category_name = 'Bao bì & Đóng gói'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SP-BOX08');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 20, 'Mẫu demo: nhập lô đầu bàn phím', DATE_SUB(NOW(), INTERVAL 9 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Công ty Thiết bị Minh Khang'
WHERE p.sku = 'SP-KB01' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu bàn phím');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 12, 'Mẫu demo: xuất bàn phím', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM products p
WHERE p.sku = 'SP-KB01' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất bàn phím');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 35, 'Mẫu demo: nhập lô đầu chuột', DATE_SUB(NOW(), INTERVAL 12 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Công ty Thiết bị Minh Khang'
WHERE p.sku = 'SP-MS02' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu chuột');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 7, 'Mẫu demo: xuất chuột', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM products p
WHERE p.sku = 'SP-MS02' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất chuột');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 5, 'Mẫu demo: nhập lô đầu màn hình', DATE_SUB(NOW(), INTERVAL 15 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Phân phối Á Châu'
WHERE p.sku = 'SP-MN03' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu màn hình');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 3, 'Mẫu demo: xuất màn hình', DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM products p
WHERE p.sku = 'SP-MN03' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất màn hình');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 15, 'Mẫu demo: nhập lô đầu tai nghe', DATE_SUB(NOW(), INTERVAL 18 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Phân phối Á Châu'
WHERE p.sku = 'SP-HD04' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu tai nghe');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 3, 'Mẫu demo: xuất tai nghe', DATE_SUB(NOW(), INTERVAL 4 DAY)
FROM products p
WHERE p.sku = 'SP-HD04' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất tai nghe');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 25, 'Mẫu demo: nhập lô đầu giấy in', DATE_SUB(NOW(), INTERVAL 14 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Văn phòng phẩm Việt Nhật'
WHERE p.sku = 'SP-ST05' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu giấy in');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 24, 'Mẫu demo: xuất giấy in', DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM products p
WHERE p.sku = 'SP-ST05' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất giấy in');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 50, 'Mẫu demo: nhập lô đầu USB', DATE_SUB(NOW(), INTERVAL 11 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Công ty Thiết bị Minh Khang'
WHERE p.sku = 'SP-USB06' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu USB');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 10, 'Mẫu demo: xuất USB', DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM products p
WHERE p.sku = 'SP-USB06' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất USB');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 10, 'Mẫu demo: nhập lô đầu đèn bàn', DATE_SUB(NOW(), INTERVAL 8 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Phân phối Á Châu'
WHERE p.sku = 'SP-LD07' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu đèn bàn');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 4, 'Mẫu demo: xuất đèn bàn', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM products p
WHERE p.sku = 'SP-LD07' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất đèn bàn');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, s.id, 'IMPORT', 20, 'Mẫu demo: nhập lô đầu thùng carton', DATE_SUB(NOW(), INTERVAL 16 DAY)
FROM products p
JOIN suppliers s ON s.user_id = @user_id AND s.supplier_name = 'Bao bì Thành Công'
WHERE p.sku = 'SP-BOX08' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: nhập lô đầu thùng carton');

INSERT INTO stock_movements (user_id, product_id, supplier_id, movement_type, quantity, note, created_at)
SELECT @user_id, p.id, NULL, 'EXPORT', 5, 'Mẫu demo: xuất thùng carton', DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM products p
WHERE p.sku = 'SP-BOX08' AND p.user_id = @user_id
  AND NOT EXISTS (SELECT 1 FROM stock_movements WHERE user_id = @user_id AND note = 'Mẫu demo: xuất thùng carton');
