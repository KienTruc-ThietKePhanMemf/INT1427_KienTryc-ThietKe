import axiosClient from './axiosClient';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  InventoryOverview,
  LowStockReport,
  Product,
  ProductAdjust,
  ProductCreate,
  ProductFilterParams,
  ProductUpdate,
  StockExportCreate,
  StockImportCreate,
  StockMovement,
  StockMovementFilterParams,
  Supplier,
  SupplierCreate,
  SupplierUpdate,
} from '../types/inventory';

// ==========================================
// In-Memory Demo Fallback Data
// ==========================================

let demoCategories: Category[] = [
  { id: 1, category_name: 'Thiết bị điện tử', user_id: null, created_at: '2026-01-10T08:00:00' },
  { id: 2, category_name: 'Phụ kiện máy tính', user_id: null, created_at: '2026-01-10T08:00:00' },
  { id: 3, category_name: 'Văn phòng phẩm', user_id: null, created_at: '2026-01-10T08:00:00' },
  { id: 4, category_name: 'Linh kiện thay thế', user_id: 99, created_at: '2026-01-11T09:30:00' },
];

let demoSuppliers: Supplier[] = [
  {
    id: 1,
    supplier_name: 'Công ty TNHH Phân Phối Á Châu',
    phone: '0912345678',
    email: 'achau@supplier.vn',
    address: 'Số 12 Cầu Giấy, Hà Nội',
    user_id: 99,
    created_at: '2026-01-05T10:00:00',
    updated_at: '2026-01-05T10:00:00',
  },
  {
    id: 2,
    supplier_name: 'Tập Đoàn Thiết Bị Minh Khang',
    phone: '0987654321',
    email: 'minhkhang@supplier.vn',
    address: '45 Lê Duẩn, Quận 1, TP. HCM',
    user_id: 99,
    created_at: '2026-01-08T11:00:00',
    updated_at: '2026-01-08T11:00:00',
  },
  {
    id: 3,
    supplier_name: 'Tổng Kho Gia Dụng & VPP Việt Nhật',
    phone: '0905123456',
    email: 'vietnhat@supplier.vn',
    address: '23 Nguyễn Văn Linh, Đà Nẵng',
    user_id: 99,
    created_at: '2026-01-12T14:20:00',
    updated_at: '2026-01-12T14:20:00',
  },
];

let demoProducts: Product[] = [
  {
    id: 1,
    sku: 'SP-KB01',
    product_name: 'Bàn phím cơ không dây RK61 RGB',
    category_id: 2,
    unit: 'Cái',
    buy_price: 650000,
    sell_price: 950000,
    stock_quantity: 3,
    min_threshold: 5,
    user_id: 99,
    created_at: '2026-01-10T10:00:00',
    updated_at: '2026-01-10T10:00:00',
    category: { id: 2, category_name: 'Phụ kiện máy tính', created_at: '2026-01-10T08:00:00' },
  },
  {
    id: 2,
    sku: 'SP-MS02',
    product_name: 'Chuột Gaming Logitech G102 Lightsync',
    category_id: 2,
    unit: 'Cái',
    buy_price: 300000,
    sell_price: 450000,
    stock_quantity: 28,
    min_threshold: 10,
    user_id: 99,
    created_at: '2026-01-10T11:00:00',
    updated_at: '2026-01-10T11:00:00',
    category: { id: 2, category_name: 'Phụ kiện máy tính', created_at: '2026-01-10T08:00:00' },
  },
  {
    id: 3,
    sku: 'SP-MN03',
    product_name: 'Màn hình Dell UltraSharp 24 inch U2422H',
    category_id: 1,
    unit: 'Chiếc',
    buy_price: 4800000,
    sell_price: 6200000,
    stock_quantity: 2,
    min_threshold: 5,
    user_id: 99,
    created_at: '2026-01-11T09:00:00',
    updated_at: '2026-01-11T09:00:00',
    category: { id: 1, category_name: 'Thiết bị điện tử', created_at: '2026-01-10T08:00:00' },
  },
  {
    id: 4,
    sku: 'SP-HD04',
    product_name: 'Tai nghe chống ồn Sony WH-1000XM4',
    category_id: 1,
    unit: 'Chiếc',
    buy_price: 5200000,
    sell_price: 6990000,
    stock_quantity: 12,
    min_threshold: 3,
    user_id: 99,
    created_at: '2026-01-12T14:00:00',
    updated_at: '2026-01-12T14:00:00',
    category: { id: 1, category_name: 'Thiết bị điện tử', created_at: '2026-01-10T08:00:00' },
  },
  {
    id: 5,
    sku: 'SP-ST05',
    product_name: 'Giấy in văn phòng Double A A4 80gsm',
    category_id: 3,
    unit: 'Ream',
    buy_price: 68000,
    sell_price: 95000,
    stock_quantity: 1,
    min_threshold: 15,
    user_id: 99,
    created_at: '2026-01-13T16:00:00',
    updated_at: '2026-01-13T16:00:00',
    category: { id: 3, category_name: 'Văn phòng phẩm', created_at: '2026-01-10T08:00:00' },
  },
];

const demoMovements: StockMovement[] = [
  {
    id: 101,
    user_id: 99,
    product_id: 2,
    supplier_id: 2,
    movement_type: 'IMPORT',
    quantity: 30,
    note: 'Nhập lô chuột G102 từ Minh Khang',
    created_at: '2026-01-14T09:30:00',
    product: demoProducts[1],
    supplier: demoSuppliers[1],
  },
  {
    id: 102,
    user_id: 99,
    product_id: 2,
    supplier_id: null,
    movement_type: 'EXPORT',
    quantity: 2,
    note: 'Xuất lẻ cho khách',
    created_at: '2026-01-14T15:00:00',
    product: demoProducts[1],
  },
  {
    id: 103,
    user_id: 99,
    product_id: 3,
    supplier_id: 1,
    movement_type: 'IMPORT',
    quantity: 5,
    note: 'Nhập màn hình Dell',
    created_at: '2026-01-15T11:00:00',
    product: demoProducts[2],
    supplier: demoSuppliers[0],
  },
];

const isDemo = () => localStorage.getItem('token') === 'demo-token';

export const inventoryApi = {
  // ==========================================
  // Categories APIs
  // ==========================================
  getCategories: async (): Promise<Category[]> => {
    if (isDemo()) return [...demoCategories];
    try {
      const response = await axiosClient.get<Category[]>('/categories/');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoCategories];
      }
      throw err;
    }
  },

  createCategory: async (data: CategoryCreate): Promise<Category> => {
    if (isDemo()) {
      const newCat: Category = {
        id: demoCategories.length + 1,
        category_name: data.category_name,
        user_id: 99,
        created_at: new Date().toISOString(),
      };
      demoCategories.push(newCat);
      return newCat;
    }
    const response = await axiosClient.post<Category>('/categories/', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoryUpdate): Promise<Category> => {
    if (isDemo()) {
      const cat = demoCategories.find((c) => c.id === id);
      if (cat && data.category_name) {
        cat.category_name = data.category_name;
      }
      return cat || demoCategories[0];
    }
    const response = await axiosClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    if (isDemo()) {
      demoCategories = demoCategories.filter((c) => c.id !== id);
      return;
    }
    await axiosClient.delete(`/categories/${id}`);
  },

  initDefaultCategories: async (): Promise<{ message: string }> => {
    if (isDemo()) {
      return { message: 'Khởi tạo danh mục kho mặc định thành công! (Demo)' };
    }
    const response = await axiosClient.post<{ message: string }>('/categories/init-defaults');
    return response.data;
  },

  // ==========================================
  // Suppliers APIs
  // ==========================================
  getSuppliers: async (): Promise<Supplier[]> => {
    if (isDemo()) return [...demoSuppliers];
    try {
      const response = await axiosClient.get<Supplier[]>('/suppliers/');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoSuppliers];
      }
      throw err;
    }
  },

  getSupplierDetail: async (id: number): Promise<Supplier> => {
    if (isDemo()) {
      return demoSuppliers.find((s) => s.id === id) || demoSuppliers[0];
    }
    const response = await axiosClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: SupplierCreate): Promise<Supplier> => {
    if (isDemo()) {
      const newSup: Supplier = {
        id: demoSuppliers.length + 1,
        supplier_name: data.supplier_name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        user_id: 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoSuppliers.push(newSup);
      return newSup;
    }
    const response = await axiosClient.post<Supplier>('/suppliers/', data);
    return response.data;
  },

  updateSupplier: async (id: number, data: SupplierUpdate): Promise<Supplier> => {
    if (isDemo()) {
      const sup = demoSuppliers.find((s) => s.id === id);
      if (sup) {
        if (data.supplier_name) sup.supplier_name = data.supplier_name;
        if (data.phone !== undefined) sup.phone = data.phone;
        if (data.email !== undefined) sup.email = data.email;
        if (data.address !== undefined) sup.address = data.address;
        sup.updated_at = new Date().toISOString();
      }
      return sup || demoSuppliers[0];
    }
    const response = await axiosClient.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    if (isDemo()) {
      demoSuppliers = demoSuppliers.filter((s) => s.id !== id);
      return;
    }
    await axiosClient.delete(`/suppliers/${id}`);
  },

  // ==========================================
  // Products APIs
  // ==========================================
  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    if (isDemo()) {
      let filtered = [...demoProducts];
      if (params?.category_id) {
        filtered = filtered.filter((p) => p.category_id === params.category_id);
      }
      if (params?.low_stock) {
        filtered = filtered.filter((p) => p.stock_quantity <= p.min_threshold);
      }
      if (params?.search && params.search.trim()) {
        const key = params.search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.product_name.toLowerCase().includes(key) ||
            p.sku.toLowerCase().includes(key)
        );
      }
      return filtered;
    }

    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.category_id) queryParams.category_id = params.category_id;
      if (params?.low_stock !== undefined) queryParams.low_stock = params.low_stock;

      const response = await axiosClient.get<Product[]>('/products/', {
        params: queryParams,
      });

      let results = response.data;
      if (params?.search && params.search.trim()) {
        const searchKey = params.search.trim().toLowerCase();
        results = results.filter(
          (p) =>
            p.product_name.toLowerCase().includes(searchKey) ||
            p.sku.toLowerCase().includes(searchKey)
        );
      }
      return results;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoProducts];
      }
      throw err;
    }
  },

  getProductDetail: async (id: number): Promise<Product> => {
    if (isDemo()) {
      return demoProducts.find((p) => p.id === id) || demoProducts[0];
    }
    const response = await axiosClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: ProductCreate): Promise<Product> => {
    if (isDemo()) {
      const cat = demoCategories.find((c) => c.id === data.category_id);
      const newProd: Product = {
        id: demoProducts.length + 1,
        sku: data.sku,
        product_name: data.product_name,
        category_id: data.category_id,
        unit: data.unit,
        buy_price: data.buy_price,
        sell_price: data.sell_price,
        stock_quantity: 0,
        min_threshold: data.min_threshold,
        user_id: 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: cat || null,
      };
      demoProducts.unshift(newProd);
      return newProd;
    }
    const response = await axiosClient.post<Product>('/products/', data);
    return response.data;
  },

  updateProduct: async (id: number, data: ProductUpdate): Promise<Product> => {
    if (isDemo()) {
      const prod = demoProducts.find((p) => p.id === id);
      if (prod) {
        if (data.sku) prod.sku = data.sku;
        if (data.product_name) prod.product_name = data.product_name;
        if (data.category_id) {
          prod.category_id = data.category_id;
          prod.category = demoCategories.find((c) => c.id === data.category_id) || null;
        }
        if (data.unit) prod.unit = data.unit;
        if (data.buy_price !== undefined) prod.buy_price = data.buy_price;
        if (data.sell_price !== undefined) prod.sell_price = data.sell_price;
        if (data.min_threshold !== undefined) prod.min_threshold = data.min_threshold;
        prod.updated_at = new Date().toISOString();
      }
      return prod || demoProducts[0];
    }
    const response = await axiosClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (isDemo()) {
      demoProducts = demoProducts.filter((p) => p.id !== id);
      return;
    }
    await axiosClient.delete(`/products/${id}`);
  },

  adjustProductStock: async (id: number, data: ProductAdjust): Promise<Product> => {
    if (isDemo()) {
      const prod = demoProducts.find((p) => p.id === id);
      if (prod) {
        prod.stock_quantity = data.real_quantity;
        prod.updated_at = new Date().toISOString();
      }
      return prod || demoProducts[0];
    }
    const response = await axiosClient.put<Product>(`/products/${id}/adjust`, data);
    return response.data;
  },

  // ==========================================
  // Stock Movements APIs
  // ==========================================
  getStockMovements: async (
    params?: StockMovementFilterParams
  ): Promise<StockMovement[]> => {
    if (isDemo()) {
      let filtered = [...demoMovements];
      if (params?.movement_type) {
        filtered = filtered.filter((m) => m.movement_type === params.movement_type);
      }
      return filtered;
    }
    try {
      const response = await axiosClient.get<StockMovement[]>('/stock-movements/', {
        params,
      });
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoMovements];
      }
      throw err;
    }
  },

  importStock: async (data: StockImportCreate): Promise<StockMovement> => {
    if (isDemo()) {
      const prod = demoProducts.find((p) => p.id === data.product_id);
      const sup = demoSuppliers.find((s) => s.id === data.supplier_id);
      if (prod) {
        prod.stock_quantity += data.quantity;
      }
      const newM: StockMovement = {
        id: demoMovements.length + 101,
        user_id: 99,
        product_id: data.product_id,
        supplier_id: data.supplier_id,
        movement_type: 'IMPORT',
        quantity: data.quantity,
        note: data.note || null,
        created_at: new Date().toISOString(),
        product: prod || null,
        supplier: sup || null,
      };
      demoMovements.unshift(newM);
      return newM;
    }
    const response = await axiosClient.post<StockMovement>(
      '/stock-movements/import',
      data
    );
    return response.data;
  },

  exportStock: async (data: StockExportCreate): Promise<StockMovement> => {
    if (isDemo()) {
      const prod = demoProducts.find((p) => p.id === data.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - data.quantity);
      }
      const newM: StockMovement = {
        id: demoMovements.length + 101,
        user_id: 99,
        product_id: data.product_id,
        supplier_id: null,
        movement_type: 'EXPORT',
        quantity: data.quantity,
        note: data.note || null,
        created_at: new Date().toISOString(),
        product: prod || null,
      };
      demoMovements.unshift(newM);
      return newM;
    }
    const response = await axiosClient.post<StockMovement>(
      '/stock-movements/export',
      data
    );
    return response.data;
  },

  // ==========================================
  // Reports & Overview
  // ==========================================
  getOverviewReport: async (): Promise<InventoryOverview> => {
    if (isDemo()) {
      const total_products = demoProducts.length;
      const total_stock_quantity = demoProducts.reduce(
        (sum, p) => sum + p.stock_quantity,
        0
      );
      const total_inventory_value = demoProducts.reduce(
        (sum, p) => sum + Number(p.buy_price) * p.stock_quantity,
        0
      );
      return {
        total_products,
        total_stock_quantity,
        total_inventory_value,
        low_stock_count: demoProducts.filter((p) => p.stock_quantity <= p.min_threshold).length,
        recent_movements: demoMovements.slice(0, 5),
      };
    }
    try {
      const response = await axiosClient.get<InventoryOverview>('/reports/overview');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        const total_products = demoProducts.length;
        const total_stock_quantity = demoProducts.reduce(
          (sum, p) => sum + p.stock_quantity,
          0
        );
        const total_inventory_value = demoProducts.reduce(
          (sum, p) => sum + Number(p.buy_price) * p.stock_quantity,
          0
        );
        return {
          total_products,
          total_stock_quantity,
          total_inventory_value,
          low_stock_count: demoProducts.filter((p) => p.stock_quantity <= p.min_threshold).length,
          recent_movements: demoMovements.slice(0, 5),
        };
      }
      throw err;
    }
  },

  getLowStockReport: async (): Promise<LowStockReport> => {
    if (isDemo()) {
      const items = demoProducts.filter((p) => p.stock_quantity <= p.min_threshold);
      return {
        total: items.length,
        items,
      };
    }
    try {
      const response = await axiosClient.get<LowStockReport>('/reports/low-stock');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        const items = demoProducts.filter((p) => p.stock_quantity <= p.min_threshold);
        return {
          total: items.length,
          items,
        };
      }
      throw err;
    }
  },
};

export default inventoryApi;
