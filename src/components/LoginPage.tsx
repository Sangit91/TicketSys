import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  Cpu,
  Code2,
  Sparkles,
  KeyRound,
  Radio,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import { TechnicalStaffProfile, UserRole, ROLE_PERMISSIONS } from '../types';

interface LoginPageProps {
  staffList: TechnicalStaffProfile[];
  onLoginSuccess: (user: TechnicalStaffProfile) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  staffList,
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('ADMIN');
  const loginTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loginTimerRef.current) {
        window.clearTimeout(loginTimerRef.current);
      }
    };
  }, []);

  // Helper to map roleType to icon
  const getRoleIcon = (roleType: UserRole) => {
    switch (roleType) {
      case 'ADMIN':
        return ShieldAlert;
      case 'DOCTOR':
        return Stethoscope;
      case 'NURSE':
        return HeartPulse;
      case 'HARDWARE_TECH':
        return Cpu;
      case 'SOFTWARE_TECH':
        return Code2;
      default:
        return User;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);

    loginTimerRef.current = window.setTimeout(() => {
      // Find matching staff profile by username/email or name match
      const matched = staffList.find(
        (s) =>
          (s.username && s.username.toLowerCase() === username.trim().toLowerCase()) ||
          s.email.toLowerCase() === username.trim().toLowerCase() ||
          s.id.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched) {
        if (matched.password && matched.password !== password) {
          setErrorMsg('Mật khẩu không chính xác. Mật khẩu dùng thử mặc định: 123');
          setLoading(false);
          return;
        }
        onLoginSuccess(matched);
      } else {
        setErrorMsg('Không tìm thấy tài khoản. Mở tab "Đăng nhập nhanh theo Role" bên dưới để chọn tài khoản thử nghiệm.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickRoleLogin = (staff: TechnicalStaffProfile) => {
    setLoading(true);
    loginTimerRef.current = window.setTimeout(() => {
      onLoginSuccess(staff);
    }, 200);
  };

  const activeStaff = staffList.find((s) => s.roleType === activeRoleTab) || staffList[0];
  const activePerm = activeStaff ? (ROLE_PERMISSIONS[activeStaff.roleType] || ROLE_PERMISSIONS['TECHNICIAN']) : ROLE_PERMISSIONS['ADMIN'];
  const ActiveRoleIcon = getRoleIcon(activeStaff?.roleType || 'ADMIN');

  return (
    <div className={`min-h-screen w-full font-sans flex flex-col justify-between relative overflow-hidden select-none py-4 px-4 transition-colors duration-300 ${
      isLight ? 'bg-transparent text-slate-800' : 'bg-transparent text-white'
    }`}>
      {/* Dynamic Background Glow Elements */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[150px] pointer-events-none ${
        isLight ? 'bg-terracotta/10' : 'bg-acid-lime/10'
      }`} />
      <div className={`absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${
        isLight ? 'bg-blue-400/15' : 'bg-line-energy/15'
      }`} />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${isLight ? '#E05D38' : '#CCFF00'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* TOP HEADER BRANDING */}
      <header className={`relative z-10 w-full max-w-5xl mx-auto p-3.5 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl transition-all ${
        isLight
          ? 'bg-white/80 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xl'
          : 'border-b border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            {!isLight && (
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-acid-lime via-line-energy to-acid-lime opacity-50 blur-md animate-pulse" />
            )}
            <div className={`relative w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isLight
                ? 'bg-[#FDF0EB] border-terracotta/50 text-terracotta shadow-xs'
                : 'bg-panel border-acid-lime/60 text-acid-lime shadow-[0_0_20px_rgba(204,255,0,0.4)]'
            }`}>
              <Zap className={`w-5 h-5 ${isLight ? 'fill-terracotta stroke-terracotta' : 'fill-acid-lime stroke-acid-lime'}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-display text-base sm:text-lg font-black tracking-wide uppercase leading-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                TT ĐIỀU HÀNH CNTT & Y TẾ
              </h1>
              <span className={`inline-flex items-center gap-1 font-mono text-[10px] border px-2 py-0.5 rounded-full font-bold ${
                isLight
                  ? 'bg-[#FDF0EB] text-terracotta border-terracotta/40'
                  : 'bg-acid-lime/20 text-acid-lime border-acid-lime/40'
              }`}>
                <Radio className={`w-2.5 h-2.5 animate-pulse ${isLight ? 'text-terracotta' : 'text-acid-lime'}`} />
                RBAC ACCESS
              </span>
            </div>
            <p className={`text-[11px] font-mono tracking-wider uppercase mt-0.5 ${
              isLight ? 'text-slate-500' : 'text-white/60'
            }`}>
              BVĐK KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl border backdrop-blur-md ${
            isLight
              ? 'bg-slate-100/80 border-slate-200/80 text-slate-700'
              : 'bg-panel/80 border-white/10 text-white/70'
          }`}>
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-terracotta' : 'text-acid-lime'}`} />
            <span>XÁC THỰC MÃ HÓA ISO 27001</span>
          </div>

          {/* Theme Switcher Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Chuyển đổi giao diện sáng/tối"
              className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                  : 'bg-panel border-white/20 text-white hover:bg-white/10'
              }`}
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-[11px]">GIAO DIỆN TỐI</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-acid-lime" />
                  <span className="hidden sm:inline text-[11px] text-acid-lime">GIAO DIỆN SÁNG</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* MAIN CENTERED CONTAINER */}
      <main className="relative z-10 w-full max-w-2xl mx-auto py-8 my-auto">
        <div className={`border rounded-3xl p-8 sm:p-10 lg:p-12 backdrop-blur-2xl relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] text-slate-800'
            : 'bg-[#0A0D1B]/95 border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white'
        }`}>
          {/* Top Accent Line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            isLight
              ? 'from-terracotta via-amber-500 to-blue-600'
              : 'from-acid-lime via-line-energy to-neon-red'
          }`} />

          {/* Form Header */}
          <div className="text-center space-y-3 mb-8">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold ${
              isLight
                ? 'bg-[#FDF0EB] border-terracotta/30 text-terracotta'
                : 'bg-acid-lime/10 border-acid-lime/30 text-acid-lime'
            }`}>
              <KeyRound className="w-4 h-4" />
              <span>CỔNG ĐĂNG NHẬP HỆ THỐNG</span>
            </div>
            <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide uppercase ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Đăng Nhập Tài Khoản
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-sans max-w-lg mx-auto ${
              isLight ? 'text-slate-600' : 'text-white/60'
            }`}>
              Đăng nhập bằng tài khoản cá nhân hoặc chọn nhanh Role dùng thử bên dưới để trải nghiệm phân quyền ứng dụng.
            </p>
          </div>

          {errorMsg && (
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium mb-6 animate-in fade-in flex items-start gap-2.5 ${
              isLight
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-neon-red/15 border-neon-red/40 text-neon-red'
            }`}>
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5 sm:space-y-6">
            {/* Username Field */}
            <div className="space-y-2 text-left">
              <label className={`block text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}>
                Tên Đăng Nhập / Email:
              </label>
              <div className="relative">
                <User className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-white/40'
                }`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: admin, bacsi.nam, dieuduong.hong..."
                  className={`w-full border pl-12 pr-4 py-3.5 sm:py-4 text-xs sm:text-sm font-mono rounded-2xl outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 placeholder:text-slate-400'
                      : 'bg-space-bg border-white/20 text-white focus:border-acid-lime focus:ring-2 focus:ring-acid-lime/30 placeholder:text-white/30'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-left">
              <label className={`block text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}>
                Mật Khẩu Mật Mã:
              </label>
              <div className="relative">
                <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-slate-400' : 'text-white/40'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu mặc định: 123"
                  className={`w-full border pl-12 pr-11 py-3.5 sm:py-4 text-xs sm:text-sm font-mono rounded-2xl outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 placeholder:text-slate-400'
                      : 'bg-space-bg border-white/20 text-white focus:border-acid-lime focus:ring-2 focus:ring-acid-lime/30 placeholder:text-white/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện/ẩn mật khẩu"
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className={`flex items-center gap-2.5 cursor-pointer font-mono ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`rounded w-4 h-4 focus:ring-0 ${
                    isLight
                      ? 'border-slate-300 bg-white text-terracotta accent-terracotta'
                      : 'border-white/20 bg-space-bg text-acid-lime accent-acid-lime'
                  }`}
                />
                <span>Ghi nhớ phiên (ISO 27001)</span>
              </label>
              <span className={`hover:underline cursor-pointer font-mono text-xs sm:text-sm ${
                isLight ? 'text-blue-600' : 'text-line-energy'
              }`}>
                Mật khẩu dùng thử: <strong className={isLight ? 'text-slate-900' : 'text-white'}>123</strong>
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-3 font-mono font-bold text-sm sm:text-base uppercase py-4 rounded-2xl tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 border ${
                isLight
                  ? 'bg-terracotta hover:bg-[#c84c2b] text-white shadow-md border-terracotta'
                  : 'bg-acid-lime hover:bg-acid-lime-dim text-black shadow-[0_0_25px_rgba(204,255,0,0.4)] border-acid-lime'
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${
                    isLight ? 'border-white' : 'border-black'
                  }`} />
                  ĐANG XÁC THỰC THÔNG TIN...
                </span>
              ) : (
                <>
                  <span>XÁC NHẬN ĐĂNG NHẬP</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* COLLAPSIBLE TAB / ACCORDION FOR QUICK ROLE SELECTION */}
          <div className={`mt-6 pt-5 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <button
              type="button"
              onClick={() => setShowRolesPanel(!showRolesPanel)}
              className={`w-full border p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-mono font-bold flex items-center justify-between transition-all cursor-pointer group shadow-sm ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                  : 'bg-[#12162B] hover:bg-[#1A203E] border-white/15 hover:border-acid-lime/50 text-white'
              }`}
            >
              <div className={`flex items-center gap-2 ${isLight ? 'text-terracotta' : 'text-acid-lime'}`}>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>ĐĂNG NHẬP NHANH THEO ROLE DÙNG THỬ</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                <span>{showRolesPanel ? 'Thu gọn' : 'Bật mở tab cho từng Role'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  showRolesPanel ? `rotate-180 ${isLight ? 'text-terracotta' : 'text-acid-lime'}` : ''
                }`} />
              </div>
            </button>

            {/* EXPANDABLE TABBED ROLE SELECTOR PANEL */}
            {showRolesPanel && (
              <div className={`mt-3 border rounded-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-200 ${
                isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-space-bg/90 border-acid-lime/30'
              }`}>
                {/* Role Tabs Header */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  {staffList.map((staff) => {
                    const isTabActive = activeRoleTab === staff.roleType;
                    const perm = ROLE_PERMISSIONS[staff.roleType] || ROLE_PERMISSIONS['TECHNICIAN'];

                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setActiveRoleTab(staff.roleType)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-bold text-[10px] uppercase shrink-0 transition-all cursor-pointer border ${
                          isTabActive
                            ? isLight
                              ? 'bg-terracotta text-white border-terracotta shadow-xs'
                              : 'bg-acid-lime text-black border-acid-lime shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                            : isLight
                            ? 'bg-white text-slate-700 hover:bg-slate-200/60 border-slate-200'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        {perm.shortRole}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Role Card Details */}
                {activeStaff && (
                  <div className={`border p-3.5 rounded-xl space-y-3 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0D1124] border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${activePerm.badgeBg} ${activePerm.badgeBorder} border flex items-center justify-center shrink-0 ${activePerm.badgeText}`}>
                        <ActiveRoleIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase border ${activePerm.badgeBg} ${activePerm.badgeText} ${activePerm.badgeBorder}`}>
                            {activePerm.shortRole}
                          </span>
                          <span className={`text-xs font-mono truncate ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                            User: {activeStaff.username}
                          </span>
                        </div>
                        <div className={`font-bold text-sm truncate mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {activeStaff.name}
                        </div>
                      </div>
                    </div>

                    <p className={`text-[11px] font-sans text-left leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-white/70'
                    }`}>
                      {activeStaff.specialty}
                    </p>

                    {/* Allowed View List */}
                    <div className={`p-2.5 rounded-lg border text-left space-y-1 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-space-bg/60 border-white/5'
                    }`}>
                      <div className={`text-[10px] font-mono font-bold uppercase ${
                        isLight ? 'text-slate-500' : 'text-white/50'
                      }`}>
                        DANH MỤC VIEW ĐƯỢC PHÉP TRUY CẬP ({activePerm.allowedTabs.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activePerm.allowedTabs.map((tab) => (
                          <span key={tab} className={`px-1.5 py-0.5 rounded text-[9px] font-mono border font-bold ${
                            isLight
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-acid-lime/10 text-acid-lime border-acid-lime/30'
                          }`}>
                            ✓ {tab}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Login Button */}
                    <button
                      type="button"
                      onClick={() => handleQuickRoleLogin(activeStaff)}
                      className={`w-full font-mono font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                        isLight
                          ? 'bg-terracotta hover:bg-[#c84c2b] text-white border-terracotta shadow-xs'
                          : 'bg-acid-lime hover:bg-acid-lime-dim text-black border-acid-lime shadow-md'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ĐĂNG NHẬP TÀI KHOẢN [{activePerm.shortRole}] NGAY</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Liên hệ hỗ trợ: <span className={`font-bold ${isLight ? 'text-terracotta' : 'text-acid-lime'}`}>Phòng CNTT Ext: 8800</span>
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`relative z-10 w-full border-t py-3 px-4 text-center text-xs font-mono transition-colors ${
        isLight
          ? 'border-slate-200 bg-white/80 text-slate-500'
          : 'border-white/10 bg-space-bg/80 text-white/40'
      }`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BVĐK KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM © 2026</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>ISO 27001</span>
            <span>•</span>
            <span>SmartCA</span>
            <span>•</span>
            <span className={isLight ? 'text-terracotta font-bold' : 'text-acid-lime'}>SẴN SÀNG</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

