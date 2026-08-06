import React, { useState, useCallback, useRef } from 'react';
import { DepartmentSummary, TechnicalStaffProfile } from '../types';
import { generateId } from '../utils';
import { useTrapFocus } from '../hooks/useTrapFocus';
import {
  Users,
  Server,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  Building,
  ShieldCheck,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  Layers,
  Phone,
  Wrench,
  UserCheck,
} from 'lucide-react';

interface DepartmentsViewProps {
  departments: DepartmentSummary[];
  currentUser?: TechnicalStaffProfile;
  staffList?: TechnicalStaffProfile[];
  onOpenDrawerForDept: (deptId: string) => void;
  onAddDepartment?: (newDept: DepartmentSummary) => void;
  onUpdateDepartment?: (updatedDept: DepartmentSummary) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  currentUser,
  staffList = [],
  onOpenDrawerForDept,
  onAddDepartment,
  onUpdateDepartment,
}) => {
  const isTechnician = currentUser && currentUser.roleType !== 'ADMIN';
  const isAdmin = currentUser?.roleType === 'ADMIN';

  const [onlyScopeDepartments, setOnlyScopeDepartments] = useState<boolean>(Boolean(isTechnician));

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentSummary | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    lead: '',
    headcount: 35,
    assetCount: 80,
    activeTicketsCount: 0,
    allocatedBudget: '3.0 Tỷ VNĐ',
    networkBandwidthGbps: 10,
    healthIndex: 95,
    keyAssetsInput: 'Máy Trạm Khám Bệnh HIS, Máy In Mã Vạch, Switch Quang',
  });

  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const dialogRef = useRef<HTMLDivElement>(null);
  useTrapFocus(isModalOpen, closeModal, dialogRef);

  const filteredDepts = departments.filter((dept) => {
    if (onlyScopeDepartments && currentUser && currentUser.roleType !== 'ADMIN') {
      return currentUser.assignedDepartmentIds.includes(dept.id);
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingDept(null);
    const newId = generateId('DEP');
    setFormData({
      id: newId,
      name: '',
      code: '',
      lead: '',
      headcount: 30,
      assetCount: 50,
      activeTicketsCount: 0,
      allocatedBudget: '2.5 Tỷ VNĐ',
      networkBandwidthGbps: 10,
      healthIndex: 98,
      keyAssetsInput: 'Máy Trạm HIS/PACS, Máy In Tem Y Tế, Switch Kết Nối',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentSummary) => {
    setEditingDept(dept);
    setFormData({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      lead: dept.lead || '',
      headcount: dept.headcount || 30,
      assetCount: dept.assetCount || 50,
      activeTicketsCount: dept.activeTicketsCount || 0,
      allocatedBudget: dept.allocatedBudget || '2.5 Tỷ VNĐ',
      networkBandwidthGbps: dept.networkBandwidthGbps || 10,
      healthIndex: dept.healthIndex || 95,
      keyAssetsInput: dept.keyAssets ? dept.keyAssets.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const parsedAssets = formData.keyAssetsInput
      ? formData.keyAssetsInput.split(',').map((item) => item.trim()).filter(Boolean)
      : ['Máy Trạm CNTT', 'Máy In Y Tế'];

    const targetDepartment: DepartmentSummary = {
      id: formData.id || generateId('DEP'),
      name: formData.name,
      code: formData.code.toUpperCase(),
      lead: formData.lead || 'BS. Trưởng Khoa',
      headcount: Number(formData.headcount) || 30,
      assetCount: Number(formData.assetCount) || 50,
      activeTicketsCount: Number(formData.activeTicketsCount) || 0,
      allocatedBudget: formData.allocatedBudget || '2.5 Tỷ VNĐ',
      networkBandwidthGbps: Number(formData.networkBandwidthGbps) || 10,
      healthIndex: Number(formData.healthIndex) || 95,
      keyAssets: parsedAssets,
    };

    if (editingDept && onUpdateDepartment) {
      onUpdateDepartment(targetDepartment);
    } else if (onAddDepartment) {
      onAddDepartment(targetDepartment);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12131F] border border-white/10 p-5 rounded-lg backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl text-white tracking-wider uppercase flex items-center gap-2">
              <Building className="w-6 h-6 text-acid-lime" />
              CATALOG TÌNH TRẠNG & HẠ TẦNG CNTT THEO KHOA PHÒNG
            </h2>
            {isTechnician && (
              <span className="font-mono text-[10px] bg-acid-lime text-black font-bold px-2 py-0.5 rounded uppercase">
                KHOA BẠN PHỤ TRÁCH
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-white/50 mt-1">
            {currentUser
              ? `Tài khoản: ${currentUser.name} (${currentUser.role}) • ${currentUser.assignedDepartmentIds.length} Khoa phòng trong danh mục`
              : 'Theo dõi thiết bị, sự cố và phân bổ hạ tầng hệ thống thông tin bệnh viện'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isTechnician && (
            <button
              onClick={() => setOnlyScopeDepartments(!onlyScopeDepartments)}
              className={`px-3 py-2 rounded font-mono text-xs border flex items-center gap-1.5 cursor-pointer transition-all ${
                onlyScopeDepartments
                  ? 'bg-acid-lime text-black font-bold border-acid-lime'
                  : 'bg-[#1A1D2E] text-white/70 border-white/20 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>
                {onlyScopeDepartments
                  ? `CHỈ KHOA PHỤ TRÁCH (${currentUser.assignedDepartmentIds.length})`
                  : 'XEM TOÀN BỘ KHOA'}
              </span>
            </button>
          )}

          {/* Add Department Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold px-4 py-2 rounded text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>THÊM KHOA PHÒNG MỚI</span>
          </button>
        </div>
      </div>

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => {
          const isAssignedToCurrentUser = currentUser?.assignedDepartmentIds.includes(dept.id);
          const leadName = dept.lead || 'Đang cập nhật';
          const assetCount = dept.assetCount ?? 50;
          const activeTickets = dept.activeTicketsCount ?? 0;
          const budget = dept.allocatedBudget || '2.5 Tỷ VNĐ';
          const keyAssets = dept.keyAssets || ['Máy Trạm HIS', 'Máy In Y Tế'];

          // Map assigned technical staff from staffList
          const assignedStaff = staffList.filter((s) => s.assignedDepartmentIds.includes(dept.id));

          return (
            <div
              key={dept.id}
              className={`bg-[#12131F]/90 border rounded-xl p-5 backdrop-blur-md space-y-4 transition-all relative shadow-lg ${
                isAssignedToCurrentUser
                  ? 'border-acid-lime shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {isAssignedToCurrentUser && (
                <div className="absolute top-3 right-3 font-mono text-[9px] bg-acid-lime text-black font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                  <span>PHỤ TRÁCH KĨ THUẬT</span>
                </div>
              )}

              {/* Dept Header */}
              <div className="flex items-start justify-between pr-20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-line-energy font-bold bg-line-energy/10 px-2 py-0.5 rounded border border-line-energy/20">
                      {dept.code}
                    </span>
                    <span className="font-mono text-[10px] text-white/40">{dept.id}</span>
                  </div>
                  <h3 className="font-display text-xl text-white mt-1.5">{dept.name}</h3>
                  <span className="font-mono text-xs text-white/60 block mt-1">
                    Trưởng Khoa: <strong className="text-white/90">{leadName}</strong>
                  </span>
                </div>
              </div>

              {/* Assigned Technicians Info Box (Mapped from Roles) */}
              <div className="bg-[#1A1D2E] p-3 rounded-lg border border-white/10 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-white/50 uppercase">
                  <span className="flex items-center gap-1 text-acid-lime font-bold">
                    <Wrench className="w-3 h-3" /> CÁN BỘ KĨ THUẬT PHỤ TRÁCH
                  </span>
                  <span className="text-line-energy">{assignedStaff.length} Nhân sự</span>
                </div>

                {assignedStaff.length > 0 ? (
                  <div className="space-y-1.5">
                    {assignedStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between gap-2 text-xs bg-white/5 p-2.5 rounded-lg border border-white/10"
                      >
                        <div className="min-w-0 flex-1 pr-1">
                          <div className="flex items-center gap-1.5 font-sans font-medium text-white truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-acid-lime inline-block animate-pulse shrink-0"></span>
                            <span className="text-xs font-bold truncate">{staff.name}</span>
                            {staff.roleType === 'ADMIN' && (
                              <span className="text-[9px] bg-acid-lime/20 text-acid-lime px-1.5 py-0.2 rounded font-mono font-bold shrink-0 border border-acid-lime/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/60 font-mono block mt-0.5 truncate" title={staff.role}>
                            {staff.role}
                          </span>
                        </div>

                        <a
                          href={`tel:${staff.phone}`}
                          className="font-mono text-[11px] text-acid-lime hover:bg-acid-lime/20 flex items-center gap-1 shrink-0 bg-acid-lime/10 px-2.5 py-1.5 rounded-md border border-acid-lime/30 transition-colors"
                          title="Gọi hotline kĩ thuật viên"
                        >
                          <Phone className="w-3 h-3 stroke-[2.5]" />
                          <span className="font-bold tracking-tight">{staff.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-white/40 italic py-1 text-center">
                    Chưa gán KTV phụ trách trực tiếp (Bàn ADMIN quản lý chung)
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-[#1A1D2E] p-3 rounded-lg border border-white/10">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase flex items-center gap-1">
                    <Server className="w-3 h-3 text-line-energy" /> Thiết Bị
                  </span>
                  <span className="font-bold text-white text-base mt-0.5 block">{assetCount}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-neon-red" /> Sự Cố Mở
                  </span>
                  <span
                    className={`font-bold text-base mt-0.5 block ${
                      activeTickets > 0 ? 'text-neon-red' : 'text-emerald-400'
                    }`}
                  >
                    {activeTickets}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-acid-lime" /> Nhân Sự
                  </span>
                  <span className="font-bold text-acid-lime text-base mt-0.5 block">{dept.headcount || 30}</span>
                </div>
              </div>

              {/* Key Assets List */}
              <div className="font-mono text-xs space-y-1.5">
                <span className="text-white/40 text-[10px] uppercase block">
                  Thiết Bị Trọng Điểm:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keyAssets.map((asset, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70 text-[11px]"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs gap-2">
                <button
                  onClick={() => handleOpenEditModal(dept)}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/15 text-white/80 border border-white/20 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Chỉnh sửa tên & thông tin khoa phòng"
                >
                  <Edit2 className="w-3.5 h-3.5 text-acid-lime" />
                  <span>SỬA THÔNG TIN</span>
                </button>

                <button
                  onClick={() => onOpenDrawerForDept(dept.id)}
                  className="bg-acid-lime hover:bg-acid-lime-dim text-black font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
                >
                  <span>BÁO SỰ CỐ</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Department */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Quản lý thông tin khoa phòng" tabIndex={-1} className="bg-[#12131F] border border-acid-lime/40 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-acid-lime" />
                <h3 className="font-display text-xl text-white tracking-wide">
                  {editingDept ? 'CẬP NHẬT THÔNG TIN KHOA PHÒNG' : 'THÊM KHOA PHÒNG MỚI VÀO HỆ THỐNG'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">MÃ ĐỊNH DANH KHOA (CODE)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: KB-CC, UB-YHHN"
                    className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime"
                  />
                </div>

                <div>
                  <label className="block text-white/60 mb-1">MÃ HỆ THỐNG (ID)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.id}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">TÊN KHOA PHÒNG BỆNH VIỆN *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Khoa Khám Bệnh & Cấp Cứu, Khoa Ung Bướu..."
                  className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">TRƯỞNG KHOA / LÃNH ĐẠO</label>
                  <input
                    type="text"
                    value={formData.lead}
                    onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                    placeholder="VD: BS. CKII. Nguyễn Văn A"
                    className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime"
                  />
                </div>

                <div>
                  <label className="block text-white/60 mb-1">SỐ LƯỢNG THIẾT BỊ</label>
                  <input
                    type="number"
                    value={formData.assetCount}
                    onChange={(e) => setFormData({ ...formData, assetCount: Number(e.target.value) })}
                    className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime"
                  />
                </div>

                <div>
                  <label className="block text-white/60 mb-1">SỐ LƯỢNG NHÂN SỰ</label>
                  <input
                    type="number"
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: Number(e.target.value) })}
                    className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">DANH SÁCH THIẾT BỊ TRỌNG ĐIỂM (Phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.keyAssetsInput}
                  onChange={(e) => setFormData({ ...formData, keyAssetsInput: e.target.value })}
                  placeholder="VD: Máy Trạm HIS, Máy In Tem Mã Vạch, Switch Quang..."
                  className="w-full bg-[#1A1D2E] border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-acid-lime"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="bg-acid-lime hover:bg-acid-lime-dim text-black font-bold px-5 py-2 rounded flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingDept ? 'LƯU THAY ĐỔI' : 'TẠO KHOA PHÒNG'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
