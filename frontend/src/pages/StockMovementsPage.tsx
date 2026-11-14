import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Package,
  Truck,
  X,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import inventoryApi from '../api/inventoryApi';
import { exportStockApi, getStockMovementsApi, importStockApi } from '../api/stockApi';
import type {
  Product,
  StockExportCreate,
  StockImportCreate,
  StockMovement,
  Supplier,
} from '../types/inventory';
import { formatDateTime } from '../utils/format';

export const StockMovementsPage: React.FC = () => {
  const location = useLocation();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [filterType, setFilterType] = useState<string>('');
  const [filterProductId, setFilterProductId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Notification banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importForm, setImportForm] = useState<StockImportCreate>({
    product_id: 0,
    supplier_id: 0,
    quantity: 1,
    note: '',
  });

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportForm, setExportForm] = useState<StockExportCreate>({
    product_id: 0,
    quantity: 1,
    note: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Load products and suppliers
  const loadOptions = useCallback(async () => {
    try {
      const [prodList, supList] = await Promise.all([
        inventoryApi.getProducts(),
        inventoryApi.getSuppliers(),
      ]);
      setProducts(prodList);
      setSuppliers(supList);

      // Auto open import modal if prefillProductId passed via navigation state
      const stateObj = location.state as { prefillImportProductId?: number } | null;
      if (stateObj?.prefillImportProductId) {
        setImportForm({
          product_id: stateObj.prefillImportProductId,
          supplier_id: supList[0]?.id || 0,
          quantity: 10,
          note: 'Nhập hàng theo cảnh báo tồn kho thấp',
        });
        setIsImportModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading options:', err);
    }
  }, [location.state]);

  // Fetch movements
  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params = {
        movement_type:
          filterType === 'IMPORT' || filterType === 'EXPORT'
            ? (filterType as 'IMPORT' | 'EXPORT')
            : undefined,
        product_id: filterProductId ? Number(filterProductId) : undefined,
        page: currentPage,
        limit: itemsPerPage,
      };

      const data = await getStockMovementsApi(params);
      setMovements(data);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Không thể tải lịch sử biến động kho.')
      );
    } finally {
      setLoading(false);
    }
  }, [filterType, filterProductId, currentPage]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // Currently selected product for Export check
  const selectedExportProduct = products.find(
    (p) => p.id === Number(exportForm.product_id)
  );
  const currentAvailableStock = selectedExportProduct?.stock_quantity ?? 0;
  const isExportExceedsStock = exportForm.quantity > currentAvailableStock;

  // Open Import Modal
  const handleOpenImportModal = () => {
    setImportForm({
      product_id: products[0]?.id || 0,
      supplier_id: suppliers[0]?.id || 0,
      quantity: 10,
      note: 'Nhập hàng bổ sung định kỳ',
    });
    setIsImportModalOpen(true);
  };

  // Open Export Modal
  const handleOpenExportModal = () => {
    setExportForm({
      product_id: products[0]?.id || 0,
      quantity: 1,
      note: 'Xuất kho giao khách hàng',
    });
    setIsExportModalOpen(true);
  };

  // Submit Import
  const handleSubmitImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.product_id || !importForm.supplier_id || importForm.quantity <= 0)
      return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await importStockApi({
        product_id: Number(importForm.product_id),
        supplier_id: Number(importForm.supplier_id),
        quantity: Number(importForm.quantity),
        note: importForm.note?.trim() || undefined,
      });

      setSuccessMessage('Tạo phiếu nhập kho thành công! Số lượng tồn đã được cộng.');
      setIsImportModalOpen(false);
      fetchMovements();
      loadOptions(); // Refresh current stock quantities
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Lỗi khi nhập kho. Vui lòng kiểm tra lại!')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Export
  const handleSubmitExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportForm.product_id || exportForm.quantity <= 0) return;

    if (isExportExceedsStock) {
      setErrorMessage('Số lượng hàng trong kho không đủ để xuất!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await exportStockApi({
        product_id: Number(exportForm.product_id),
        quantity: Number(exportForm.quantity),
        note: exportForm.note?.trim() || undefined,
      });

      setSuccessMessage('Tạo phiếu xuất kho thành công! Số lượng tồn đã được trừ.');
      setIsExportModalOpen(false);
      fetchMovements();
      loadOptions(); // Refresh current stock quantities
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Lỗi khi xuất kho. Vui lòng kiểm tra lại!')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quản lý Nhập / Xuất kho
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ghi nhận và tra cứu toàn bộ lịch sử biến động số lượng hàng hóa
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleOpenImportModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-200"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Tạo Phiếu Nhập</span>
          </button>

          <button
            onClick={handleOpenExportModal}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shadow-rose-200"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Tạo Phiếu Xuất</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Movement Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer"
            >
              <option value="">Tất cả loại giao dịch</option>
              <option value="IMPORT">Chỉ phiếu Nhập kho (IMPORT)</option>
              <option value="EXPORT">Chỉ phiếu Xuất kho (EXPORT)</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterProductId}
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer max-w-xs"
            >
              <option value="">Tất cả sản phẩm</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.product_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Hiển thị trang <span className="font-semibold text-slate-800">{currentPage}</span>
        </div>
      </div>

      {/* Movements History Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải lịch sử nhập/xuất kho...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Không tìm thấy phiếu giao dịch nào
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Hãy tạo phiếu nhập hoặc phiếu xuất kho đầu tiên của bạn.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleOpenImportModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer"
            >
              + Tạo phiếu nhập
            </button>
            <button
              onClick={handleOpenExportModal}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-rose-700 transition-all cursor-pointer"
            >
              + Tạo phiếu xuất
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Mã Phiếu</th>
                  <th className="py-3.5 px-6">Loại Giao Dịch</th>
                  <th className="py-3.5 px-6">Sản Phẩm</th>
                  <th className="py-3.5 px-6">Số Lượng Biến Động</th>
                  <th className="py-3.5 px-6">Nhà Cung Cấp</th>
                  <th className="py-3.5 px-6">Ghi Chú</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => {
                  const isImport = m.movement_type === 'IMPORT';
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-6 font-mono text-xs font-semibold text-slate-500">
                        #{m.id}
                      </td>

                      {/* Badge: Blue for IMPORT, Rose/Orange for EXPORT */}
                      <td className="py-3.5 px-6">
                        {isImport ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" />
                            Nhập kho (IMPORT)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            Xuất kho (EXPORT)
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-slate-900 block">
                          {m.product?.product_name || `SP #${m.product_id}`}
                        </span>
                        {m.product?.sku && (
                          <span className="font-mono text-[11px] text-slate-400">
                            SKU: {m.product.sku}
                          </span>
                        )}
                      </td>

                      {/* Quantity change: + for import, - for export */}
                      <td className="py-3.5 px-6 font-mono font-bold text-sm">
                        {isImport ? (
                          <span className="text-blue-600">
                            +{m.quantity}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              {m.product?.unit || 'sp'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-rose-600">
                            -{m.quantity}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              {m.product?.unit || 'sp'}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        {m.supplier?.supplier_name ? (
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {m.supplier.supplier_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Xuất nội bộ/bán</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-6 text-xs text-slate-500 max-w-xs truncate">
                        {m.note || '-'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(m.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị {movements.length} giao dịch
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800">
                Trang {currentPage}
              </span>
              <button
                type="button"
                disabled={movements.length < itemsPerPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import: POST /stock-movements/import */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  Tạo Phiếu Nhập Kho
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitImport} className="mt-4 space-y-4">
              {/* Product */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sản phẩm nhập <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={importForm.product_id}
                  onChange={(e) =>
                    setImportForm((prev) => ({
                      ...prev,
                      product_id: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn sản phẩm --
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.product_name} (Hiện có: {p.stock_quantity}{' '}
                      {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nhà cung cấp <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={importForm.supplier_id}
                  onChange={(e) =>
                    setImportForm((prev) => ({
                      ...prev,
                      supplier_id: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn nhà cung cấp --
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số lượng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={importForm.quantity}
                  onChange={(e) =>
                    setImportForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ghi chú nhập hàng
                </label>
                <input
                  type="text"
                  value={importForm.note || ''}
                  onChange={(e) =>
                    setImportForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Nhập bổ sung, hàng mới..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Xác nhận Nhập kho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Export: POST /stock-movements/export */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  Tạo Phiếu Xuất Kho
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExport} className="mt-4 space-y-4">
              {/* Product */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sản phẩm xuất <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={exportForm.product_id}
                  onChange={(e) =>
                    setExportForm((prev) => ({
                      ...prev,
                      product_id: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-600 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn sản phẩm --
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Available Stock Display */}
              {selectedExportProduct && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Số lượng tồn kho hiện tại:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      currentAvailableStock === 0
                        ? 'text-rose-600'
                        : currentAvailableStock <= selectedExportProduct.min_threshold
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {currentAvailableStock} {selectedExportProduct.unit}
                  </span>
                </div>
              )}

              {/* Quantity input with live validation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số lượng xuất <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={exportForm.quantity}
                  onChange={(e) =>
                    setExportForm((prev) => ({
                      ...prev,
                      quantity: Math.max(1, Number(e.target.value)),
                    }))
                  }
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                    isExportExceedsStock
                      ? 'border-rose-400 text-rose-700 bg-rose-50/40 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-rose-100 focus:border-rose-600'
                  }`}
                />

                {/* Exceeds Stock Warning */}
                {isExportExceedsStock && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Số lượng xuất ({exportForm.quantity}) vượt quá tồn kho khả dụng ({currentAvailableStock})!
                    </span>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Lý do xuất kho
                </label>
                <input
                  type="text"
                  value={exportForm.note || ''}
                  onChange={(e) =>
                    setExportForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Bán lẻ cho khách, xuất dự án..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || isExportExceedsStock || currentAvailableStock === 0}
                  className="px-5 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Xác nhận Xuất kho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementsPage;
