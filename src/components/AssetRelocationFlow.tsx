import React, { useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InventoryItem, AssetHistoryEvent } from '../types';
import {
  MapPin,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Move,
} from 'lucide-react';

interface AssetRelocationFlowProps {
  item: InventoryItem;
}

export const AssetRelocationFlow: React.FC<AssetRelocationFlowProps> = ({ item }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Process history log or synthesize steps if history is minimal
  const { initialNodes, initialEdges, stepsList } = useMemo(() => {
    const rawEvents = item.historyLog || [];
    
    // Collect all relocation or stock events
    let movementEvents = rawEvents.filter(
      (e) => e.type === 'DI_DỜI' || e.type === 'NHẬP_XUẤT' || e.type === 'CHUYỂN_TRẠNG_THÁI'
    );

    // If no explicit events exist, synthesize a realistic history journey for demonstration
    if (movementEvents.length === 0) {
      movementEvents = [
        {
          id: 'INIT-STEP-1',
          timestamp: item.importDate || '2025-01-10 08:30',
          type: 'NHẬP_XUẤT',
          description: `Nhập kho tiếp nhận thiết bị từ ${item.supplierName || 'Nhà cung cấp y tế'}`,
          actor: 'Tổ Vật Tư & Kho CNTT',
          fromDepartment: 'Kho CNTT Bệnh Viện',
          toDepartment: 'Kho CNTT Bệnh Viện',
          fromLocation: 'Kho Dự Phòng CNTT Tầng 1',
          toLocation: 'Kho Dự Phòng CNTT Tầng 1',
          receivedBy: 'KS. Phạm Minh Nhật',
          decisionNumber: 'QĐ-NHAPKHO-01',
          transferReason: 'Khởi tạo mua sắm mới',
        },
        {
          id: 'INIT-STEP-2',
          timestamp: '2025-06-15 10:15',
          type: 'DI_DỜI',
          description: `Bàn giao cấp phát ban đầu cho ${item.department}`,
          actor: 'KS. Phạm Minh Nhật',
          fromDepartment: 'Kho CNTT Bệnh Viện',
          toDepartment: item.department,
          fromLocation: 'Kho Dự Phòng CNTT Tầng 1',
          toLocation: item.location,
          receivedBy: item.assignedTo,
          decisionNumber: 'QĐ-402/QĐ-BV',
          transferReason: 'Cấp phát sử dụng theo yêu cầu khoa phòng',
        },
      ];
    }

    // Build flow nodes
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];
    const stepsListWithMeta: {
      stepIndex: number;
      event: AssetHistoryEvent;
      isCurrent: boolean;
      departmentName: string;
      locationName: string;
    }[] = [];

    const totalSteps = movementEvents.length;

    movementEvents.forEach((evt, idx) => {
      const isLast = idx === totalSteps - 1;
      const nodeId = `reloc-node-${idx}`;
      
      const dept = isLast
        ? item.department
        : evt.toDepartment || evt.toLocation || item.department;
        
      const loc = isLast
        ? item.location
        : evt.toLocation || item.location;

      const stepNum = idx + 1;

      stepsListWithMeta.push({
        stepIndex: stepNum,
        event: evt,
        isCurrent: isLast,
        departmentName: dept,
        locationName: loc,
      });

      // Node styling & inner JSX
      const nodeX = idx * 340;
      const nodeY = idx % 2 === 0 ? 40 : 110; // Staggered layout for clean flow view

      generatedNodes.push({
        id: nodeId,
        position: { x: nodeX, y: nodeY },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
          boxShadow: 'none',
        },
        data: {
          label: (
            <div
              className={`p-3.5 rounded-2xl w-[290px] font-mono text-xs transition-all cursor-grab active:cursor-grabbing text-left shadow-2xl ${
                isLast
                  ? 'bg-surface border-2 border-acid-lime text-white shadow-[0_0_25px_rgba(204,255,0,0.3)]'
                  : 'bg-[#0F1120] border border-line-energy/40 text-white/90 hover:border-line-energy'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isLast
                      ? 'bg-acid-lime text-black font-extrabold animate-pulse'
                      : 'bg-line-energy/20 text-line-energy'
                  }`}
                >
                  {isLast ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping inline-block" />
                      📍 VỊ TRÍ HIỆN TẠI (BƯỚC {stepNum})
                    </>
                  ) : (
                    `BƯỚC ${stepNum}: ${evt.type}`
                  )}
                </span>
                <span className="text-[10px] text-white/50">{evt.timestamp.split(' ')[0]}</span>
              </div>

              {/* Department & Location Name */}
              <div className="space-y-1 my-2">
                <div className="text-acid-lime font-bold text-sm truncate flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-acid-lime shrink-0" />
                  <span className="truncate">{dept}</span>
                </div>
                <div className="text-white/80 text-[11px] truncate pl-5">
                  {loc}
                </div>
              </div>

              {/* Handler Transfer Details */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1 text-[10px]">
                <div className="flex items-center justify-between text-white/60">
                  <span>Bàn giao:</span>
                  <span className="text-white font-bold truncate max-w-[150px]">{evt.actor}</span>
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span>Tiếp nhận:</span>
                  <span className="text-line-energy font-bold truncate max-w-[150px]">
                    {evt.receivedBy || item.assignedTo}
                  </span>
                </div>
              </div>

              {/* Decision / Reason Note */}
              <div className="mt-2 text-[10px] text-white/50 italic truncate">
                {evt.decisionNumber ? `📄 ${evt.decisionNumber}: ` : ''}
                {evt.description || evt.transferReason || 'Điều chuyển vị trí'}
              </div>
            </div>
          ),
        },
      });

      // Add edge from previous step
      if (idx > 0) {
        const prevNodeId = `reloc-node-${idx - 1}`;
        generatedEdges.push({
          id: `edge-${idx - 1}-${idx}`,
          source: prevNodeId,
          target: nodeId,
          animated: true,
          style: {
            stroke: isLast ? '#CCFF00' : '#88AAFF',
            strokeWidth: 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isLast ? '#CCFF00' : '#88AAFF',
          },
        });
      }
    });

    return {
      initialNodes: generatedNodes,
      initialEdges: generatedEdges,
      stepsList: stepsListWithMeta,
    };
  }, [item]);

  // ReactFlow node and edge states to allow dragging
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state if initialNodes or item updates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Find currently selected step details
  const activeStep = useMemo(() => {
    if (selectedNodeId) {
      const stepIdx = parseInt(selectedNodeId.replace('reloc-node-', ''), 10);
      return stepsList[stepIdx] || stepsList[stepsList.length - 1];
    }
    return stepsList[stepsList.length - 1];
  }, [selectedNodeId, stepsList]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Node Flow Map Viewport */}
      <div className="relative w-full h-[320px] bg-space-bg rounded-2xl border border-acid-lime/40 overflow-hidden shadow-inner">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-panel/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-acid-lime" />
          <span className="text-white font-bold">SƠ ĐỒ LUÂN CHUYỂN THIẾT BỊ (NỐT KÉO THẢ TƯƠNG TÁC)</span>
          <span className="text-acid-lime font-bold bg-acid-lime/10 px-2 py-0.5 rounded-full border border-acid-lime/30 flex items-center gap-1">
            <Move className="w-3 h-3" />
            {stepsList.length} BƯỚC
          </span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ background: '#030014' }}
        >
          <Controls className="bg-surface border border-acid-lime/40 text-acid-lime rounded-xl" />
          <Background color="#CCFF00" opacity={0.1} variant={BackgroundVariant.Dots} />
        </ReactFlow>

        <div className="absolute bottom-2 right-3 z-10 text-[10px] text-white/60 bg-black/80 px-2.5 py-1 rounded-lg border border-white/10">
          💡 Bạn có thể <span className="text-acid-lime font-bold">kéo thả di chuyển nốt</span> và nhấp vào nốt để xem chi tiết
        </div>
      </div>

      {/* Selected Step Detail Inspector Panel */}
      {activeStep && (
        <div className="bg-surface border border-acid-lime/50 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-acid-lime animate-ping" />
              <h5 className="font-bold text-sm text-white uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-acid-lime" />
                CHI TIẾT BƯỚC {activeStep.stepIndex}: {activeStep.event.type}
              </h5>
            </div>
            <span className="text-white/50 text-[11px] font-bold">
              {activeStep.event.timestamp}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            {/* Location & Dept */}
            <div className="p-3 rounded-xl bg-[#1A1E36] border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Khoa Phòng & Vị Trí Lắp Đặt:</span>
              <div className="text-acid-lime font-bold text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{activeStep.departmentName}</span>
              </div>
              <div className="text-white/80 font-sans text-xs pt-1">{activeStep.locationName}</div>
            </div>

            {/* Handlers ("Qua tay những ai") */}
            <div className="p-3 rounded-xl bg-[#1A1E36] border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Cán Bộ Giao / Nhận ("Qua tay ai"):</span>
              <div className="text-white text-xs">
                <span className="text-white/60">Giao / Di chuyển:</span>{' '}
                <span className="text-acid-lime font-bold">{activeStep.event.actor}</span>
              </div>
              <div className="text-white text-xs">
                <span className="text-white/60">Tiếp nhận / Quản lý:</span>{' '}
                <span className="text-line-energy font-bold">
                  {activeStep.event.receivedBy || item.assignedTo}
                </span>
              </div>
            </div>

            {/* Legal / Decision Details */}
            <div className="p-3 rounded-xl bg-[#1A1E36] border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px] uppercase font-bold">Quyết Định / Lý Do Di Dời:</span>
              <div className="text-white font-bold text-xs">
                {activeStep.event.decisionNumber || 'Biên bản bàn giao nội bộ'}
              </div>
              <div className="text-white/70 font-sans text-xs italic">
                {activeStep.event.description || activeStep.event.transferReason || 'Luân chuyển hạ tầng y tế'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
