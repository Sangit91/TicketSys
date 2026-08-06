import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  Activity,
  User,
  Clock,
  Terminal,
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lock,
  X,
  FileCheck,
  ChevronRight,
  Database,
  Eye,
  Plus,
} from 'lucide-react';
import { SystemAuditLog, AuditLogLevel, AuditLogCategory, TechnicalStaffProfile } from '../types';
import { generateId, fakeSha256 } from '../utils';

interface AuditLogsViewProps {
  logs: SystemAuditLog[];
  onAddLog?: (newLog: SystemAuditLog) => void;
  currentUser: TechnicalStaffProfile;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  onAddLog,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('TẤT CẢ');
  const [selectedCategory, setSelectedCategory] = useState<string>('TẤT CẢ');
  const [selectedLogForInspection, setSelectedLogForInspection] = useState<SystemAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveAutoRefresh, setIsLiveAutoRefresh] = useState(true);

  // Filters calculation
  const filteredLogs = logs.filter((log) => {
    const matchesLevel =
      selectedLevel === 'TẤT CẢ' || log.level.toUpperCase() === selectedLevel.toUpperCase();
    const matchesCategory =
      selectedCategory === 'TẤT CẢ' || log.category.toUpperCase() === selectedCategory.toUpperCase();
    
    const query = searchTerm.toLowerCase();
    const matchesQuery =
      !searchTerm ||
      log.id.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.actorName.toLowerCase().includes(query) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(query)) ||
      (log.targetId && log.targetId.toLowerCase().includes(query)) ||
      (log.sha256Hash && log.sha256Hash.toLowerCase().includes(query));

    return matchesLevel && matchesCategory && matchesQuery;
  });

  // KPI Metrics
  const totalCount = logs.length;
  const securityCount = logs.filter((l) => l.level === 'SECURITY' || l.level === 'WARNING').length;
  const signatureCount = logs.filter((l) => l.category === 'KÝ SỐ' || l.level === 'KÝ SỐ').length;
  const errorCount = logs.filter((l) => l.level === 'ERROR').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AUDIT_LOG_EXPORT_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSimulateNewEvent = () => {
    if (!onAddLog) return;
    const actions = [
      {
        level: 'KÝ SỐ' as AuditLogLevel,
        category: 'KÝ SỐ' as AuditLogCategory,
        action: 'VERIFY_E2E_TSA_DOCUMENT',
        details: 'Ký số xác nhận nghiệm thu kỹ thuật thành công bằng chữ ký số SmartCA PKI. Gắn vết thời gian TSA.',
      },
      {
        level: 'WARNING' as AuditLogLevel,
        category: 'INVENTORY' as AuditLogCategory,
        action: 'TEMPERATURE_HIGH_WARNING',
        details: 'Cảnh báo nhiệt độ Tủ Rack 02 vượt 42°C. Đã khởi động quạt làm mát tự động.',
      },
      {
        level: 'INFO' as AuditLogLevel,
        category: 'TICKETS' as AuditLogCategory,
        action: 'CREATE_INCIDENT_TICKET',
        details: 'Khởi tạo ticket xử lý sự cố mạng HIS từ Phòng Khám Cấp Cứu #04.',
      },
      {
        level: 'SUCCESS' as AuditLogLevel,
        category: 'DEPARTMENTS' as AuditLogCategory,
        action: 'ALLOCATE_BUDGET_APPROVED',
        details: 'Phê duyệt phân bổ kinh phí nâng cấp hạ tầng mạng quang 10G Khoa Cấp Cứu.',
      },
      {
        level: 'SECURITY' as AuditLogLevel,
        category: 'SECURITY' as AuditLogCategory,
        action: 'ZERO_TRUST_SESSION_VALIDATION',
        details: 'Xác thực chứng thư số thành công trên Cổng An Ninh Zero-Trust BHYT.',
      },
    ];

    const randomPick = actions[Math.floor(Math.random() * actions.length)];
    const now = new Date();
    const newLog: SystemAuditLog = {
      id: generateId('LOG', 2026),
      timestamp: now.toISOString(),
      level: randomPick.level,
      category: randomPick.category,
      action: randomPick.action,
      details: randomPick.details,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      ipAddress: `10.200.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 200)}`,
      targetId: generateId('RES'),
      sha256Hash: fakeSha256(),
      payloadDiff: {
        timestamp: now.toISOString(),
        executor: currentUser.name,
        verified: true,
      },
    };

    onAddLog(newLog);
  };

  const getLevelBadgeClass = (level: AuditLogLevel) => {
    switch (level) {
      case 'SUCCESS':
        return 'bg-acid-lime/15 text-acid-lime border-acid-lime/40';
      case 'KÝ SỐ':
        return 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ERROR':
        return 'bg-neon-red/20 text-neon-red border-neon-red/40';
      case 'SECURITY':
        return 'bg-line-energy/20 text-line-energy border-line-energy/40';
      default:
        return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Logs */}
        <div className="p-4 rounded-xl bg-panel border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono">
            <span>TỔNG SỐ AUDIT LOGS</span>
            <ScrollText className="w-4 h-4 text-acid-lime" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 font-display">
            <span className="text-2xl sm:text-3xl text-white font-bold tracking-wider">{totalCount}</span>
            <span className="text-[10px] text-acid-lime font-mono">HOẠT ĐỘNG</span>
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-acid-lime animate-ping" />
            <span>Ghi nhận thời gian thực</span>
          </div>
        </div>

        {/* Dual Signatures & TSA */}
        <div className="p-4 rounded-xl bg-panel border border-neon-cyan/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono">
            <span>XÁC NHẬN KÝ SỐ & TSA</span>
            <FileCheck className="w-4 h-4 text-neon-cyan" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 font-display">
            <span className="text-2xl sm:text-3xl text-neon-cyan font-bold tracking-wider">{signatureCount}</span>
            <span className="text-[10px] text-neon-cyan font-mono">BIÊN BẢN</span>
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            <span>Đã khóa vết SHA-256</span>
          </div>
        </div>

        {/* Security Events */}
        <div className="p-4 rounded-xl bg-panel border border-line-energy/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono">
            <span>AN NINH & RBAC</span>
            <ShieldCheck className="w-4 h-4 text-line-energy" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 font-display">
            <span className="text-2xl sm:text-3xl text-line-energy font-bold tracking-wider">{securityCount}</span>
            <span className="text-[10px] text-line-energy font-mono">CẢNH BÁO</span>
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            <span>An toàn 100% Zero-Trust</span>
          </div>
        </div>

        {/* System Diagnostics / Errors */}
        <div className="p-4 rounded-xl bg-panel border border-neon-red/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 text-xs font-mono">
            <span>TROUBLESHOOT & LỖI</span>
            <AlertTriangle className="w-4 h-4 text-neon-red" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 font-display">
            <span className="text-2xl sm:text-3xl text-neon-red font-bold tracking-wider">{errorCount}</span>
            <span className="text-[10px] text-neon-red font-mono">SỰ CỐ HẠ TẦNG</span>
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            <span>Sẵn sàng truy vết gốc</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="p-4 rounded-xl bg-panel border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã Log, Tên Cán Bộ, Hành Vi, Mã Sự Cố, Địa Chỉ IP hay Mã SHA-256..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-space-bg border border-white/20 pl-9 pr-4 py-2 text-xs font-mono text-white rounded-lg outline-none focus:border-acid-lime transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={handleSimulateNewEvent}
              className="px-3 py-2 rounded-lg bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md transition-all"
              title="Mô phỏng tự động phát sinh 1 sự kiện Audit mới"
            >
              <Plus className="w-4 h-4" />
              <span>MÔ PHỎNG HOẠT ĐỘNG MỚI</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>XUẤT LOG JSON</span>
            </button>

            <button
              onClick={() => setIsLiveAutoRefresh(!isLiveAutoRefresh)}
              className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap border transition-all ${
                isLiveAutoRefresh
                  ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan font-bold'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveAutoRefresh ? 'animate-spin' : ''}`} />
              <span>LIVE FEED</span>
            </button>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10 text-xs font-mono">
          <span className="text-white/40 text-[11px] uppercase tracking-wider mr-2 font-bold flex items-center gap-1">
            <Filter className="w-3 h-3 text-acid-lime" /> MỨC ĐỘ LOG:
          </span>
          {['TẤT CẢ', 'KÝ SỐ', 'SUCCESS', 'WARNING', 'ERROR', 'SECURITY', 'INFO'].map((level) => {
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? level === 'KÝ SỐ'
                      ? 'bg-neon-cyan text-black shadow-sm'
                      : level === 'ERROR'
                      ? 'bg-neon-red text-white shadow-sm'
                      : level === 'WARNING'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'bg-acid-lime text-black shadow-sm'
                    : 'bg-space-bg text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-white/40 text-[11px] uppercase tracking-wider mr-2 font-bold flex items-center gap-1">
            <Database className="w-3 h-3 text-line-energy" /> MODULE:
          </span>
          {['TẤT CẢ', 'KÝ SỐ', 'TICKETS', 'INVENTORY', 'TOPOLOGY', 'DEPARTMENTS', 'RBAC', 'SECURITY'].map(
            (cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-line-energy text-black font-bold'
                      : 'bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="rounded-xl bg-panel border border-white/10 overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="p-3 bg-[#14182D] border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-acid-lime" />
            <span className="font-bold text-white uppercase">NHẬT KÝ THAO TÁC & VẾT TROUBLESHOOT CỦA BỆNH VIỆN</span>
          </div>
          <span className="text-[11px] text-acid-lime font-bold">
            Hiển thị {filteredLogs.length} / {logs.length} bản ghi
          </span>
        </div>

        {/* Table Body */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-mono text-xs space-y-2">
            <ScrollText className="w-10 h-10 mx-auto text-white/20" />
            <div>Không tìm thấy nhật ký thao tác phù hợp với bộ lọc.</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {filteredLogs.map((log) => {
              const isSelected = selectedLogForInspection?.id === log.id;

              return (
                <div
                  key={log.id}
                  className={`p-3 sm:p-3.5 hover:bg-white/[0.03] transition-colors font-mono text-xs lg:grid lg:grid-cols-12 lg:items-center lg:gap-4 flex flex-col gap-2.5 ${
                    isSelected ? 'bg-white/[0.06] border-l-2 border-acid-lime' : ''
                  }`}
                >
                  {/* Column 1 (span 4): ID, Level, Category, Timestamp */}
                  <div className="lg:col-span-4 flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    <span className="text-[11px] font-bold text-acid-lime bg-acid-lime/10 border border-acid-lime/30 px-2 py-0.5 rounded shrink-0 font-mono">
                      {log.id}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getLevelBadgeClass(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>

                    <span className="text-[10px] text-line-energy bg-line-energy/10 px-1.5 py-0.5 rounded border border-line-energy/20 font-bold uppercase shrink-0">
                      {log.category}
                    </span>

                    <span className="text-[10px] text-white/40 flex items-center gap-1 shrink-0 ml-auto sm:ml-0 font-mono">
                      <Clock className="w-3 h-3 text-white/40" />
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  {/* Column 2 (span 5): Action Name & Summary Details */}
                  <div className="lg:col-span-5 min-w-0">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5 truncate">
                      <ChevronRight className="w-3.5 h-3.5 text-acid-lime shrink-0" />
                      <span className="truncate">{log.action}</span>
                    </div>
                    <div className="text-white/70 text-[11px] font-sans mt-0.5 line-clamp-1 leading-relaxed truncate">
                      {log.details}
                    </div>
                  </div>

                  {/* Column 3 (span 3): Actor Name, IP & Inspector Action Button */}
                  <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
                    <div className="text-left lg:text-right min-w-0">
                      <div className="text-white font-bold text-[11px] flex items-center lg:justify-end gap-1 truncate max-w-[170px]" title={log.actorName}>
                        <User className="w-3 h-3 text-acid-lime shrink-0" />
                        <span className="truncate">{log.actorName}</span>
                      </div>
                      <div className="text-white/40 text-[10px] font-mono truncate">
                        IP: {log.ipAddress || '10.200.0.1'}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedLogForInspection(log)}
                      className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-acid-lime hover:text-black text-white font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0 border border-white/20 hover:shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>TRUY VẾT</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Troubleshoot Detail Inspector Modal */}
      <AnimatePresence>
        {selectedLogForInspection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-panel border border-acid-lime/50 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#14182D] p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-5 h-5 text-acid-lime" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-acid-lime">
                        AUDIT INSPECTOR [{selectedLogForInspection.id}]
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getLevelBadgeClass(
                          selectedLogForInspection.level
                        )}`}
                      >
                        {selectedLogForInspection.level}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-white font-bold mt-0.5">
                      {selectedLogForInspection.action}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLogForInspection(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-5 font-mono text-xs">
                {/* Meta Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-space-bg border border-white/10 rounded-xl">
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Thời Gian Hệ Thống</span>
                    <span className="text-white font-bold">{new Date(selectedLogForInspection.timestamp).toLocaleString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Thao Tác Viên (Actor)</span>
                    <span className="text-acid-lime font-bold">{selectedLogForInspection.actorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Chức Danh / Quyền</span>
                    <span className="text-white/80">{selectedLogForInspection.actorRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Địa Chỉ IP Client</span>
                    <span className="text-line-energy font-bold">{selectedLogForInspection.ipAddress || '10.200.0.1'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Module / Phân Loại</span>
                    <span className="text-neon-cyan font-bold">{selectedLogForInspection.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Mã Tài Sản / Phiếu</span>
                    <span className="text-amber-400 font-bold">{selectedLogForInspection.targetId || 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] text-white/50 block mb-1 font-bold uppercase">Mô Tả Thao Tác Chi Tiết:</label>
                  <div className="p-3 bg-space-bg border border-white/10 rounded-lg text-white/90 leading-relaxed font-sans">
                    {selectedLogForInspection.details}
                  </div>
                </div>

                {/* Payload State Diff */}
                {selectedLogForInspection.payloadDiff && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-acid-lime font-bold uppercase flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" /> PAYLOAD STATE DIFF (BEFORE VS AFTER):
                      </label>
                      <button
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(selectedLogForInspection.payloadDiff, null, 2),
                            'payload'
                          )
                        }
                        className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'payload' ? (
                          <Check className="w-3 h-3 text-acid-lime" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === 'payload' ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-space-bg border border-acid-lime/30 text-acid-lime rounded-lg text-[11px] overflow-x-auto custom-scrollbar font-mono">
                      {JSON.stringify(selectedLogForInspection.payloadDiff, null, 2)}
                    </pre>
                  </div>
                )}

                {/* SHA256 & TSA Security Verification Badge */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> VẾT BẢO MẬT KHÔNG THỂ THAY ĐỔI (CRYPTOGRAPHIC INTEGRITY):
                    </span>
                    <span className="bg-emerald-400 text-black px-2 py-0.5 rounded text-[10px] font-bold">
                      VERIFIED INTRA-HOSPITAL
                    </span>
                  </div>
                  <div className="text-[11px] text-white/70 font-mono break-all bg-black/40 p-2 rounded border border-white/10">
                    {selectedLogForInspection.sha256Hash || 'SHA256-a8f93e11b002c98d784a3e212910ff982110cba'}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-[#14182D] p-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedLogForInspection(null)}
                  className="px-5 py-2 rounded-lg bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold text-xs uppercase cursor-pointer"
                >
                  ĐÓNG TROUBLESHOOT INSPECTOR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
