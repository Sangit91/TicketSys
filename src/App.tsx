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
const VisualBackdrop = ({ theme }: { theme: 'dark' | 'light' }) => (
  <Suspense fallback={null}>
    <ParticleBackground />
    <HeroGraphic theme={theme} />
  </Suspense>
);

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
import {
  INITIAL_TICKETS,
  INITIAL_INVENTORY,
  DEPARTMENTS_DATA,
  TECHNICAL_STAFF_USERS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import {
  Ticket,
  TicketStatus,
  TechnicalStaffProfile,
  SystemAuditLog,
  TabType,
  ROLE_PERMISSIONS,
  InventoryItem,
  DepartmentSummary,
} from './types';
import { generateId, fakeSha256 } from './utils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('TỔNG QUAN');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [departments, setDepartments] = useState(DEPARTMENTS_DATA);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
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

  // RBAC State
  const [staffList, setStaffList] = useState<TechnicalStaffProfile[]>(TECHNICAL_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<TechnicalStaffProfile>(TECHNICAL_STAFF_USERS[0]); // Default ADMIN

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

  const addAuditLog = (logData: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SystemAuditLog = {
      ...logData,
      id: generateId('LOG', 2026),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddDepartment = (newDept: DepartmentSummary) => {
    setDepartments((prev) => [...prev, newDept]);
    showNotification(`ĐÃ THÊM KHOA PHÒNG MỚI: ${newDept.name} (${newDept.code})`);
    addAuditLog({
      level: 'INFO',
      category: 'DEPARTMENTS',
      action: 'ADD_DEPARTMENT',
      details: `Khởi tạo thông tin Khoa / Phòng mới: ${newDept.name} (${newDept.code}). Leader: ${newDept.lead}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: newDept.id,
      sha256Hash: fakeSha256(),
    });
  };

  const handleUpdateDepartment = (updatedDept: DepartmentSummary) => {
    setDepartments((prev) => prev.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
    showNotification(`ĐÃ CẬP NHẬT THÔNG TIN KHOA PHÒNG: ${updatedDept.name}`);
    addAuditLog({
      level: 'INFO',
      category: 'DEPARTMENTS',
      action: 'UPDATE_DEPARTMENT',
      details: `Cập nhật cấu hình Khoa / Phòng: ${updatedDept.name}. Băng thông: ${updatedDept.networkBandwidthGbps} Gbps.`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: updatedDept.id,
      sha256Hash: fakeSha256(),
    });
  };

  const handleLoginSuccess = (user: TechnicalStaffProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    const perm = ROLE_PERMISSIONS[user.roleType] || ROLE_PERMISSIONS['ADMIN'];
    if (!perm.allowedTabs.includes(activeTab)) {
      setActiveTab(perm.allowedTabs[0]);
    }

    showNotification(`ĐÃ ĐĂNG NHẬP THÀNH CÔNG: ${user.name.toUpperCase()} (${perm.shortRole})`);
    addAuditLog({
      level: 'SECURITY',
      category: 'RBAC',
      action: 'USER_LOGIN',
      details: `Phiên làm việc mới được mở cho tài khoản ${user.name} với phân hệ role: [${perm.label}].`,
      actorName: user.name,
      actorRole: user.role,
      targetId: user.id,
      sha256Hash: fakeSha256(),
    });
  };

  const handleSwitchUser = (staffId: string) => {
    const targetStaff = staffList.find((s) => s.id === staffId);
    if (targetStaff) {
      setCurrentUser(targetStaff);
      const perm = ROLE_PERMISSIONS[targetStaff.roleType] || ROLE_PERMISSIONS['ADMIN'];
      if (!perm.allowedTabs.includes(activeTab)) {
        setActiveTab(perm.allowedTabs[0]);
      }

      showNotification(`CHUYỂN PHIÊN PHÂN QUYỀN: ${targetStaff.name.toUpperCase()} (${perm.shortRole})`);
      addAuditLog({
        level: 'SECURITY',
        category: 'RBAC',
        action: 'SWITCH_USER_SESSION',
        details: `Chuyển đổi tài khoản làm việc sang: ${targetStaff.name} (${perm.label}).`,
        actorName: targetStaff.name,
        actorRole: targetStaff.role,
        targetId: targetStaff.id,
        sha256Hash: fakeSha256(),
      });
    }
  };

  const handleUpdateStaffDepartments = (staffId: string, departmentIds: string[]) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, assignedDepartmentIds: departmentIds } : s))
    );
    if (currentUser.id === staffId) {
      setCurrentUser((prev) => ({ ...prev, assignedDepartmentIds: departmentIds }));
    }
    showNotification(`ĐÃ CẬP NHẬT GÁN PHÂN CÔNG KHOA PHÒNG PHỤ TRÁCH CHO KĨ THUẬT VIÊN`);
    addAuditLog({
      level: 'SECURITY',
      category: 'RBAC',
      action: 'UPDATE_STAFF_DEPARTMENTS',
      details: `Thay đổi danh sách khoa phòng được giao phụ trách cho kĩ thuật viên ID [${staffId}].`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: staffId,
      sha256Hash: fakeSha256(),
    });
  };

  const handleAddStaffProfile = (newStaff: TechnicalStaffProfile) => {
    setStaffList((prev) => [...prev, newStaff]);
    showNotification(`ĐÃ KHỞI TẠO TÀI KHOẢN KĨ THUẬT VIÊN MỚI: ${newStaff.name}`);
    addAuditLog({
      level: 'SECURITY',
      category: 'RBAC',
      action: 'ADD_STAFF_PROFILE',
      details: `Khởi tạo hồ sơ nhân sự kĩ thuật viên mới: ${newStaff.name} - Chuyên môn: ${newStaff.specialty}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: newStaff.id,
      sha256Hash: fakeSha256(),
    });
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
    showNotification(`ĐÃ THÊM THIẾT BỊ / MỰC IN MỚI: ${newItem.name}`);
    addAuditLog({
      level: 'SUCCESS',
      category: 'INVENTORY',
      action: 'ADD_INVENTORY_ASSET',
      details: `Nhập kho thiết bị / mực in y tế mới: ${newItem.name} [Mã QR: ${newItem.qrCodeUrl}]`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: newItem.id,
      sha256Hash: fakeSha256(),
    });
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    showNotification(`ĐÃ CẬP NHẬT NHẬT KÝ VẬN HÀNH THIẾT BỊ [${updatedItem.id}]`);
    addAuditLog({
      level: 'INFO',
      category: 'INVENTORY',
      action: 'UPDATE_ASSET_LOG',
      details: `Cập nhật hồ sơ vận hành thiết bị ${updatedItem.name} (${updatedItem.id}). Vị trí: ${updatedItem.location}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: updatedItem.id,
      sha256Hash: fakeSha256(),
    });
  };

  // Handle New Ticket Submission
  const handleCreateTicket = (
    newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const id = generateId('INC', 2026);
    const now = new Date().toISOString();

    const created: Ticket = {
      ...newTicketData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setTickets((prev) => [created, ...prev]);
    showNotification(`TICKET [${id}] CREATED SUCCESSFULLY AND DISPATCHED TO NCO`);
    addAuditLog({
      level: 'INFO',
      category: 'TICKETS',
      action: 'CREATE_TICKET',
      details: `Tạo yêu cầu hỗ trợ sự cố mới [${id}]: ${created.title}. Đơn vị: ${created.departmentName}`,
      actorName: created.requestorName,
      actorRole: created.requestorRole || 'Cán Bộ Y Tế',
      targetId: id,
      sha256Hash: fakeSha256(),
    });
  };

  // Handle Updating Status
  const handleUpdateTicketStatus = (
    ticketId: string,
    newStatus: TicketStatus,
    notes?: string,
    engineer?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus,
            resolutionNotes: notes || t.resolutionNotes,
            assignedEngineer: engineer || t.assignedEngineer,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              resolutionNotes: notes || prev.resolutionNotes,
              assignedEngineer: engineer || prev.assignedEngineer,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    showNotification(`TICKET [${ticketId}] UPDATED TO STATUS: ${newStatus}`);
    addAuditLog({
      level: newStatus === 'ĐÃ HOÀN THÀNH' ? 'SUCCESS' : 'INFO',
      category: 'TICKETS',
      action: 'UPDATE_TICKET_STATUS',
      details: `Cập nhật trạng thái sự cố [${ticketId}] sang "${newStatus}". Phụ trách: ${engineer || currentUser.name}. Ghi chú: ${notes || 'N/A'}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: ticketId,
      sha256Hash: fakeSha256(),
    });
  };

  // Handle Dual E2E Digital Verification
  const handleVerifyE2E = (
    ticketId: string,
    itSignature: string,
    userSignature: string,
    verificationMethod: 'DIGITAL_CODE' | 'FILE_UPLOAD' = 'DIGITAL_CODE',
    signedFileInfo?: {
      name: string;
      url: string;
      type: string;
      uploadTime: string;
      hash: string;
    }
  ) => {
    const now = new Date().toISOString();

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            e2eVerified: true,
            itSignature,
            userSignature,
            verificationMethod,
            signedFileName: signedFileInfo?.name,
            signedFileUrl: signedFileInfo?.url,
            signedFileType: signedFileInfo?.type,
            signedFileUploadTime: signedFileInfo?.uploadTime || now,
            signedFileHash: signedFileInfo?.hash,
            updatedAt: now,
          };
        }
        return t;
      })
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              e2eVerified: true,
              itSignature,
              userSignature,
              verificationMethod,
              signedFileName: signedFileInfo?.name,
              signedFileUrl: signedFileInfo?.url,
              signedFileType: signedFileInfo?.type,
              signedFileUploadTime: signedFileInfo?.uploadTime || now,
              signedFileHash: signedFileInfo?.hash,
            }
          : null
      );
    }

    const logDetails = verificationMethod === 'FILE_UPLOAD'
      ? `Nộp biên bản nghiệm thu ký số bằng file đính kèm: ${signedFileInfo?.name || 'File.pdf'}. Đóng vết thời gian TSA lúc ${signedFileInfo?.uploadTime || now}. Hash: ${signedFileInfo?.hash}`
      : `Xác thực thành công cặp chữ ký số PKI hai chiều: CNTT [${itSignature}] & Bác sĩ [${userSignature}] cho ticket [${ticketId}].`;

    showNotification(`E2E DUAL SIGNATURE VERIFIED FOR TICKET [${ticketId}]`);

    addAuditLog({
      level: 'KÝ SỐ',
      category: 'KÝ SỐ',
      action: verificationMethod === 'FILE_UPLOAD' ? 'UPLOAD_SIGNATURE_DOC' : 'VERIFY_E2E_SMARTCA_CODE',
      details: logDetails,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: ticketId,
      signedFileName: signedFileInfo?.name,
      signedFilePreview: signedFileInfo?.url,
      sha256Hash: signedFileInfo?.hash || fakeSha256(),
    });
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
      {/* Nền trực quan (Three.js + SVG) — chỉ render ở tab TỔNG QUAN để giảm tải GPU/bundle */}
      {activeTab === 'TỔNG QUAN' && <VisualBackdrop theme={theme} />}

      {/* z-30: Header Overlay */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        criticalCount={criticalCount}
        currentUser={currentUser}
        staffList={staffList}
        onSwitchUser={handleSwitchUser}
        onLogout={() => setIsLoggedIn(false)}
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

            {/* Bottom Line: Terracotta Orange in Light Mode, Acid Lime in Dark Mode */}
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
                  onSelectTicket={(t) => setSelectedTicket(t)}
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
                  onAddLog={(newLog) => setAuditLogs((prev) => [newLog, ...prev])}
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
        onClose={() => setSelectedTicket(null)}
        onUpdateStatus={handleUpdateTicketStatus}
        onVerifyE2E={handleVerifyE2E}
      />
    </div>
  );
}
