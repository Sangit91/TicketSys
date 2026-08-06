export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'HARDWARE_TECH' | 'SOFTWARE_TECH' | 'TECHNICIAN';

export type TabType =
  | 'TỔNG QUAN'
  | 'YÊU CẦU XỬ LÝ'
  | 'THIẾT BỊ & TÀI SẢN'
  | 'SƠ ĐỒ HẠ TẦNG'
  | 'KHOA PHÒNG'
  | 'QUẢN TRỊ ROLES'
  | 'NHẬT KÝ AUDIT';

export interface RolePermissionConfig {
  roleType: UserRole;
  label: string;
  shortRole: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  allowedTabs: TabType[];
  description: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  ADMIN: {
    roleType: 'ADMIN',
    label: 'Quản Trị Viên Hệ Thống (Admin)',
    shortRole: 'ADMIN',
    badgeBg: 'bg-neon-red/20',
    badgeText: 'text-neon-red',
    badgeBorder: 'border-neon-red/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'THIẾT BỊ & TÀI SẢN', 'SƠ ĐỒ HẠ TẦNG', 'KHOA PHÒNG', 'QUẢN TRỊ ROLES', 'NHẬT KÝ AUDIT'],
    description: 'Toàn quyền quản trị hệ thống, cấp quyền phân hệ, quản lý khoa phòng & xem nhật ký audit security.',
  },
  DOCTOR: {
    roleType: 'DOCTOR',
    label: 'Bác Sĩ Lâm Sàng',
    shortRole: 'BÁC SĨ',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'SƠ ĐỒ HẠ TẦNG', 'KHOA PHÒNG'],
    description: 'Tạo & theo dõi ticket sự cố HIS/PACS/Ký số đơn thuốc, xem sơ đồ mạng phòng khám & thông tin khoa.',
  },
  NURSE: {
    roleType: 'NURSE',
    label: 'Điều Dưỡng / Y Sĩ',
    shortRole: 'ĐIỀU DƯỠNG',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'KHOA PHÒNG'],
    description: 'Tạo yêu cầu hỗ trợ máy in tem nhãn, mực in, thiết bị buồng bệnh & tra cứu danh mục khoa phòng.',
  },
  HARDWARE_TECH: {
    roleType: 'HARDWARE_TECH',
    label: 'Nhân Viên Kỹ Thuật Phần Cứng',
    shortRole: 'KTV PHẦN CỨNG',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'THIẾT BỊ & TÀI SẢN', 'SƠ ĐỒ HẠ TẦNG'],
    description: 'Tiếp nhận xử lý sự cố phần cứng, kiểm kê máy chủ / switch quang / máy in & theo dõi sơ đồ hạ tầng.',
  },
  SOFTWARE_TECH: {
    roleType: 'SOFTWARE_TECH',
    label: 'Nhân Viên Phần Mềm & CSDL',
    shortRole: 'KTV PHẦN MỀM',
    badgeBg: 'bg-line-energy/20',
    badgeText: 'text-line-energy',
    badgeBorder: 'border-line-energy/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'THIẾT BỊ & TÀI SẢN', 'NHẬT KÝ AUDIT'],
    description: 'Xử lý lỗi phần mềm HIS/PACS/LIS, Chữ ký số SmartCA, tra cứu máy trạm & kiểm soát nhật ký hệ thống.',
  },
  TECHNICIAN: {
    roleType: 'TECHNICIAN',
    label: 'Nhân Viên Kỹ Thuật CNTT',
    shortRole: 'KỸ THUẬT VIÊN',
    badgeBg: 'bg-line-energy/20',
    badgeText: 'text-line-energy',
    badgeBorder: 'border-line-energy/40',
    allowedTabs: ['TỔNG QUAN', 'YÊU CẦU XỬ LÝ', 'THIẾT BỊ & TÀI SẢN', 'SƠ ĐỒ HẠ TẦNG'],
    description: 'Tiếp nhận xử lý sự cố công nghệ thông tin và quản lý thiết bị được giao.',
  },
};

export interface TechnicalStaffProfile {
  id: string;
  name: string;
  role: string;
  roleType: UserRole;
  username?: string;
  password?: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  assignedDepartmentIds: string[]; // List of department IDs this technician is responsible for
  specialty: string;
  shiftStatus: 'ĐANG TRỰC' | 'SẴN SÀNG' | 'NGOÀI GIỜ';
}

export type Priority = 'P1-KHẨN CẤP' | 'P2-CAO' | 'P3-TRUNG BÌNH' | 'P4-THẤP';
export type TicketStatus = 'MỚI' | 'ĐANG XỬ LÝ' | 'CHỜ KÝ XÁC NHẬN' | 'ĐÃ HOÀN THÀNH' | 'ĐÃ ĐÓNG';
export type IssueCategory = 'Phần Cứng / Y Tế' | 'Phần Mềm HIS/PACS/LIS' | 'Mạng & Hạ Tầng' | 'Tài Khoản & Chữ Ký Số' | 'An Ninh Mạng & Dữ Liệu';

export interface TicketLog {
  timestamp: string;
  note: string;
  actor: string;
}

export interface Ticket {
  id: string;
  title: string;
  requestorName: string;
  requestorRole?: string;
  requestorPhone?: string;
  departmentId: string;
  departmentName: string;
  assetQrCode: string;
  category: IssueCategory;
  priority: Priority;
  status: TicketStatus;
  description: string;
  assignedEngineer?: string;
  assignedEngineerRole?: string;
  assignedEngineerPhone?: string;
  createdAt: string;
  updatedAt: string;
  requiresE2EVerification: boolean;
  e2eVerified: boolean;
  userSignature?: string;
  itSignature?: string;
  verificationMethod?: 'DIGITAL_CODE' | 'FILE_UPLOAD';
  signedFileName?: string;
  signedFileUrl?: string;
  signedFileType?: string;
  signedFileUploadTime?: string;
  signedFileHash?: string;
  resolutionNotes?: string;
  // Department Request Document (Giấy đề nghị của Khoa)
  proposalFileName?: string;
  proposalFileUrl?: string;
  proposalFileType?: 'doc' | 'pdf' | 'image';
  proposalFileUploadTime?: string;
  proposalFileSize?: string;
  logs?: TicketLog[];
}

export type AuditLogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SECURITY' | 'KÝ SỐ';
export type AuditLogCategory = 'TICKETS' | 'INVENTORY' | 'TOPOLOGY' | 'DEPARTMENTS' | 'RBAC' | 'KÝ SỐ' | 'HEALTHTEST' | 'SYSTEM';

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  category: AuditLogCategory;
  action: string;
  details: string;
  actorName: string;
  actorRole: string;
  ipAddress?: string;
  targetId?: string;
  signedFilePreview?: string;
  signedFileName?: string;
  payloadDiff?: Record<string, any>;
  sha256Hash?: string;
}

export type AssetType =
  | 'Máy Chủ HIS/PACS'
  | 'Máy Trạm Khám Bệnh'
  | 'Switch Quang Trung Tâm'
  | 'Cụm Xử Lý Hình Ảnh'
  | 'Cổng An Ninh Mạng'
  | 'Máy In Y Tế & Mực In'
  | 'Thiết Bị Ký Số & Chữ Ký Số'
  | 'Hạ Tầng Dự Phòng & UPS';

export type AssetHealth = 'TỐI ƯU' | 'SUY GIẢM' | 'NGUY CẤP' | 'BẢO TRÌ';

export type OperationalStatus = 'ĐANG SỬ DỤNG' | 'ĐANG BẢO TRÌ' | 'TRONG KHO DỰ PHÒNG' | 'ĐÃ THANH LÝ';

export interface AssetHistoryEvent {
  id: string;
  timestamp: string;
  type: 'NHẬP_XUẤT' | 'DI_DỜI' | 'BẢO_TRÌ' | 'THAY_MỰC' | 'CHUYỂN_TRẠNG_THÁI';
  description: string;
  actor: string; // Cán bộ thực hiện di chuyển/bàn giao
  fromDepartment?: string;
  toDepartment?: string;
  fromLocation?: string;
  toLocation?: string;
  receivedBy?: string; // Cán bộ tiếp nhận
  transferReason?: string; // Lý do di dời
  decisionNumber?: string; // Số quyết định/Phiếu bàn giao
}

export interface InventoryItem {
  id: string;
  name: string;
  serialNumber: string;
  type: AssetType;
  department: string;
  assignedTo: string;
  ipAddress: string;
  macAddress: string;
  subnetMask?: string;
  vlan?: string;
  defaultGateway?: string;
  health: AssetHealth;
  operationalStatus: OperationalStatus;
  temperature: number; // Celsius
  cpuUsage: number; // Percentage
  memoryUsage: number; // Percentage
  uptimeDays: number;
  location: string;
  qrCodeUrl: string;
  lastMaintenanceDate: string;
  
  // Ink & Printer Supplies attributes
  isPrinterSupply?: boolean;
  inkModel?: string;
  inkLevelPercent?: number;
  printedPagesCount?: number;

  // Lifecycle & Procurement tracking
  supplierName?: string;
  importDate?: string;
  warrantyExpiryDate?: string;
  linkedTopologyNodeId?: string;
  historyLog?: AssetHistoryEvent[];
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  lead: string;
  headcount: number;
  assetCount: number;
  activeTicketsCount: number;
  allocatedBudget: string;
  networkBandwidthGbps: number;
  healthIndex: number; // 0 - 100
  keyAssets: string[];
}

export interface SystemMetric {
  timestamp: string;
  globalLatencyMs: number;
  packetLossPercent: number;
  activeThreatsBlocked: number;
  totalTicketsResolvedToday: number;
  slaCompliancePercent: number;
}

