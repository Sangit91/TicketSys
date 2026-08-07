import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  addEdge,
  Connection,
  Handle,
  Position,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, Plus, Link2, Trash2, X, Globe, Shield, Server, Cpu, Radio, Network, CheckCircle, AlertTriangle, Database, Activity, Building2, Wifi, Pencil } from 'lucide-react';
import { useTrapFocus } from '../hooks/useTrapFocus';

interface NodeDetail {
  id: string;
  label: string;
  type: string;
  throughput: string;
  packetsPerSec: string;
  status: 'ONLINE' | 'WARNING' | 'CRITICAL';
  ip: string;
  department: string;
  description: string;
  color?: string;
}

const INITIAL_NODE_DETAILS: { [key: string]: NodeDetail } = {
  'node-gw': {
    id: 'node-gw',
    label: 'CỔNG AN NINH & TƯỜNG LỬA CHÍNH',
    type: 'Palo Alto PA-7080 Firewall',
    throughput: '42.8 Gbps',
    packetsPerSec: '12,400,000 pps',
    status: 'ONLINE',
    ip: '10.200.0.254',
    department: 'Trung Tâm Công Nghệ Thông Tin',
    description: 'Tường lửa thế hệ mới kiểm soát lưu lượng kết nối HIS, PACS, LIS và cổng thông tin bảo hiểm y tế.',
    color: '#CCFF00',
  },
  'node-core': {
    id: 'node-core',
    label: 'SWITCH QUANG TRUNG TÂM (CORE)',
    type: 'Cisco Nexus 9000 400G',
    throughput: '380 Gbps',
    packetsPerSec: '88,000,000 pps',
    status: 'WARNING',
    ip: '10.200.0.1',
    department: 'Phòng Máy Chủ & Hạ Tầng Mạng',
    description: 'Trục xương sống kết nối mạng cáp quang tới tất cả các Khoa Khám bệnh, Cấp cứu và Điều trị.',
    color: '#00F0FF',
  },
  'node-ai': {
    id: 'node-ai',
    label: 'CỤM MÁY CHỦ PACS & TRÍ TUỆ NHÂN TẠO',
    type: 'NVIDIA H100 Tensor Nodes',
    throughput: '720 Gbps',
    packetsPerSec: '140,000,000 pps',
    status: 'CRITICAL',
    ip: '10.200.14.88',
    department: 'Khoa Chẩn Đoán Hình Ảnh (PACS)',
    description: 'Hệ thống lưu trữ hình ảnh X-quang, CT, MRI và AI hỗ trợ đọc kết quả bị quá nhiệt nút GPU 4.',
    color: '#FF3366',
  },
  'node-db': {
    id: 'node-db',
    label: 'CƠ SỞ DỮ LIỆU CỐT LÕI (HIS / LIS)',
    type: 'Distributed PostgreSQL Cluster',
    throughput: '18.4 Gbps',
    packetsPerSec: '4,100,000 pps',
    status: 'ONLINE',
    ip: '10.200.12.10',
    department: 'Phòng Máy Chủ Trung Tâm',
    description: 'Cơ sở dữ liệu quản lý bệnh nhân, hồ sơ bệnh án điện tử (EMR) và kết nối BHYT.',
    color: '#00FF66',
  },
  'node-secops': {
    id: 'node-secops',
    label: 'TRẠM GIÁM SÁT AN NINH MẠNG',
    type: 'Workstation Giám Sát CNTT',
    throughput: '1.2 Gbps',
    packetsPerSec: '340,000 pps',
    status: 'ONLINE',
    ip: '10.200.88.45',
    department: 'Trung Tâm Công Nghệ Thông Tin',
    description: 'Bảng điều khiển giám sát thời gian thực sự cố mạng và cảnh báo an toàn thông tin.',
    color: '#C084FC',
  },
  'node-exec': {
    id: 'node-exec',
    label: 'CỔNG KẾT NỐI BAN GIÁM ĐỐC',
    type: 'Cổng Kết Nối Mã Hóa Bảo Mật',
    throughput: '850 Mbps',
    packetsPerSec: '120,000 pps',
    status: 'ONLINE',
    ip: '10.200.99.12',
    department: 'Ban Giám Đốc Bệnh Viện',
    description: 'Trạm kết nối báo cáo số liệu điều hành bệnh viện và chữ ký số lãnh đạo.',
    color: '#FF9900',
  },
};

// Vector Lucide Icon renderer for network nodes
const renderNodeIcon = (iconName: string, color: string) => {
  const props = { className: 'w-4 h-4 shrink-0', style: { color } };
  switch (iconName) {
    case 'shield':
      return <Shield {...props} />;
    case 'zap':
      return <Zap {...props} />;
    case 'server':
      return <Server {...props} />;
    case 'database':
      return <Database {...props} />;
    case 'activity':
      return <Activity {...props} />;
    case 'building':
      return <Building2 {...props} />;
    case 'cpu':
      return <Cpu {...props} />;
    case 'wifi':
      return <Wifi {...props} />;
    case 'network':
    default:
      return <Network {...props} />;
  }
};

// Custom Network Node Component with active handles for drawing connection lines
interface NetworkNodeData {
  label: string;
  ip?: string;
  iconName?: string;
  borderColor?: string;
  bgColor?: string;
}

const nodeData = (node: Node | undefined): NetworkNodeData | undefined =>
  node ? (node.data as unknown as NetworkNodeData) : undefined;

const CustomNetworkNode = ({ data, selected }: { data: NetworkNodeData; selected: boolean }) => {
  const isLight = document.querySelector('[data-theme="light"]') !== null || document.body.classList.contains('theme-light');

  let borderColor = data.borderColor || '#CCFF00';
  if (isLight) {
    if (borderColor === '#CCFF00') borderColor = '#E05D38';
    else if (borderColor === '#00F0FF') borderColor = '#0284C7';
    else if (borderColor === '#FF3366') borderColor = '#DC2626';
    else if (borderColor === '#00FF66') borderColor = '#16A34A';
    else if (borderColor === '#C084FC') borderColor = '#9333EA';
    else if (borderColor === '#FF9900') borderColor = '#EA580C';
  }

  const bgColor = isLight ? '#FFFFFF' : (data.bgColor || '#0F1526');
  const textColor = isLight ? '#0F172A' : borderColor;
  const ipColor = isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)';

  return (
    <div
      className={`relative px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-grab active:cursor-grabbing ${
        selected
          ? isLight
            ? 'ring-2 ring-terracotta scale-105 shadow-md'
            : 'ring-2 ring-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.6)]'
          : ''
      }`}
      style={{
        background: bgColor,
        color: textColor,
        border: `2px solid ${borderColor}`,
        boxShadow: isLight
          ? `0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px ${borderColor}33`
          : `0 0 20px ${borderColor}55, inset 0 0 10px ${borderColor}22`,
      }}
    >
      {/* Target Connection Handles (Top & Left) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={`!w-3 !h-3 !border-2 hover:scale-150 transition-transform cursor-pointer ${
          isLight ? '!bg-blue-600 !border-white' : '!bg-neon-cyan !border-black'
        }`}
        title="Kéo thả đến đây để nối line"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`!w-3 !h-3 !border-2 hover:scale-150 transition-transform cursor-pointer ${
          isLight ? '!bg-blue-600 !border-white' : '!bg-neon-cyan !border-black'
        }`}
        title="Kéo thả đến đây để nối line"
      />

      <div className="flex items-center gap-2">
        {renderNodeIcon(data.iconName || 'network', borderColor)}
        <div className="flex flex-col text-left">
          <span className="leading-tight tracking-wide">{data.label}</span>
          {data.ip && <span className="text-[10px] font-normal" style={{ color: ipColor }}>{data.ip}</span>}
        </div>
      </div>

      {/* Source Connection Handles (Bottom & Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`!w-3 !h-3 !border-2 hover:scale-150 transition-transform cursor-pointer ${
          isLight ? '!bg-terracotta !border-white' : '!bg-acid-lime !border-black'
        }`}
        title="Kéo thả từ đây để tạo line mới"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={`!w-3 !h-3 !border-2 hover:scale-150 transition-transform cursor-pointer ${
          isLight ? '!bg-terracotta !border-white' : '!bg-acid-lime !border-black'
        }`}
        title="Kéo thả từ đây để tạo line mới"
      />
    </div>
  );
};

const nodeTypes = {
  networkNode: CustomNetworkNode,
};

const initialNodes: Node[] = [
  {
    id: 'node-gw',
    type: 'networkNode',
    position: { x: 50, y: 180 },
    data: {
      label: 'GW-01 / TƯỜNG LỬA',
      iconName: 'shield',
      ip: '10.200.0.254',
      bgColor: '#0F1526',
      borderColor: '#CCFF00',
    },
  },
  {
    id: 'node-core',
    type: 'networkNode',
    position: { x: 320, y: 180 },
    data: {
      label: 'SWITCH CORE 400G',
      iconName: 'zap',
      ip: '10.200.0.1',
      bgColor: '#0A182E',
      borderColor: '#00F0FF',
    },
  },
  {
    id: 'node-ai',
    type: 'networkNode',
    position: { x: 600, y: 50 },
    data: {
      label: 'MÁY CHỦ PACS / AI',
      iconName: 'server',
      ip: '10.200.14.88',
      bgColor: '#240A18',
      borderColor: '#FF3366',
    },
  },
  {
    id: 'node-db',
    type: 'networkNode',
    position: { x: 600, y: 180 },
    data: {
      label: 'CSDL HIS & LIS',
      iconName: 'database',
      ip: '10.200.12.10',
      bgColor: '#082113',
      borderColor: '#00FF66',
    },
  },
  {
    id: 'node-secops',
    type: 'networkNode',
    position: { x: 600, y: 310 },
    data: {
      label: 'TRUNG TÂM GIÁM SÁT',
      iconName: 'activity',
      ip: '10.200.88.45',
      bgColor: '#1A0F2B',
      borderColor: '#C084FC',
    },
  },
  {
    id: 'node-exec',
    type: 'networkNode',
    position: { x: 880, y: 180 },
    data: {
      label: 'BAN GIÁM ĐỐC',
      iconName: 'building',
      ip: '10.200.99.12',
      bgColor: '#291803',
      borderColor: '#FF9900',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-gw-core',
    source: 'node-gw',
    target: 'node-core',
    animated: true,
    style: { stroke: '#CCFF00', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#CCFF00' },
  },
  {
    id: 'e-core-ai',
    source: 'node-core',
    target: 'node-ai',
    animated: true,
    style: { stroke: '#FF3366', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#FF3366' },
  },
  {
    id: 'e-core-db',
    source: 'node-core',
    target: 'node-db',
    animated: true,
    style: { stroke: '#88AAFF', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#88AAFF' },
  },
  {
    id: 'e-core-secops',
    source: 'node-core',
    target: 'node-secops',
    animated: true,
    style: { stroke: '#CCFF00', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#CCFF00' },
  },
  {
    id: 'e-db-exec',
    source: 'node-db',
    target: 'node-exec',
    animated: true,
    style: { stroke: '#FFFFFF', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#FFFFFF' },
  },
];

interface AssetFlowMapProps {
  theme?: 'dark' | 'light';
}

export const AssetFlowMap: React.FC<AssetFlowMapProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const displayEdges = useMemo(() => {
    if (!isLight) return edges;
    return edges.map((e) => {
      let strokeColor = (e.style?.stroke as string) || '#CCFF00';
      if (strokeColor === '#CCFF00' || strokeColor === '#FFFFFF') strokeColor = '#E05D38';
      else if (strokeColor === '#00F0FF') strokeColor = '#0284C7';
      else if (strokeColor === '#88AAFF') strokeColor = '#2563EB';
      else if (strokeColor === '#FF3366') strokeColor = '#DC2626';

      return {
        ...e,
        style: { ...e.style, stroke: strokeColor },
        markerEnd: typeof e.markerEnd === 'object' ? { ...e.markerEnd, color: strokeColor } : e.markerEnd,
      };
    });
  }, [edges, isLight]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-core');
  const [nodeDetails, setNodeDetails] = useState<{ [key: string]: NodeDetail }>(INITIAL_NODE_DETAILS);

  // Modals state
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddEdgeModal, setShowAddEdgeModal] = useState(false);
  const [showEditNodeModal, setShowEditNodeModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [edgeFormError, setEdgeFormError] = useState<string | null>(null);

  // Add Node Form fields
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('Router / Switch PoE Khoa');
  const [newNodeIp, setNewNodeIp] = useState('10.200.30.1');
  const [newNodeDept, setNewNodeDept] = useState('Khoa Cấp Cứu');
  const [newNodeThroughput, setNewNodeThroughput] = useState('10 Gbps');
  const [newNodeStatus, setNewNodeStatus] = useState<'ONLINE' | 'WARNING' | 'CRITICAL'>('ONLINE');
  const [newNodeColor, setNewNodeColor] = useState('#00F0FF');
  const [newNodeDesc, setNewNodeDesc] = useState('Nút mạng mới được thêm vào sơ đồ hạ tầng bệnh viện.');

  // Edit Node Form fields
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeType, setEditNodeType] = useState('');
  const [editNodeIp, setEditNodeIp] = useState('');
  const [editNodeDept, setEditNodeDept] = useState('');
  const [editNodeThroughput, setEditNodeThroughput] = useState('');
  const [editNodePackets, setEditNodePackets] = useState('');
  const [editNodeStatus, setEditNodeStatus] = useState<'ONLINE' | 'WARNING' | 'CRITICAL'>('ONLINE');
  const [editNodeColor, setEditNodeColor] = useState('#00F0FF');
  const [editNodeDesc, setEditNodeDesc] = useState('');

  // Add Edge Form fields
  const [edgeSource, setEdgeSource] = useState('node-core');
  const [edgeTarget, setEdgeTarget] = useState('node-gw');
  const [edgeColor, setEdgeColor] = useState('#00F0FF');
  const [edgeAnimated, setEdgeAnimated] = useState(true);
  const [edgeWidth, setEdgeWidth] = useState(2);

  const closeAddNodeModal = useCallback(() => setShowAddNodeModal(false), []);
  const closeAddEdgeModal = useCallback(() => setShowAddEdgeModal(false), []);
  const closeEditNodeModal = useCallback(() => setShowEditNodeModal(false), []);
  const addNodeDialogRef = useRef<HTMLDivElement>(null);
  const addEdgeDialogRef = useRef<HTMLDivElement>(null);
  const editNodeDialogRef = useRef<HTMLDivElement>(null);
  useTrapFocus(showAddNodeModal, closeAddNodeModal, addNodeDialogRef);
  useTrapFocus(showAddEdgeModal, closeAddEdgeModal, addEdgeDialogRef);
  useTrapFocus(showEditNodeModal, closeEditNodeModal, editNodeDialogRef);

  // Connect edge by dragging handles on canvas
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        animated: true,
        style: { stroke: '#00F0FF', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#00F0FF' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle Submit New Node
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const newId = `node-${Date.now()}`;
    const iconMap: { [key: string]: string } = {
      '#CCFF00': 'shield',
      '#00F0FF': 'zap',
      '#FF3366': 'server',
      '#00FF66': 'database',
      '#C084FC': 'activity',
      '#FF9900': 'building',
    };

    // Calculate position
    const posX = 300 + Math.floor(Math.random() * 300);
    const posY = 100 + Math.floor(Math.random() * 200);

    const newNodeObj: Node = {
      id: newId,
      type: 'networkNode',
      position: { x: posX, y: posY },
      data: {
        label: newNodeName.toUpperCase(),
        iconName: iconMap[newNodeColor] || 'network',
        ip: newNodeIp,
        bgColor: '#0F1526',
        borderColor: newNodeColor,
      },
    };

    const newDetailObj: NodeDetail = {
      id: newId,
      label: newNodeName,
      type: newNodeType,
      throughput: newNodeThroughput,
      packetsPerSec: '2,500,000 pps',
      status: newNodeStatus,
      ip: newNodeIp,
      department: newNodeDept,
      description: newNodeDesc,
      color: newNodeColor,
    };

    setNodes((nds) => [...nds, newNodeObj]);
    setNodeDetails((prev) => ({ ...prev, [newId]: newDetailObj }));
    setSelectedNodeId(newId);
    setShowAddNodeModal(false);

    // Reset Form
    setNewNodeName('');
  };

  // Handle Submit New Link Line
  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (edgeSource === edgeTarget) {
      setEdgeFormError('Vui lòng chọn nút nguồn và nút đích khác nhau!');
      return;
    }
    setEdgeFormError(null);

    const newEdgeObj: Edge = {
      id: `e-${edgeSource}-${edgeTarget}-${Date.now()}`,
      source: edgeSource,
      target: edgeTarget,
      animated: edgeAnimated,
      style: { stroke: edgeColor, strokeWidth: Number(edgeWidth) },
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
    };

    setEdges((eds) => addEdge(newEdgeObj, eds));
    setShowAddEdgeModal(false);
  };

  // Trigger Node Delete Request
  const handleDeleteNode = useCallback((idToDelete: string) => {
    if (nodes.length <= 1) {
      setDeleteNotice('Sơ đồ hạ tầng mạng cần giữ lại ít nhất 1 nút mạng!');
      return;
    }
    setNodeToDelete(idToDelete);
  }, [nodes.length]);

  // Execute Node Delete Action
  const confirmDeleteNode = () => {
    if (!nodeToDelete) return;

    const idToRemove = nodeToDelete;

    setNodes((nds) => {
      const remaining = nds.filter((n) => n.id !== idToRemove);
      if (selectedNodeId === idToRemove && remaining.length > 0) {
        setSelectedNodeId(remaining[0].id);
      }
      return remaining;
    });

    setEdges((eds) => eds.filter((e) => e.source !== idToRemove && e.target !== idToRemove));

    setNodeDetails((prev) => {
      const copy = { ...prev };
      delete copy[idToRemove];
      return copy;
    });

    setNodeToDelete(null);
  };

  // Open Edit Node modal pre-filled with selected node details
  const handleOpenEditModal = () => {
    const current = nodeDetails[selectedNodeId] || {
      id: selectedNodeId,
      label: 'NÚT MẠNG TÙY CHỈNH',
      type: 'Thiết Bị Mạng Hạ Tầng',
      throughput: '1 Gbps',
      packetsPerSec: '1,000,000 pps',
      status: 'ONLINE',
      ip: '10.200.0.100',
      department: 'Trung Tâm CNTT',
      description: 'Nút mạng hoạt động bình thường.',
    };
    const currentNode = nodes.find((n) => n.id === current.id);
    setEditNodeName(current.label || '');
    setEditNodeType(current.type || '');
    setEditNodeIp(current.ip || '');
    setEditNodeDept(current.department || '');
    setEditNodeThroughput(current.throughput || '');
    setEditNodePackets(current.packetsPerSec || '1,000,000 pps');
    setEditNodeStatus(current.status || 'ONLINE');
    setEditNodeColor(current.color || nodeData(currentNode)?.borderColor || '#00F0FF');
    setEditNodeDesc(current.description || '');
    setShowEditNodeModal(true);
  };

  // Save changes to selected node
  const handleSaveEditNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNodeName.trim()) return;

    const iconMap: { [key: string]: string } = {
      '#CCFF00': 'shield',
      '#00F0FF': 'zap',
      '#FF3366': 'server',
      '#00FF66': 'database',
      '#C084FC': 'activity',
      '#FF9900': 'building',
    };

    const updatedDetail: NodeDetail = {
      ...(nodeDetails[selectedNodeId] || {}),
      id: selectedNodeId,
      label: editNodeName,
      type: editNodeType,
      ip: editNodeIp,
      department: editNodeDept,
      throughput: editNodeThroughput,
      packetsPerSec: editNodePackets,
      status: editNodeStatus,
      color: editNodeColor,
      description: editNodeDesc,
    };

    setNodeDetails((prev) => ({
      ...prev,
      [selectedNodeId]: updatedDetail,
    }));

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              label: editNodeName.toUpperCase(),
              ip: editNodeIp,
              borderColor: editNodeColor,
              iconName: iconMap[editNodeColor] || n.data.iconName || 'network',
            },
          };
        }
        return n;
      })
    );

    setShowEditNodeModal(false);
  };

  // Keyboard shortcut listener for [Delete] or [Backspace] key when a node is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a form input, textarea, or select field
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        handleDeleteNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, handleDeleteNode]);

  const selectedDetail = nodeDetails[selectedNodeId] || {
    id: selectedNodeId,
    label: 'NÚT MẠNG TÙY CHỈNH',
    type: 'Thiết Bị Mạng Hạ Tầng',
    throughput: '1 Gbps',
    packetsPerSec: '1,000,000 pps',
    status: 'ONLINE',
    ip: '10.200.0.100',
    department: 'Trung Tâm CNTT',
    description: 'Nút mạng hoạt động bình thường trong hạ tầng bệnh viện.',
  };

  return (
    <div className="w-full space-y-4">
      {/* Topology Header & Action Bar */}
      <div className={`p-4 rounded-2xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border shadow-xl transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-surface border-neon-cyan/30 text-white'
      }`}>
        <div>
          <h2 className={`font-display text-2xl tracking-wider uppercase flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Zap className={`w-6 h-6 ${isLight ? 'text-terracotta' : 'text-acid-lime'}`} />
            SƠ ĐỒ LUỒNG DỮ LIỆU & HẠ TẦNG MẠNG BỆNH VIỆN
          </h2>
          <p className={`font-mono text-xs ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
            BVĐK KHU VỰC MIỀN NÚI PHÍA BẮC QUẢNG NAM - Thiết kế & Kéo thả luồng kết nối tương tác
          </p>
        </div>

        {/* Toolbar Buttons: Add Node & Add Link Line */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowAddNodeModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 font-extrabold rounded-xl transition-all active:scale-95 ${
              isLight
                ? 'bg-terracotta hover:bg-[#c84c2b] text-white shadow-xs'
                : 'bg-acid-lime hover:bg-[#b3ff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]'
            }`}
          >
            <Plus className="w-4 h-4" />
            THÊM NÚT MẠNG
          </button>

          <button
            onClick={() => setShowAddEdgeModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl transition-all active:scale-95 border ${
              isLight
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-neon-cyan/50'
            }`}
          >
            <Link2 className="w-4 h-4" />
            VẼ LINE LIÊN KẾT
          </button>

          <div className={`hidden sm:flex items-center gap-3 ml-3 pl-3 border-l text-[11px] ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-white/20 text-white/70'
          }`}>
            <div className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-terracotta' : 'bg-acid-lime'}`} />
              <span>TỐI ƯU</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-blue-600' : 'bg-line-energy'}`} />
              <span>BÌNH THƯỜNG</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-500 font-bold">CẢNH BÁO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas + Detail Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[550px]">
        {/* Flow Canvas Container */}
        <div className={`lg:col-span-2 rounded-2xl overflow-hidden relative transition-all border ${
          isLight
            ? 'bg-[#F8FAFC] border-slate-200 shadow-sm'
            : 'bg-space-bg border-white/15 shadow-[0_0_30px_rgba(3,0,20,0.8)]'
        }`}>
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            style={{ background: isLight ? '#F8FAFC' : '#030014' }}
          >
            <Controls />
            <Background
              color={isLight ? '#94A3B8' : '#88AAFF'}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>

          {/* Interactive Instructions Overlay */}
          <div className={`absolute top-3 left-3 backdrop-blur-md p-2.5 rounded-xl border font-mono text-[11px] pointer-events-none space-y-0.5 ${
            isLight
              ? 'bg-white/90 border-slate-200 text-slate-700 shadow-md'
              : 'bg-panel/90 border-white/15 text-white/80'
          }`}>
            <div className={`flex items-center gap-1.5 font-bold ${
              isLight ? 'text-blue-700' : 'text-neon-cyan'
            }`}>
              <Network className="w-3.5 h-3.5" /> NỐT KÉO THẢ & VẼ LIÊN KẾT TƯƠNG TÁC
            </div>
            <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              • Kéo chấm tròn <span className={`font-bold ${isLight ? 'text-terracotta' : 'text-acid-lime'}`}>
                {isLight ? 'Cam/Xanh' : 'Vàng/Cyan'}
              </span> ở viền nút để nối đường truyền trực tiếp
            </div>
            <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              • Chọn nút & nhấn phím <span className="text-red-500 font-bold">[Delete]</span> hoặc <span className="text-red-500 font-bold">[Backspace]</span> để xóa nút
            </div>
          </div>
        </div>

        {/* Selected Node Telemetry Inspector Panel */}
        <div className={`rounded-2xl p-5 font-mono flex flex-col justify-between space-y-4 shadow-xl border overflow-y-auto transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-surface border-neon-cyan/30 text-white'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                isLight
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30'
              }`}>
                NÚT ĐANG KIỂM TRA
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedDetail.status === 'CRITICAL'
                      ? 'bg-red-500 text-white animate-pulse'
                      : selectedDetail.status === 'WARNING'
                      ? 'bg-amber-400/20 text-amber-700'
                      : isLight
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  ● {selectedDetail.status === 'CRITICAL' ? 'NGUY CẤP' : selectedDetail.status === 'WARNING' ? 'CẢNH BÁO' : 'BÌNH THƯỜNG'}
                </span>

                <button
                  onClick={handleOpenEditModal}
                  title="Chỉnh sửa thông số nút này"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'hover:bg-neon-cyan/20 text-neon-cyan hover:text-white border-neon-cyan/30'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteNode(selectedDetail.id)}
                  title="Xóa nút này khỏi sơ đồ (hoặc nhấn phím Delete)"
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isLight
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                      : 'hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/30'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className={`font-display text-2xl tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedDetail.label}</h3>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{selectedDetail.type}</p>

            <div className={`space-y-3 p-4 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0D1A] border-white/10'
            }`}>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-white/40'}>Địa chỉ IP:</span>
                <span className={`font-extrabold ${isLight ? 'text-blue-700' : 'text-neon-cyan'}`}>{selectedDetail.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-white/40'}>Khoa / Đơn vị:</span>
                <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{selectedDetail.department}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-white/40'}>Băng thông truyền:</span>
                <span className={`font-bold ${isLight ? 'text-terracotta' : 'text-acid-lime'}`}>{selectedDetail.throughput}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-white/40'}>Tốc độ gói tin:</span>
                <span className={isLight ? 'text-slate-700' : 'text-white/90'}>{selectedDetail.packetsPerSec}</span>
              </div>
            </div>

            <p className={`text-xs mt-4 leading-relaxed p-3 border rounded-xl font-sans ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-space-bg border-white/10 text-white/80'
            }`}>
              {selectedDetail.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={handleOpenEditModal}
                className={`py-2.5 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px] border ${
                  isLight
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                    : 'bg-neon-cyan/15 hover:bg-neon-cyan/25 border-neon-cyan/40 text-neon-cyan'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                SỬA THÔNG SỐ
              </button>

              <button
                onClick={() => handleDeleteNode(selectedDetail.id)}
                className={`py-2.5 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px] border ${
                  isLight
                    ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                    : 'bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400'
                }`}
                title="Hoặc bấm phím Delete trên bàn phím"
              >
                <Trash2 className="w-3.5 h-3.5" />
                XÓA NÚT <span className="text-[9px] opacity-70">(Delete)</span>
              </button>
            </div>
          </div>

          <div className={`pt-3 border-t text-[11px] text-center flex items-center justify-between ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-white/40'
          }`}>
            <span>TỔNG SỐ NÚT MẠNG: <b className={isLight ? 'text-terracotta' : 'text-acid-lime'}>{nodes.length}</b></span>
            <span>TỔNG SỐ LIÊN KẾT: <b className={isLight ? 'text-blue-600' : 'text-neon-cyan'}>{edges.length}</b></span>
          </div>
        </div>
      </div>

      {/* MODAL 1: THÊM NÚT MẠNG MỚI */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={addNodeDialogRef} role="dialog" aria-modal="true" aria-label="Thêm nút mạng mới vào sơ đồ" tabIndex={-1} className="bg-surface border border-acid-lime/40 w-full max-w-lg rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-acid-lime font-bold text-base uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-acid-lime" /> THÊM NÚT MẠNG MỚI VÀO SƠ ĐỒ
              </h3>
              <button
                onClick={() => setShowAddNodeModal(false)}
                aria-label="Đóng cửa sổ"
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-3">
              <div>
                <label className="text-white/70 block mb-1 font-bold">Tên Nút Mạng / Thiết Bị *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: ROUTER POE KHOA CẤP CỨU"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white font-bold outline-none focus:border-acid-lime rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Loại Thiết Bị *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Switch PoE Cisco 2960"
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Địa Chỉ IP *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 10.200.30.1"
                    value={newNodeIp}
                    onChange={(e) => setNewNodeIp(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-neon-cyan font-bold outline-none focus:border-acid-lime rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Khoa / Đơn Vị *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Khoa Cấp Cứu"
                    value={newNodeDept}
                    onChange={(e) => setNewNodeDept(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Băng Thông Thiết Kế *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 10 Gbps"
                    value={newNodeThroughput}
                    onChange={(e) => setNewNodeThroughput(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-acid-lime font-bold outline-none focus:border-acid-lime rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Màu Sắc Viền Neon Nhận Diện *</label>
                <div className="flex items-center gap-3">
                  {[
                    { color: '#CCFF00', label: 'Vàng Neon' },
                    { color: '#00F0FF', label: 'Xanh Cyan' },
                    { color: '#FF3366', label: 'Hồng Đỏ' },
                    { color: '#00FF66', label: 'Xanh Lá' },
                    { color: '#C084FC', label: 'Tím Neon' },
                    { color: '#FF9900', label: 'Cam' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.color}
                      onClick={() => setNewNodeColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newNodeColor === item.color ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-70'
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Mô Tả Chức Năng</label>
                <textarea
                  rows={2}
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-acid-lime rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-acid-lime hover:bg-[#b3ff00] text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                >
                  + XÁC NHẬN THÊM NÚT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VẼ LINE LIÊN KẾT GIỮA 2 NÚT */}
      {showAddEdgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={addEdgeDialogRef} role="dialog" aria-modal="true" aria-label="Vẽ đường truyền liên kết mới" tabIndex={-1} className="bg-surface border border-neon-cyan/40 w-full max-w-lg rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-neon-cyan font-bold text-base uppercase flex items-center gap-2">
                <Link2 className="w-5 h-5 text-neon-cyan" /> VẼ ĐƯỜNG TRUYỀN LIÊN KẾT MỚI
              </h3>
              <button
                onClick={() => setShowAddEdgeModal(false)}
                aria-label="Đóng cửa sổ"
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEdge} className="space-y-4">
              {edgeFormError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{edgeFormError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-bold">Từ Nút Nguồn (From) *</label>
                  <select
                    value={edgeSource}
                    onChange={(e) => setEdgeSource(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-neon-cyan font-bold outline-none focus:border-neon-cyan rounded-xl"
                  >
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {nodeData(node)?.label || node.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-bold">Đến Nút Đích (To) *</label>
                  <select
                    value={edgeTarget}
                    onChange={(e) => setEdgeTarget(e.target.value)}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-acid-lime font-bold outline-none focus:border-neon-cyan rounded-xl"
                  >
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {nodeData(node)?.label || node.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-bold">Màu Sắc Đường Truyền *</label>
                <div className="flex items-center gap-3">
                  {[
                    { color: '#00F0FF', label: 'Cyan Mạng Core' },
                    { color: '#CCFF00', label: 'Vàng Neon An Ninh' },
                    { color: '#FF3366', label: 'Đỏ PACS/AI' },
                    { color: '#00FF66', label: 'Xanh CSDL' },
                    { color: '#FFFFFF', label: 'Trắng BGD' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.color}
                      onClick={() => setEdgeColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        edgeColor === item.color ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-70'
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Hiệu Ứng Luồng Dữ Liệu</label>
                  <select
                    value={edgeAnimated ? 'animated' : 'solid'}
                    onChange={(e) => setEdgeAnimated(e.target.value === 'animated')}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  >
                    <option value="animated">✨ Hoạt ảnh chuyển động (Pulse)</option>
                    <option value="solid">➖ Đường cố định tĩnh</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Độ Dày Cáp Quang</label>
                  <select
                    value={edgeWidth}
                    onChange={(e) => setEdgeWidth(Number(e.target.value))}
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  >
                    <option value={1.5}>1.5px - Cáp phụ</option>
                    <option value={2.5}>2.5px - Chuẩn</option>
                    <option value={4}>4.0px - Trục quang chính</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#0A0D1A] rounded-xl border border-white/10 text-[11px] text-white/60">
                💡 <b className="text-neon-cyan">Mẹo hay:</b> Bạn cũng có thể kéo các điểm chấm ở góc các nốt trên màn hình để nối trực tiếp vô cùng nhanh chóng!
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddEdgeModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neon-cyan hover:bg-[#00c8ff] text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  + VẼ LIÊN KẾT MẠNG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHỈNH SỬA THÔNG TIN NÚT MẠNG ĐANG CÓ */}
      {showEditNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={editNodeDialogRef} role="dialog" aria-modal="true" aria-label="Chỉnh sửa thông tin nút mạng" tabIndex={-1} className="bg-surface border border-neon-cyan/40 w-full max-w-lg rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-neon-cyan font-bold text-base uppercase flex items-center gap-2">
                <Pencil className="w-5 h-5 text-neon-cyan" /> CHỈNH SỬA THÔNG TÍN NÚT MẠNG
              </h3>
              <button
                onClick={() => setShowEditNodeModal(false)}
                aria-label="Đóng cửa sổ"
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditNode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1 font-bold">Tên Nút Mạng *</label>
                  <input
                    type="text"
                    required
                    value={editNodeName}
                    onChange={(e) => setEditNodeName(e.target.value)}
                    placeholder="VD: SWITCH CORE 400G"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1 font-bold">Địa Chỉ IP *</label>
                  <input
                    type="text"
                    required
                    value={editNodeIp}
                    onChange={(e) => setEditNodeIp(e.target.value)}
                    placeholder="VD: 10.200.0.1"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl font-mono text-neon-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Loại Thiết Bị</label>
                  <input
                    type="text"
                    value={editNodeType}
                    onChange={(e) => setEditNodeType(e.target.value)}
                    placeholder="VD: Máy Chủ Lưu Trữ / Router"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Khoa / Đơn Vị Quản Lý</label>
                  <input
                    type="text"
                    value={editNodeDept}
                    onChange={(e) => setEditNodeDept(e.target.value)}
                    placeholder="VD: Trung Tâm CNTT"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Băng Thông Truyền</label>
                  <input
                    type="text"
                    value={editNodeThroughput}
                    onChange={(e) => setEditNodeThroughput(e.target.value)}
                    placeholder="VD: 10 Gbps / 40 Gbps"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl text-acid-lime"
                  />
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Tốc Độ Gói Tin (pps)</label>
                  <input
                    type="text"
                    value={editNodePackets}
                    onChange={(e) => setEditNodePackets(e.target.value)}
                    placeholder="VD: 5,000,000 pps"
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Trạng Thái Hoạt Động</label>
                  <select
                    value={editNodeStatus}
                    onChange={(e) =>
                      setEditNodeStatus(e.target.value as NodeDetail['status'])
                    }
                    className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl"
                  >
                    <option value="ONLINE">● ONLINE (Bình Thường)</option>
                    <option value="WARNING">▲ WARNING (Cảnh Báo)</option>
                    <option value="CRITICAL">✖ CRITICAL (Nguy Cấp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Màu Sắc Viền Neon & Icon</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { color: '#CCFF00', label: 'Tường Lửa / An Ninh (Shield)' },
                      { color: '#00F0FF', label: 'Switch Core (Zap)' },
                      { color: '#FF3366', label: 'Server PACS (Server)' },
                      { color: '#00FF66', label: 'CSDL HIS (Database)' },
                      { color: '#C084FC', label: 'Giám Sát (Activity)' },
                      { color: '#FF9900', label: 'Ban Giám Đốc (Building)' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.color}
                        onClick={() => setEditNodeColor(item.color)}
                        style={{ backgroundColor: item.color }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          editNodeColor === item.color ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-70'
                        }`}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Mô Tả Chi Tiết / Chức Năng</label>
                <textarea
                  rows={3}
                  value={editNodeDesc}
                  onChange={(e) => setEditNodeDesc(e.target.value)}
                  placeholder="Nhập ghi chú hoặc mô tả kỹ thuật..."
                  className="w-full bg-[#0A0D1A] border border-white/20 p-2.5 text-white outline-none focus:border-neon-cyan rounded-xl font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditNodeModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neon-cyan hover:bg-[#00c8ff] text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  LƯU THAY ĐỔI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: XÁC NHẬN XÓA NÚT MẠNG */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-red-400 font-bold text-base uppercase flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" /> XÁC NHẬN XÓA NÚT MẠNG
              </h3>
              <button
                onClick={() => setNodeToDelete(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-white/80">
              <p>Bạn có chắc chắn muốn xóa nút mạng này khỏi sơ đồ hạ tầng?</p>
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl space-y-1">
                <div className="font-bold text-white text-sm">
                  {nodeDetails[nodeToDelete]?.label || nodeData(nodes.find((n) => n.id === nodeToDelete))?.label || nodeToDelete}
                </div>
                <div className="text-red-300 font-mono text-[11px]">
                  IP: {nodeDetails[nodeToDelete]?.ip || nodeData(nodes.find((n) => n.id === nodeToDelete))?.ip || '10.200.x.x'}
                </div>
              </div>
              <p className="text-white/60 text-[11px]">
                Lưu ý: Tất cả đường truyền / liên kết nối tới nút này cũng sẽ tự động bị xóa gỡ bỏ khỏi sơ đồ.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setNodeToDelete(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl"
              >
                HỦY BỎ
              </button>
              <button
                type="button"
                onClick={confirmDeleteNode}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> XÓA NÚT MẠNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: THÔNG BÁO HỆ THỐNG */}
      {deleteNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-amber-500/50 w-full max-w-md rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-amber-400 font-bold text-base uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> THÔNG BÁO HỆ THỐNG
              </h3>
              <button
                onClick={() => setDeleteNotice(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/90 text-sm leading-relaxed">{deleteNotice}</p>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteNotice(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl"
              >
                ĐÃ HIỂU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


