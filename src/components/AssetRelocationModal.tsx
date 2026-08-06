import React, { useState, useRef } from 'react';
import { InventoryItem, DepartmentSummary, TechnicalStaffProfile, OperationalStatus, AssetHistoryEvent } from '../types';
import { generateId } from '../utils';
import { useTrapFocus } from '../hooks/useTrapFocus';
import { X, MapPin, Building2, User, ArrowRight, ShieldCheck, FileText, CheckCircle2, Truck, Globe, Layers, Wifi } from 'lucide-react';

interface AssetRelocationModalProps {
  item: InventoryItem;
  departments: DepartmentSummary[];
  staffList: TechnicalStaffProfile[];
  currentUser?: TechnicalStaffProfile;
  onClose: () => void;
  onSaveRelocation: (updatedItem: InventoryItem) => void;
}

export const AssetRelocationModal: React.FC<AssetRelocationModalProps> = ({
  item,
  departments,
  staffList,
  currentUser,
  onClose,
  onSaveRelocation,
}) => {
  const [toDepartment, setToDepartment] = useState<string>(item.department);
  const [toLocation, setToLocation] = useState<string>(item.location);
  const [receivedBy, setReceivedBy] = useState<string>(item.assignedTo);
  const [actor, setActor] = useState<string>(currentUser ? currentUser.name : 'KS. Phạm Minh Nhật');
  const [decisionNumber, setDecisionNumber] = useState<string>(`QĐ-DDC-${Math.floor(100 + Math.random() * 900)}/QĐ-BV`);
  const [transferReason, setTransferReason] = useState<string>('Luân chuyển thiết bị phục vụ khám chữa bệnh');
  const [newStatus, setNewStatus] = useState<OperationalStatus>(item.operationalStatus);
  const [ipAddress, setIpAddress] = useState<string>(item.ipAddress || '10.200.12.10');
  const [vlan, setVlan] = useState<string>(item.vlan || 'VLAN 10 - Mạng Nội Bộ Khoa');
  const [subnetMask, setSubnetMask] = useState<string>(item.subnetMask || '255.255.255.0 (/24)');
  const [defaultGateway, setDefaultGateway] = useState<string>(item.defaultGateway || '10.200.12.1');
  const dialogRef = useRef<HTMLDivElement>(null);

  useTrapFocus(true, onClose, dialogRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const newHistoryEvent: AssetHistoryEvent = {
      id: generateId('RELOC'),
      timestamp: nowStr,
      type: 'DI_DỜI',
      description: `${transferReason} (${decisionNumber}) - IP: ${ipAddress}, VLAN: ${vlan}`,
      actor,
      fromDepartment: item.department,
      toDepartment,
      fromLocation: item.location,
      toLocation,
      receivedBy,
      transferReason,
      decisionNumber,
    };

    const updatedHistory = [newHistoryEvent, ...(item.historyLog || [])];

    const updatedItem: InventoryItem = {
      ...item,
      department: toDepartment,
      location: toLocation,
      assignedTo: receivedBy,
      operationalStatus: newStatus,
      ipAddress,
      vlan,
      subnetMask,
      defaultGateway,
      historyLog: updatedHistory,
    };

    onSaveRelocation(updatedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Điều chuyển thiết bị ${item.name}`}
        tabIndex={-1}
        className="bg-surface border-2 border-acid-lime rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white shadow-[0_0_50px_rgba(204,255,0,0.3)] font-mono text-xs"
      >
        
        {/* Header */}
        <div className="bg-[#0F1120] p-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-acid-lime text-black font-extrabold text-[10px] px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> LẬP PHIẾU ĐIỀU CHUYỂN THIẾT BỊ
              </span>
              <span className="text-line-energy font-bold text-[11px]">{item.id}</span>
            </div>
            <h3 className="font-display text-xl text-white font-bold">{item.name}</h3>
            <p className="text-white/50 text-[11px]">Seri: {item.serialNumber} | Mã QR: {item.qrCodeUrl}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ điều chuyển"
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Info Banner */}
        <div className="bg-[#1A1E36] px-5 py-3 border-b border-white/10 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-white/50 block text-[10px] uppercase font-bold">Vị Trí Hiện Tại (Khoa/Phòng):</span>
            <span className="text-white font-bold block truncate">{item.department}</span>
            <span className="text-white/70 text-[10px] block truncate">{item.location}</span>
          </div>
          <div>
            <span className="text-white/50 block text-[10px] uppercase font-bold">Người Bàn Giao Hiện Tại:</span>
            <span className="text-line-energy font-bold block truncate">{item.assignedTo}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Destination Department & Location */}
          <div className="p-4 bg-[#0B0D1B] rounded-xl border border-acid-lime/30 space-y-3">
            <h4 className="text-acid-lime font-bold text-xs uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> KHOA PHÒNG & VỊ TRÍ TIẾP NHẬN MỚI
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 block mb-1">Khoa / Đơn Vị Tiếp Nhận *</label>
                <select
                  value={toDepartment}
                  onChange={(e) => setToDepartment(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl cursor-pointer"
                >
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Khoa Khám Bệnh & Cấp Cứu">Khoa Khám Bệnh & Cấp Cứu</option>
                      <option value="Khoa Chẩn Đoán Hình Ảnh (PACS)">Khoa Chẩn Đoán Hình Ảnh (PACS)</option>
                      <option value="Khoa Xét Nghiệm (LIS)">Khoa Xét Nghiệm (LIS)</option>
                      <option value="Khoa Phẫu Thuật - Gây Mê Hồi Sức">Khoa Phẫu Thuật - Gây Mê Hồi Sức</option>
                      <option value="Khoa Dược & Vật Tư Y Tế">Khoa Dược & Vật Tư Y Tế</option>
                      <option value="Phòng Tài Chính - Kế Toán">Phòng Tài Chính - Kế Toán</option>
                      <option value="Trung Tâm Công Nghệ Thông Tin">Trung Tâm Công Nghệ Thông Tin</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Vị Trí Lắp Đặt Chi Tiết Mới *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng Khám Số 05 Tầng 2 - Tòa A"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Network Configuration Parameters (IP, VLAN, Subnet, Gateway) */}
          <div className="p-4 bg-[#0B0D1B] rounded-xl border border-neon-cyan/30 space-y-3">
            <h4 className="text-neon-cyan font-bold text-xs uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-neon-cyan" /> THÔNG SỐ MẠNG & VLAN PHÂN LUỒNG MỚI
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 block mb-1">Địa Chỉ IP Tĩnh *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 10.200.12.10"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-neon-cyan font-bold outline-none focus:border-neon-cyan rounded-xl"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">VLAN Phân Luồng Hạ Tầng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: VLAN 10 - Server HIS/PACS"
                  value={vlan}
                  onChange={(e) => setVlan(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Subnet Mask & Lớp Mạng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 255.255.255.0 (/24)"
                  value={subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1">Default Gateway Cổng Mạng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 10.200.12.1"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Transfer Personnel ("Qua tay những ai") */}
          <div className="p-4 bg-[#0B0D1B] rounded-xl border border-line-energy/30 space-y-3">
            <h4 className="text-line-energy font-bold text-xs uppercase flex items-center gap-1.5">
              <User className="w-4 h-4" /> CÁN BỘ BÀN GIAO & TIẾP NHẬN ("QUA TAY AI")
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 block mb-1">Cán Bộ Di Chuyển / Bàn Giao *</label>
                <select
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-line-energy rounded-xl cursor-pointer"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                  <option value="Tổ Bàn Giao Kỹ Thuật CNTT">Tổ Bàn Giao Kỹ Thuật CNTT</option>
                </select>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Cán Bộ Tiếp Nhận Mới *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BS. CKII. Nguyễn Văn Nam / Trưởng Khoa"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-line-energy rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Legal / Decision / Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 block mb-1">Số Quyết Định / Phiếu Luân Chuyển *</label>
              <input
                type="text"
                required
                placeholder="VD: QĐ-102/QĐ-BV"
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
                className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl"
              />
            </div>

            <div>
              <label className="text-white/60 block mb-1">Trạng Thái Vận Hành Mới</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OperationalStatus)}
                className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl cursor-pointer"
              >
                <option value="ĐANG SỬ DỤNG">ĐANG SỬ DỤNG</option>
                <option value="TRONG KHO DỰ PHÒNG">TRONG KHO DỰ PHÒNG</option>
                <option value="ĐANG BẢO TRÌ">ĐANG BẢO TRÌ</option>
                <option value="ĐÃ THANH LÝ">ĐÃ THANH LÝ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-white/60 block mb-1">Lý Do / Nội Dung Điều Chuyển Chi Tiết *</label>
            <textarea
              rows={3}
              required
              placeholder="VD: Điều chuyển máy in mã vạch từ Khoa Khám sang Khoa Cấp Cứu phục vụ mở rộng đợt khám BHYT cao điểm..."
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full bg-[#1A1E36] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl font-sans"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-extrabold py-3 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>XÁC NHẬN ĐIỀU CHUYỂN VÀ TẠO NỐT LỊCH SỬ MỚI</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
