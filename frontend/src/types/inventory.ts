/**
 * HỆ THỐNG QUẢN LÝ KHO MINI - TypeScript Domain Models
 */

// ==========================================
// 1. Categories
// ==========================================

export interface Category {
  id: number;
  category_name: string;
  user_id?: number | null; // null nếu là danh mục mặc định của hệ thống
  created_at: string;
}

export interface CategoryCreate {
  category_name: string;
}

export interface CategoryUpdate {
  category_name?: string;
}

// ==========================================
// 2. Suppliers
// ==========================================

export interface Supplier {
  id: number;
  supplier_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreate {
  supplier_name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierUpdate {
  supplier_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ==========================================
// 3. Products
// ==========================================

export interface Product {
  id: number;
  category_id: number;
  sku: string;
  product_name: string;
  unit: string;
  buy_price: number | string;
  sell_price: number | string;
  stock_quantity: number;
  min_threshold: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface ProductCreate {
  category_id: number;
  sku: string;
  product_name: string;
  unit: string;
  buy_price: number;
  sell_price: number;
  min_threshold: number;
}

export interface ProductUpdate {
  category_id?: number;
  sku?: string;
  product_name?: string;
  unit?: string;
  buy_price?: number;
  sell_price?: number;
  min_threshold?: number;
}

export interface ProductAdjust {
  real_quantity: number;
  reason?: string;
}

export interface ProductFilterParams {
  category_id?: number;
  low_stock?: boolean;
  search?: string;
}

// ==========================================
// 4. Stock Movements (Nhập / Xuất Kho)
// ==========================================

export type MovementType = 'IMPORT' | 'EXPORT';

export interface StockMovement {
  id: number;
  user_id: number;
  product_id: number;
  supplier_id?: number | null;
  movement_type: MovementType;
  quantity: number;
  note?: string | null;
  created_at: string;
  product?: Product | null;
  supplier?: Supplier | null;
}

export interface StockImportCreate {
  product_id: number;
  supplier_id: number;
  quantity: number;
  note?: string;
}

export interface StockExportCreate {
  product_id: number;
  quantity: number;
  note?: string;
}

export interface StockMovementFilterParams {
  page?: number;
  limit?: number;
  product_id?: number;
  supplier_id?: number;
  movement_type?: MovementType;
}

// ==========================================
// 5. Inventory Reports & Dashboard
// ==========================================

export interface InventoryOverview {
  total_products: number;
  total_stock_quantity: number;
  total_inventory_value: number | string;
  low_stock_count: number;
  recent_movements: StockMovement[];
}

export interface LowStockReport {
  total: number;
  items: Product[];
}

export interface TopProductItem {
  product_id: number;
  product_name: string;
  sku: string;
  total_imported: number;
  total_exported: number;
  total_movement: number;
}

