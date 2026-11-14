import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  Boxes,
  DollarSign,
  Loader2,
  Package,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import { getLowStockReportApi, getOverviewReportApi, getTopProductsReportApi } from '../api/reportApi';
import { TopProductsChart } from '../components/dashboard/TopProductsChart';
import { useAuth } from '../context/AuthContext';
import type {
  InventoryOverview,
  LowStockReport,
  TopProductItem,
} from '../types/inventory';
import { formatVND } from '../utils/format';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [lowStock, setLowStock] = useState<LowStockReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const [ovData, lsData, topData] = await Promise.all([
        getOverviewReportApi().catch(() => null),
        getLowStockReportApi().catch(() => null),
        getTopProductsReportApi().catch(() => []),
      ]);

      if (ovData) setOverview(ovData);
      if (lsData) setLowStock(lsData);
      if (topData) setTopProducts(topData);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Không thể tải số liệu bảng điều khiển.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Navigate to Stock Movements page and trigger Import modal with prefilled product
  const handleQuickImport = (productId: number) => {
    navigate('/movements', {
      state: { prefillImportProductId: productId },
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hệ Thống Quản Lý Kho Mini</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Xin chào, {user?.full_name || 'Quản trị viên'}! 👋
          </h1>
          <p className="mt-2 text-sm text-indigo-100/80 leading-relaxed">
            Hệ thống đang theo dõi biến động xuất nhập tồn kho thời gian thực.
            Kiểm tra các chỉ số tài sản và danh mục cần nhập hàng ngay bên dưới.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 4 Stat Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="text-sm text-slate-500">Đang tổng hợp số liệu kho...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Tổng mặt hàng */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng mặt hàng
              </span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-mono text-slate-900">
              {overview?.total_products || 0}
            </p>
            <p className="text-xs text-slate-400 mt-2">Mã SKU trong danh mục</p>
          </div>

          {/* Card 2: Tổng tồn kho */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng tồn kho
              </span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-xs">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-mono text-blue-600">
              {overview?.total_stock_quantity || 0}
            </p>
            <p className="text-xs text-slate-400 mt-2">Sản phẩm vật lý lưu kho</p>
          </div>

          {/* Card 3: Tổng giá trị tài sản kho */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng giá trị tài sản
              </span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 truncate">
              {formatVND(overview?.total_inventory_value || 0)}
            </p>
            <p className="text-xs text-slate-400 mt-2">Định giá theo vốn nhập kho</p>
          </div>

          {/* Card 4: Số mặt hàng báo động thiếu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Báo động thiếu hàng
              </span>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold font-mono text-rose-600">
                {overview?.low_stock_count ?? lowStock?.total ?? 0}
              </p>
              {(overview?.low_stock_count || lowStock?.total || 0) > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                  Cần nhập
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Tồn kho ≤ ngưỡng tối thiểu</p>
          </div>
        </div>
      )}

      {/* Top Products Chart Section */}
      <TopProductsChart data={topProducts} loading={loading} />

      {/* Low Stock Alert Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Bảng Cảnh Báo Tồn Kho Thấp
              </h3>
              <p className="text-xs text-slate-500">
                Các sản phẩm đang có số lượng $\le$ ngưỡng tối thiểu và cần bổ sung gấp
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
            {lowStock?.items?.length || 0} mặt hàng cần nhập
          </span>
        </div>

        {!lowStock?.items || lowStock.items.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Tồn kho hiện tại đang an toàn! 🎉
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Không có sản phẩm nào chạm ngưỡng cảnh báo tối thiểu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Tên Sản Phẩm</th>
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4">Tồn Kho Hiện Tại</th>
                  <th className="py-3 px-4">Ngưỡng Tối Thiểu</th>
                  <th className="py-3 px-4">Tình Trạng</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-700">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.product_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {item.category?.category_name || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {item.stock_quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.min_threshold} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Thiếu hàng
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleQuickImport(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Nhập thêm hàng</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
