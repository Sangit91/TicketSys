import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { FooterMarquee } from './components/FooterMarquee';
import { ActionDrawer } from './components/ActionDrawer';
import { ScrambleText } from './components/ScrambleText';
import { TypewriterText } from './components/TypewriterText';
import { TicketDetailModal } from './components/TicketDetailModal';
import { NotificationBanner } from './components/NotificationBanner';
import { LoginPage } from './components/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';

// Background trực quan (Three.js / SVG) — chỉ tải khi cần (login + TỔNG QUAN), tránh nặng GPU/bundle ở tab dữ liệu
const ParticleBackground = lazy(() => import('./components/ParticleBackground').then((m) => ({ default: m.ParticleBackground })));
const HeroGraphic = lazy(() => import('./components/HeroGraphic').then((m) => ({ default: m.HeroGraphic })));

// Bao nền trực quan khi cần hiển thị (login + TỔNG QUAN)
const VisualBackdrop = ({ theme }: { theme: 'dark' | 'light' }) => {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <Suspense fallback={null}>
      {!reducedMotion && <ParticleBackground />}
      <HeroGraphic theme={theme} />
    </Suspense>
  );
};

// Nền tĩnh nhẹ (gradient + lưới chấm CSS, không animation) cho các tab dữ liệu
const StaticBackdrop = ({ theme }: { theme: 'dark' | 'light' }) => {
  const isLight = theme === 'light';
  const dot = isLight ? '#E05D38' : '#CCFF00';
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Basé radial glow (top) */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 85% at 50% 0%, ${
            isLight ? 'rgba(224,93,56,0.10)' : 'rgba(204,255,0,0.08)'
          }, transparent 50%)`,
        }}
      />
      {/* Lưới chấm mờ */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, ${dot} 1px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Lưới đường kẻ nhẹ */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.06)'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
      {/* Ba khối glow mềm */}
      <div
        className={`absolute -top-1/4 -left-1/4 h-[420px] w-[55%] rounded-full blur-[130px] ${
          isLight ? 'bg-terracotta/15' : 'bg-acid-lime/15'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-1/5 h-[420px] w-[45%] rounded-full blur-[140px] ${
          isLight ? 'bg-blue-400/15' : 'bg-line-energy/15'
        }`}
      />
      <div
        className={`absolute -bottom-1/5 left-1/3 h-[360px] w-[45%] rounded-full blur-[150px] ${
          isLight ? 'bg-neon-red/10' : 'bg-neon-red/10'
        }`}
      />
    </div>
  );
};

// Tiêu đề gọn cho các tab dữ liệu (thay cho hero khổng lồ khi xem dữ liệu)
const VIEW_META: Record<string, { title: string; sub: string }> = {
  'TỔNG QUAN': { title: 'Tổng Quan Điều Hành', sub: 'Quản lý vận hành CNTT Bệnh viện' },
  'YÊU CẦU XỬ LÝ': { title: 'Yêu Cầu Xử Lý', sub: 'Phiếu sự cố, phân công & ký số xác nhận' },
  'THIẾT BỊ & TÀI SẢN': { title: 'Thiết Bị & Tài Sản', sub: 'Quản lý thiết bị, mực in, di dời & bảo trì' },
  'SƠ ĐỒ HẠ TẦNG': { title: 'Sơ Đồ Hạ Tầng', sub: 'Bản đồ mạng & luồng dữ liệu liên khoa phòng' },
  'KHOA PHÒNG': { title: 'Khoa Phòng', sub: 'Danh mục khoa, thiết bị & nhân sự phụ trách' },
  'QUẢN TRỊ ROLES': { title: 'Quản Trị Roles', sub: 'Phân quyền RBAC & gán khoa phòng phụ trách' },
  'NHẬT KÝ AUDIT': { title: 'Nhật Ký Audit', sub: 'Vết hoạt động, ký số & kiểm soát an ninh' },
};

// Code-split per-tab views (chunk riêng, chỉ tải khi tab được mở)
const DashboardView = lazy(() => import('./components/DashboardView').then((m) => ({ default: m.DashboardView })));
const TicketsView = lazy(() => import('./components/TicketsView').then((m) => ({ default: m.TicketsView })));
const InventoryView = lazy(() => import('./components/InventoryView').then((m) => ({ default: m.InventoryView })));
const AssetFlowMap = lazy(() => import('./components/AssetFlowMap').then((m) => ({ default: m.AssetFlowMap })));
const DepartmentsView = lazy(() => import('./components/DepartmentsView').then((m) => ({ default: m.DepartmentsView })));
const AdminRoleView = lazy(() => import('./components/AdminRoleView').then((m) => ({ default: m.AdminRoleView })));
const AuditLogsView = lazy(() => import('./components/AuditLogsView').then((m) => ({ default: m.AuditLogsView })));

import { useDataStore } from './data/useDataStore';
import { useSessionStore } from './state/sessionStore';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import {
  Ticket,
  TicketStatus,
  TechnicalStaffProfile,
  TabType,
  ROLE_PERMISSIONS,
  InventoryItem,
  DepartmentSummary,
} from './types';

export default function App() {
  const store = useDataStore();
  const { tickets, inventory, departments, staffList, auditLogs } = store;
  const session = useSessionStore();
  const { currentUser, isLoggedIn } = session;
  const [activeTab, setActiveTab] = useState<TabType>('TỔNG QUAN');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Theme State: 'dark' (Cyber Ops) vs 'light' (9Router Grid Warm Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app-theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000);
  };

  // Persist phiên đăng nhập — đã nằm trong sessionStore (zustand persist)
  // selectedTicket derive từ store (1 nguồn sự thật — hết stale state)
  const selectedTicket: Ticket | null = selectedTicketId
    ? store.tickets.find((t) => t.id === selectedTicketId) ?? null
    : null;

  const handleLoginSuccess = (user: TechnicalStaffProfile) => {
    session.login(user);

    const perm = ROLE_PERMISSIONS[user.roleType] || ROLE_PERMISSIONS['ADMIN'];
    if (!perm.allowedTabs.includes(activeTab)) {
      setActiveTab(perm.allowedTabs[0]);
    }

    showNotification(`ĐÃ ĐĂNG NHẬP THÀNH CÔNG: ${user.name.toUpperCase()} (${perm.shortRole})`);
    store.addAuditLog({
      level: 'SECURITY',
      category: 'RBAC',
      action: 'USER_LOGIN',
      details: `Phiên làm việc mới được mở cho tài khoản ${user.name} với phân hệ role: [${perm.label}].`,
      actorName: user.name,
      actorRole: user.role,
      targetId: user.id,
    });
  };

  const handleSwitchUser = (staffId: string) => {
    const targetStaff = staffList.find((s) => s.id === staffId);
    if (!targetStaff) return;

    session.switchUser(targetStaff);
    const perm = ROLE_PERMISSIONS[targetStaff.roleType] || ROLE_PERMISSIONS['ADMIN'];
    if (!perm.allowedTabs.includes(activeTab)) {
      setActiveTab(perm.allowedTabs[0]);
    }

    showNotification(`CHUYỂN PHIÊN PHÂN QUYỀN: ${targetStaff.name.toUpperCase()} (${perm.shortRole})`);
    store.addAuditLog({
      level: 'SECURITY',
      category: 'RBAC',
      action: 'SWITCH_USER_SESSION',
      details: `Chuyển đổi tài khoản làm việc sang: ${targetStaff.name} (${perm.label}).`,
      actorName: targetStaff.name,
      actorRole: targetStaff.role,
      targetId: targetStaff.id,
    });
  };

  const handleUpdateStaffDepartments = (staffId: string, departmentIds: string[]) => {
    store.updateStaffDepartments(staffId, departmentIds);
    showNotification(`ĐÃ CẬP NHẬT GÁN PHÂN CÔNG KHOA PHÒNG PHỤ TRÁCH CHO KĨ THUẬT VIÊN`);
  };

  const handleAddStaffProfile = (newStaff: TechnicalStaffProfile) => {
    store.addStaffProfile(newStaff);
    showNotification(`ĐÃ KHỞI TẠO TÀI KHOẢN KĨ THUẬT VIÊN MỚI: ${newStaff.name}`);
  };

  const handleAddDepartment = (newDept: DepartmentSummary) => {
    store.addDepartment(newDept);
    showNotification(`ĐÃ THÊM KHOA PHÒNG MỚI: ${newDept.name} (${newDept.code})`);
  };

  const handleUpdateDepartment = (updatedDept: DepartmentSummary) => {
    store.updateDepartment(updatedDept);
    showNotification(`ĐÃ CẬP NHẬT THÔNG TIN KHOA PHÒNG: ${updatedDept.name}`);
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    store.addInventoryItem(newItem);
    showNotification(`ĐÃ THÊM THIẾT BỊ / MỰC IN MỚI: ${newItem.name}`);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    store.updateInventoryItem(updatedItem);
    showNotification(`ĐÃ CẬP NHẬT NHẬT KÝ VẬN HÀNH THIẾT BỊ [${updatedItem.id}]`);
  };

  const handleCreateTicket = (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = store.addTicket(data);
    showNotification(`TICKET [${id}] CREATED SUCCESSFULLY AND DISPATCHED TO NCO`);
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    newStatus: TicketStatus,
    notes?: string,
    engineer?: string
  ) => {
    store.applyTicketStatus(ticketId, newStatus, notes, engineer);
    showNotification(`TICKET [${ticketId}] UPDATED TO STATUS: ${newStatus}`);
  };

  const handleVerifyE2E = (
    ticketId: string,
    itSignature: string,
    userSignature: string,
    verificationMethod: 'DIGITAL_CODE' | 'FILE_UPLOAD' = 'DIGITAL_CODE',
    signedFileInfo?: { name: string; url: string; type: string; uploadTime: string; hash: string }
  ) => {
    store.verifyE2E(ticketId, itSignature, userSignature, verificationMethod, signedFileInfo);
    showNotification(`E2E DUAL SIGNATURE VERIFIED FOR TICKET [${ticketId}]`);
  };

  const criticalCount = tickets.filter(
    (t) =>
      t.priority === 'P1-KHẨN CẤP' &&
      t.status !== 'ĐÃ HOÀN THÀNH' &&
      t.status !== 'ĐÃ ĐÓNG'
  ).length;

  if (!isLoggedIn) {
    return (
      <div
        data-theme={theme}
        className={`relative min-h-screen w-full flex flex-col font-sans overflow-x-clip transition-colors duration-300 ${
          theme === 'light'
            ? 'theme-light bg-canvas-light text-slate-900 selection:bg-terracotta selection:text-white'
            : 'bg-space-bg text-white selection:bg-acid-lime selection:text-black'
        }`}
      >
        {/* z-0 + z-10: Background trực quan (Three.js particle + SVG) — lazy */}
        <VisualBackdrop theme={theme} />

        {/* z-20: Login Page Form & Role Selection Overlay */}
        <div className="relative z-20 min-h-screen flex flex-col justify-between">
          <LoginPage
            staffList={staffList}
            onLoginSuccess={handleLoginSuccess}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      className={`relative min-h-screen w-full flex flex-col font-sans overflow-x-clip transition-colors duration-300 ${
        theme === 'light'
          ? 'theme-light bg-canvas-light text-slate-900 selection:bg-terracotta selection:text-white'
          : 'bg-space-bg text-white selection:bg-acid-lime selection:text-black'
      }`}
    >
      {/* Nền: particle chỉ ở TỔNG QUAN; tab dữ liệu dùng nền tĩnh nhẹ */}
      {activeTab === 'TỔNG QUAN' ? (
        <VisualBackdrop theme={theme} />
      ) : (
        <StaticBackdrop theme={theme} />
      )}

      {/* z-30: Header Overlay */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCount={criticalCount}
        currentUser={currentUser}
        staffList={staffList}
        onSwitchUser={handleSwitchUser}
        onLogout={() => session.logout()}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Real-time Notification Banner */}
      <NotificationBanner
        message={notification}
        onDismiss={() => setNotification(null)}
        theme={theme}
      />

      {/* z-20: Main Dashboard Content Container */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 sm:pt-8 md:pt-12 pb-24 flex flex-col space-y-8">
        {/* Hero / Title: hero lớn chỉ ở tab TỔNG QUAN; tab dữ liệu dùng tiêu đề gọn */}
        {activeTab === 'TỔNG QUAN' ? (
        <section className="text-center space-y-4 pt-2 pb-2">
          {/* Top Status Eyebrow */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md transition-colors ${
              theme === 'light'
                ? 'bg-[#FDF0EB] border border-terracotta/30 shadow-xs'
                : 'bg-card-bg/80 border border-acid-lime/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                theme === 'light' ? 'bg-terracotta' : 'bg-acid-lime'
              }`}
            />
            <span
              className={`font-mono text-[11px] font-bold tracking-widest uppercase ${
                theme === 'light' ? 'text-terracotta' : 'text-acid-lime'
              }`}
            >
              HỆ THỐNG ĐIỀU HÀNH CNTT Y TẾ V4.9
            </span>
          </div>

          {/* Mammoth Headline */}
          <div className="flex flex-col items-center justify-center font-display uppercase tracking-widest">
            {/* Top Line: Sharp Slate in Light Mode, Transparent White Stroke in Dark Mode */}
            <h1
              className={`text-[26px] sm:text-[40px] md:text-[54px] lg:text-[64px] font-black leading-tight ${
                theme === 'light'
                  ? 'text-[#0F172A]'
                  : 'text-stroke-white text-transparent'
              }`}
            >
              QUẢN LÝ VẬN HÀNH
            </h1>

            {/* Bottom Line: Terracotta Orange in Light White, Acid Lime in Dark Mode */}
            <div
              className={`text-[36px] sm:text-[56px] md:text-[76px] lg:text-[92px] font-extrabold bg-transparent mt-2 sm:mt-3 leading-tight ${
                theme === 'light'
                  ? 'text-terracotta'
                  : 'text-acid-lime drop-shadow-[0_0_25px_rgba(204,255,0,0.5)]'
              }`}
            >
              <ScrambleText
                words={['AN TOÀN', 'TOÀN DIỆN', 'TỐI ƯU', 'CHUẨN XÁC']}
                intervalMs={4000}
              />
            </div>
          </div>

          {/* Typewriter Sub-bio */}
          <div
            className={`max-w-2xl mx-auto font-mono text-xs sm:text-sm leading-relaxed min-h-[3rem] ${
              theme === 'light' ? 'text-[#475569]' : 'text-white/80'
            }`}
          >
            <TypewriterText text="Trung tâm điều hành CNTT Bệnh viện: Tiếp nhận & xử lý sự cố y tế 24/7, giám sát hạ tầng thiết bị và sơ đồ luồng dữ liệu liên khoa phòng." />
          </div>
        </section>
        ) : (
          <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pt-1 pb-1">
            <div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-white uppercase tracking-widest font-bold">
                {VIEW_META[activeTab]?.title || activeTab}
              </h1>
              <p className="font-mono text-[11px] sm:text-xs text-white/50 mt-0.5">
                {VIEW_META[activeTab]?.sub || 'Trung tâm điều hành CNTT Bệnh viện'}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid-lime/40 bg-card-bg/80 text-[11px] font-mono font-bold uppercase tracking-widest text-acid-lime self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-acid-lime animate-pulse" />
              {VIEW_META[activeTab]?.title || activeTab}
            </span>
          </section>
        )}

        {/* Tab Selection Area */}
        <div className="w-full">
          <Suspense fallback={<LoadingSkeleton />}>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
              {(activeTab === 'TỔNG QUAN' || (activeTab as string) === 'DASHBOARD') && (
                <DashboardView
                  tickets={tickets}
                  inventory={inventory}
                  departments={departments}
                  staffList={staffList}
                  currentUser={currentUser}
                  auditLogs={auditLogs}
                  onNavigate={(tab) => setActiveTab(tab as TabType)}
                />
              )}

              {(activeTab === 'YÊU CẦU XỬ LÝ' || (activeTab as string) === 'TICKETS') && (
                <TicketsView
                  tickets={tickets}
                  currentUser={currentUser}
                  onSelectTicket={(t) => setSelectedTicketId(t.id)}
                  onOpenDrawer={() => setIsDrawerOpen(true)}
                />
              )}

              {(activeTab === 'THIẾT BỊ & TÀI SẢN' || (activeTab as string) === 'INVENTORY') && (
                <InventoryView
                  inventory={inventory}
                  currentUser={currentUser}
                  departments={departments}
                  onOpenNewTicketForAsset={(assetQr, assetName) => {
                    setIsDrawerOpen(true);
                  }}
                  onAddInventoryItem={handleAddInventoryItem}
                  onUpdateInventoryItem={handleUpdateInventoryItem}
                  onNavigateToTopology={() => setActiveTab('SƠ ĐỒ HẠ TẦNG')}
                />
              )}

              {(activeTab === 'SƠ ĐỒ HẠ TẦNG' || (activeTab as string) === 'ASSET FLOW') && (
                <AssetFlowMap theme={theme} />
              )}

              {(activeTab === 'KHOA PHÒNG' || (activeTab as string) === 'DEPARTMENTS') && (
                <DepartmentsView
                  departments={departments}
                  currentUser={currentUser}
                  staffList={staffList}
                  onOpenDrawerForDept={(deptId) => {
                    setIsDrawerOpen(true);
                  }}
                  onAddDepartment={handleAddDepartment}
                  onUpdateDepartment={handleUpdateDepartment}
                />
              )}

              {(activeTab === 'QUẢN TRỊ ROLES' || (activeTab as string) === 'ROLES') && (
                <AdminRoleView
                  currentUser={currentUser}
                  staffList={staffList}
                  departments={departments}
                  tickets={tickets}
                  onUpdateStaffDepartments={handleUpdateStaffDepartments}
                  onAddStaffProfile={handleAddStaffProfile}
                  onSwitchUser={handleSwitchUser}
                  onAddDepartment={handleAddDepartment}
                />
              )}

              {(activeTab === 'NHẬT KÝ AUDIT' || (activeTab as string) === 'AUDIT LOGS') && (
                <AuditLogsView
                  logs={auditLogs}
                  onAddLog={(newLog) => store.addAuditLog(newLog)}
                  currentUser={currentUser}
                />
              )}
            </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </Suspense>
        </div>
      </main>

      {/* z-30: Footer Marquee */}
      <FooterMarquee theme={theme} />

      {/* z-50: ActionDrawer (New Incident Ticket & Asset Panel) */}
      <ActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmitTicket={handleCreateTicket}
        departments={departments}
      />

      {/* Ticket Inspector Modal */}
      <TicketDetailModal
        key={selectedTicket ? selectedTicket.id : 'no-ticket'}
        ticket={selectedTicket}
        onClose={() => setSelectedTicketId(null)}
        onUpdateStatus={handleUpdateTicketStatus}
        onVerifyE2E={handleVerifyE2E}
      />
    </div>
  );
}