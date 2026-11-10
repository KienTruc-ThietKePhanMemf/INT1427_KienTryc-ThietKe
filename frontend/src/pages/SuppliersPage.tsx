import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import inventoryApi from '../api/inventoryApi';
import type { Supplier, SupplierCreate, SupplierUpdate } from '../types/inventory';
import { formatDate } from '../utils/format';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Create/Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierCreate>({
    supplier_name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Modal Delete state
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await inventoryApi.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Không thể tải danh sách nhà cung cấp.')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      supplier_name: '',
      phone: '',
      email: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_name: supplier.supplier_name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setIsModalOpen(true);
  };

  // Handle Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_name.trim()) return;

    try {
      setModalSubmitting(true);
      setErrorMessage(null);

      const payload: SupplierCreate = {
        supplier_name: formData.supplier_name.trim(),
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      };

      if (editingSupplier) {
        await inventoryApi.updateSupplier(editingSupplier.id, payload as SupplierUpdate);
        setSuccessMessage('Cập nhật nhà cung cấp thành công!');
      } else {
        await inventoryApi.createSupplier(payload);
        setSuccessMessage('Thêm nhà cung cấp mới thành công!');
      }

      setIsModalOpen(false);
      fetchSuppliers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Lỗi khi lưu thông tin nhà cung cấp.')
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    try {
      setIsDeleting(true);
      await inventoryApi.deleteSupplier(deletingSupplier.id);
      setIsDeleteModalOpen(false);
      setDeletingSupplier(null);
      setSuccessMessage('Đã xóa nhà cung cấp thành công!');
      fetchSuppliers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(
          err,
          'Lỗi khi xóa nhà cung cấp. Có thể NCC này đang gắn với phiếu nhập kho.'
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search)) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quản lý Nhà cung cấp
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Danh bạ các đối tác cung ứng hàng hóa cho kho của bạn
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhà cung cấp</span>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên NCC, SĐT hoặc Email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500">
          Tổng cộng: <span className="font-semibold text-slate-800">{suppliers.length}</span> đối tác
        </div>
      </div>

      {/* Table of Suppliers */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Đang tải danh sách nhà cung cấp...</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Chưa có nhà cung cấp nào
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Thêm nhà cung cấp mới để phục vụ việc ghi phiếu nhập kho sau này.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95"
          >
            + Thêm nhà cung cấp đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Mã ID</th>
                  <th className="py-3.5 px-6">Tên Nhà Cung Cấp</th>
                  <th className="py-3.5 px-6">Điện Thoại</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Địa Chỉ</th>
                  <th className="py-3.5 px-6">Ngày Tạo</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                      #{supplier.id}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{supplier.supplier_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      {supplier.phone ? (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {supplier.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs">
                      {supplier.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {supplier.email}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs max-w-xs truncate">
                      {supplier.address ? (
                        <span className="flex items-center gap-1.5" title={supplier.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{supplier.address}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">
                      {formatDate(supplier.created_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(supplier)}
                        title="Chỉnh sửa thông tin NCC"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingSupplier(supplier);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Xóa nhà cung cấp"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingSupplier
                    ? 'Chỉnh sửa Nhà cung cấp'
                    : 'Thêm Nhà cung cấp mới'}
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tên nhà cung cấp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplier_name: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Công ty TNHH Phân Phối Á Châu..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="0987654321"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="contact@nhacungcap.vn"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                />
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
                  disabled={modalSubmitting || !formData.supplier_name.trim()}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {modalSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingSupplier ? 'Lưu thay đổi' : 'Tạo mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {isDeleteModalOpen && deletingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Xác nhận xóa Nhà cung cấp?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Bạn có chắc chắn muốn xóa đối tác{' '}
              <strong className="text-slate-800">
                "{deletingSupplier.supplier_name}"
              </strong>
              ?
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
                onClick={handleDeleteSupplier}
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

export default SuppliersPage;
