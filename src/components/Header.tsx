import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  Activity,
  ChevronUp,
  ChevronDown,
  Server,
  Network,
  Building2,
  ShieldAlert,
  Radio,
  ScrollText,
  LogOut,
  UserCheck,
  Sun,
  Moon,
  LayoutDashboard
} from 'lucide-react';
import { TechnicalStaffProfile, TabType, ROLE_PERMISSIONS } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  criticalCount: number;
  currentUser: TechnicalStaffProfile;
  staffList: TechnicalStaffProfile[];
  onSwitchUser: (staffId: string) => void;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  currentUser,
  staffList,
  onSwitchUser,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'TỔNG QUAN', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'YÊU CẦU XỬ LÝ', label: 'Yêu Cầu Xử Lý', icon: Activity },
    { id: 'THIẾT BỊ & TÀI SẢN', label: 'Thiết Bị & Tài Sản', icon: Server },
    { id: 'SƠ ĐỒ HẠ TẦNG', label: 'Sơ Đồ Hạ Tầng', icon: Network },
    { id: 'KHOA PHÒNG', label: 'Khoa Phòng', icon: Building2 },
    { id: 'QUẢN TRỊ ROLES', label: 'Quản Trị Roles', icon: ShieldAlert },
    { id: 'NHẬT KÝ AUDIT', label: 'Nhật Ký Audit', icon: ScrollText },
  ];

  const userPerm = ROLE_PERMISSIONS[currentUser.roleType] || ROLE_PERMISSIONS['ADMIN'];
  const filteredNavItems = navItems.filter((item) => userPerm.allowedTabs.includes(item.id));

  const isCurrentAdmin = currentUser.roleType === 'ADMIN';
  const initials = currentUser.name.substring(0, 2).toUpperCase();

  return (
    <>
      {/* 1. STICKY TOP HEADER */}
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200/90 shadow-xs text-slate-900'
            : 'bg-panel-deep/95 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white'
        }`}
      >
        <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-3">
          
          {/* Branding & Hospital Metadata (Left) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={`absolute -inset-1 rounded-xl opacity-40 blur-sm animate-pulse ${
                  isLight
                    ? 'bg-gradient-to-r from-terracotta via-amber-400 to-terracotta'
                    : 'bg-gradient-to-r from-acid-lime via-line-energy to-acid-lime'
                }`}
              />
              <div
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  isLight
                    ? 'bg-terracotta border-terracotta text-white shadow-[0_0_15px_rgba(224,93,56,0.3)]'
                    : 'bg-panel border-acid-lime/50 text-acid-lime shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                }`}
              >
                <Zap
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isLight ? 'fill-white stroke-white' : 'fill-acid-lime stroke-acid-lime'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className={`font-display text-xs sm:text-sm md:text-base font-extrabold tracking-wide uppercase leading-tight whitespace-nowrap ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  TT ĐIỀU HÀNH CNTT & Y TẾ
                </h1>
                <span
                  className={`hidden 2xl:inline-flex items-center gap-1 font-mono text-[9px] border px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isLight
                      ? 'bg-[#FDF0EB] text-terracotta border-terracotta/30'
                      : 'bg-acid-lime/15 text-acid-lime border-acid-lime/30'
                  }`}
                >
                  <Radio className={`w-2.5 h-2.5 animate-pulse ${isLight ? 'text-terracotta' : 'text-acid-lime'}`} />
                  LIVE OPS
                </span>
              </div>
              <span
                className={`font-mono text-[9px] tracking-wider uppercase font-medium mt-0.5 truncate hidden sm:block max-w-[240px] ${
                  isLight ? 'text-slate-500' : 'text-white/50'
                }`}
              >
                BVĐK KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Center Desktop XL+) - Filtered by Role Permissions */}
          <nav
            className={`hidden xl:flex items-center gap-1 p-1 rounded-xl border shadow-inner backdrop-blur-md shrink-0 transition-colors ${
              isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-surface/90 border-white/10'
            }`}
          >
            {filteredNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const isRoleTab = item.id === 'QUẢN TRỊ ROLES';
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-2.5 2xl:px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 select-none ${
                    isActive
                      ? isLight
                        ? 'bg-terracotta text-white shadow-md font-bold'
                        : 'bg-acid-lime text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] font-bold'
                      : isRoleTab
                      ? isLight
                        ? 'text-terracotta hover:bg-terracotta/10 border border-terracotta/30'
                        : 'text-line-energy hover:bg-line-energy/15 border border-line-energy/30'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive
                        ? isLight
                          ? 'text-white'
                          : 'text-black'
                        : isRoleTab
                        ? isLight
                          ? 'text-terracotta'
                          : 'text-line-energy'
                        : isLight
                        ? 'text-slate-500'
                        : 'text-white/60'
                    }`}
                  />
                  <span>{item.label}</span>

                  {isActive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full animate-ping ml-0.5 shrink-0 ${
                        isLight ? 'bg-white' : 'bg-black'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* SLA Telemetry Status & Role Pill & Direct Logout Button (Right) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SLA Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl border shadow-xs shrink-0 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-surface border-white/10 text-white/90'
              }`}
            >
              <span
                className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase border ${userPerm.badgeBg} ${userPerm.badgeText} ${userPerm.badgeBorder}`}
              >
                {userPerm.shortRole}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    criticalCount > 0 ? 'bg-neon-red animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold ${
                    criticalCount > 0 ? (isLight ? 'text-rose-600' : 'text-neon-red') : 'text-emerald-600'
                  }`}
                >
                  {criticalCount} KHẨN CẤP
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                aria-label="Chuyển đổi giao diện"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer shrink-0 shadow-sm ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-terracotta/40 text-terracotta hover:border-terracotta'
                    : 'bg-surface hover:bg-[#1A1E34] border-white/20 text-acid-lime hover:border-acid-lime'
                }`}
                title={isLight ? 'Chuyển sang Giao diện Tối (Cyber Ops)' : 'Chuyển sang Giao diện Sáng (9Router Grid)'}
              >
                {isLight ? (
                  <>
                    <Moon className="w-4 h-4 text-terracotta" />
                    <span className="hidden lg:inline text-slate-800">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-acid-lime" />
                    <span className="hidden lg:inline text-white">Dark Mode</span>
                  </>
                )}
              </button>
            )}

            {/* Current User Dropdown & Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              {/* User Switcher Dropdown Anchor */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Menu người dùng"
                  className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-all border shrink-0 ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                      : 'bg-surface hover:bg-[#1A1E34] border-white/20 hover:border-acid-lime'
                  }`}
                  title="Bấm để chuyển đổi Role / Nhân sự đang làm việc"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${userPerm.badgeBg} ${userPerm.badgeText} font-mono font-bold text-xs flex items-center justify-center border ${userPerm.badgeBorder} shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                    <span className={`font-bold text-[11px] truncate max-w-[120px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      {currentUser.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${userPerm.badgeText}`}>
                      {userPerm.shortRole}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isLight ? 'text-slate-500' : 'text-white/70'
                    } ${isUserMenuOpen ? 'rotate-180 text-terracotta' : ''}`}
                  />
                </button>

                {/* Dropdown Menu attached to Top Header */}
                {isUserMenuOpen && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl p-3 z-50 font-mono text-xs space-y-2 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 border ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-800 shadow-xl'
                        : 'bg-[#0F1120] border-acid-lime/50 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
                    }`}
                  >
                    {/* Active Account Banner */}
                    <div
                      className={`p-2.5 rounded-xl border space-y-1 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181B30] border-acid-lime/40'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between text-[10px] uppercase font-bold ${
                          isLight ? 'text-slate-500' : 'text-white/50'
                        }`}
                      >
                        <span>TÀI KHOẢN ĐANG ĐĂNG NHẬP</span>
                        <span
                          className={`flex items-center gap-1 font-bold ${
                            isLight ? 'text-terracotta' : 'text-acid-lime'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-ping inline-block ${
                              isLight ? 'bg-terracotta' : 'bg-acid-lime'
                            }`}
                          />
                          ONLINE
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <div
                          className={`w-8 h-8 rounded-full font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm ${
                            isLight ? 'bg-terracotta text-white' : 'bg-acid-lime text-black'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {currentUser.name}
                          </div>
                          <div className={`text-[10px] truncate font-sans ${isLight ? 'text-slate-500' : 'text-line-energy'}`}>
                            {currentUser.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selector Header */}
                    <div
                      className={`px-2 pt-1 text-[10px] uppercase font-bold flex justify-between items-center ${
                        isLight ? 'text-slate-500' : 'text-white/50'
                      }`}
                    >
                      <span>CHUYỂN ĐỔI ROLE & CÁN BỘ:</span>
                      <span className={`font-bold ${isLight ? 'text-terracotta' : 'text-acid-lime'}`}>
                        {staffList.length} Nhân sự
                      </span>
                    </div>

                    {/* Staff Roster */}
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {staffList.map((staff) => {
                        const isSelected = staff.id === currentUser.id;
                        const stPerm = ROLE_PERMISSIONS[staff.roleType] || ROLE_PERMISSIONS['TECHNICIAN'];

                        return (
                          <button
                            key={staff.id}
                            onClick={() => {
                              onSwitchUser(staff.id);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? isLight
                                  ? 'bg-terracotta text-white font-bold shadow-md'
                                  : 'bg-acid-lime text-black font-bold shadow-md'
                                : isLight
                                ? 'hover:bg-slate-100 text-slate-700'
                                : 'hover:bg-white/10 text-white/90'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="truncate text-xs">{staff.name}</span>
                              </div>
                              <span
                                className={`text-[10px] block truncate font-sans ${
                                  isSelected
                                    ? 'text-white/90 font-medium'
                                    : isLight
                                    ? 'text-slate-400'
                                    : 'text-white/50'
                                }`}
                              >
                                {staff.role}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-mono shrink-0 font-bold border ${stPerm.badgeBg} ${stPerm.badgeText} ${stPerm.badgeBorder}`}
                            >
                              {stPerm.shortRole}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Admin Console & Logout buttons */}
                    <div
                      className={`pt-2 border-t space-y-1.5 ${
                        isLight ? 'border-slate-200' : 'border-white/10'
                      }`}
                    >
                      {isCurrentAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('QUẢN TRỊ ROLES');
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full text-center py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-line-energy/20 hover:bg-line-energy/30 text-line-energy border-line-energy/30'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>QUẢN TRỊ ROLES & CẤP QUYỀN</span>
                        </button>
                      )}

                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className={`w-full text-center py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border ${
                            isLight
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                              : 'bg-neon-red/20 hover:bg-neon-red/30 text-neon-red border-neon-red/30'
                          }`}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>ĐĂNG XUẤT TÀI KHOẢN</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  aria-label="Đăng xuất khỏi hệ thống"
                  className={`p-2 rounded-xl border transition-all font-mono text-xs font-bold flex items-center justify-center cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border-rose-200'
                      : 'bg-neon-red/20 hover:bg-neon-red text-neon-red hover:text-white border-neon-red/40'
                  }`}
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Sub-Header Navigation Bar (< XL screens) */}
        <div
          className={`flex xl:hidden overflow-x-auto gap-1.5 px-3 py-1.5 custom-scrollbar border-t justify-start sm:justify-center ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0D1B] border-white/10'
          }`}
        >
          {filteredNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const isRoleTab = item.id === 'QUẢN TRỊ ROLES';
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? isLight
                      ? 'bg-terracotta text-white font-bold shadow-sm'
                      : 'bg-acid-lime text-black font-bold shadow-[0_0_12px_rgba(204,255,0,0.5)]'
                    : isRoleTab
                    ? isLight
                      ? 'bg-terracotta/10 text-terracotta border border-terracotta/30'
                      : 'bg-line-energy/20 text-line-energy border border-line-energy/40'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                    : 'bg-surface text-white/70 hover:text-white border border-white/10'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? isLight
                        ? 'text-white'
                        : 'text-black'
                      : isRoleTab
                      ? isLight
                        ? 'text-terracotta'
                        : 'text-line-energy'
                      : isLight
                      ? 'text-slate-500'
                      : 'text-white/60'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};

