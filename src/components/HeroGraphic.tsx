import React from 'react';
import { motion } from 'motion/react';
import { Server, Wifi } from 'lucide-react';

interface HeroGraphicProps {
  theme?: 'dark' | 'light';
}

export const HeroGraphic: React.FC<HeroGraphicProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <div className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none z-0 overflow-hidden">
      {/* LEFT FLOATING TECH NODE: HIS CENTRAL SERVER (visible only on ultra-wide monitors >1720px) */}
      <motion.div
        className={`hidden min-[1720px]:flex flex-col gap-3 absolute left-4 xl:left-8 top-32 w-72 xl:w-80 p-4 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-[#0A0D1B]/80 border border-acid-lime/30 shadow-[0_0_30px_rgba(204,255,0,0.1)] text-white'
        }`}
        initial={{ x: -60, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 0.85,
          y: [-10, 10, -10],
        }}
        transition={{
          x: { duration: 0.8, ease: 'easeOut' },
          opacity: { duration: 0.8 },
          y: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isLight
                ? 'bg-[#FDF0EB] border-terracotta/40 text-terracotta'
                : 'bg-acid-lime/15 border-acid-lime/40 text-acid-lime'
            }`}>
              <Server className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <div className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                MÁY CHỦ TRUNG TÂM HIS
              </div>
              <div className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                isLight ? 'text-terracotta' : 'text-acid-lime'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  isLight ? 'bg-terracotta' : 'bg-acid-lime'
                }`} />
                <span>ONLINE • LATENCY 1.2ms</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-bold ${
            isLight
              ? 'bg-[#FDF0EB] text-terracotta border-terracotta/40'
              : 'bg-acid-lime/20 text-acid-lime border-acid-lime/40'
          }`}>
            NODE #01
          </span>
        </div>

        {/* SVG Mini Circuit Graphic */}
        <div className={`relative w-full h-24 rounded-xl border p-2 overflow-hidden flex items-center justify-center ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-space-bg/80 border-white/10'
        }`}>
          <svg viewBox="0 0 300 100" fill="none" className="w-full h-full opacity-90">
            {/* Grid & Traces */}
            <path
              d="M 10 50 L 80 50 L 110 20 L 190 20 L 220 50 L 290 50"
              stroke={isLight ? '#E05D38' : '#CCFF00'}
              strokeWidth="1.5"
              strokeDasharray="6 3"
            >
              <animate attributeName="stroke-dashoffset" values="0;36" dur="2s" repeatCount="indefinite" />
            </path>
            <path
              d="M 40 80 L 100 80 L 130 50 L 260 50"
              stroke={isLight ? '#2563EB' : '#88AAFF'}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={isLight ? '0.8' : '0.6'}
            />
            {/* Processor Core Box */}
            <rect
              x="110"
              y="30"
              width="80"
              height="40"
              rx="6"
              fill={isLight ? '#FFFFFF' : '#12162B'}
              stroke={isLight ? '#E05D38' : '#CCFF00'}
              strokeWidth="1.5"
            />
            <circle
              cx="150"
              cy="50"
              r="8"
              fill={isLight ? '#E05D38' : '#CCFF00'}
              className="animate-pulse"
            />
            <text
              x="150"
              y="86"
              fill={isLight ? '#C2410C' : '#CCFF00'}
              fontSize="8.5"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              HIS / SQL CLUSTER
            </text>
          </svg>
        </div>

        {/* Real-time Telemetry Stats */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className={`p-2 rounded-lg border text-left ${
            isLight
              ? 'bg-slate-100/80 border-slate-200'
              : 'bg-white/5 border-white/5'
          }`}>
            <span className={`block ${isLight ? 'text-slate-500' : 'text-white/50'}`}>TẢI CPU HIỆN TẠI</span>
            <span className={`font-bold text-xs ${isLight ? 'text-[#C2410C]' : 'text-acid-lime'}`}>
              14.2% (16 CORES)
            </span>
          </div>
          <div className={`p-2 rounded-lg border text-left ${
            isLight
              ? 'bg-slate-100/80 border-slate-200'
              : 'bg-white/5 border-white/5'
          }`}>
            <span className={`block ${isLight ? 'text-slate-500' : 'text-white/50'}`}>RAM SỬ DỤNG</span>
            <span className={`font-bold text-xs ${isLight ? 'text-blue-700' : 'text-line-energy'}`}>
              32.8 GB / 128 GB
            </span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT FLOATING TECH NODE: CORE SWITCH & SMARTCA SECURITY (visible only on ultra-wide monitors >1720px) */}
      <motion.div
        className={`hidden min-[1720px]:flex flex-col gap-3 absolute right-4 xl:right-8 top-32 w-72 xl:w-80 p-4 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.06)] text-slate-800'
            : 'bg-[#0A0D1B]/80 border border-line-energy/30 shadow-[0_0_30px_rgba(136,170,255,0.1)] text-white'
        }`}
        initial={{ x: 60, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 0.85,
          y: [10, -10, 10],
        }}
        transition={{
          x: { duration: 0.8, ease: 'easeOut' },
          opacity: { duration: 0.8 },
          y: {
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-between pb-2.5 border-b ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-line-energy/15 border-line-energy/40 text-line-energy'
            }`}>
              <Wifi className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <div className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                SWITCH CORE & SMARTCA
              </div>
              <div className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                isLight ? 'text-blue-600' : 'text-line-energy'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  isLight ? 'bg-blue-600' : 'bg-line-energy'
                }`} />
                <span>BĂNG THÔNG 10 Gbps</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-bold ${
            isLight
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-line-energy/20 text-line-energy border-line-energy/40'
          }`}>
            NODE #02
          </span>
        </div>

        {/* SVG Mini Network Node Graphic */}
        <div className={`relative w-full h-24 rounded-xl border p-2 overflow-hidden flex items-center justify-center ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-space-bg/80 border-white/10'
        }`}>
          <svg viewBox="0 0 300 100" fill="none" className="w-full h-full opacity-90">
            {/* Concentric Node Rings */}
            <circle
              cx="150"
              cy="50"
              r="38"
              stroke={isLight ? '#2563EB' : '#88AAFF'}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity={isLight ? '0.6' : '0.4'}
            />
            <circle
              cx="150"
              cy="50"
              r="22"
              stroke={isLight ? '#E05D38' : '#CCFF00'}
              strokeWidth="1.5"
              opacity={isLight ? '0.8' : '0.6'}
            />
            <circle
              cx="150"
              cy="50"
              r="8"
              fill={isLight ? '#2563EB' : '#88AAFF'}
              className="animate-pulse"
            />
            
            {/* Connecting lines */}
            <line
              x1="20"
              y1="50"
              x2="128"
              y2="50"
              stroke={isLight ? '#2563EB' : '#88AAFF'}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <line
              x1="172"
              y1="50"
              x2="280"
              y2="50"
              stroke={isLight ? '#2563EB' : '#88AAFF'}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text
              x="150"
              y="88"
              fill={isLight ? '#1E40AF' : '#88AAFF'}
              fontSize="8.5"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              XÁC THỰC SMARTCA ISO 27001
            </text>
          </svg>
        </div>

        {/* Real-time Telemetry Stats */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className={`p-2 rounded-lg border text-left ${
            isLight
              ? 'bg-slate-100/80 border-slate-200'
              : 'bg-white/5 border-white/5'
          }`}>
            <span className={`block ${isLight ? 'text-slate-500' : 'text-white/50'}`}>CHUẨN BẢO MẬT</span>
            <span className={`font-bold text-xs ${isLight ? 'text-[#C2410C]' : 'text-acid-lime'}`}>
              AES-256 E2E
            </span>
          </div>
          <div className={`p-2 rounded-lg border text-left ${
            isLight
              ? 'bg-slate-100/80 border-slate-200'
              : 'bg-white/5 border-white/5'
          }`}>
            <span className={`block ${isLight ? 'text-slate-500' : 'text-white/50'}`}>ACTIVE SESSIONS</span>
            <span className={`font-bold text-xs ${isLight ? 'text-blue-700' : 'text-line-energy'}`}>
              184 THIẾT BỊ
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


