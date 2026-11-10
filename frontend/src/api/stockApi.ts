import axiosClient from './axiosClient';
import type {
  StockExportCreate,
  StockImportCreate,
  StockMovement,
  StockMovementFilterParams,
} from '../types/inventory';

// Mock initial data for Demo mode
const demoMovements: StockMovement[] = [
  {
    id: 105,
    user_id: 99,
    product_id: 2,
    supplier_id: 2,
    movement_type: 'IMPORT',
    quantity: 25,
    note: 'Nhập lô chuột G102 Lightsync chính hãng',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    product: {
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
    },
    supplier: {
      id: 2,
      supplier_name: 'Tập Đoàn Thiết Bị Minh Khang',
      user_id: 99,
      created_at: '2026-01-08T11:00:00',
      updated_at: '2026-01-08T11:00:00',
    },
  },
  {
    id: 104,
    user_id: 99,
    product_id: 1,
    supplier_id: 1,
    movement_type: 'IMPORT',
    quantity: 10,
    note: 'Nhập bàn phím cơ RK61 bổ sung kho',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    product: {
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
    },
    supplier: {
      id: 1,
      supplier_name: 'Công ty TNHH Phân Phối Á Châu',
      user_id: 99,
      created_at: '2026-01-05T10:00:00',
      updated_at: '2026-01-05T10:00:00',
    },
  },
  {
    id: 103,
    user_id: 99,
    product_id: 3,
    supplier_id: null,
    movement_type: 'EXPORT',
    quantity: 3,
    note: 'Xuất giao phòng ban kế toán',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    product: {
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
    },
  },
  {
    id: 102,
    user_id: 99,
    product_id: 4,
    supplier_id: null,
    movement_type: 'EXPORT',
    quantity: 2,
    note: 'Xuất bán lẻ khách Shopee',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    product: {
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
    },
  },
  {
    id: 101,
    user_id: 99,
    product_id: 5,
    supplier_id: 3,
    movement_type: 'IMPORT',
    quantity: 20,
    note: 'Nhập giấy in từ Tổng kho Việt Nhật',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    product: {
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
    },
    supplier: {
      id: 3,
      supplier_name: 'Tổng Kho Gia Dụng & VPP Việt Nhật',
      user_id: 99,
      created_at: '2026-01-12T14:20:00',
      updated_at: '2026-01-12T14:20:00',
    },
  },
];

const isDemo = () => localStorage.getItem('token') === 'demo-token';

export const stockApi = {
  /**
   * Tạo phiếu Nhập kho
   * POST /stock-movements/import
   */
  importStock: async (payload: StockImportCreate): Promise<StockMovement> => {
    if (isDemo()) {
      const newM: StockMovement = {
        id: demoMovements.length + 101,
        user_id: 99,
        product_id: payload.product_id,
        supplier_id: payload.supplier_id,
        movement_type: 'IMPORT',
        quantity: payload.quantity,
        note: payload.note || null,
        created_at: new Date().toISOString(),
      };
      demoMovements.unshift(newM);
      return newM;
    }
    const response = await axiosClient.post<StockMovement>(
      '/stock-movements/import',
      payload
    );
    return response.data;
  },

  /**
   * Tạo phiếu Xuất kho
   * POST /stock-movements/export
   */
  exportStock: async (payload: StockExportCreate): Promise<StockMovement> => {
    if (isDemo()) {
      const newM: StockMovement = {
        id: demoMovements.length + 101,
        user_id: 99,
        product_id: payload.product_id,
        supplier_id: null,
        movement_type: 'EXPORT',
        quantity: payload.quantity,
        note: payload.note || null,
        created_at: new Date().toISOString(),
      };
      demoMovements.unshift(newM);
      return newM;
    }
    const response = await axiosClient.post<StockMovement>(
      '/stock-movements/export',
      payload
    );
    return response.data;
  },

  /**
   * Lấy danh sách lịch sử biến động kho
   * GET /stock-movements/?product_id=&movement_type=&page=&limit=&skip=
   */
  getStockMovements: async (
    params?: StockMovementFilterParams
  ): Promise<StockMovement[]> => {
    if (isDemo()) {
      let filtered = [...demoMovements];
      if (params?.product_id) {
        filtered = filtered.filter((m) => m.product_id === params.product_id);
      }
      if (params?.movement_type) {
        filtered = filtered.filter((m) => m.movement_type === params.movement_type);
      }
      const skip = params?.page && params?.limit ? (params.page - 1) * params.limit : 0;
      const limit = params?.limit || 20;
      return filtered.slice(skip, skip + limit);
    }

    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.product_id) queryParams.product_id = params.product_id;
      if (params?.movement_type) queryParams.movement_type = params.movement_type;
      if (params?.page && params?.limit) {
        queryParams.page = params.page;
        queryParams.limit = params.limit;
        queryParams.skip = (params.page - 1) * params.limit;
      }

      const response = await axiosClient.get<StockMovement[]>('/stock-movements/', {
        params: queryParams,
      });
      return response.data;
    } catch (err) {
      if (isDemo() || (err as { message?: string }).message?.includes('Network Error')) {
        return [...demoMovements];
      }
      throw err;
    }
  },
};

export const importStockApi = stockApi.importStock;
export const exportStockApi = stockApi.exportStock;
export const getStockMovementsApi = stockApi.getStockMovements;

export default stockApi;

