import React from 'react';
import {
  Ticket,
  InventoryItem,
  DepartmentSummary,
  TechnicalStaffProfile,
  SystemAuditLog,
} from '../types';
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  Cpu,
  Activity,
  Radio,
  Gauge,
  Users,
  Building,
  ArrowRight,
  CheckCircle2,
  Wifi,
  Server,
  Lock,
  FileCheck,
} from 'lucide-react';

interface DashboardViewProps {
  tickets: Ticket[];
  inventory: InventoryItem[];
  departments: DepartmentSummary[];
  staffList: TechnicalStaffProfile[];
  currentUser: TechnicalStaffProfile;
  auditLogs: SystemAuditLog[];
  onNavigate: (tab: string) => void;
}

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'ĐANG TRỰC':
      return 'bg-acid-lime/15 text-acid-lime border border-acid-lime/40';
    case 'SẴN SÀNG':
      return 'bg-line-energy/15 text-line-energy border border-line-energy/40';
    default:
      return 'bg-white/10 text-white/60 border border-white/20';
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  inventory,
  departments,
  staffList,
  currentUser,
  auditLogs,
  onNavigate,
}) => {
  const openP1 = tickets.filter(
    (t) => t.priority === 'P1-KHẨN CẤP' && t.status !== 'ĐÃ HOÀN THÀNH' && t.status !== 'ĐÃ ĐÓNG'
  ).length;
  const criticalAssets = inventory.filter((i) => i.health === 'NGUY CẤP').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'ĐANG XỬ LÝ').length;
  const pendingSign = tickets.filter((t) => t.requiresE2EVerification && !t.e2eVerified).length;
  const onDutyStaff = staffList.filter((s) => s.shiftStatus === 'ĐANG TRỰC');
  const availableStaff = staffList.filter((s) => s.shiftStatus === 'SẴN SÀNG');
  const avgHealth = departments.length
    ? Math.round(departments.reduce((sum, d) => sum + d.healthIndex, 0) / departments.length)
    : 0;
  const healthyDepts = departments.filter((d) => d.healthIndex >= 90).length;

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const latestAudit = auditLogs.slice(0, 4);

  return (
    <div className="w-full space-y-6">
      {/* Greeting Banner */}
      <div className="bg-surface/80 border border-acid-lime/40 p-5 rounded-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-acid-lime/20 border border-acid-lime flex items-center justify-center text-acid-lime shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display text-lg sm:text-xl text-white uppercase tracking-wide">
              Tổng Quan Điều Hành
            </div>
            <p className="font-mono text-xs text-white/60 mt-0.5">
              Xin chào <span className="text-acid-lime font-bold">{currentUser.name}</span> ·{' '}
              {currentUser.role} · Phiên: {currentUser.shiftStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-white/60">TRẠNG THÁI HỆ THỐNG:</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-acid-lime bg-acid-lime/10 border border-acid-lime/30 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-acid-lime animate-pulse" />
            HOẠT ĐỘNG 24/7
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <button
          onClick={() => onNavigate('YÊU CẦU XỬ LÝ')}
          className="text-left bg-surface/80 border border-neon-red/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md shadow-lg hover:border-neon-red/70 hover:bg-neon-red/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">
              SỰ CỐ P1 ĐANG MỞ
            </span>
            <AlertTriangle className="w-5 h-5 text-neon-red opacity-90 shrink-0" />
          </div>
          <span className="block font-display text-3xl sm:text-4xl font-extrabold text-neon-red tracking-tight mt-2 drop-shadow-[0_0_12px_rgba(255,51,102,0.4)]">
            {openP1}
          </span>
        </button>

        <button
          onClick={() => onNavigate('THIẾT BỊ & TÀI SẢN')}
          className="text-left bg-surface/80 border border-alert-amber/50 p-3.5 sm:p-4 rounded-xl backdrop-blur-md shadow-lg hover:border-alert-amber/80 hover:bg-alert-amber/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">
              THIẾT BỊ NGUY CẤP
            </span>
            <Cpu className="w-5 h-5 text-alert-amber opacity-90 shrink-0" />
          </div>
          <span className="block font-display text-3xl sm:text-4xl font-extrabold text-alert-amber tracking-tight mt-2 drop-shadow-[0_0_12px_rgba(255,153,0,0.4)]">
            {criticalAssets}
          </span>
        </button>

        <button
          onClick={() => onNavigate('YÊU CẦU XỬ LÝ')}
          className="text-left bg-surface/80 border border-line-energy/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md shadow-lg hover:border-line-energy/70 hover:bg-line-energy/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">
              ĐANG XỬ LÝ
            </span>
            <Clock className="w-5 h-5 text-line-energy opacity-90 shrink-0" />
          </div>
          <span className="block font-display text-3xl sm:text-4xl font-extrabold text-line-energy tracking-tight mt-2 drop-shadow-[0_0_12px_rgba(136,170,255,0.4)]">
            {inProgressTickets}
          </span>
        </button>

        <button
          onClick={() => onNavigate('YÊU CẦU XỬ LÝ')}
          className="text-left bg-surface/80 border border-acid-lime/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md shadow-lg hover:border-acid-lime/70 hover:bg-acid-lime/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">
              CHỜ KÝ SỐ
            </span>
            <ShieldCheck className="w-5 h-5 text-acid-lime opacity-90 shrink-0" />
          </div>
          <span className="block font-display text-3xl sm:text-4xl font-extrabold text-acid-lime tracking-tight mt-2 drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]">
            {pendingSign}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ca trực */}
        <div className="bg-panel/90 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/70 font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-acid-lime" /> CA TRỰC HIỆN TẠI
            </h3>
            <span className="font-mono text-[11px] text-acid-lime bg-acid-lime/10 border border-acid-lime/30 px-2 py-0.5 rounded">
              {onDutyStaff.length} TRỰC / {availableStaff.length} SẴN SÀNG
            </span>
          </div>
          <ul className="space-y-2">
            {staffList.slice(0, 5).map((staff) => (
              <li
                key={staff.id}
                className="flex items-center justify-between gap-3 bg-panel-deep border border-white/10 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-line-energy/15 text-line-energy flex items-center justify-center text-[10px] font-bold shrink-0">
                    {staff.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(-2)
                      .join('')}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-white font-semibold truncate">{staff.name}</div>
                    <div className="text-[10px] text-white/50 truncate">{staff.specialty}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${statusBadgeClass(staff.shiftStatus)}`}>
                  {staff.shiftStatus}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sức khỏe khoa phòng */}
        <div className="bg-panel/90 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/70 font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-line-energy" /> SỨC KHỎE KHOA PHÒNG
            </h3>
            <span className="font-mono text-[11px] text-line-energy bg-line-energy/10 border border-line-energy/30 px-2 py-0.5 rounded">
              {healthyDepts}/{departments.length} TỐT · TB {avgHealth}
            </span>
          </div>
          <ul className="space-y-3">
            {departments.map((dept) => (
              <li key={dept.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/80 font-medium truncate mr-2">{dept.name}</span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      dept.healthIndex >= 90
                        ? 'text-acid-lime'
                        : dept.healthIndex >= 80
                        ? 'text-alert-amber'
                        : 'text-neon-red'
                    }`}
                  >
                    {dept.healthIndex}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.healthIndex >= 90
                        ? 'bg-acid-lime'
                        : dept.healthIndex >= 80
                        ? 'bg-alert-amber'
                        : 'bg-neon-red'
                    }`}
                    style={{ width: `${dept.healthIndex}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* SLA & Telemetry */}
        <div className="bg-panel/90 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-xl">
          <h3 className="font-mono text-xs uppercase tracking-wider text-white/70 font-bold flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-neon-cyan" /> TELEMETRY & SLA
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-panel-deep border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase font-bold">
                <Radio className="w-3 h-3 text-neon-cyan" /> LATENCY
              </div>
              <div className="font-display text-xl text-neon-cyan font-extrabold mt-1">1.8 ms</div>
            </div>
            <div className="bg-panel-deep border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase font-bold">
                <Wifi className="w-3 h-3 text-neon-cyan" /> MẤT GÓI TIN
              </div>
              <div className="font-display text-xl text-neon-cyan font-extrabold mt-1">0.002%</div>
            </div>
            <div className="bg-panel-deep border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase font-bold">
                <Lock className="w-3 h-3 text-acid-lime" /> ĐÚNG SLA
              </div>
              <div className="font-display text-xl text-acid-lime font-extrabold mt-1">99.98%</div>
            </div>
            <div className="bg-panel-deep border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase font-bold">
                <ShieldCheck className="w-3 h-3 text-neon-red" /> CHẶN ĐE DỌA
              </div>
              <div className="font-display text-xl text-neon-red font-extrabold mt-1">14,209</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-panel-deep border border-neon-cyan/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-white/50 font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-neon-cyan" /> TÀI NGUYÊN HỆ THỐNG
              </span>
              <span className="font-mono text-[10px] text-neon-cyan font-bold">ỔN ĐỊNH</span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-line-energy rounded-full" />
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[42%] bg-acid-lime rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ticket gần đây */}
        <div className="bg-panel/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/70 font-bold flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-acid-lime" /> YÊU CẦU MỚI NHẤT
            </h3>
            <button
              onClick={() => onNavigate('YÊU CẦU XỬ LÝ')}
              className="font-mono text-[11px] text-line-energy hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              XEM TẤT CẢ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-white/10">
            {recentTickets.map((t) => (
              <li key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white font-semibold truncate">{t.title}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {t.id} · {t.departmentName} · {t.requestorName}
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] uppercase whitespace-nowrap ${
                    t.priority === 'P1-KHẨN CẤP'
                      ? 'bg-neon-red text-white'
                      : t.priority === 'P2-CAO'
                      ? 'bg-line-energy/20 text-line-energy border border-line-energy/30'
                      : 'bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  {t.priority}
                </span>
              </li>
            ))}
            {recentTickets.length === 0 && (
              <li className="px-5 py-6 text-center text-white/50 text-xs">CHƯA CÓ YÊU CẦU NÀO</li>
            )}
          </ul>
        </div>

        {/* Audit gần đây */}
        <div className="bg-panel/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/70 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-line-energy" /> HOẠT ĐỘNG AUDIT
            </h3>
            <button
              onClick={() => onNavigate('NHẬT KÝ AUDIT')}
              className="font-mono text-[11px] text-line-energy hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              XEM TẤT CẢ <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-white/10">
            {latestAudit.map((log) => (
              <li key={log.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white/90 font-medium truncate">{log.details}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {log.actorName} · {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] uppercase whitespace-nowrap ${
                    log.level === 'KÝ SỐ'
                      ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                      : log.level === 'SECURITY'
                      ? 'bg-line-energy/20 text-line-energy border border-line-energy/40'
                      : log.level === 'ERROR'
                      ? 'bg-neon-red/20 text-neon-red border border-neon-red/40'
                      : 'bg-white/10 text-white/80 border border-white/20'
                  }`}
                >
                  {log.level}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
