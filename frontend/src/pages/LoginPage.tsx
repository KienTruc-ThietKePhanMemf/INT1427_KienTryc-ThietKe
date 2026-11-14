import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Loader2,
  Lock,
  Mail,
  PackageSearch,
  Sparkles,
  Warehouse,
} from 'lucide-react';
import { extractErrorMessage } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Message from registration redirect if any
  const registrationSuccessMessage = (
    location.state as { registeredEmail?: string; message?: string } | null
  )?.message;

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email quản trị.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Định dạng email không hợp lệ.';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu đăng nhập.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await login({
        username: email.trim(),
        password,
      });

      const destination =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      const parsedError = extractErrorMessage(
        error,
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin tài khoản!'
      );
      setErrorMessage(parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="absolute -top-36 -left-36 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Left Side: Brand Hero (Desktop & Tablet) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/20 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative">
          <div>
            {/* Logo & Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950">
                <Warehouse className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                  KHO MINI
                </span>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                  Logistics & Warehouse
                </span>
              </div>
            </div>

            {/* Slogan */}
            <div className="mt-8 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <PackageSearch className="w-3.5 h-3.5" />
                <span>Kiểm soát Tồn kho Toàn diện</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Tối ưu hóa quản trị kho bãi & biến động hàng hóa
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Nền tảng kiểm soát xuất nhập tồn, phân tích định giá vốn và cảnh báo thiếu hàng thời gian thực.
              </p>
            </div>

            {/* Feature Highlights Cards */}
            <div className="space-y-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Cảnh báo tồn kho thấp
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tự động nhận diện SKU chạm ngưỡng tối thiểu và gợi ý nhập hàng.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Nhật ký biến động minh bạch
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quản lý phiếu nhập/xuất liên kết trực tiếp với Nhà cung cấp.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Định giá tài sản kho
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tính toán tổng giá trị vốn lưu động và Top sản phẩm luân chuyển.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI Engine Connected
            </span>
            <span className="font-mono text-slate-500">v1.0 Pro</span>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Đăng nhập hệ thống
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Nhập thông tin quản trị viên để truy cập bảng điều khiển kho
              </p>
            </div>

            {/* Registration Success Banner */}
            {registrationSuccessMessage && (
              <div
                role="status"
                className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-300">Đăng ký thành công!</p>
                  <p className="mt-0.5 text-emerald-400/90 leading-relaxed">
                    {registrationSuccessMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Backend Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Đăng nhập thất bại</p>
                  <p className="mt-0.5 text-rose-400/90 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Email quản trị viên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="admin@khomini.vn"
                    autoComplete="email"
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      validationErrors.email
                        ? 'border-rose-500/80 focus:ring-rose-500/20 bg-rose-500/5'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Mật khẩu
                  </label>
                  <span className="text-xs text-slate-500">Tối thiểu 6 ký tự</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/60 border rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      validationErrors.password
                        ? 'border-rose-500/80 focus:ring-rose-500/20 bg-rose-500/5'
                        : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-rose-400 font-medium mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực hệ thống...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Mode Button */}
              <div className="relative my-4 pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-slate-900 px-3 text-slate-500">
                    Hoặc dùng thử ngay
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  loginAsDemo();
                  navigate('/dashboard', { replace: true });
                }}
                className="w-full bg-slate-950/80 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-xs active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Xem thử giao diện ngay (Demo Mode)</span>
              </button>
            </form>

            {/* Footer Navigation */}
            <p className="mt-8 text-center text-xs sm:text-sm text-slate-400">
              Chưa có tài khoản quản lý?{' '}
              <Link
                to="/register"
                className="font-semibold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 hover:underline"
              >
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
