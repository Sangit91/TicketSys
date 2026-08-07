import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Wifi,
  Zap,
  Lock,
  CheckCircle2,
  Pause,
  Play,
  FastForward,
  Radio,
  Server,
} from 'lucide-react';

interface TickerItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  statusColor: 'lime' | 'cyan' | 'rose' | 'amber';
}

interface FooterMarqueeProps {
  theme?: 'dark' | 'light';
}

export const FooterMarquee: React.FC<FooterMarqueeProps> = ({ theme = 'dark' }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const isLight = theme === 'light';

  const items: TickerItem[] = [
    {
      id: 'hosp',
      icon: <Server className="w-3.5 h-3.5 text-acid-lime" />,
      label: 'BVĐK MIỀN NÚI PHÍA BẮC QUẢNG NAM',
      value: 'TRUNG TÂM CNTT VẬN HÀNH 24/7',
      statusColor: 'lime',
    },
    {
      id: 'his',
      icon: <Activity className="w-3.5 h-3.5 text-line-energy" />,
      label: 'MẠNG NỘI BỘ HIS / PACS / LIS',
      value: '100% ONLINE',
      statusColor: 'cyan',
    },
    {
      id: 'bhyt',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-acid-lime" />,
      label: 'CỔNG BHYT & KẾT NỐI BẢO HIỂM',
      value: 'AN TOÀN MÃ HÓA SHA-256',
      statusColor: 'lime',
    },
    {
      id: 'ping',
      icon: <Wifi className="w-3.5 h-3.5 text-line-energy" />,
      label: 'ĐỘ TRỄ MẠNG (PING)',
      value: '12ms // LAPSERATE 0.00%',
      statusColor: 'cyan',
    },
    {
      id: 'sla',
      icon: <Zap className="w-3.5 h-3.5 text-acid-lime" />,
      label: 'SLA HẠ TẦNG CNTT',
      value: '99.99% UPTIME',
      statusColor: 'lime',
    },
    {
      id: 'ca',
      icon: <Lock className="w-3.5 h-3.5 text-line-energy" />,
      label: 'CHỮ KÝ SỐ DỰ KIỆN EMR',
      value: 'SMART-CA SẴN SÀNG',
      statusColor: 'cyan',
    },
    {
      id: 'p1',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-acid-lime" />,
      label: 'BÁO ĐỘNG SỰ CỐ P1',
      value: '0 CẢNH BÁO NGUY CẤP',
      statusColor: 'lime',
    },
  ];

  const getSpeedClass = () => {
    if (isPaused) return 'animate-marquee-paused';
    if (speed === 'fast') return 'animate-marquee-fast';
    if (speed === 'slow') return 'animate-marquee-slow';
    return 'animate-marquee-normal';
  };

  const renderBadgeList = (keyPrefix: string) => (
    <div className="flex items-center gap-6 px-4">
      {items.map((item) => {
        const isHovered = activeItem === item.id;
        return (
          <div
            key={`${keyPrefix}-${item.id}`}
            onMouseEnter={() => setActiveItem(item.id)}
            onMouseLeave={() => setActiveItem(null)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300 cursor-pointer ${
              isHovered
                ? isLight
                  ? 'bg-[#FDF0EB] border-terracotta shadow-sm scale-105'
                  : 'bg-acid-lime/20 border-acid-lime shadow-[0_0_15px_rgba(204,255,0,0.5)] scale-105'
                : isLight
                ? 'bg-white border-slate-200 hover:border-terracotta/60 shadow-2xs'
                : 'bg-[#1A1A1A]/90 border-white/15 hover:border-line-energy/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLight
                    ? item.statusColor === 'lime'
                      ? 'bg-terracotta'
                      : 'bg-blue-600'
                    : item.statusColor === 'lime'
                    ? 'bg-acid-lime'
                    : 'bg-line-energy'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLight
                    ? item.statusColor === 'lime'
                      ? 'bg-terracotta'
                      : 'bg-blue-600'
                    : item.statusColor === 'lime'
                    ? 'bg-acid-lime'
                    : 'bg-line-energy'
                }`}
              />
            </span>

            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
              className: `w-3.5 h-3.5 ${
                isLight
                  ? item.statusColor === 'lime'
                    ? 'text-terracotta'
                    : 'text-blue-600'
                  : item.statusColor === 'lime'
                  ? 'text-acid-lime'
                  : 'text-line-energy'
              }`,
            })}

            <span
              className={`font-mono text-xs font-bold tracking-wider uppercase whitespace-nowrap ${
                isLight ? 'text-slate-700' : 'text-white/90'
              }`}
            >
              {item.label}:
            </span>

            <span
              className={`font-mono text-xs font-extrabold tracking-widest uppercase whitespace-nowrap ${
                isLight
                  ? item.statusColor === 'lime'
                    ? 'text-terracotta'
                    : 'text-blue-600'
                  : item.statusColor === 'lime'
                  ? 'text-acid-lime'
                  : 'text-line-energy'
              }`}
            >
              {item.value}
            </span>

            <span className={`font-mono text-xs font-light ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
              //
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-30 overflow-hidden border-t backdrop-blur-md pointer-events-auto transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-lg text-slate-800'
          : 'bg-space-bg/95 border-white/15 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] text-white'
      }`}
    >
      {/* Animated Glowing Top Border Beam */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent animate-pulse ${
          isLight ? 'via-terracotta' : 'via-acid-lime'
        } to-transparent`}
      />

      {/* Left and Right Edge Fade Masks for Smooth Continuous Effect */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r z-10 pointer-events-none ${
          isLight ? 'from-white to-transparent' : 'from-space-bg to-transparent'
        }`}
      />
      <div
        className={`absolute top-0 bottom-0 right-0 w-24 md:w-48 bg-gradient-to-l z-10 pointer-events-none ${
          isLight ? 'from-white via-white/80 to-transparent' : 'from-space-bg via-space-bg/80 to-transparent'
        }`}
      />

      <div className="flex items-center justify-between py-2 px-2 md:px-4">
        {/* Ticker Container with Marquee */}
        <div className="relative flex-1 overflow-hidden">
          <div className={`animate-marquee whitespace-nowrap flex items-center ${getSpeedClass()}`}>
            {renderBadgeList('set1')}
            {renderBadgeList('set2')}
          </div>
        </div>

        {/* Interactive Controls Panel */}
        <div
          className={`relative z-20 flex items-center gap-1.5 md:gap-2 ml-2 pl-3 border-l shrink-0 font-mono text-xs ${
            isLight ? 'border-slate-200 bg-white' : 'border-white/20 bg-space-bg'
          }`}
        >
          {/* Status Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-700'
                : 'bg-white/5 border border-white/10 text-white/60'
            }`}
          >
            <Radio className={`w-3 h-3 animate-pulse ${isLight ? 'text-terracotta' : 'text-acid-lime'}`} />
            <span>TRỰC TUYẾN</span>
          </div>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(speed === 'normal' ? 'fast' : speed === 'fast' ? 'slow' : 'normal')}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-all cursor-pointer text-[11px] ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white/10 hover:bg-line-energy/20 hover:text-line-energy border-white/15 text-white/80'
            }`}
            title="Thay đổi tốc độ chạy chữ"
          >
            <FastForward className={`w-3 h-3 ${isLight ? 'text-terracotta' : 'text-line-energy'}`} />
            <span className="hidden sm:inline">
              {speed === 'normal' ? '1.0x' : speed === 'fast' ? '2.0x' : '0.5x'}
            </span>
          </button>

          {/* Pause / Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-bold transition-all cursor-pointer text-[11px] ${
              isPaused
                ? isLight
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-neon-red/20 border-neon-red text-neon-red shadow-[0_0_10px_rgba(255,51,102,0.4)]'
                : isLight
                ? 'bg-[#FDF0EB] border-terracotta/50 text-terracotta hover:bg-terracotta hover:text-white'
                : 'bg-acid-lime/15 border-acid-lime/50 text-acid-lime hover:bg-acid-lime/30'
            }`}
            title={isPaused ? 'Tiếp tục chạy' : 'Tạm dừng dòng chữ'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPaused ? 'TIẾP TỤC' : 'DỪNG'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
