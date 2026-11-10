import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Package,
} from 'lucide-react';
import type { TopProductItem } from '../../types/inventory';

interface TopProductsChartProps {
  data: TopProductItem[];
  loading?: boolean;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  data,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IMPORT' | 'EXPORT'>('ALL');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-lg mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center">
        <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">
          Chưa có dữ liệu biến động hàng hóa
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Các giao dịch nhập và xuất kho sẽ tự động tổng hợp biểu đồ tại đây.
        </p>
      </div>
    );
  }

  // Calculate maximum value for relative bar widths
  const maxMovement = Math.max(
    ...data.map((item) => {
      if (activeTab === 'IMPORT') return item.total_imported;
      if (activeTab === 'EXPORT') return item.total_exported;
      return item.total_movement;
    }),
    1
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Top Sản Phẩm Biến Động Nhiều Nhất
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Xếp hạng theo tổng lượng luân chuyển qua các phiếu Nhập & Xuất
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng số
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'IMPORT'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập ({data.reduce((s, i) => s + i.total_imported, 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'EXPORT'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Xuất ({data.reduce((s, i) => s + i.total_exported, 0)})</span>
          </button>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="space-y-4">
        {data.map((item, idx) => {
          const val =
            activeTab === 'IMPORT'
              ? item.total_imported
              : activeTab === 'EXPORT'
              ? item.total_exported
              : item.total_movement;

          const percentage = Math.min(100, Math.round((val / maxMovement) * 100));

          const importWidth =
            item.total_movement > 0
              ? Math.round((item.total_imported / item.total_movement) * 100)
              : 0;
          const exportWidth = 100 - importWidth;

          return (
            <div
              key={item.product_id}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.product_name}
                    </p>
                    <span className="text-[11px] font-mono text-slate-400">
                      SKU: {item.sku}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-sm text-slate-800">
                    {val}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      sp
                    </span>
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-3 w-full bg-slate-200/60 rounded-full overflow-hidden flex">
                {activeTab === 'ALL' ? (
                  <>
                    <div
                      style={{ width: `${(percentage * importWidth) / 100}%` }}
                      className="bg-blue-500 h-full transition-all duration-500 rounded-l-full"
                      title={`Nhập: ${item.total_imported} sp`}
                    />
                    <div
                      style={{ width: `${(percentage * exportWidth) / 100}%` }}
                      className="bg-rose-500 h-full transition-all duration-500 rounded-r-full"
                      title={`Xuất: ${item.total_exported} sp`}
                    />
                  </>
                ) : activeTab === 'IMPORT' ? (
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  />
                ) : (
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  />
                )}
              </div>

              {/* Secondary details for ALL view */}
              {activeTab === 'ALL' && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Đã nhập: {item.total_imported}
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Đã xuất: {item.total_exported}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProductsChart;

