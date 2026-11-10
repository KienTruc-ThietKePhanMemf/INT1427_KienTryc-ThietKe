import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  DollarSign,
  Loader2,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import inventoryApi from '../api/inventoryApi';
import type { InventoryOverview, LowStockReport } from '../types/inventory';
import { formatVND } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [lowStock, setLowStock] = useState<LowStockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [ovData, lsData] = await Promise.all([
        inventoryApi.getOverviewReport(),
        inventoryApi.getLowStockReport(),
      ]);
      setOverview(ovData);
      setLowStock(lsData);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Không thể tải báo cáo số liệu kho.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Báo cáo & Phân tích Tồn kho
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng quan định giá tài sản kho và các sản phẩm chạm ngưỡng cảnh báo
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tổng hợp báo cáo...</p>
        </div>
      ) : (
        <>
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tổng mã sản phẩm
                </span>
              </div>
              <p className="text-3xl font-bold font-mono text-slate-900">
                {overview?.total_products || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Các mặt hàng đang quản lý trong kho
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tổng số lượng tồn kho
                </span>
              </div>
              <p className="text-3xl font-bold font-mono text-emerald-600">
                {overview?.total_stock_quantity || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tổng sản phẩm hiện vật lý trong kho
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Giá trị tồn kho (Vốn)
                </span>
              </div>
              <p className="text-3xl font-bold font-mono text-amber-600">
                {formatVND(overview?.total_inventory_value || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tính theo Giá nhập × Số lượng tồn
              </p>
            </div>
          </div>

          {/* Low Stock Alert Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Cảnh báo sản phẩm sắp hết hàng
                  </h3>
                  <p className="text-xs text-slate-500">
                    Các sản phẩm có tồn kho ≤ ngưỡng tối thiểu ({lowStock?.total || 0} sản phẩm)
                  </p>
                </div>
              </div>
            </div>

            {!lowStock?.items || lowStock.items.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  Tồn kho an toàn!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hiện tại không có sản phẩm nào chạm hoặc dưới ngưỡng cảnh báo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Tên Sản Phẩm</th>
                      <th className="py-3 px-4">Danh Mục</th>
                      <th className="py-3 px-4">Tồn Kho Hiện Tại</th>
                      <th className="py-3 px-4">Ngưỡng Tối Thiểu</th>
                      <th className="py-3 px-4">Tình Trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStock.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-700">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {item.product_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {item.category?.category_name || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          {item.stock_quantity} {item.unit}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {item.min_threshold} {item.unit}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Cần nhập thêm
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
