import React from 'react';
import {
  Boxes,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Mở Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900">KHO MINI</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-medium text-slate-700">Hệ Thống Quản Lý Kho Mini</span>
          <span className="text-slate-300">|</span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            v1.0 Pro
          </span>
        </div>
      </div>

      {/* Right: User Info & Logout button */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 py-1 px-2.5 sm:px-3 rounded-xl bg-slate-100/80 border border-slate-200/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.full_name || 'Quản trị viên'}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Đăng xuất khỏi hệ thống"
          className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 active:scale-95 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

