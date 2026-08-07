import React, { useState } from 'react';
import { Ticket, TechnicalStaffProfile } from '../types';
import { usePagedRows } from '../hooks/usePagedRows';
import { Pagination } from './Pagination';
import { Search, Filter, ShieldCheck, AlertTriangle, Clock, CheckCircle2, User, QrCode, Eye, Building } from 'lucide-react';

interface TicketsViewProps {
  tickets: Ticket[];
  currentUser?: TechnicalStaffProfile;
  onSelectTicket: (ticket: Ticket) => void;
  onOpenDrawer: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  currentUser,
  onSelectTicket,
  onOpenDrawer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Scope filter: If technician, default to only their assigned departments
  const isTechnician = currentUser && currentUser.roleType !== 'ADMIN';
  const [onlyScopeDepartments, setOnlyScopeDepartments] = useState<boolean>(Boolean(isTechnician));

  const filteredTickets = tickets.filter((t) => {
    // Role/Department scope filter
    if (onlyScopeDepartments && currentUser && currentUser.roleType !== 'ADMIN') {
      if (!currentUser.assignedDepartmentIds.includes(t.departmentId)) {
        return false;
      }
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetQrCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const pageSize = 8;
  const pagination = usePagedRows(filteredTickets, pageSize, [
    searchTerm,
    selectedPriority,
    selectedStatus,
    onlyScopeDepartments,
  ]);
  const pageTickets = pagination.rows;

  const criticalCount = tickets.filter((t) => t.priority.includes('KHẨN CẤP') || t.priority.includes('CRITICAL')).filter(t => t.status !== 'ĐÃ HOÀN THÀNH' && t.status !== 'ĐÃ ĐÓNG').length;
  const inProgressCount = tickets.filter((t) => t.status === 'ĐANG XỬ LÝ').length;
  const pendingVerifyCount = tickets.filter((t) => t.status === 'CHỜ KÝ XÁC NHẬN' || (t.requiresE2EVerification && !t.e2eVerified)).length;
  const resolvedCount = tickets.filter((t) => t.status === 'ĐÃ HOÀN THÀNH' || t.status === 'ĐÃ ĐÓNG').length;

  return (
    <div className="w-full space-y-6">
      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface/80 border border-neon-red/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md flex flex-col justify-between min-h-[96px] shadow-lg hover:border-neon-red/70 transition-all">
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">SỰ CỐ KHẨN CẤP P1</span>
            <AlertTriangle className="w-5 h-5 text-neon-red opacity-90 shrink-0" />
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-neon-red tracking-tight drop-shadow-[0_0_12px_rgba(255,51,102,0.4)]">
              {criticalCount}
            </span>
          </div>
        </div>

        <div className="bg-surface/80 border border-line-energy/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md flex flex-col justify-between min-h-[96px] shadow-lg hover:border-line-energy/70 transition-all">
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">ĐANG XỬ LÝ</span>
            <Clock className="w-5 h-5 text-line-energy opacity-90 shrink-0" />
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-line-energy tracking-tight drop-shadow-[0_0_12px_rgba(136,170,255,0.4)]">
              {inProgressCount}
            </span>
          </div>
        </div>

        <div className="bg-surface/80 border border-acid-lime/40 p-3.5 sm:p-4 rounded-xl backdrop-blur-md flex flex-col justify-between min-h-[96px] shadow-lg hover:border-acid-lime/70 transition-all">
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">CHỜ KÝ XÁC NHẬN SỐ</span>
            <ShieldCheck className="w-5 h-5 text-acid-lime opacity-90 shrink-0" />
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-acid-lime tracking-tight drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]">
              {pendingVerifyCount}
            </span>
          </div>
        </div>

        <div className="bg-surface/80 border border-white/20 p-3.5 sm:p-4 rounded-xl backdrop-blur-md flex flex-col justify-between min-h-[96px] shadow-lg hover:border-white/40 transition-all">
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-white/60 uppercase tracking-wider font-semibold">ĐÃ XỬ LÝ TRONG NGÀY</span>
            <CheckCircle2 className="w-5 h-5 text-white/80 shrink-0" />
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-panel/90 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 shadow-lg">
        {/* Search */}
        <div className="flex-1 relative min-w-[200px]">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm phiếu theo Mã, Người yêu cầu, Mã QR, Từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel-deep border border-white/15 focus:border-acid-lime pl-10 pr-4 py-2 text-xs font-sans text-white outline-none rounded-lg transition-colors placeholder:text-white/40"
          />
        </div>

        {/* Filters & Technician Scope Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-sans text-xs">
          {currentUser && currentUser.roleType !== 'ADMIN' && (
            <button
              onClick={() => setOnlyScopeDepartments(!onlyScopeDepartments)}
              className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap font-medium ${
                onlyScopeDepartments
                  ? 'bg-acid-lime/15 border-acid-lime text-acid-lime font-bold'
                  : 'bg-panel-deep border-white/15 text-white/70 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>
                {onlyScopeDepartments
                  ? `KHOA PHỤ TRÁCH (${currentUser.assignedDepartmentIds.length})`
                  : 'TOÀN BỆNH VIỆN'}
              </span>
            </button>
          )}

          <div className="flex items-center gap-1 text-white/60">
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wider hidden sm:inline">ƯU TIÊN:</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            aria-label="Lọc theo mức ưu tiên"
            className="bg-panel-deep border border-white/15 text-white text-xs px-2.5 py-2 rounded-lg outline-none cursor-pointer focus:border-acid-lime"
          >
            <option value="ALL">TẤT CẢ MỨC ƯU TIÊN</option>
            <option value="P1-KHẨN CẤP">P1 - KHẨN CẤP</option>
            <option value="P2-CAO">P2 - CAO</option>
            <option value="P3-TRUNG BÌNH">P3 - TRUNG BÌNH</option>
            <option value="P4-THẤP">P4 - THẤP</option>
          </select>

          <div className="flex items-center gap-1 text-white/60">
            <span className="font-semibold text-[11px] uppercase tracking-wider hidden sm:inline">TRẠNG THÁI:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="bg-panel-deep border border-white/15 text-white text-xs px-2.5 py-2 rounded-lg outline-none cursor-pointer focus:border-acid-lime"
          >
            <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
            <option value="MỚI">MỚI</option>
            <option value="ĐANG XỬ LÝ">ĐANG XỬ LÝ</option>
            <option value="CHỜ KÝ XÁC NHẬN">CHỜ KÝ XÁC NHẬN SỐ</option>
            <option value="ĐÃ HOÀN THÀNH">ĐÃ HOÀN THÀNH</option>
          </select>

          <button
            onClick={onOpenDrawer}
            className="bg-acid-lime hover:bg-acid-lime-dim text-black font-bold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all shrink-0 ml-auto"
          >
            + TẠO YÊU CẦU
          </button>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="bg-panel/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
        <div className="w-full">
          <table className="w-full text-left border-collapse font-sans text-xs table-auto">
            <thead>
              <tr className="bg-panel-deep text-white/60 border-b border-white/10 font-bold text-[10px] sm:text-[11px] tracking-wide uppercase">
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Mã Phiếu</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Ưu Tiên</th>
                <th className="py-3 px-2 sm:px-3">Nội Dung & Người Yêu Cầu</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Khoa / Phòng</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Mã Thiết Bị (QR)</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Xác Nhận Ký Số</th>
                <th className="py-3 px-2 sm:px-3 whitespace-nowrap">Trạng Thái</th>
                <th className="py-3 px-2 sm:px-3 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-white/50 font-sans">
                    KHÔNG TÌM THẤY YÊU CẦU NÀO PHÙ HỢP
                  </td>
                </tr>
              ) : (
                pageTickets.map((ticket) => {
                  const isCritical = ticket.priority.includes('KHẨN CẤP') || ticket.priority.includes('CRITICAL');
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTicket(ticket);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        isCritical ? 'bg-neon-red/10' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-2 sm:px-3 font-mono font-bold text-acid-lime whitespace-nowrap text-[11px] sm:text-xs">
                        {ticket.id}
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-2 sm:px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] sm:text-[10px] tracking-wider uppercase ${
                            isCritical
                              ? 'bg-neon-red text-white shadow-[0_0_8px_rgba(255,51,102,0.5)]'
                              : ticket.priority.includes('CAO') || ticket.priority.includes('HIGH')
                              ? 'bg-line-energy/20 text-line-energy border border-line-energy/30'
                              : 'bg-white/10 text-white/70 border border-white/10'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Title & Requestor */}
                      <td className="py-2.5 px-2 sm:px-3">
                        <div className="font-semibold text-xs text-white leading-snug line-clamp-1 sm:line-clamp-2">
                          {ticket.title}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-white/60 flex items-center gap-1 sm:gap-1.5 mt-0.5 font-medium flex-wrap">
                          <span className="flex items-center gap-1 text-acid-lime">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[110px] sm:max-w-none">{ticket.requestorName}</span>
                          </span>
                          <span className="text-white/30 hidden sm:inline">•</span>
                          <span className="text-white/50 hidden sm:inline">{ticket.category}</span>
                        </div>
                      </td>

                      {/* Dept */}
                      <td className="py-2.5 px-2 sm:px-3 text-white/90 font-medium text-[11px] sm:text-xs whitespace-nowrap">
                        <span className="truncate block max-w-[120px] lg:max-w-none" title={ticket.departmentName}>
                          {ticket.departmentName}
                        </span>
                      </td>

                      {/* Asset QR */}
                      <td className="py-2.5 px-2 sm:px-3 text-line-energy font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1 bg-line-energy/10 border border-line-energy/20 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] w-fit">
                          <QrCode className="w-3 h-3 text-line-energy shrink-0" />
                          <span className="truncate">{ticket.assetQrCode}</span>
                        </div>
                      </td>

                      {/* E2E Protocol */}
                      <td className="py-2.5 px-2 sm:px-3 whitespace-nowrap">
                        {ticket.requiresE2EVerification ? (
                          ticket.e2eVerified ? (
                            <span className="inline-flex items-center gap-1 text-acid-lime font-bold text-[10px] bg-acid-lime/10 border border-acid-lime/30 px-2 py-0.5 rounded">
                              <ShieldCheck className="w-3 h-3 shrink-0" /> ĐÃ KÝ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neon-red font-bold text-[10px] bg-neon-red/15 border border-neon-red/30 px-2 py-0.5 rounded animate-pulse">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> CHỜ KÝ SỐ
                            </span>
                          )
                        ) : (
                          <span className="text-white/40 text-[10px] font-medium">TIÊU CHUẨN</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2 sm:px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] sm:text-[10px] tracking-wider uppercase ${
                            ticket.status === 'ĐÃ HOÀN THÀNH' || ticket.status === 'ĐÃ ĐÓNG'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ticket.status === 'ĐANG XỬ LÝ'
                              ? 'bg-line-energy/20 text-line-energy border border-line-energy/30'
                              : 'bg-acid-lime/20 text-acid-lime border border-acid-lime/30'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 sm:px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTicket(ticket);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg bg-white/10 hover:bg-acid-lime hover:text-black text-white transition-colors cursor-pointer"
                          aria-label={`Xem chi tiết phiếu ${ticket.id}`}
                          title="Xem Chi Tiết"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pageSize}
          onPage={pagination.setPage}
        />
      </div>
    </div>
  );
};

