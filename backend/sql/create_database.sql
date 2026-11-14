CREATE DATABASE IF NOT EXISTS mini_inventory_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_inventory_db;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_id (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  category_name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_categories_id (id),
  KEY ix_categories_user_id (user_id),
  CONSTRAINT fk_categories_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  supplier_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  address VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_suppliers_id (id),
  KEY ix_suppliers_user_id (user_id),
  CONSTRAINT fk_suppliers_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  sku VARCHAR(50) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  buy_price DECIMAL(15, 2) NOT NULL,
  sell_price DECIMAL(15, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_threshold INT NOT NULL DEFAULT 5,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_id (id),
  KEY ix_products_user_id (user_id),
  KEY ix_products_category_id (category_id),
  CONSTRAINT fk_products_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_products_category_id
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  supplier_id INT NULL,
  movement_type VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  note VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_stock_movements_id (id),
  KEY ix_stock_movements_user_id (user_id),
  KEY ix_stock_movements_product_id (product_id),
  KEY ix_stock_movements_supplier_id (supplier_id),
  KEY ix_stock_movements_created_at (created_at),
  CONSTRAINT fk_stock_movements_user_id
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_movements_product_id
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_movements_supplier_id
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO categories (user_id, category_name)
SELECT NULL, 'Linh kiện điện tử'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id IS NULL AND category_name = 'Linh kiện điện tử'
);

INSERT INTO categories (user_id, category_name)
SELECT NULL, 'Đồ gia dụng'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id IS NULL AND category_name = 'Đồ gia dụng'
);

INSERT INTO categories (user_id, category_name)
SELECT NULL, 'Bao bì & Đóng gói'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id IS NULL AND category_name = 'Bao bì & Đóng gói'
);

INSERT INTO categories (user_id, category_name)
SELECT NULL, 'Văn phòng phẩm'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id IS NULL AND category_name = 'Văn phòng phẩm'
);

INSERT INTO categories (user_id, category_name)
SELECT NULL, 'Khác'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE user_id IS NULL AND category_name = 'Khác'
);
