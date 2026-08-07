import React, { useState, useCallback, useRef } from 'react';
import { InventoryItem, AssetType, OperationalStatus, AssetHealth, AssetHistoryEvent, TechnicalStaffProfile, DepartmentSummary } from '../types';
import { TECHNICAL_STAFF_USERS } from '../data/mockData';
import { generateId } from '../utils';
import { AssetRelocationFlow } from './AssetRelocationFlow';
import { AssetRelocationModal } from './AssetRelocationModal';
import { useTrapFocus } from '../hooks/useTrapFocus';
import { usePagedRows } from '../hooks/usePagedRows';
import { Pagination } from './Pagination';
import {
  Search,
  Activity,
  QrCode,
  RefreshCw,
  Wrench,
  Plus,
  Printer,
  Calendar,
  Building,
  User,
  History,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  Layers,
  Sparkles,
  X,
  Compass,
  Filter,
  ShieldAlert,
  ArrowRightLeft,
  GitCommit,
  Globe,
  Wifi,
  Network,
  Cpu,
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  currentUser?: TechnicalStaffProfile;
  departments?: DepartmentSummary[];
  onOpenNewTicketForAsset: (assetQr: string, assetName: string) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (updatedItem: InventoryItem) => void;
  onNavigateToTopology: (nodeId?: string) => void;
}

const ALL_ASSET_TYPES: AssetType[] = [
  'Máy Chủ HIS/PACS',
  'Máy Trạm Khám Bệnh',
  'Switch Quang Trung Tâm',
  'Cụm Xử Lý Hình Ảnh',
  'Cổng An Ninh Mạng',
  'Máy In Y Tế & Mực In',
  'Thiết Bị Ký Số & Chữ Ký Số',
  'Hạ Tầng Dự Phòng & UPS',
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  currentUser,
  departments = [],
  onOpenNewTicketForAsset,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onNavigateToTopology,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [selectedOperationalStatus, setSelectedOperationalStatus] = useState<string>('ALL');
  
  // Scope filter: Only assigned departments vs All
  const isTechnician = currentUser && currentUser.roleType !== 'ADMIN';
  const [onlyScopeDepartments, setOnlyScopeDepartments] = useState<boolean>(Boolean(isTechnician));

  // Assigned department names for logged in technician
  const assignedDepts = departments.filter((d) => currentUser?.assignedDepartmentIds.includes(d.id));
  const assignedDeptNames = assignedDepts.map((d) => d.name.toLowerCase());

  // Modals
  const [qrModalAsset, setQrModalAsset] = useState<InventoryItem | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);
  const [relocatingAsset, setRelocatingAsset] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [historyViewMode, setHistoryViewMode] = useState<'NODE' | 'LIST'>('NODE');
  
  // Ping state
  const [pingResults, setPingResults] = useState<{ [id: string]: number }>({});
  const [isPinging, setIsPinging] = useState<string | null>(null);

  // New History Event State for detail modal
  const [newEventPayload, setNewEventPayload] = useState<{
    type: 'NHẬP_XUẤT' | 'DI_DỜI' | 'BẢO_TRÌ' | 'THAY_MỰC' | 'CHUYỂN_TRẠNG_THÁI';
    description: string;
    actor: string;
    fromLocation: string;
    toLocation: string;
    newStatus?: OperationalStatus;
  }>({
    type: 'DI_DỜI',
    description: '',
    actor: 'KS. Phạm Minh Nhật',
    fromLocation: '',
    toLocation: '',
  });

  // New Asset Form State
  const [newAssetData, setNewAssetData] = useState<Partial<InventoryItem>>({
    name: '',
    serialNumber: '',
    type: 'Máy In Y Tế & Mực In',
    department: 'Khoa Khám Bệnh & Cấp Cứu',
    assignedTo: 'BS. CKII. Nguyễn Văn Nam',
    ipAddress: '10.200.12.99',
    macAddress: '00:11:22:33:44:55',
    health: 'TỐI ƯU',
    operationalStatus: 'ĐANG SỬ DỤNG',
    temperature: 30,
    cpuUsage: 10,
    memoryUsage: 20,
    uptimeDays: 30,
    location: 'Khoa Khám Bệnh - Phòng 01',
    isPrinterSupply: true,
    inkModel: 'Hộp Mực Cartridge HP 26A / Canon EP-308',
    inkLevelPercent: 100,
    printedPagesCount: 0,
    supplierName: 'Công ty Cổ phần Y Tế Quảng Nam',
  });

  const closeDetailModal = useCallback(() => setSelectedItemForDetail(null), []);
  const closeQrModal = useCallback(() => setQrModalAsset(null), []);
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const detailDialogRef = useRef<HTMLDivElement>(null);
  const qrDialogRef = useRef<HTMLDivElement>(null);
  const addDialogRef = useRef<HTMLDivElement>(null);
  useTrapFocus(!!selectedItemForDetail, closeDetailModal, detailDialogRef);
  useTrapFocus(!!qrModalAsset, closeQrModal, qrDialogRef);
  useTrapFocus(isAddModalOpen, closeAddModal, addDialogRef);

  const filteredItems = inventory.filter((item) => {
    // Role/Department scope filter (KTV chỉ xem thiết bị thuộc khoa phụ trách)
    if (onlyScopeDepartments && currentUser && currentUser.roleType !== 'ADMIN') {
      if (!assignedDeptNames.includes(item.department.toLowerCase())) {
        return false;
      }
    }

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.inkModel && item.inkModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.ipAddress.includes(searchTerm);

    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesHealth = selectedHealth === 'ALL' || item.health === selectedHealth;
    const matchesOperational =
      selectedOperationalStatus === 'ALL' || item.operationalStatus === selectedOperationalStatus;

    return matchesSearch && matchesType && matchesHealth && matchesOperational;
  });

  const pageSize = 9;
  const pagination = usePagedRows(filteredItems, pageSize, [
    searchTerm,
    selectedType,
    selectedHealth,
    selectedOperationalStatus,
    onlyScopeDepartments,
  ]);
  const pageItems = pagination.rows;

  const handleSimulatePing = (id: string) => {
    setIsPinging(id);
    setTimeout(() => {
      const ms = +(Math.random() * 2.8 + 0.4).toFixed(2);
      setPingResults((prev) => ({ ...prev, [id]: ms }));
      setIsPinging(null);
    }, 600);
  };

  const handleAddHistoryEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForDetail) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newHistoryEntry: AssetHistoryEvent = {
      id: generateId('HIST'),
      timestamp: nowStr,
      type: newEventPayload.type,
      description: newEventPayload.description,
      actor: newEventPayload.actor,
      fromLocation: newEventPayload.fromLocation || selectedItemForDetail.location,
      toLocation: newEventPayload.toLocation || selectedItemForDetail.location,
    };

    const updatedHistory = [newHistoryEntry, ...(selectedItemForDetail.historyLog || [])];
    const updatedItem: InventoryItem = {
      ...selectedItemForDetail,
      historyLog: updatedHistory,
      location: newEventPayload.toLocation || selectedItemForDetail.location,
      operationalStatus: newEventPayload.newStatus || selectedItemForDetail.operationalStatus,
      lastMaintenanceDate: newEventPayload.type === 'BẢO_TRÌ' ? nowStr.split(' ')[0] : selectedItemForDetail.lastMaintenanceDate,
      inkLevelPercent: newEventPayload.type === 'THAY_MỰC' ? 100 : selectedItemForDetail.inkLevelPercent,
    };

    onUpdateInventoryItem(updatedItem);
    setSelectedItemForDetail(updatedItem);
    setNewEventPayload({
      type: 'DI_DỜI',
      description: '',
      actor: 'KS. Phạm Minh Nhật',
      fromLocation: '',
      toLocation: '',
    });
  };

  const handleSaveNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetData.name || !newAssetData.serialNumber) return;

    const id = generateId('AST');
    const nowStr = new Date().toISOString().substring(0, 10);
    const qrCodeUrl = `QR-${id}`;

    const itemToAdd: InventoryItem = {
      id,
      name: newAssetData.name!,
      serialNumber: newAssetData.serialNumber!,
      type: (newAssetData.type as AssetType) || 'Máy In Y Tế & Mực In',
      department: newAssetData.department || 'Khoa Khám Bệnh',
      assignedTo: newAssetData.assignedTo || 'Bác sĩ / Cán bộ Khoa',
      ipAddress: newAssetData.ipAddress || '10.200.0.100',
      macAddress: newAssetData.macAddress || '00:1A:2B:3C:4D:99',
      health: (newAssetData.health as AssetHealth) || 'TỐI ƯU',
      operationalStatus: (newAssetData.operationalStatus as OperationalStatus) || 'ĐANG SỬ DỤNG',
      temperature: Number(newAssetData.temperature) || 30,
      cpuUsage: Number(newAssetData.cpuUsage) || 10,
      memoryUsage: Number(newAssetData.memoryUsage) || 20,
      uptimeDays: Number(newAssetData.uptimeDays) || 1,
      location: newAssetData.location || 'Phòng Khám Bệnh',
      qrCodeUrl,
      lastMaintenanceDate: nowStr,
      isPrinterSupply: newAssetData.type === 'Máy In Y Tế & Mực In' || newAssetData.isPrinterSupply,
      inkModel: newAssetData.inkModel,
      inkLevelPercent: newAssetData.inkLevelPercent || 100,
      printedPagesCount: newAssetData.printedPagesCount || 0,
      supplierName: newAssetData.supplierName || 'Công ty Thiết Bị Y Tế & CNTT',
      importDate: nowStr,
      warrantyExpiryDate: '2028-12-31',
      historyLog: [
        {
          id: generateId('HIST'),
          timestamp: `${nowStr} 09:00`,
          type: 'NHẬP_XUẤT',
          description: `Khai báo nhập kho thiết bị/vật tư mới: ${newAssetData.name}`,
          actor: 'KS. Phạm Minh Nhật',
        },
      ],
    };

    onAddInventoryItem(itemToAdd);
    setIsAddModalOpen(false);
  };

  // Quick stats
  const totalAssets = inventory.length;
  const printerSupplyCount = inventory.filter((i) => i.type === 'Máy In Y Tế & Mực In' || i.isPrinterSupply).length;
  const underMaintenanceCount = inventory.filter((i) => i.operationalStatus === 'ĐANG BẢO TRÌ').length;
  const inStockCount = inventory.filter((i) => i.operationalStatus === 'TRONG KHO DỰ PHÒNG').length;

  return (
    <div className="w-full space-y-6">
      {/* Top Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card-bg/60 border border-acid-lime/40 p-4 rounded-md backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] text-white/50 uppercase block">TỔNG THIẾT BỊ / TÀI SẢN</span>
            <span className="font-display text-3xl text-acid-lime">{totalAssets}</span>
          </div>
          <Layers className="w-8 h-8 text-acid-lime opacity-80" />
        </div>

        <div className="bg-card-bg/60 border border-line-energy/40 p-4 rounded-md backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] text-white/50 uppercase block">MÁY IN & MỰC IN Y TẾ</span>
            <span className="font-display text-3xl text-line-energy">{printerSupplyCount}</span>
          </div>
          <Printer className="w-8 h-8 text-line-energy opacity-80" />
        </div>

        <div className="bg-card-bg/60 border border-neon-red/40 p-4 rounded-md backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] text-white/50 uppercase block">ĐANG BẢO TRÌ / SỬA CHỮA</span>
            <span className="font-display text-3xl text-neon-red">{underMaintenanceCount}</span>
          </div>
          <Wrench className="w-8 h-8 text-neon-red opacity-80" />
        </div>

        <div className="bg-card-bg/60 border border-amber-400/40 p-4 rounded-md backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] text-white/50 uppercase block">KHO DỰ PHÒNG THAY THẾ</span>
            <span className="font-display text-3xl text-amber-300">{inStockCount}</span>
          </div>
          <Truck className="w-8 h-8 text-amber-300 opacity-80" />
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-card-bg/80 border border-white/10 p-4 rounded-md backdrop-blur-md space-y-3 font-mono text-xs">
        {/* Row 1: Search & Add Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên thiết bị, Seri, IP, vị trí, cartridge mực, khoa phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/20 focus:border-acid-lime pl-9 pr-4 py-2.5 text-xs font-mono text-white outline-none rounded"
            />
          </div>

          {/* Scope Toggle for Technician */}
          {currentUser && currentUser.roleType !== 'ADMIN' && (
            <button
              onClick={() => setOnlyScopeDepartments(!onlyScopeDepartments)}
              className={`px-3 py-2.5 rounded border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                onlyScopeDepartments
                  ? 'bg-acid-lime/15 border-acid-lime text-acid-lime font-bold'
                  : 'bg-[#1A1A1A] border-white/20 text-white/60 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>
                {onlyScopeDepartments
                  ? `CHỈ XEM KHOA PHỤ TRÁCH (${assignedDepts.length})`
                  : 'XEM TOÀN BV (ADMIN SCOPE)'}
              </span>
            </button>
          )}

          {/* Add Equipment / Ink Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Đóng cửa sổ thêm thiết bị"
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
        </div>

        {/* Row 2: Synchronized Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div>
            <label className="text-white/50 block mb-1 text-[10px] uppercase">Loại Thiết Bị / Vật Tư</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/20 text-white px-3 py-1.5 rounded outline-none focus:border-acid-lime cursor-pointer text-xs"
            >
              <option value="ALL">TẤT CẢ LOẠI THIẾT BỊ & MỰC IN</option>
              {ALL_ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/50 block mb-1 text-[10px] uppercase">Trạng Thái Vận Hành</label>
            <select
              value={selectedOperationalStatus}
              onChange={(e) => setSelectedOperationalStatus(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/20 text-white px-3 py-1.5 rounded outline-none focus:border-acid-lime cursor-pointer text-xs"
            >
              <option value="ALL">TẤT CẢ TRẠNG THÁI VẬN HÀNH</option>
              <option value="ĐANG SỬ DỤNG">ĐANG SỬ DỤNG</option>
              <option value="ĐANG BẢO TRÌ">ĐANG BẢO TRÌ</option>
              <option value="TRONG KHO DỰ PHÒNG">TRONG KHO DỰ PHÒNG</option>
              <option value="ĐÃ THANH LÝ">ĐÃ THANH LÝ</option>
            </select>
          </div>

          <div>
            <label className="text-white/50 block mb-1 text-[10px] uppercase">Sức Khỏe Kỹ Thuật</label>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/20 text-white px-3 py-1.5 rounded outline-none focus:border-acid-lime cursor-pointer text-xs"
            >
              <option value="ALL">TẤT CẢ SỨC KHỎE KỸ THUẬT</option>
              <option value="TỐI ƯU">TỐI ƯU</option>
              <option value="SUY GIẢM">SUY GIẢM</option>
              <option value="NGUY CẤP">NGUY CẤP</option>
              <option value="BẢO TRÌ">BẢO TRÌ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Hardware & Ink Supplies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.map((item) => {
          const isCritical = item.health === 'NGUY CẤP';
          const isDegraded = item.health === 'SUY GIẢM';
          const isPrinter = item.type === 'Máy In Y Tế & Mực In' || item.isPrinterSupply;

          return (
            <div
              key={item.id}
              className={`bg-card-bg/70 border rounded-lg p-5 backdrop-blur-md flex flex-col justify-between space-y-4 transition-all hover:border-acid-lime/50 ${
                isCritical
                  ? 'border-neon-red shadow-[0_0_20px_rgba(255,51,102,0.2)]'
                  : isDegraded
                  ? 'border-amber-400/50'
                  : 'border-white/10'
              }`}
            >
              {/* Top Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-acid-lime px-2 py-0.5 rounded bg-acid-lime/10 border border-acid-lime/30 flex items-center gap-1">
                    {isPrinter ? <Printer className="w-3 h-3 text-acid-lime" /> : null}
                    {item.type}
                  </span>
                  
                  {/* Operational status badge */}
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.operationalStatus === 'ĐANG BẢO TRÌ'
                        ? 'bg-neon-red text-white animate-pulse'
                        : item.operationalStatus === 'TRONG KHO DỰ PHÒNG'
                        ? 'bg-amber-400/20 text-amber-300'
                        : item.operationalStatus === 'ĐÃ THANH LÝ'
                        ? 'bg-white/20 text-white/50'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    ● {item.operationalStatus || item.health}
                  </span>
                </div>

                <h3
                  onClick={() => setSelectedItemForDetail(item)}
                  className="font-display text-xl text-white tracking-wide hover:text-acid-lime cursor-pointer transition-colors"
                >
                  {item.name}
                </h3>
                <p className="font-mono text-xs text-white/50">{item.serialNumber}</p>
              </div>

              {/* Hardware / Ink Metrics Gauges */}
              {isPrinter ? (
                /* Ink Supplies Gauge Panel */
                <div className="space-y-2.5 font-mono text-xs bg-[#1A1A1A] p-3 rounded border border-white/10">
                  <div className="flex justify-between text-[11px] text-white/70">
                    <span className="text-acid-lime font-bold flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5" /> Hộp mực / Vật tư:
                    </span>
                    <span className="text-white truncate max-w-[150px]">{item.inkModel || 'Cartridge tiêu chuẩn'}</span>
                  </div>

                  {/* Ink Level Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Dung lượng mực còn lại</span>
                      <span className={item.inkLevelPercent && item.inkLevelPercent < 15 ? 'text-neon-red font-bold' : 'text-acid-lime'}>
                        {item.inkLevelPercent ?? 100}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded overflow-hidden">
                      <div
                        className={`h-full ${
                          (item.inkLevelPercent ?? 100) < 15
                            ? 'bg-neon-red animate-pulse'
                            : (item.inkLevelPercent ?? 100) < 40
                            ? 'bg-amber-400'
                            : 'bg-acid-lime'
                        }`}
                        style={{ width: `${item.inkLevelPercent ?? 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Printed Pages */}
                  <div className="flex justify-between text-[11px] text-white/60 pt-1">
                    <span>Tổng số trang đã in:</span>
                    <span className="text-white font-bold">{(item.printedPagesCount || 0).toLocaleString()} trang</span>
                  </div>
                </div>
              ) : (
                /* Hardware Workstation / Server Gauges */
                <div className="space-y-2.5 font-mono text-xs bg-[#1A1A1A] p-3 rounded border border-white/10">
                  {/* Temp Gauge */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-neon-red" /> Nhiệt độ:
                    </span>
                    <span className={`font-bold ${item.temperature > 80 ? 'text-neon-red' : 'text-white'}`}>
                      {item.temperature}°C
                    </span>
                  </div>

                  {/* CPU Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Tải CPU</span>
                      <span>{item.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
                      <div
                        className={`h-full ${
                          item.cpuUsage > 85 ? 'bg-neon-red' : 'bg-acid-lime'
                        }`}
                        style={{ width: `${item.cpuUsage}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Dung lượng RAM</span>
                      <span>{item.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
                      <div
                        className="h-full bg-line-energy"
                        style={{ width: `${item.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Networking & Location details */}
              <div className="font-mono text-xs space-y-2 text-white/70">
                <div className="flex justify-between">
                  <span className="text-white/40">Khoa / Đơn vị:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{item.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40">Vị trí lắp đặt:</span>
                  <span className="text-acid-lime font-bold flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-acid-lime shrink-0" />
                    {item.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Cán bộ bàn giao:</span>
                  <span className="text-white/90 truncate max-w-[170px]">{item.assignedTo}</span>
                </div>

                {/* Subnet, VLAN & Default Gateway panel */}
                <div className="p-2.5 bg-[#0A0D1A] rounded-xl border border-neon-cyan/30 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-neon-cyan" /> Địa chỉ IP:
                    </span>
                    <span className="text-neon-cyan font-extrabold">{item.ipAddress}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-acid-lime" /> VLAN Phân luồng:
                    </span>
                    <span className="text-acid-lime font-bold truncate max-w-[150px]" title={item.vlan || 'VLAN 10'}>
                      {item.vlan || 'VLAN 10'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <Network className="w-3 h-3 text-line-energy" /> Subnet Mask:
                    </span>
                    <span className="text-white/90 font-medium">{item.subnetMask || '255.255.255.0 (/24)'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-purple-400" /> Default Gateway:
                    </span>
                    <span className="text-white/90 font-medium">{item.defaultGateway || item.ipAddress.replace(/\.\d+$/, '.1')}</span>
                  </div>
                </div>
              </div>

              {/* Linkage to Topology Map */}
              {item.linkedTopologyNodeId && (
                <button
                  onClick={() => onNavigateToTopology(item.linkedTopologyNodeId)}
                  className="w-full bg-line-energy/15 hover:bg-line-energy/30 border border-line-energy/40 text-line-energy py-1 px-2 rounded text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>XEM TRÊN SƠ ĐỒ HẠ TẦNG</span>
                </button>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 font-mono text-xs">
                {/* Detail & History Button */}
                <button
                  onClick={() => {
                    setSelectedItemForDetail(item);
                    setHistoryViewMode('NODE');
                  }}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 rounded cursor-pointer transition-colors text-[11px]"
                >
                  <History className="w-3.5 h-3.5 text-acid-lime" />
                  <span>LỊCH SỬ</span>
                </button>

                {/* Relocate Asset Button */}
                <button
                  onClick={() => setRelocatingAsset(item)}
                  className="flex items-center gap-1 bg-acid-lime/15 hover:bg-acid-lime/30 text-acid-lime border border-acid-lime/40 px-2 py-1.5 rounded cursor-pointer transition-colors text-[11px] font-bold"
                  title="Điều chuyển vị trí lắp đặt / khoa phòng"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>ĐIỀU CHUYỂN</span>
                </button>

                {/* Ping Button */}
                <button
                  onClick={() => handleSimulatePing(item.id)}
                  disabled={isPinging === item.id}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded cursor-pointer transition-colors text-[11px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging === item.id ? 'animate-spin text-acid-lime' : ''}`} />
                  <span>{pingResults[item.id] ? `${pingResults[item.id]}ms` : 'PING'}</span>
                </button>

                {/* QR Modal Button */}
                <button
                  onClick={() => setQrModalAsset(item)}
                  className="flex items-center gap-1 bg-line-energy/20 hover:bg-line-energy/30 text-line-energy px-2.5 py-1.5 rounded cursor-pointer transition-colors text-[11px]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>MÃ QR</span>
                </button>

                {/* Issue Incident Button */}
                <button
                  onClick={() => onOpenNewTicketForAsset(item.qrCodeUrl, item.name)}
                  className="flex items-center gap-1 bg-neon-red/20 hover:bg-neon-red/40 text-neon-red px-2.5 py-1.5 rounded cursor-pointer font-bold transition-colors text-[11px]"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>BÁO LỖI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pageSize}
        onPage={pagination.setPage}
      />

      {/* Full Asset Detail & Lifecycle History Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/85 backdrop-blur-md">
          <div ref={detailDialogRef} role="dialog" aria-modal="true" aria-label={`Chi tiết thiết bị ${selectedItemForDetail.name}`} tabIndex={-1} className="bg-card-bg border border-acid-lime/50 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white shadow-[0_0_50px_rgba(204,255,0,0.2)]">
            {/* Modal Header */}
            <div className="bg-[#1A1A1A] p-5 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                  <span className="text-acid-lime font-bold px-2 py-0.5 rounded bg-acid-lime/10 border border-acid-lime/30">
                    {selectedItemForDetail.id}
                  </span>
                  <span className="text-white/60">{selectedItemForDetail.type}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded uppercase ${
                      selectedItemForDetail.operationalStatus === 'ĐANG BẢO TRÌ'
                        ? 'bg-neon-red text-white'
                        : selectedItemForDetail.operationalStatus === 'TRONG KHO DỰ PHÒNG'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    ● {selectedItemForDetail.operationalStatus || 'ĐANG SỬ DỤNG'}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-white">{selectedItemForDetail.name}</h3>
                <p className="font-mono text-xs text-white/50">Mã Seri: {selectedItemForDetail.serialNumber}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRelocatingAsset(selectedItemForDetail)}
                  className="bg-acid-lime hover:bg-acid-lime-dim text-black font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-[0_0_12px_rgba(204,255,0,0.4)]"
                >
                  <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>ĐIỀU CHUYỂN VỊ TRÍ</span>
                </button>

                <button
                  onClick={() => setSelectedItemForDetail(null)}
                  aria-label="Đóng cửa sổ chi tiết thiết bị"
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#1A1A1A] border border-white/10 rounded-xl">
                <div>
                  <span className="text-white/40 block mb-1">Khoa Phòng</span>
                  <span className="font-bold text-white">{selectedItemForDetail.department}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Vị Trí Lắp Đặt</span>
                  <span className="font-bold text-acid-lime flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedItemForDetail.location}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Cán Bộ Phụ Trách</span>
                  <span className="font-bold text-white">{selectedItemForDetail.assignedTo}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Địa Chỉ MAC</span>
                  <span className="font-bold text-white/80">{selectedItemForDetail.macAddress}</span>
                </div>
              </div>

              {/* Full Network Specification Grid (IP, Subnet, VLAN, Default Gateway) */}
              <div className="p-4 bg-[#0A0D1A] border border-neon-cyan/30 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-neon-cyan uppercase flex items-center gap-2">
                  <Globe className="w-4 h-4 text-neon-cyan" /> THÔNG SỐ CẤU HÌNH MẠNG & VLAN PHÂN LUỒNG
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-2.5 bg-surface rounded-lg border border-white/10">
                    <span className="text-white/40 block text-[10px] mb-1">Địa Chỉ IP Tĩnh:</span>
                    <span className="font-extrabold text-neon-cyan text-sm">{selectedItemForDetail.ipAddress}</span>
                  </div>
                  <div className="p-2.5 bg-surface rounded-lg border border-white/10">
                    <span className="text-white/40 block text-[10px] mb-1">VLAN Hạ Tầng:</span>
                    <span className="font-bold text-acid-lime text-xs">{selectedItemForDetail.vlan || 'VLAN 10 - Server HIS/PACS'}</span>
                  </div>
                  <div className="p-2.5 bg-surface rounded-lg border border-white/10">
                    <span className="text-white/40 block text-[10px] mb-1">Subnet Mask / Lớp Mạng:</span>
                    <span className="font-bold text-white text-xs">{selectedItemForDetail.subnetMask || '255.255.255.0 (/24)'}</span>
                  </div>
                  <div className="p-2.5 bg-surface rounded-lg border border-white/10">
                    <span className="text-white/40 block text-[10px] mb-1">Default Gateway:</span>
                    <span className="font-bold text-purple-400 text-xs">{selectedItemForDetail.defaultGateway || selectedItemForDetail.ipAddress.replace(/\.\d+$/, '.1')}</span>
                  </div>
                </div>
              </div>

              {/* Procurement & Warranty Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-space-bg border border-white/10 rounded">
                <div>
                  <span className="text-white/40 block">Nhà Cung Cấp Hợp Đồng:</span>
                  <span className="text-white font-bold">{selectedItemForDetail.supplierName || 'Công ty Y Tế Quảng Nam'}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Ngày Nhập Kho / Cấp Phát:</span>
                  <span className="text-acid-lime font-bold">{selectedItemForDetail.importDate || '2025-01-10'}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Hạn Bảo Hành Chính Hãng:</span>
                  <span className="text-line-energy font-bold">{selectedItemForDetail.warrantyExpiryDate || '2028-12-31'}</span>
                </div>
              </div>

              {/* Consumable / Printer Details */}
              {(selectedItemForDetail.type === 'Máy In Y Tế & Mực In' || selectedItemForDetail.isPrinterSupply) && (
                <div className="p-4 bg-[#1A1A1A] border border-acid-lime/30 rounded space-y-3">
                  <h4 className="font-bold text-sm text-acid-lime flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    THÔNG TIN MỰC IN & VẬT TƯ THAY THẾ
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-white/40 block">Mẫu hộp mực Cartridge/Ribbon:</span>
                      <span className="text-white font-bold">{selectedItemForDetail.inkModel || 'Hộp mực tiêu chuẩn'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Mức mực hiện tại:</span>
                      <span className="text-acid-lime font-bold">{selectedItemForDetail.inkLevelPercent ?? 100}%</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Số trang đã in:</span>
                      <span className="text-white font-bold">{(selectedItemForDetail.printedPagesCount || 0).toLocaleString()} trang</span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Section Header with View Mode Switcher */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-acid-lime" />
                    LỊCH SỬ LUÂN CHUYỂN, DI DỜI & BẢO TRÌ THIẾT BỊ
                  </h4>

                  {/* Mode Toggle Buttons */}
                  <div className="flex items-center bg-[#111322] p-1 rounded-xl border border-white/10 gap-1 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setHistoryViewMode('NODE')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        historyViewMode === 'NODE'
                          ? 'bg-acid-lime text-black shadow-[0_0_12px_rgba(204,255,0,0.4)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>SƠ ĐỒ NỐT LUÂN CHUYỂN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryViewMode('LIST')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        historyViewMode === 'LIST'
                          ? 'bg-line-energy text-black shadow-[0_0_12px_rgba(136,170,255,0.4)]'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>DANH SÁCH TIMELINE</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Rendering: Interactive Node Flow vs Timeline List */}
                {historyViewMode === 'NODE' ? (
                  <AssetRelocationFlow item={selectedItemForDetail} />
                ) : (
                  <>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedItemForDetail.historyLog && selectedItemForDetail.historyLog.length > 0 ? (
                        selectedItemForDetail.historyLog.map((event) => (
                          <div
                            key={event.id}
                            className="p-3 bg-[#1A1A1A] border border-white/10 rounded flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    event.type === 'NHẬP_XUẤT'
                                      ? 'bg-line-energy/20 text-line-energy'
                                      : event.type === 'DI_DỜI'
                                      ? 'bg-acid-lime/20 text-acid-lime'
                                      : event.type === 'THAY_MỰC'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-neon-red/20 text-neon-red'
                                  }`}
                                >
                                  {event.type}
                                </span>
                                <span className="text-white/50 text-[11px]">{event.timestamp}</span>
                              </div>
                              <p className="text-white font-sans text-xs">{event.description}</p>
                              {event.fromLocation && event.toLocation && (
                                <div className="text-[11px] text-white/50">
                                  Từ: <span className="text-white">{event.fromLocation}</span> → Sang:{' '}
                                  <span className="text-acid-lime">{event.toLocation}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-white/40 text-[11px] whitespace-nowrap">{event.actor}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/50 p-3 bg-[#1A1A1A] rounded text-center">Chưa có nhật ký ghi nhận</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Add New Event Form */}
              <form onSubmit={handleAddHistoryEvent} className="p-4 bg-[#1A1A1A] border border-white/15 rounded space-y-3">
                <h5 className="font-bold text-xs text-acid-lime uppercase flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Ghi Nhật Ký Di Dời / Bảo Trì / Thay Mực Mới
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/50 block mb-1">Loại Thao Tác</label>
                    <select
                      value={newEventPayload.type}
                      onChange={(e) =>
                        setNewEventPayload({
                          ...newEventPayload,
                          type: e.target.value as AssetHistoryEvent['type'],
                        })
                      }
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    >
                      <option value="DI_DỜI">DI DỜI VỊ TRÍ KHOA PHÒNG</option>
                      <option value="THAY_MỰC">THAY HỘP MỰC / CARTRIDGE</option>
                      <option value="BẢO_TRÌ">BẢO TRÌ & SỬA CHỮA</option>
                      <option value="CHUYỂN_TRẠNG_THÁI">CHUYỂN TRẠNG THÁI QUẢN LÝ</option>
                      <option value="NHẬP_XUẤT">NHẬP XUẤT KHO</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/50 block mb-1">Trạng Thái Vận Hành Mới</label>
                    <select
                      value={newEventPayload.newStatus || selectedItemForDetail.operationalStatus}
                      onChange={(e) =>
                        setNewEventPayload({
                          ...newEventPayload,
                          newStatus: e.target.value as OperationalStatus,
                        })
                      }
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    >
                      <option value="ĐANG SỬ DỤNG">ĐANG SỬ DỤNG</option>
                      <option value="ĐANG BẢO TRÌ">ĐANG BẢO TRÌ</option>
                      <option value="TRONG KHO DỰ PHÒNG">TRONG KHO DỰ PHÒNG</option>
                      <option value="ĐÃ THANH LÝ">ĐÃ THANH LÝ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white/50 block mb-1">Cán Bộ Thực Hiện</label>
                    <input
                      type="text"
                      required
                      value={newEventPayload.actor}
                      onChange={(e) => setNewEventPayload({ ...newEventPayload, actor: e.target.value })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 block mb-1">Nội Dung Chi Tiết</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Thay cartridge HP 26A mới, bàn giao Khoa Khám..."
                      value={newEventPayload.description}
                      onChange={(e) => setNewEventPayload({ ...newEventPayload, description: e.target.value })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Vị Trí Mới (Nếu Di Dời)</label>
                    <input
                      type="text"
                      placeholder="VD: Phòng Khám Số 05 Tầng 2"
                      value={newEventPayload.toLocation}
                      onChange={(e) => setNewEventPayload({ ...newEventPayload, toLocation: e.target.value })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-bold py-2 rounded uppercase tracking-wider cursor-pointer"
                >
                  CẬP NHẬT NHẬT KÝ THIẾT BỊ
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add New Equipment / Printer Supply Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/85 backdrop-blur-md">
          <div ref={addDialogRef} role="dialog" aria-modal="true" aria-label="Thêm thiết bị hoặc vật tư mực in mới" tabIndex={-1} className="bg-card-bg border border-acid-lime rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-white">
            <div className="bg-[#1A1A1A] p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-2xl text-white uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-acid-lime" />
                THÊM THIẾT BỊ HOẶC VẬT TƯ MỰC IN MỚI
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Đóng cửa sổ thêm thiết bị"
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAsset} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1">Tên Thiết Bị / Vật Tư *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Máy In Đơn Thuốc Canon 3300 / Hộp Mực HP 26A"
                    value={newAssetData.name}
                    onChange={(e) => setNewAssetData({ ...newAssetData, name: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Số Seri / Mã Nhận Diện *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SN-CANON-3300-2026"
                    value={newAssetData.serialNumber}
                    onChange={(e) => setNewAssetData({ ...newAssetData, serialNumber: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1">Loại Tài Sản (Đồng bộ Category)</label>
                  <select
                    value={newAssetData.type}
                    onChange={(e) => setNewAssetData({ ...newAssetData, type: e.target.value as AssetType })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  >
                    {ALL_ASSET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Khoa / Phòng Quản Lý</label>
                  <input
                    type="text"
                    value={newAssetData.department}
                    onChange={(e) => setNewAssetData({ ...newAssetData, department: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1">Vị Trí Lắp Đặt Chi Tiết</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng Khám Số 01 Tầng 1"
                    value={newAssetData.location}
                    onChange={(e) => setNewAssetData({ ...newAssetData, location: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>

                <div>
                  <label className="text-white/60 block mb-1">Cán Bộ Bàn Giao</label>
                  <input
                    type="text"
                    value={newAssetData.assignedTo}
                    onChange={(e) => setNewAssetData({ ...newAssetData, assignedTo: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded"
                  />
                </div>
              </div>

              {/* Ink attributes */}
              <div className="p-4 bg-[#1A1A1A] border border-acid-lime/30 rounded space-y-3">
                <h4 className="font-bold text-xs text-acid-lime uppercase flex items-center gap-1.5">
                  <Printer className="w-4 h-4" /> Chi Tiết Mực In / Vật Tư Thay Thế
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/50 block mb-1">Mẫu Hộp Mực (Cartridge)</label>
                    <input
                      type="text"
                      placeholder="VD: HP 26A / Canon EP-308"
                      value={newAssetData.inkModel}
                      onChange={(e) => setNewAssetData({ ...newAssetData, inkModel: e.target.value })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Dung Lượng Mực (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newAssetData.inkLevelPercent}
                      onChange={(e) => setNewAssetData({ ...newAssetData, inkLevelPercent: Number(e.target.value) })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 block mb-1">Số Trang Đã In (Ban đầu)</label>
                    <input
                      type="number"
                      min={0}
                      value={newAssetData.printedPagesCount}
                      onChange={(e) => setNewAssetData({ ...newAssetData, printedPagesCount: Number(e.target.value) })}
                      className="w-full bg-space-bg border border-white/20 p-2 text-white outline-none rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-acid-lime hover:bg-acid-lime-dim text-black font-mono font-bold py-3 rounded uppercase tracking-wider text-sm cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.4)]"
              >
                LƯU THIẾT BỊ / MỰC IN VÀO HỆ THỐNG
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Display Modal */}
      {qrModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/80 backdrop-blur-md">
          <div ref={qrDialogRef} role="dialog" aria-modal="true" aria-label={`Mã QR thiết bị ${qrModalAsset.name}`} tabIndex={-1} className="bg-card-bg border border-acid-lime p-6 rounded-lg max-w-sm w-full text-center space-y-4">
            <h3 className="font-display text-2xl text-white">{qrModalAsset.name}</h3>
            <p className="font-mono text-xs text-acid-lime">{qrModalAsset.qrCodeUrl}</p>

            <div className="p-6 bg-white rounded-md mx-auto w-48 h-48 flex flex-col items-center justify-center border-4 border-black">
              <QrCode className="w-32 h-32 text-black" />
              <span className="font-mono text-[10px] text-black font-bold mt-2">{qrModalAsset.serialNumber}</span>
            </div>

            <p className="font-mono text-xs text-white/60">
              Được giao cho: {qrModalAsset.assignedTo} ({qrModalAsset.location})
            </p>

            <button
              onClick={() => setQrModalAsset(null)}
              className="w-full bg-acid-lime text-black font-mono font-bold text-xs py-2 uppercase rounded cursor-pointer"
            >
              ĐÓNG THẺ MÃ VẠCH
            </button>
          </div>
        </div>
      )}

      {/* Asset Relocation & Location Edit Modal */}
      {relocatingAsset && (
        <AssetRelocationModal
          item={relocatingAsset}
          departments={departments}
          staffList={TECHNICAL_STAFF_USERS}
          currentUser={currentUser}
          onClose={() => setRelocatingAsset(null)}
          onSaveRelocation={(updatedItem) => {
            onUpdateInventoryItem(updatedItem);
            if (selectedItemForDetail?.id === updatedItem.id) {
              setSelectedItemForDetail(updatedItem);
            }
            setRelocatingAsset(null);
          }}
        />
      )}
    </div>
  );
};
