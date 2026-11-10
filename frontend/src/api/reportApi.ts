import axiosClient from './axiosClient';
import type {
  InventoryOverview,
  LowStockReport,
  TopProductItem,
} from '../types/inventory';

// Mock data for demo fallback
const demoTopProducts: TopProductItem[] = [
  {
    product_id: 2,
    product_name: 'Chuột Gaming Logitech G102 Lightsync',
    sku: 'SP-MS02',
    total_imported: 30,
    total_exported: 12,
    total_movement: 42,
  },
  {
    product_id: 5,
    product_name: 'Giấy in văn phòng Double A A4 80gsm',
    sku: 'SP-ST05',
    total_imported: 25,
    total_exported: 10,
    total_movement: 35,
  },
  {
    product_id: 1,
    product_name: 'Bàn phím cơ không dây RK61 RGB',
    sku: 'SP-KB01',
    total_imported: 15,
    total_exported: 8,
    total_movement: 23,
  },
  {
    product_id: 4,
    product_name: 'Tai nghe chống ồn Sony WH-1000XM4',
    sku: 'SP-HD04',
    total_imported: 14,
    total_exported: 6,
    total_movement: 20,
  },
  {
    product_id: 3,
    product_name: 'Màn hình Dell UltraSharp 24 inch U2422H',
    sku: 'SP-MN03',
    total_imported: 6,
    total_exported: 4,
    total_movement: 10,
  },
];

const isDemo = () => localStorage.getItem('token') === 'demo-token';

export const reportApi = {
  /**
   * Lấy tổng quan thống kê kho
   * GET /reports/overview
   */
  getOverview: async (): Promise<InventoryOverview> => {
    if (isDemo()) {
      return {
        total_products: 5,
        total_stock_quantity: 46,
        total_inventory_value: 86450000,
        low_stock_count: 3,
        recent_movements: [],
      };
    }
    try {
      const response = await axiosClient.get<InventoryOverview>('/reports/overview');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return {
          total_products: 5,
          total_stock_quantity: 46,
          total_inventory_value: 86450000,
          low_stock_count: 3,
          recent_movements: [],
        };
      }
      throw err;
    }
  },

  /**
   * Lấy danh sách sản phẩm chạm ngưỡng tồn kho tối thiểu
   * GET /reports/low-stock
   */
  getLowStock: async (): Promise<LowStockReport> => {
    if (isDemo()) {
      return {
        total: 3,
        items: [
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
        ],
      };
    }
    try {
      const response = await axiosClient.get<LowStockReport>('/reports/low-stock');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return {
          total: 3,
          items: [],
        };
      }
      throw err;
    }
  },

  /**
   * Lấy Top sản phẩm có lượng xuất nhập nhiều nhất
   * GET /reports/top-products
   */
  getTopProducts: async (): Promise<TopProductItem[]> => {
    if (isDemo()) {
      return [...demoTopProducts];
    }
    try {
      const response = await axiosClient.get<TopProductItem[]>('/reports/top-products');
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoTopProducts];
      }
      throw err;
    }
  },
};

export const getOverviewReportApi = reportApi.getOverview;
export const getLowStockReportApi = reportApi.getLowStock;
export const getTopProductsReportApi = reportApi.getTopProducts;

export default reportApi;

