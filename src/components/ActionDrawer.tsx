import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Upload,
  Paperclip,
  Trash2,
  Eye,
  FileText,
  FileType,
  Image as ImageIcon,
  Info,
  Wrench,
} from 'lucide-react';
import { Ticket, IssueCategory } from '../types';

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  departments: { id: string; name: string }[];
}

export const ActionDrawer: React.FC<ActionDrawerProps> = ({
  isOpen,
  onClose,
  onSubmitTicket,
  departments,
}) => {
  const [requestorName, setRequestorName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'DEP-HIS');
  const [assetQrCode, setAssetQrCode] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Phần Cứng / Y Tế');
  const [priority, setPriority] = useState<string>('P2-CAO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiresE2EVerification, setRequiresE2EVerification] = useState(true);
  const [userSignature, setUserSignature] = useState('');
  const [isScanningQr, setIsScanningQr] = useState(false);

  // Hardware / Maintenance / Ink Request Toggle & Proposal File State
  const [isHardwareOrInkExplicit, setIsHardwareOrInkExplicit] = useState<boolean>(true);
  const [proposalFile, setProposalFile] = useState<{
    name: string;
    url: string;
    fileType: 'doc' | 'pdf' | 'image';
    size: string;
    uploadTime: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Smart check if the issue nature requires/recommends a Department Proposal Document
  const isHardwareOrInkCategory =
    isHardwareOrInkExplicit ||
    category === 'Phần Cứng / Y Tế' ||
    title.toLowerCase().includes('thay thế') ||
    title.toLowerCase().includes('bảo trì') ||
    title.toLowerCase().includes('sửa chữa') ||
    title.toLowerCase().includes('mực in') ||
    title.toLowerCase().includes('linh kiện') ||
    description.toLowerCase().includes('mực in') ||
    description.toLowerCase().includes('thay thế') ||
    description.toLowerCase().includes('bảo trì');

  const handleSimulateQrScan = () => {
    setIsScanningQr(true);
    setTimeout(() => {
      const randomQr = `QR-TB-YTE-${Math.floor(1000 + Math.random() * 9000)}-BVQK`;
      setAssetQrCode(randomQr);
      setIsScanningQr(false);
    }, 800);
  };

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      let fileType: 'doc' | 'pdf' | 'image' = 'pdf';
      const nameLower = file.name.toLowerCase();
      if (
        nameLower.endsWith('.doc') ||
        nameLower.endsWith('.docx') ||
        file.type.includes('msword') ||
        file.type.includes('wordprocessingml')
      ) {
        fileType = 'doc';
      } else if (file.type.startsWith('image/')) {
        fileType = 'image';
      }

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const formattedSize =
        file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

      setProposalFile({
        name: file.name,
        url,
        fileType,
        size: formattedSize,
        uploadTime: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN'),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requestorName.trim()) return;

    const selectedDept = departments.find((d) => d.id === departmentId);

    onSubmitTicket({
      title,
      requestorName,
      departmentId,
      departmentName: selectedDept?.name || 'Khoa Khám Bệnh & Cấp Cứu',
      assetQrCode: assetQrCode || `QR-TB-${Math.floor(Math.random() * 90000)}`,
      category,
priority: priority as Ticket['priority'],
      status: 'MỚI',
      description,
      requiresE2EVerification,
      e2eVerified: false,
      userSignature: requiresE2EVerification && userSignature ? userSignature : undefined,
      proposalFileName: proposalFile?.name,
      proposalFileUrl: proposalFile?.url,
      proposalFileType: proposalFile?.fileType,
      proposalFileUploadTime: proposalFile?.uploadTime,
      proposalFileSize: proposalFile?.size,
    });

    // Reset Form
    setTitle('');
    setRequestorName('');
    setDescription('');
    setAssetQrCode('');
    setUserSignature('');
    setProposalFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-space-bg z-50 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-card-bg border-l border-acid-lime/30 shadow-[-10px_0_40px_rgba(3,0,20,0.8)] flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card-bg/90 backdrop-blur-md p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-acid-lime text-black flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-black stroke-black" />
                </div>
                <div>
                  <h2 className="font-display text-2xl tracking-wider text-white uppercase">
                    TẠO PHIẾU YÊU CẦU HỖ TRỢ CNTT
                  </h2>
                  <p className="font-mono text-xs text-acid-lime">
                    BVĐK KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              {/* Incident Title */}
              <div>
                <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                  Tiêu Đề Yêu Cầu / Sự Cố <span className="text-neon-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Máy tính phòng khám số 3 không in được kết quả xét nghiệm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
                />
              </div>

              {/* Requestor & Dept Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                    Họ Và Tên Người Yêu Cầu <span className="text-neon-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BS. Nguyễn Văn A"
                    value={requestorName}
                    onChange={(e) => setRequestorName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                    Khoa / Phòng Sử Dụng
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#1A1A1A] text-white">
                        {d.name} ({d.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asset QR / Barcode Input */}
              <div>
                <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                  Mã Quét QR / Barcode Thiết Bị Y Tế
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="QR-SW-8801-CORE"
                    value={assetQrCode}
                    onChange={(e) => setAssetQrCode(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateQrScan}
                    disabled={isScanningQr}
                    className="flex items-center gap-2 bg-line-energy/20 hover:bg-line-energy/30 border border-line-energy/40 text-line-energy px-3 py-2 rounded text-xs font-mono cursor-pointer transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isScanningQr ? 'ĐANG QUÉT...' : 'QUÉT MÃ QR'}</span>
                  </button>
                </div>
              </div>

              {/* Issue Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                    Phân Loại Sự Cố
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    className="w-full bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none cursor-pointer"
                  >
                    <option value="Phần Cứng / Y Tế">Phần Cứng / Y Tế</option>
                    <option value="Phần Mềm HIS/PACS/LIS">Phần Mềm HIS/PACS/LIS</option>
                    <option value="Mạng & Hạ Tầng">Mạng & Hạ Tầng</option>
                    <option value="Tài Khoản & Chữ Ký Số">Tài Khoản & Chữ Ký Số</option>
                    <option value="An Ninh Mạng & Dữ Liệu">An Ninh Mạng & Dữ Liệu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                    Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#1A1A1A] border-b-2 border-white/30 focus:border-acid-lime px-4 py-2.5 text-white font-mono text-sm outline-none cursor-pointer"
                  >
                    <option value="P1-KHẨN CẤP" className="text-neon-red">
                      P1 - KHẨN CẤP (ẢNH HƯỞNG CẤP CỨU)
                    </option>
                    <option value="P2-CAO">P2 - CAO</option>
                    <option value="P3-TRUNG BÌNH">P3 - TRUNG BÌNH</option>
                    <option value="P4-THẤP">P4 - THẤP</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-xs text-white/70 uppercase mb-2">
                  Mô Tả Chi Tiết Lỗi Hoặc Yêu Cầu
                </label>
                <textarea
                  rows={4}
                  placeholder="Ghi rõ triệu chứng lỗi, mã lỗi hiển thị trên màn hình, vị trí phòng làm việc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/20 focus:border-acid-lime p-3 text-white font-mono text-sm outline-none transition-colors rounded-none"
                />
              </div>

              {/* Department Proposal Document Upload Section (Giấy đề nghị của Khoa) */}
              <div className="p-4 bg-[#1A1A1A] border border-neon-cyan/30 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-neon-cyan" />
                      <h4 className="font-mono text-xs font-bold text-white uppercase">
                        GIẤY ĐỀ NGHỊ CỦA KHOA / PHÒNG (BẢN WORD, PDF HOẶC ẢNH CHỤP)
                      </h4>
                      {isHardwareOrInkCategory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 uppercase">
                          CẦN BẢN ĐỀ NGHỊ
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-white/60 leading-relaxed">
                      Đính kèm Giấy đề nghị được Lãnh đạo Khoa phê duyệt đối với các yêu cầu:
                      <strong className="text-white"> Thay thế linh kiện, Bảo trì sửa chữa thiết bị CNTT</strong> hoặc <strong className="text-white">Cấp mực in / Cuộn in barcode</strong>.
                    </p>
                  </div>
                </div>

                {/* Explicit Nature Toggle Button / Checkbox */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 font-mono text-xs">
                  <input
                    type="checkbox"
                    id="hardwareInkToggle"
                    checked={isHardwareOrInkExplicit}
                    onChange={(e) => setIsHardwareOrInkExplicit(e.target.checked)}
                    className="w-4 h-4 accent-neon-cyan cursor-pointer"
                  />
                  <label htmlFor="hardwareInkToggle" className="text-white/80 cursor-pointer select-none">
                    Yêu cầu liên quan đến <strong>Thay thế, Bảo trì thiết bị CNTT</strong> hoặc <strong>Cấp mực in</strong>
                  </label>
                </div>

                {!isHardwareOrInkCategory && (
                  <div className="p-2.5 bg-space-bg border border-white/10 rounded text-[11px] text-white/50 font-mono flex items-center gap-2">
                    <Info className="w-4 h-4 text-line-energy shrink-0" />
                    <span>
                      Ghi chú: Nếu là <strong>sự cố mạng</strong> hoặc <strong>sự cố phần mềm HIS/PACS</strong>, Quý khoa không cần thiết phải đính kèm Giấy đề nghị này.
                    </span>
                  </div>
                )}

                {/* File Upload Box or Uploaded File Preview Card */}
                {proposalFile ? (
                  <div className="p-3 bg-space-bg border border-neon-cyan/60 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center shrink-0 text-neon-cyan">
                        {proposalFile.fileType === 'doc' ? (
                          <FileText className="w-5 h-5 text-line-energy" />
                        ) : proposalFile.fileType === 'pdf' ? (
                          <FileType className="w-5 h-5 text-neon-red" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-acid-lime" />
                        )}
                      </div>
                      <div className="min-w-0 font-mono text-xs">
                        <div className="text-white font-bold truncate">{proposalFile.name}</div>
                        <div className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5">
                          <span>Kích thước: {proposalFile.size}</span>
                          <span>•</span>
                          <span>{proposalFile.uploadTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {proposalFile.url.startsWith('data:image') && (
                        <a
                          href={proposalFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded bg-white/10 hover:bg-neon-cyan hover:text-black text-white text-xs font-mono font-bold transition-colors flex items-center gap-1"
                          title="Xem ảnh Giấy đề nghị"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setProposalFile(null)}
                        className="p-1.5 rounded bg-white/10 hover:bg-neon-red text-white transition-colors cursor-pointer"
                        title="Xóa đính kèm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileProcess(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed p-4 text-center rounded-lg cursor-pointer transition-all ${
                      isDraggingFile
                        ? 'border-neon-cyan bg-neon-cyan/15'
                        : 'border-white/20 hover:border-neon-cyan/70 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="file"
                      id="proposalFileInput"
                      accept=".doc,.docx,.pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="proposalFileInput" className="cursor-pointer block space-y-1.5">
                      <Upload className="w-6 h-6 text-neon-cyan mx-auto" />
                      <div className="text-xs font-mono font-bold text-white">
                        Kéo thả hoặc Nhấp để đính kèm <span className="text-neon-cyan">File Word (.doc, .docx)</span>, <span className="text-neon-red">PDF</span> hoặc <span className="text-acid-lime">Ảnh Giấy Đề Nghị</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/40">
                        Chấp nhận: .doc, .docx, .pdf, .jpg, .png, .webp (Tối đa 25MB)
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* End-to-End Verification Toggle & Digital Signature */}
              <div className="p-4 bg-[#1A1A1A] border border-line-energy/20 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-acid-lime" />
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white uppercase">
                        Quy Trình Ký Số Xác Nhận Hai Bên
                      </h4>
                      <p className="font-mono text-[11px] text-white/50">
                        Yêu cầu chữ ký số giữa Bác sĩ / Cán bộ y tế và Cán bộ CNTT
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setRequiresE2EVerification(!requiresE2EVerification)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                      requiresE2EVerification ? 'bg-acid-lime justify-end' : 'bg-white/20 justify-start'
                    }`}
                  >
                    <motion.div
                      layout
                      className={`w-4 h-4 rounded-full ${
                        requiresE2EVerification ? 'bg-black' : 'bg-white'
                      }`}
                    />
                  </button>
                </div>

                {requiresE2EVerification && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <label className="block font-mono text-[11px] text-acid-lime uppercase">
                      Chữ Ký Số Người Yêu Cầu (Họ Tên Hoặc Mã SmartCA)
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên hoặc Mã xác thực chữ ký số"
                      value={userSignature}
                      onChange={(e) => setUserSignature(e.target.value)}
                      className="w-full bg-space-bg border border-white/20 focus:border-acid-lime px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-display text-xl tracking-widest uppercase py-3.5 rounded shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>GỬI PHIẾU TỚI TRUNG TÂM CNTT</span>
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

