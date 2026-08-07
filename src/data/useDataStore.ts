import { useState } from 'react';
import {
  Ticket,
  TicketStatus,
  InventoryItem,
  DepartmentSummary,
  SystemAuditLog,
  TechnicalStaffProfile,
} from '../types';
import { INITIAL_TICKETS, INITIAL_INVENTORY, DEPARTMENTS_DATA, TECHNICAL_STAFF_USERS, INITIAL_AUDIT_LOGS } from './mockData';
import { generateId, fakeSha256 } from '../utils';

export interface E2EFileInfo {
  name: string;
  url: string;
  type: string;
  uploadTime: string;
  hash: string;
}

/**
 * Data-access layer.
 * Toàn bộ đọc/ghi mock data tập trung ở đây. Khi nối backend:
 * chỉ cần đổi phần khởi tạo useState / body các hàm CRUD sang fetch API,
 * API trả về giữ nguyên — App & views không đổi.
 */
export function useDataStore() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [departments, setDepartments] = useState<DepartmentSummary[]>(DEPARTMENTS_DATA);
  const [staffList, setStaffList] = useState<TechnicalStaffProfile[]>(TECHNICAL_STAFF_USERS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Session khôi phục: nếu có id user lưu trước đó (localStorage), giữ nguyên người dùng
  const storedUserId = typeof window !== 'undefined' ? window.localStorage.getItem('app-user') : null;
  const [currentUser, setCurrentUserState] = useState<TechnicalStaffProfile>(
    () =>
      (storedUserId && TECHNICAL_STAFF_USERS.find((s) => s.id === storedUserId)) ||
      TECHNICAL_STAFF_USERS[0]
  );

  const setCurrentUser = (user: TechnicalStaffProfile) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') window.localStorage.setItem('app-user', user.id);
  };

  const addAuditLog = (logData: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SystemAuditLog = {
      ...logData,
      id: generateId('LOG', 2026),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addTicket = (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId('INC', 2026);
    const now = new Date().toISOString();
    setTickets((prev) => [{ ...data, id, createdAt: now, updatedAt: now }, ...prev]);
    addAuditLog({
      level: 'INFO',
      category: 'TICKETS',
      action: 'CREATE_TICKET',
      details: `Tạo yêu cầu hỗ trợ sự cố mới [${id}]: ${data.title}. Đơn vị: ${data.departmentName}`,
      actorName: data.requestorName,
      actorRole: data.requestorRole || 'Cán Bộ Y Tế',
      targetId: id,
      sha256Hash: fakeSha256(),
    });
    return id;
  };

  const updateTicketStatus = (ticketId: string) =>
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? t : t)));

  const applyTicketStatus = (
    ticketId: string,
    newStatus: TicketStatus,
    notes?: string,
    engineer?: string,
    actorName?: string,
    actorRole?: string
  ) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, resolutionNotes: notes || t.resolutionNotes, assignedEngineer: engineer || t.assignedEngineer, updatedAt: now } : t))
    );
    addAuditLog({
      level: newStatus === 'ĐÃ HOÀN THÀNH' ? 'SUCCESS' : 'INFO',
      category: 'TICKETS',
      action: 'UPDATE_TICKET_STATUS',
      details: `Cập nhật trạng thái sự cố [${ticketId}] sang "${newStatus}". Phụ trách: ${engineer || actorName || currentUser.name}. Ghi chú: ${notes || 'N/A'}`,
      actorName: actorName || currentUser.name,
      actorRole: actorRole || currentUser.role,
      targetId: ticketId,
      sha256Hash: fakeSha256(),
    });
  };

  const verifyE2E = (
    ticketId: string,
    itSignature: string,
    userSignature: string,
    verificationMethod: 'DIGITAL_CODE' | 'FILE_UPLOAD' = 'DIGITAL_CODE',
    fileInfo?: E2EFileInfo
  ) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              e2eVerified: true,
              itSignature,
              userSignature,
              verificationMethod,
              signedFileName: fileInfo?.name,
              signedFileUrl: fileInfo?.url,
              signedFileType: fileInfo?.type,
              signedFileUploadTime: fileInfo?.uploadTime || now,
              signedFileHash: fileInfo?.hash,
              updatedAt: now,
            }
          : t
      )
    );
    const details =
      verificationMethod === 'FILE_UPLOAD'
        ? `Nộp biên bản nghiệm thu ký số bằng file đính kèm: ${fileInfo?.name || 'File.pdf'}. Đóng vết thời gian TSA lúc ${fileInfo?.uploadTime || now}. Hash: ${fileInfo?.hash}`
        : `Xác thực thành công cặp chữ ký số PKI hai chiều: CNTT [${itSignature}] & Bác sĩ [${userSignature}] cho ticket [${ticketId}].`;
    addAuditLog({
      level: 'KÝ SỐ',
      category: 'KÝ SỐ',
      action: verificationMethod === 'FILE_UPLOAD' ? 'UPLOAD_SIGNATURE_DOC' : 'VERIFY_E2E_SMARTCA_CODE',
      details,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: ticketId,
      signedFileName: fileInfo?.name,
      signedFilePreview: fileInfo?.url,
      sha256Hash: fileInfo?.hash || fakeSha256(),
    });
  };

  const addDepartment = (newDept: DepartmentSummary) => {
    setDepartments((prev) => [...prev, newDept]);
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

  const updateDepartment = (updatedDept: DepartmentSummary) => {
    setDepartments((prev) => prev.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
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

  const addInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
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

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
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

  const addStaffProfile = (newStaff: TechnicalStaffProfile) => {
    setStaffList((prev) => [...prev, newStaff]);
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

  const updateStaffDepartments = (staffId: string, departmentIds: string[]) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, assignedDepartmentIds: departmentIds } : s))
    );
    if (currentUser.id === staffId) {
      setCurrentUserState((prev) => ({ ...prev, assignedDepartmentIds: departmentIds }));
    }
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

  return {
    tickets,
    inventory,
    departments,
    staffList,
    auditLogs,
    currentUser,
    setCurrentUser,
    addAuditLog,
    addTicket,
    updateTicketStatus,
    applyTicketStatus,
    verifyE2E,
    addDepartment,
    updateDepartment,
    addInventoryItem,
    updateInventoryItem,
    addStaffProfile,
    updateStaffDepartments,
  };
}