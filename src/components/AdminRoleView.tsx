import React, { useState, useCallback, useRef } from 'react';
import { TechnicalStaffProfile, DepartmentSummary, Ticket } from '../types';
import { generateId } from '../utils';
import { useTrapFocus } from '../hooks/useTrapFocus';
import {
  ShieldAlert,
  UserCheck,
  Building,
  Plus,
  Check,
  X,
  Phone,
  Mail,
  Award,
  Layers,
  Settings2,
  Lock,
  Unlock,
  CheckCircle2,
  Users,
  Wrench,
  Activity,
  UserPlus
} from 'lucide-react';

interface AdminRoleViewProps {
  currentUser: TechnicalStaffProfile;
  staffList: TechnicalStaffProfile[];
  departments: DepartmentSummary[];
  tickets: Ticket[];
  onUpdateStaffDepartments: (staffId: string, departmentIds: string[]) => void;
  onAddStaffProfile: (newStaff: TechnicalStaffProfile) => void;
  onSwitchUser: (staffId: string) => void;
  onAddDepartment?: (newDept: DepartmentSummary) => void;
}

export const AdminRoleView: React.FC<AdminRoleViewProps> = ({
  currentUser,
  staffList,
  departments,
  tickets,
  onUpdateStaffDepartments,
  onAddStaffProfile,
  onSwitchUser,
  onAddDepartment,
}) => {
  const isAdmin = currentUser.roleType === 'ADMIN';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);

  const closeStaffModal = useCallback(() => setIsAddModalOpen(false), []);
  const closeDeptModal = useCallback(() => setIsAddDeptModalOpen(false), []);
  const staffDialogRef = useRef<HTMLDivElement>(null);
  const deptDialogRef = useRef<HTMLDivElement>(null);
  useTrapFocus(isAddModalOpen, closeStaffModal, staffDialogRef);
  useTrapFocus(isAddDeptModalOpen, closeDeptModal, deptDialogRef);

  // New staff form state
  const [newStaffData, setNewStaffData] = useState<Partial<TechnicalStaffProfile>>({
    name: '',
    role: 'Kỹ Thuật Viên CNTT Y Tế',
    roleType: 'TECHNICIAN',
    phone: '0905.',
    email: '@benhvien.gov.vn',
    specialty: 'Hạ Tầng, Phần Mềm HIS & Máy In Y Tế',
    shiftStatus: 'ĐANG TRỰC',
    assignedDepartmentIds: [],
  });

  // New department state
  const [newDeptData, setNewDeptData] = useState({
    name: '',
    code: '',
    lead: '',
    headcount: 30,
    assetCount: 60,
    allocatedBudget: '2.5 Tỷ VNĐ',
    keyAssetsInput: 'Máy Trạm HIS, Máy In Mã Vạch, Switch Quang',
  });

  const handleToggleDepartment = (staffId: string, deptId: string) => {
    if (!isAdmin) return;
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    let updatedIds: string[];
    if (staff.assignedDepartmentIds.includes(deptId)) {
      updatedIds = staff.assignedDepartmentIds.filter((id) => id !== deptId);
    } else {
      updatedIds = [...staff.assignedDepartmentIds, deptId];
    }

    onUpdateStaffDepartments(staffId, updatedIds);
  };

  const handleSaveNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newStaffData.name || !newStaffData.phone) return;

    const id = generateId('USER-TECH');
    const staffToAdd: TechnicalStaffProfile = {
      id,
      name: newStaffData.name!,
      role: newStaffData.role || 'Kỹ Thuật Viên CNTT',
      roleType: newStaffData.roleType || 'TECHNICIAN',
      phone: newStaffData.phone!,
      email: newStaffData.email || `${id.toLowerCase()}@benhvien.gov.vn`,
      assignedDepartmentIds: newStaffData.assignedDepartmentIds || [],
      specialty: newStaffData.specialty || 'Chuyên viên kỹ thuật',
      shiftStatus: newStaffData.shiftStatus || 'SẴN SÀNG',
    };

    onAddStaffProfile(staffToAdd);
    setIsAddModalOpen(false);
  };

  const handleSaveNewDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newDeptData.name || !newDeptData.code) return;

    const parsedAssets = newDeptData.keyAssetsInput
      ? newDeptData.keyAssetsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Máy Trạm HIS', 'Máy In Y Tế'];

    const deptToAdd: DepartmentSummary = {
      id: generateId('DEP'),
      name: newDeptData.name,
      code: newDeptData.code.toUpperCase(),
      lead: newDeptData.lead || 'BS. Trưởng Khoa',
      headcount: Number(newDeptData.headcount) || 30,
      assetCount: Number(newDeptData.assetCount) || 60,
      activeTicketsCount: 0,
      allocatedBudget: newDeptData.allocatedBudget || '2.5 Tỷ VNĐ',
      networkBandwidthGbps: 10,
      healthIndex: 98,
      keyAssets: parsedAssets,
    };

    if (onAddDepartment) {
      onAddDepartment(deptToAdd);
    }

    setIsAddDeptModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-[#12131F] border border-acid-lime/40 p-5 rounded-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-acid-lime/20 border border-acid-lime flex items-center justify-center text-acid-lime shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-white tracking-wide uppercase">
                TRANG QUẢN TRỊ ROLES & PHÂN CÔNG KHOA PHÒNG PHỤ TRÁCH
              </span>
              <span className="font-mono text-[10px] bg-acid-lime text-black px-2 py-0.5 rounded font-bold uppercase">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="font-mono text-xs text-white/60 mt-1">
              Phân quyền tài khoản kĩ thuật viên, gán khoa phòng phụ trách trực tiếp. Mỗi kĩ thuật viên sau khi đăng nhập chỉ xem catalog khoa phòng & ticket thuộc phạm vi được giao.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddDeptModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer border border-white/20 transition-all"
          >
            <Building className="w-4 h-4 text-acid-lime" />
            <span>+ THÊM KHOA PHÒNG</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-acid-lime hover:bg-acid-lime-dim text-black font-bold px-3.5 py-2 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ THÊM KĨ THUẬT VIÊN</span>
          </button>
        </div>
      </div>

      {/* Non-admin Warning Banner */}
      {!isAdmin && (
        <div className="bg-neon-red/20 border border-neon-red p-4 rounded-xl text-white font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-neon-red" />
            <span>
              Bạn đang ở chế độ xem tài khoản <strong>{currentUser.name}</strong> ({currentUser.role}). Chỉ có <strong>Quản Trị Viên (ADMIN)</strong> mới có quyền chỉnh sửa phân công Khoa Phòng!
            </span>
          </div>
          <button
            onClick={() => onSwitchUser('USER-ADMIN')}
            className="bg-acid-lime text-black px-3 py-1 rounded font-bold hover:bg-acid-lime-dim cursor-pointer"
          >
            CHUYỂN SANG ADMIN
          </button>
        </div>
      )}

      {/* Staff Role Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffList.map((staff) => {
          const isCurrentActiveUser = currentUser.id === staff.id;
          const isStaffAdmin = staff.roleType === 'ADMIN';

          const assignedDepts = departments.filter((d) => staff.assignedDepartmentIds.includes(d.id));
          const activeTicketsInScope = tickets.filter((t) =>
            staff.assignedDepartmentIds.includes(t.departmentId)
          );

          return (
            <div
              key={staff.id}
              className={`bg-[#12131F]/90 border rounded-xl p-5 backdrop-blur-md space-y-4 transition-all shadow-lg ${
                isCurrentActiveUser
                  ? 'border-acid-lime shadow-[0_0_25px_rgba(204,255,0,0.2)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Staff Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg font-mono border ${
                      isStaffAdmin
                        ? 'bg-acid-lime/20 text-acid-lime border-acid-lime'
                        : 'bg-line-energy/20 text-line-energy border-line-energy'
                    }`}
                  >
                    {staff.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl text-white">{staff.name}</h3>
                      {isCurrentActiveUser && (
                        <span className="font-mono text-[9px] bg-acid-lime text-black px-2 py-0.5 rounded font-bold uppercase">
                          ĐANG ĐĂNG NHẬP
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-white/60">{staff.role}</p>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-acid-lime" /> {staff.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-line-energy" /> {staff.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      staff.shiftStatus === 'ĐANG TRỰC'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-400/20 text-amber-300'
                    }`}
                  >
                    ● {staff.shiftStatus}
                  </span>

                  {!isCurrentActiveUser && (
                    <button
                      onClick={() => onSwitchUser(staff.id)}
                      className="bg-white/10 hover:bg-acid-lime hover:text-black text-white text-[11px] font-mono px-2.5 py-1 rounded border border-white/20 cursor-pointer transition-colors"
                    >
                      CHUYỂN SANG TÀI KHOẢN NÀY
                    </button>
                  )}
                </div>
              </div>

              {/* Specialty & Scope Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-[#1A1D2E] p-3 rounded-lg border border-white/10 text-center">
                <div>
                  <span className="text-white/40 block text-[10px]">KHOA PHÒNG GÁN</span>
                  <span className="font-bold text-acid-lime text-lg">
                    {isStaffAdmin ? 'TOÀN BỘ' : `${staff.assignedDepartmentIds.length} Khoa`}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">TICKET TRONG PHẠM VI</span>
                  <span className="font-bold text-line-energy text-lg">{activeTicketsInScope.length}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">CHUYÊN MÔN KĨ THUẬT</span>
                  <span className="text-white text-[11px] truncate block font-sans">{staff.specialty}</span>
                </div>
              </div>

              {/* Department Assignment Checkboxes Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-white/80 font-bold flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-acid-lime" />
                    DANH SÁCH KHOA PHÒNG PHỤ TRÁCH ({assignedDepts.length}/{departments.length})
                  </span>
                  {isAdmin && !isStaffAdmin && (
                    <span className="text-acid-lime text-[11px]">Click để bật/tắt gán quyền</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {departments.map((dept) => {
                    const isAssigned = staff.assignedDepartmentIds.includes(dept.id);
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => handleToggleDepartment(staff.id, dept.id)}
                        className={`p-2.5 rounded-lg text-left font-mono text-xs flex items-start gap-2.5 border transition-all ${
                          isAssigned
                            ? 'bg-acid-lime/10 border-acid-lime/60 text-white shadow-sm'
                            : 'bg-[#1A1D2E] border-white/10 text-white/50 hover:border-white/30'
                        } ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            isAssigned
                              ? 'bg-acid-lime border-acid-lime text-black'
                              : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0 leading-tight">
                          <span className="font-medium block text-white text-xs break-words">{dept.name}</span>
                          <span className="text-[10px] text-line-energy font-bold block mt-0.5">{dept.code}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div ref={staffDialogRef} role="dialog" aria-modal="true" aria-label="Thêm kĩ thuật viên CNTT mới" tabIndex={-1} className="bg-[#12131F] border border-acid-lime rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            <div className="bg-[#1A1D2E] p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-2xl text-white uppercase flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-acid-lime" />
                THÊM KĨ THUẬT VIÊN CNTT MỚI
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStaff} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              <div>
                <label className="text-white/60 block mb-1">Họ & Tên Kĩ Thuật Viên *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: KS. Trần Quốc Tuấn"
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                  className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1">Chức Danh / Chức Vụ</label>
                  <input
                    type="text"
                    value={newStaffData.role}
                    onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Cấp Quyền System Role (RBAC)</label>
                  <select
                    value={newStaffData.roleType}
                    onChange={(e) =>
                      setNewStaffData({ ...newStaffData, roleType: e.target.value as TechnicalStaffProfile['roleType'] })
                    }
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  >
                    <option value="ADMIN">ADMIN (Quản Trị Viên - Full Access 6 View)</option>
                    <option value="DOCTOR">DOCTOR (Bác Sĩ Lâm Sàng - 3 View)</option>
                    <option value="NURSE">NURSE (Điều Dưỡng / Y Sĩ - 2 View)</option>
                    <option value="HARDWARE_TECH">HARDWARE_TECH (NV Kỹ Thuật Phần Cứng - 3 View)</option>
                    <option value="SOFTWARE_TECH">SOFTWARE_TECH (NV Phần Mềm & CSDL - 3 View)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1">Số Điện Thoại Nóng *</label>
                  <input
                    type="text"
                    required
                    value={newStaffData.phone}
                    onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Email Công Việc</label>
                  <input
                    type="email"
                    value={newStaffData.email}
                    onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">Lĩnh Vực Chuyên Môn Kĩ Thuật</label>
                <input
                  type="text"
                  placeholder="VD: Chuyên trách Mạng LAN/WAN & Máy in mã vạch"
                  value={newStaffData.specialty}
                  onChange={(e) => setNewStaffData({ ...newStaffData, specialty: e.target.value })}
                  className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-bold py-3 rounded-lg uppercase tracking-wider text-sm cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.4)]"
              >
                KHỞI TẠO TÀI KHOẢN KĨ THUẬT VIÊN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal (Triggered from Admin console) */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div ref={deptDialogRef} role="dialog" aria-modal="true" aria-label="Thêm khoa phòng bệnh viện mới" tabIndex={-1} className="bg-[#12131F] border border-acid-lime rounded-xl max-w-lg w-full p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl text-white uppercase flex items-center gap-2">
                <Building className="w-5 h-5 text-acid-lime" />
                THÊM KHOA PHÒNG BỆNH VIỆN MỚI
              </h3>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full hover:bg-white/10 text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDepartment} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-white/60 block mb-1">TÊN KHOA PHÒNG *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khoa Khám Bệnh, Khoa Tim Mạch..."
                  value={newDeptData.name}
                  onChange={(e) => setNewDeptData({ ...newDeptData, name: e.target.value })}
                  className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">MÃ KHOA (CODE) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: KB-CC, TM"
                    value={newDeptData.code}
                    onChange={(e) => setNewDeptData({ ...newDeptData, code: e.target.value })}
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">TRƯỞNG KHOA</label>
                  <input
                    type="text"
                    placeholder="BS. Trưởng Khoa"
                    value={newDeptData.lead}
                    onChange={(e) => setNewDeptData({ ...newDeptData, lead: e.target.value })}
                    className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">NGÂN SÁCH ĐẦU TƯ CNTT</label>
                <input
                  type="text"
                  value={newDeptData.allocatedBudget}
                  onChange={(e) => setNewDeptData({ ...newDeptData, allocatedBudget: e.target.value })}
                  className="w-full bg-[#1A1D2E] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-bold py-2.5 rounded uppercase tracking-wider text-xs cursor-pointer shadow-md mt-2"
              >
                XÁC NHẬN TẠO KHOA PHÒNG MỚI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
