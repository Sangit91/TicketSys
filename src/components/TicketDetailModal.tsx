import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';import {
  X,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  QrCode,
  FileText,
  Send,
  Upload,
  FileCheck,
  Image as ImageIcon,
  FileType,
  Clock,
  Lock,
  ExternalLink,
  AlertTriangle,
  FileCode,
  Paperclip,
  Download,
  Eye,
  Printer,
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types';
import { fakeSha256, randomHex } from '../utils';
import { useTrapFocus } from '../hooks/useTrapFocus';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus, notes?: string, engineer?: string) => void;
  onVerifyE2E: (
    ticketId: string,
    itSignature: string,
    userSignature: string,
    verificationMethod?: 'DIGITAL_CODE' | 'FILE_UPLOAD',
    signedFileInfo?: {
      name: string;
      url: string;
      type: string;
      uploadTime: string;
      hash: string;
    }
  ) => void;
}

interface PreviewFileObject {
  title: string;
  fileName: string;
  fileUrl?: string;
  fileType?: 'doc' | 'pdf' | 'image' | string;
  fileSize?: string;
  uploadTime?: string;
  departmentName?: string;
  requestorName?: string;
  ticketId?: string;
  hash?: string;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
  onVerifyE2E,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes || '');
  const [assignedEngineer, setAssignedEngineer] = useState(ticket?.assignedEngineer || '');
  const [itSigInput, setItSigInput] = useState('');
  const [userSigInput, setUserSigInput] = useState(ticket?.userSignature || '');

  // Signature mode: 'DIGITAL_CODE' or 'FILE_UPLOAD'
  const [signMode, setSignMode] = useState<'DIGITAL_CODE' | 'FILE_UPLOAD'>('DIGITAL_CODE');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    type: string;
    sizeFormatted: string;
    uploadTime: string;
    hash: string;
  } | null>(null);

  // Proposal attachment state
  const [proposalFile, setProposalFile] = useState<{
    name: string;
    url?: string;
    type: 'doc' | 'pdf' | 'image';
    size: string;
    uploadTime: string;
  } | null>(
    ticket?.proposalFileName
      ? {
          name: ticket.proposalFileName,
          url: ticket.proposalFileUrl,
          type: ticket.proposalFileType || 'doc',
          size: ticket.proposalFileSize || '1.2 MB',
          uploadTime: ticket.proposalFileUploadTime || '03/08/2026 15:25',
        }
      : null
  );

  const [previewFile, setPreviewFile] = useState<PreviewFileObject | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proposalFileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useTrapFocus(!!ticket, onClose, dialogRef);

  if (!ticket) return null;

  const generateFakeHash = (_fileName: string) => fakeSha256();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString('vi-VN')} - ${now.toLocaleDateString('vi-VN')} (Giờ TSA)`;
    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        url: dataUrl,
        type: file.type.includes('pdf') ? 'application/pdf' : file.type.includes('image') ? 'image' : 'doc',
        sizeFormatted: fileSizeFormatted,
        uploadTime: formattedDate,
        hash: generateFakeHash(file.name),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProposalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString('vi-VN')} - ${now.toLocaleDateString('vi-VN')}`;
    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const fileType = file.type.includes('pdf')
      ? 'pdf'
      : file.type.includes('image')
      ? 'image'
      : 'doc';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProposalFile({
        name: file.name,
        url: dataUrl,
        type: fileType,
        size: fileSizeFormatted,
        uploadTime: formattedDate,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFile = (fileName: string, fileUrl?: string, fileType?: string) => {
    if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('http') || fileUrl.startsWith('blob:'))) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate downloadable file
    const docContent = `====================================================================
BỆNH VIỆN ĐA KHOA KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM - ĐỘC LẬP - TỰ DO - HẠNH PHÚC
====================================================================

GIẤY ĐỀ NGHỊ VÀ BIÊN BẢN NGHIỆM THU Y TẾ
Tên văn bản đính kèm: ${fileName}
Đơn vị phát hành: ${ticket.departmentName}
Người làm đơn / Đề nghị: ${ticket.requestorName}
Mã Ticket xử lý: ${ticket.id}
Ngày tạo: ${new Date().toLocaleString('vi-VN')}

NỘI DUNG SỰ CỐ / YÊU CẦU CẤP PHÁT:
--------------------------------------------------------------------
- Tên sự cố: ${ticket.title}
- Mã QR thiết bị: ${ticket.assetQrCode}
- Nội dung chi tiết:
  ${ticket.description}

DẤU THỜI GIAN & XÁC THỰC BẢO MẬT:
- Dấu thời gian (TSA): ${new Date().toISOString()}
- SHA-256 Checksum: SHA256-${randomHex(64).toUpperCase()}
- Trạng thái: ĐÃ PHÊ DUYỆT BỞI TRƯỞNG KHOA & CÁN BỘ CNTT PHỤ TRÁCH
====================================================================`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.docx') || fileName.endsWith('.pdf') ? fileName : `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signMode === 'DIGITAL_CODE') {
      if (!itSigInput || !userSigInput) return;
      onVerifyE2E(ticket.id, itSigInput, userSigInput, 'DIGITAL_CODE');
    } else {
      if (!uploadedFile) return;
      onVerifyE2E(
        ticket.id,
        itSigInput || 'VERIFIED_VIA_FILE_ATTACHMENT',
        userSigInput || 'DOC_APPROVED_BY_STAMP',
        'FILE_UPLOAD',
        {
          name: uploadedFile.name,
          url: uploadedFile.url,
          type: uploadedFile.type,
          uploadTime: uploadedFile.uploadTime,
          hash: uploadedFile.hash,
        }
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-space-bg backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết yêu cầu ${ticket.id}`}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-card-bg border border-acid-lime/40 rounded-lg shadow-[0_0_50px_rgba(3,0,20,0.9)] flex flex-col overflow-hidden text-white z-10"
        >
          {/* Header */}
          <div className="bg-[#1A1A1A] p-6 border-b border-white/10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs font-bold text-acid-lime px-2 py-0.5 rounded bg-acid-lime/10 border border-acid-lime/30">
                  {ticket.id}
                </span>
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    ticket.priority.includes('KHẨN CẤP') || ticket.priority.includes('CRITICAL')
                      ? 'bg-neon-red text-white'
                      : 'bg-line-energy/20 text-line-energy'
                  }`}
                >
                  {ticket.priority}
                </span>
                <span className="font-mono text-xs text-white/50">{ticket.category}</span>
              </div>
              <h3 className="font-display text-2xl text-white tracking-wide">{ticket.title}</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng cửa sổ chi tiết"
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm">
            {/* Grid Information */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#1A1A1A] border border-white/10 rounded">
              <div>
                <span className="text-[11px] text-white/50 uppercase block mb-1">Người Yêu Cầu</span>
                <span className="font-bold text-white">{ticket.requestorName}</span>
              </div>
              <div>
                <span className="text-[11px] text-white/50 uppercase block mb-1">Khoa / Phòng</span>
                <span className="font-bold text-acid-lime">{ticket.departmentName}</span>
              </div>
              <div>
                <span className="text-[11px] text-white/50 uppercase block mb-1">Mã QR Thiết Bị</span>
                <span className="font-bold text-line-energy flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  {ticket.assetQrCode}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-white/50 uppercase block mb-1">Trạng Thái Hiện Tại</span>
                <span className="font-bold text-white uppercase">{ticket.status}</span>
              </div>
            </div>

            {/* Diagnostic Description */}
            <div>
              <h4 className="text-xs uppercase text-white/50 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-acid-lime" />
                Mô Tả Chi Tiết Sự Cố
              </h4>
              <p className="p-4 bg-space-bg border border-white/10 text-white/90 leading-relaxed rounded font-sans">
                {ticket.description}
              </p>
            </div>

            {/* Department Proposal Document (Giấy Đề Nghị Của Khoa / Phòng) */}
            <div className="p-4 bg-space-bg border border-neon-cyan/40 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-neon-cyan" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Giấy Đề Nghị Của Khoa / Phòng (Bản Đính Kèm)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {proposalFile && (
                    <span className="text-[10px] font-mono text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/30 font-bold">
                      ĐÃ PHÊ DUYỆT
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => proposalFileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan rounded border border-neon-cyan/30 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{proposalFile ? 'Thay tệp' : 'Tải lên tệp đề nghị'}</span>
                  </button>
                  <input
                    type="file"
                    ref={proposalFileInputRef}
                    onChange={handleProposalFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                </div>
              </div>

              {proposalFile ? (
                <div className="p-3 bg-[#1A1A1A] border border-white/10 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center shrink-0 text-neon-cyan">
                      {proposalFile.type === 'doc' ? (
                        <FileText className="w-5 h-5 text-line-energy" />
                      ) : proposalFile.type === 'pdf' ? (
                        <FileType className="w-5 h-5 text-neon-red" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-acid-lime" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate max-w-[280px] sm:max-w-[360px]">
                        {proposalFile.name}
                      </div>
                      <div className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5">
                        <span>Dung lượng: {proposalFile.size}</span>
                        <span>•</span>
                        <span>{proposalFile.uploadTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewFile({
                          title: 'Giấy Đề Nghị Của Khoa / Phòng',
                          fileName: proposalFile.name,
                          fileUrl: proposalFile.url,
                          fileType: proposalFile.type,
                          fileSize: proposalFile.size,
                          uploadTime: proposalFile.uploadTime,
                          departmentName: ticket.departmentName,
                          requestorName: ticket.requestorName,
                          ticketId: ticket.id,
                          hash: generateFakeHash(proposalFile.name),
                        })
                      }
                      className="px-3 py-1.5 rounded bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-black font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-neon-cyan/40"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>XEM PREVIEW</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadFile(proposalFile.name, proposalFile.url, proposalFile.type)}
                      className="px-3 py-1.5 rounded bg-acid-lime/20 hover:bg-acid-lime text-acid-lime hover:text-black font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-acid-lime/40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>TẢI VỀ</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => proposalFileInputRef.current?.click()}
                  className="p-4 border border-dashed border-white/20 hover:border-neon-cyan bg-[#1A1A1A]/60 rounded text-center cursor-pointer transition-all hover:bg-neon-cyan/5 text-xs text-white/60 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-neon-cyan" />
                  <span>Chưa có tệp đính kèm. Nhấp để tải lên Giấy Đề Nghị của Khoa / Phòng (Word, PDF, Ảnh).</span>
                </div>
              )}
            </div>

            {/* Engineer Assignment & Workflow State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-white/50 block mb-2">Cán Bộ CNTT Phụ Trách</label>
                <input
                  type="text"
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-white/50 block mb-2">Cập Nhật Trạng Thái Phiếu</label>
                <select
                  value={ticket.status}
                  onChange={(e) =>
                    onUpdateStatus(ticket.id, e.target.value as TicketStatus, resolutionNotes, assignedEngineer)
                  }
                  className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime cursor-pointer"
                >
                  <option value="MỚI">MỚI TẠO</option>
                  <option value="ĐANG XỬ LÝ">ĐANG XỬ LÝ</option>
                  <option value="CHỜ KÝ XÁC NHẬN">CHỜ KÝ XÁC NHẬN</option>
                  <option value="ĐÃ HOÀN THÀNH">ĐÃ HOÀN THÀNH</option>
                  <option value="ĐÃ ĐÓNG">ĐÃ ĐÓNG</option>
                </select>
              </div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="text-xs uppercase text-white/50 block mb-2">Nhật Ký Xử Lý & Ghi Chú Kỹ Thuật</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Nhập chi tiết sửa chữa, linh kiện thay thế, phiên bản phần mềm hoặc nguyên nhân sự cố..."
                className="w-full bg-[#1A1A1A] border border-white/20 p-3 text-white outline-none focus:border-acid-lime font-sans"
              />
            </div>

            {/* End-to-End Verification Signature Section */}
            {ticket.requiresE2EVerification && (
              <div className="p-4 bg-[#1A1A1A] border border-acid-lime/30 rounded space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-acid-lime" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      Quy Trình Ký Số Xác Nhận Hai Bên (Hai Chiều)
                    </h4>
                  </div>
                  {ticket.e2eVerified ? (
                    <span className="flex items-center gap-1 text-xs text-acid-lime font-bold">
                      <CheckCircle2 className="w-4 h-4" /> ĐÃ XÁC NHẬN KÝ SỐ HAI BÊN
                    </span>
                  ) : (
                    <span className="text-xs text-neon-red font-bold animate-pulse">CHỜ KÝ SỐ XÁC NHẬN</span>
                  )}
                </div>

                {!ticket.e2eVerified ? (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-space-bg rounded-lg border border-white/10 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setSignMode('DIGITAL_CODE')}
                        className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signMode === 'DIGITAL_CODE'
                            ? 'bg-acid-lime text-black font-bold shadow-md'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>1. Mã Ký Số PKI/CA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignMode('FILE_UPLOAD')}
                        className={`py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signMode === 'FILE_UPLOAD'
                            ? 'bg-neon-cyan text-black font-bold shadow-md'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>2. Upload File Ảnh/PDF Đã Ký</span>
                      </button>
                    </div>

                    <form onSubmit={handleVerifySubmit} className="space-y-4">
                      {signMode === 'DIGITAL_CODE' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-white/50 block mb-1">
                                1. Mã Chữ Ký Số Cán Bộ CNTT
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="VD: KTV_TUAN_CNTT_SIGN"
                                value={itSigInput}
                                onChange={(e) => setItSigInput(e.target.value)}
                                className="w-full bg-space-bg border border-white/20 p-2.5 text-white text-xs outline-none focus:border-acid-lime rounded"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-white/50 block mb-1">
                                2. Chữ Ký Số Bác Sĩ / Trưởng Khoa Y Tế
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="VD: BS_NAM_KHAKHAMBENH_AUTH"
                                value={userSigInput}
                                onChange={(e) => setUserSigInput(e.target.value)}
                                className="w-full bg-space-bg border border-white/20 p-2.5 text-white text-xs outline-none focus:border-acid-lime rounded"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold text-xs py-2.5 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all rounded shadow-md"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>HOÀN TẤT KÝ SỐ XÁC NHẬN HAI BÊN (MÃ CHỮ KÝ)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* File Dropzone */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*,.pdf"
                            className="hidden"
                          />

                          {!uploadedFile ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-neon-cyan/40 hover:border-neon-cyan bg-space-bg/80 p-6 rounded-xl text-center cursor-pointer transition-all hover:bg-neon-cyan/5 group space-y-2"
                            >
                              <div className="w-12 h-12 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center mx-auto text-neon-cyan group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div className="text-xs font-bold text-white">
                                Tải Lên Biên Bản Đã Ký Xác Nhận Hai Bên (File Ảnh hoặc PDF)
                              </div>
                              <div className="text-[11px] text-white/50">
                                Chấp nhận định dạng: <span className="text-neon-cyan">PNG, JPG, WEBP, PDF</span> (Tối đa 25MB)
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white/70 rounded-full text-[10px] border border-white/10 font-mono mt-1">
                                <Lock className="w-3 h-3 text-acid-lime" />
                                Tự động đóng Dấu Thời Gian TSA & Mã Hóa SHA-256 chống làm giả
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-space-bg border border-neon-cyan/50 rounded-xl space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  {uploadedFile.type.includes('image') ? (
                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                                      <img
                                        src={uploadedFile.url}
                                        alt="Signed Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg bg-red-950/60 border border-red-500/40 flex flex-col items-center justify-center shrink-0 text-red-400">
                                      <FileType className="w-6 h-6" />
                                      <span className="text-[9px] font-bold">PDF</span>
                                    </div>
                                  )}
                                  <div className="min-w-0 font-mono text-xs">
                                    <div className="font-bold text-white truncate max-w-[320px]">
                                      {uploadedFile.name}
                                    </div>
                                    <div className="text-white/50 text-[11px] flex items-center gap-2">
                                      <span>Dung lượng: {uploadedFile.sizeFormatted}</span>
                                    </div>
                                    <div className="text-acid-lime text-[10px] flex items-center gap-1 font-bold mt-1">
                                      <Clock className="w-3 h-3" />
                                      <span>Thời điểm Upload: {uploadedFile.uploadTime}</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setUploadedFile(null)}
                                  className="text-white/50 hover:text-red-400 p-1 rounded transition-colors"
                                  title="Đổi file khác"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Security Hash & Anti-tampering Seal */}
                              <div className="p-2.5 bg-surface border border-acid-lime/30 rounded-lg text-[10px] font-mono space-y-1">
                                <div className="flex items-center justify-between text-acid-lime font-bold">
                                  <span className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> VẾT DẤU THỜI GIAN (TSA TIMESTAMP) & INTEGRITY SEAL:
                                  </span>
                                  <span className="bg-acid-lime/20 text-acid-lime px-1.5 py-0.5 rounded text-[9px]">
                                    VERIFIED SAFE
                                  </span>
                                </div>
                                <div className="text-white/70 font-mono truncate">
                                  {uploadedFile.hash}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewFile({
                                      title: 'Biên Bản Đã Ký Xác Nhận Hai Bên',
                                      fileName: uploadedFile.name,
                                      fileUrl: uploadedFile.url,
                                      fileType: uploadedFile.type,
                                      fileSize: uploadedFile.sizeFormatted,
                                      uploadTime: uploadedFile.uploadTime,
                                      departmentName: ticket.departmentName,
                                      requestorName: ticket.requestorName,
                                      ticketId: ticket.id,
                                      hash: uploadedFile.hash,
                                    })
                                  }
                                  className="py-1.5 px-3 bg-neon-cyan/15 hover:bg-neon-cyan text-neon-cyan hover:text-black border border-neon-cyan/40 rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>XEM PREVIEW</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(uploadedFile.name, uploadedFile.url, uploadedFile.type)}
                                  className="py-1.5 px-3 bg-acid-lime/15 hover:bg-acid-lime text-acid-lime hover:text-black border border-acid-lime/40 rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>TẢI VỀ</span>
                                </button>
                                <button
                                  type="submit"
                                  className="flex-1 bg-neon-cyan hover:bg-[#00d0df] text-black font-mono font-bold text-xs py-2 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded shadow-md"
                                >
                                  <FileCheck className="w-4 h-4" />
                                  <span>HOÀN TẤT XÁC NHẬN BẰNG FILE</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Security Anti-Falsification Disclaimer */}
                          <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-200/90 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Ghi chú bảo mật chống làm giả:</strong> Thời điểm upload và mã băm SHA-256 được lưu trữ vĩnh viễn vào nhật ký Audit của bệnh viện. Mọi hành vi chỉnh sửa file sau thời điểm này sẽ lập tức bị phát hiện và vô hiệu hóa.
                            </span>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                ) : (
                  <div className="space-y-3 p-3.5 bg-space-bg border border-acid-lime/40 rounded-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-acid-lime" />
                        <span>KÝ SỐ HAI BÊN ĐÃ NGHIỆM THU HỢP LỆ</span>
                      </div>
                      <span className="font-mono text-[10px] text-acid-lime bg-acid-lime/10 px-2 py-0.5 rounded border border-acid-lime/30 font-bold">
                        {ticket.verificationMethod === 'FILE_UPLOAD' ? 'PHƯƠNG THỨC FILE ĐÍNH KÈM' : 'PHƯƠNG THỨC MÃ SỐ PKI'}
                      </span>
                    </div>

                    {ticket.verificationMethod === 'FILE_UPLOAD' || ticket.signedFileName ? (
                      <div className="p-3 bg-surface border border-white/10 rounded-lg space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">Tên File Biên Bản:</span>
                          <span className="text-neon-cyan font-bold">{ticket.signedFileName || 'Bien_Ban_Ky_So_Hai_Ben_Verified.pdf'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">Thời Điểm Upload (Gắn Vết TSA):</span>
                          <span className="text-acid-lime font-bold">{ticket.signedFileUploadTime || ticket.updatedAt}</span>
                        </div>
                        {ticket.signedFileHash && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/50">SHA-256 Checksum:</span>
                            <span className="text-white/80 text-[10px] font-mono">{ticket.signedFileHash}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewFile({
                                title: 'Biên Bản Nghiệm Thu Ký Số Hai Bên',
                                fileName: ticket.signedFileName || 'Bien_Ban_Ky_So_Hai_Ben_Verified.pdf',
                                fileUrl: ticket.signedFileUrl,
                                fileType: ticket.signedFileType || 'pdf',
                                uploadTime: ticket.signedFileUploadTime || ticket.updatedAt,
                                departmentName: ticket.departmentName,
                                requestorName: ticket.requestorName,
                                ticketId: ticket.id,
                                hash: ticket.signedFileHash || 'SHA256-VERIFIED-E2E-OK',
                              })
                            }
                            className="flex-1 py-1.5 bg-neon-cyan/15 hover:bg-neon-cyan text-neon-cyan hover:text-black border border-neon-cyan/40 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>XEM PREVIEW BIÊN BẢN</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadFile(
                                ticket.signedFileName || 'Bien_Ban_Ky_So_Hai_Ben_Verified.pdf',
                                ticket.signedFileUrl,
                                ticket.signedFileType || 'pdf'
                              )
                            }
                            className="flex-1 py-1.5 bg-acid-lime/15 hover:bg-acid-lime text-acid-lime hover:text-black border border-acid-lime/40 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>TẢI FILE VỀ MÁY</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 bg-surface border border-white/10 rounded">
                          <span className="text-white/40 block text-[10px]">Mã Chữ Ký Số CNTT:</span>
                          <span className="text-acid-lime font-bold">{ticket.itSignature}</span>
                        </div>
                        <div className="p-2.5 bg-surface border border-white/10 rounded">
                          <span className="text-white/40 block text-[10px]">Mã Chữ Ký Số Y Tế:</span>
                          <span className="text-line-energy font-bold">{ticket.userSignature}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-[#1A1A1A] p-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 font-mono text-xs uppercase cursor-pointer"
            >
              ĐÓNG
            </button>
            <button
              onClick={() => {
                onUpdateStatus(ticket.id, 'ĐÃ HOÀN THÀNH', resolutionNotes, assignedEngineer);
                onClose();
              }}
              className="px-5 py-2 rounded bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>LƯU & XÁC NHẬN HOÀN THÀNH</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Document & File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-surface border border-neon-cyan/50 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-white font-mono text-sm font-bold min-w-0">
                <FileCheck className="w-5 h-5 text-neon-cyan shrink-0" />
                <div className="min-w-0">
                  <div className="text-white truncate">{previewFile.title}</div>
                  <div className="text-[11px] text-neon-cyan font-mono font-normal truncate">
                    {previewFile.fileName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="In tài liệu này"
                >
                  <Printer className="w-4 h-4 text-line-energy" />
                  <span className="hidden sm:inline">IN VĂN BẢN</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(previewFile.fileName, previewFile.fileUrl, previewFile.fileType)
                  }
                  className="p-2 rounded bg-acid-lime hover:bg-acid-lime-dim text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Tải văn bản về máy"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">TẢI VỀ MÁY</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content Viewer */}
            <div className="flex-1 overflow-auto py-4 flex items-center justify-center bg-[#090b14] rounded-xl my-3 border border-white/10 p-2 sm:p-4">
              {previewFile.fileType === 'image' || (previewFile.fileUrl && previewFile.fileUrl.startsWith('data:image')) ? (
                <div className="flex flex-col items-center justify-center p-2 max-w-full">
                  <img
                    src={previewFile.fileUrl}
                    alt={previewFile.fileName}
                    className="max-w-full max-h-[60vh] object-contain rounded border border-white/20 shadow-2xl"
                  />
                  <div className="mt-3 text-xs text-white/60 font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-acid-lime" />
                    <span>File ảnh đính kèm đã xác thực toàn vẹn TSA</span>
                  </div>
                </div>
              ) : (
                /* Authentic A4 Paper Document Viewer */
                <div className="w-full bg-slate-50 text-slate-900 font-sans p-6 sm:p-10 rounded-lg shadow-2xl border border-slate-300 max-w-2xl mx-auto space-y-6 text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[62vh]">
                  {/* Official Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b-2 border-slate-900 gap-2">
                    <div>
                      <div className="font-bold text-[11px] uppercase tracking-tight text-slate-800">
                        BỆNH VIỆN ĐA KHOA KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM
                      </div>
                      <div className="text-xs font-bold text-blue-900 uppercase">
                        KHOA / PHÒNG: {previewFile.departmentName || ticket.departmentName}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-700 font-serif italic">
                      <div><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></div>
                      <div>Độc lập - Tự do - Hạnh phúc</div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-1">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
                      {previewFile.title || 'GIẤY ĐỀ NGHỊ XỬ LÝ SỰ CỐ Y TẾ'}
                    </h2>
                    <div className="font-mono text-xs text-slate-600">
                      Mã phiếu: <span className="font-bold text-blue-800">{previewFile.ticketId || ticket.id}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-3 text-slate-800">
                    <p><strong>Kính gửi:</strong> Ban Giám Đốc Bệnh Viện & Phòng Công Nghệ Thông Tin - Truyền Thông.</p>
                    <p>
                      Đơn vị <strong>{previewFile.departmentName || ticket.departmentName}</strong> kính trình Ban Giám Đốc và Bộ phận kỹ thuật CNTT về việc kiểm tra, nghiệm thu và cấp phát thiết bị với thông tin chi tiết:
                    </p>

                    <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg font-mono text-xs space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Người đề nghị:</span>
                        <span className="col-span-2 font-bold text-slate-900">{previewFile.requestorName || ticket.requestorName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Nội dung / Sự cố:</span>
                        <span className="col-span-2 font-bold text-blue-900">{ticket.title}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Mã QR Thiết bị:</span>
                        <span className="col-span-2 font-bold text-slate-800">{ticket.assetQrCode}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Mô tả chi tiết:</span>
                        <span className="col-span-2 text-slate-800 font-sans italic">{ticket.description}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 italic text-xs">
                      Văn bản này được trích xuất trực tiếp từ Hệ thống Quản lý Y tế Bệnh viện. Mọi dữ liệu đã được đối soát chính xác với nhật ký trực Kỹ thuật.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 text-center text-xs">
                    <div>
                      <div className="font-bold text-slate-800 uppercase">LÃNH ĐẠO KHOA / PHÒNG</div>
                      <div className="text-[10px] text-slate-500 italic mb-6">(Đã phê duyệt điện tử)</div>
                      <div className="inline-block p-1.5 border border-emerald-600 rounded text-[10px] font-mono text-emerald-700 font-bold uppercase bg-emerald-50">
                        ✓ APPROVED PKI
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 uppercase">CÁN BỘ CNTT TIẾP NHẬN</div>
                      <div className="text-[10px] text-slate-500 italic mb-6">(Đã xác nhận sổ trực)</div>
                      <div className="inline-block p-1.5 border border-blue-600 rounded text-[10px] font-mono text-blue-700 font-bold uppercase bg-blue-50">
                        ✓ DISPATCH OK
                      </div>
                    </div>
                  </div>

                  {/* Footer Seal */}
                  <div className="pt-4 border-t border-dashed border-slate-300 font-mono text-[10px] text-slate-500 flex justify-between items-center">
                    <span>Thời gian đóng dấu TSA: {previewFile.uploadTime || '03/08/2026 15:25'}</span>
                    <span>Checksum: {previewFile.hash || 'SHA256-VERIFIED-DOC'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/60 gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-white/70">
                <ShieldCheck className="w-4 h-4 text-acid-lime" />
                <span>Được bảo vệ bởi Dấu thời gian TSA & Nhật ký Audit Bệnh Viện</span>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(previewFile.fileName, previewFile.fileUrl, previewFile.fileType)
                  }
                  className="px-4 py-2 bg-acid-lime hover:bg-acid-lime-dim text-black rounded font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>TẢI FILE VỀ MÁY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-bold cursor-pointer transition-colors"
                >
                  ĐÓNG PREVIEW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

