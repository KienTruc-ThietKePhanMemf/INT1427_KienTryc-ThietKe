import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Edit2,
  Filter,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import inventoryApi from '../api/inventoryApi';
import type {
  Category,
  Product,
  ProductAdjust,
  ProductCreate,
  ProductUpdate,
} from '../types/inventory';
import { formatVND } from '../utils/format';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    category_id: string;
    sku: string;
    product_name: string;
    unit: string;
    buy_price: string;
    sell_price: string;
    min_threshold: string;
  }>({
    category_id: '',
    sku: '',
    product_name: '',
    unit: 'Cái',
    buy_price: '',
    sell_price: '',
    min_threshold: '5',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Adjust / Stock Take Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustData, setAdjustData] = useState<{
    real_quantity: string;
    reason: string;
  }>({
    real_quantity: '',
    reason: '',
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories for select box
  const fetchCategories = useCallback(async () => {
    try {
      const data = await inventoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  // Fetch products with backend filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params = {
        category_id: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        low_stock: onlyLowStock ? true : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const data = await inventoryApi.getProducts(params);
      setProducts(data);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Không thể tải danh sách sản phẩm.'));
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, onlyLowStock, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      sku: '',
      product_name: '',
      unit: 'Cái',
      buy_price: '',
      sell_price: '',
      min_threshold: '5',
    });
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category_id: String(product.category_id),
      sku: product.sku,
      product_name: product.product_name,
      unit: product.unit,
      buy_price: String(product.buy_price),
      sell_price: String(product.sell_price),
      min_threshold: String(product.min_threshold),
    });
    setIsModalOpen(true);
  };

  // Handle open Adjust Modal
  const handleOpenAdjustModal = (product: Product) => {
    setAdjustingProduct(product);
    setAdjustData({
      real_quantity: String(product.stock_quantity),
      reason: 'Kiểm kê kho định kỳ',
    });
    setIsAdjustModalOpen(true);
  };

  // Submit Create / Edit form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name.trim() || !formData.sku.trim()) return;

    try {
      setModalSubmitting(true);
      setErrorMessage(null);

      const payload: ProductCreate = {
        category_id: Number(formData.category_id),
        sku: formData.sku.trim().toUpperCase(),
        product_name: formData.product_name.trim(),
        unit: formData.unit.trim(),
        buy_price: Number(formData.buy_price) || 0,
        sell_price: Number(formData.sell_price) || 0,
        min_threshold: Number(formData.min_threshold) || 0,
      };

      if (editingProduct) {
        await inventoryApi.updateProduct(editingProduct.id, payload as ProductUpdate);
        setSuccessMessage('Cập nhật sản phẩm thành công!');
      } else {
        await inventoryApi.createProduct(payload);
        setSuccessMessage('Thêm sản phẩm mới thành công! (Tồn kho khởi tạo = 0)');
      }

      setIsModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Lỗi khi lưu sản phẩm.'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // Submit Adjust Inventory form
  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    try {
      setAdjustSubmitting(true);
      setErrorMessage(null);

      const payload: ProductAdjust = {
        real_quantity: Number(adjustData.real_quantity),
        reason: adjustData.reason.trim() || undefined,
      };

      await inventoryApi.adjustProductStock(adjustingProduct.id, payload);

      setSuccessMessage(
        `Đã điều chỉnh tồn kho sản phẩm "${adjustingProduct.product_name}" thành ${payload.real_quantity} ${adjustingProduct.unit}!`
      );
      setIsAdjustModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Lỗi khi điều chỉnh số lượng tồn kho.')
      );
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      await inventoryApi.deleteProduct(deletingProduct.id);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      setSuccessMessage('Đã xóa sản phẩm thành công!');
      fetchProducts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(
          err,
          'Lỗi khi xóa sản phẩm. Có thể sản phẩm đã có phiếu nhập/xuất kho.'
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quản lý Sản phẩm
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi SKU, giá vốn, giá bán, số lượng tồn kho và cảnh báo thiếu hàng
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản phẩm</span>
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã SKU hoặc tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle Button */}
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-2 cursor-pointer border ${
              onlyLowStock
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 ${
                onlyLowStock ? 'text-rose-600' : 'text-slate-400'
              }`}
            />
            <span>Chỉ SP sắp hết hàng</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải danh sách sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Không tìm thấy sản phẩm nào
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {onlyLowStock
              ? 'Tất cả sản phẩm hiện đang ở mức tồn kho an toàn!'
              : 'Hãy thêm sản phẩm mới để bắt đầu theo dõi xuất nhập tồn.'}
          </p>
          {!onlyLowStock && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95 cursor-pointer"
            >
              + Thêm sản phẩm đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã SKU</th>
                  <th className="py-3.5 px-5">Tên Sản Phẩm</th>
                  <th className="py-3.5 px-5">Danh Mục</th>
                  <th className="py-3.5 px-5">Đơn Vị</th>
                  <th className="py-3.5 px-5">Tồn Kho</th>
                  <th className="py-3.5 px-5">Giá Nhập</th>
                  <th className="py-3.5 px-5">Giá Bán</th>
                  <th className="py-3.5 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const isLowStock =
                    product.stock_quantity <= product.min_threshold;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* SKU */}
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700">
                        {product.sku}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900 block">
                          {product.product_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Ngưỡng tối thiểu: {product.min_threshold} {product.unit}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        {product.category?.category_name ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                            {product.category.category_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Mặc định</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        {product.unit}
                      </td>

                      {/* Stock Quantity + Badge */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm font-mono text-slate-900">
                            {product.stock_quantity}
                          </span>
                          {isLowStock ? (
                            <span
                              title={`Tồn kho (${product.stock_quantity}) <= Ngưỡng (${product.min_threshold})`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Thiếu hàng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              An toàn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Buy Price */}
                      <td className="py-3.5 px-5 text-xs font-mono text-slate-600">
                        {formatVND(product.buy_price)}
                      </td>

                      {/* Sell Price */}
                      <td className="py-3.5 px-5 text-xs font-mono font-semibold text-slate-900">
                        {formatVND(product.sell_price)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                        {/* Adjust / Stock Take Button */}
                        <button
                          onClick={() => handleOpenAdjustModal(product)}
                          title="Kiểm kê / Điều chỉnh tồn kho thực tế"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          title="Chỉnh sửa thông tin SP"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setDeletingProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Xóa sản phẩm"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mã SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku: e.target.value,
                      }))
                    }
                    placeholder="VD: SP-001, IP15-PRO..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 uppercase"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Danh mục <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="" disabled>
                      Chọn danh mục
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      product_name: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Bàn phím cơ không dây RK61"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              {/* Unit & Min Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Đơn vị tính <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    placeholder="Cái, Hộp, Kg, Thùng..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ngưỡng cảnh báo tồn tối thiểu
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.min_threshold}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        min_threshold: e.target.value,
                      }))
                    }
                    placeholder="5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Buy Price & Sell Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Giá nhập (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.buy_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        buy_price: e.target.value,
                      }))
                    }
                    placeholder="150000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Giá bán (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.sell_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sell_price: e.target.value,
                      }))
                    }
                    placeholder="250000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {modalSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? 'Lưu thay đổi' : 'Tạo mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adjust / Stock Take (`/products/{id}/adjust`) */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Kiểm kê / Điều chỉnh tồn kho
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    SKU: {adjustingProduct.sku}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500">Sản phẩm:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {adjustingProduct.product_name}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Tồn hệ thống:</span>{' '}
                <span className="font-bold font-mono text-indigo-600 text-sm">
                  {adjustingProduct.stock_quantity} {adjustingProduct.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số lượng thực tế sau kiểm kê ({adjustingProduct.unit}){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustData.real_quantity}
                  onChange={(e) =>
                    setAdjustData((prev) => ({
                      ...prev,
                      real_quantity: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Lý do điều chỉnh
                </label>
                <input
                  type="text"
                  value={adjustData.reason}
                  onChange={(e) =>
                    setAdjustData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Kiểm kê định kỳ, hao hụt, hàng hỏng..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting || adjustData.real_quantity === ''}
                  className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {adjustSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Cập nhật tồn kho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Xác nhận xóa Sản phẩm?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <strong className="text-slate-800">
                "{deletingProduct.product_name}"
              </strong>{' '}
              (SKU: {deletingProduct.sku})?
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2 text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
