import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface NotificationBannerProps {
  message: string | null;
  onDismiss: () => void;
  theme?: 'dark' | 'light';
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, onDismiss, theme = 'dark' }) => {
  const isLight = theme === 'light';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ x: 100, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-16 sm:top-20 right-4 sm:right-6 z-[100] w-full max-w-sm sm:max-w-md pointer-events-auto"
        >
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border-2 backdrop-blur-2xl font-mono flex items-center justify-between gap-3 relative overflow-hidden transition-colors ${
              isLight
                ? 'bg-white/95 border-terracotta shadow-[0_10px_30px_rgba(224,93,56,0.25)] text-slate-900'
                : 'bg-[#0A0D1B]/95 border-acid-lime shadow-[0_10px_35px_rgba(204,255,0,0.3)] text-white'
            }`}
          >
            {/* Top Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                isLight
                  ? 'from-terracotta via-amber-400 to-terracotta'
                  : 'from-acid-lime via-line-energy to-acid-lime'
              }`}
            />

            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-[#FDF0EB] border-terracotta/40 text-terracotta'
                    : 'bg-acid-lime/15 border-acid-lime/40 text-acid-lime'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    isLight ? 'text-terracotta' : 'text-acid-lime'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>HỆ THỐNG PHIÊN XÁC THỰC</span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  {message}
                </span>
              </div>
            </div>

            <button
              onClick={onDismiss}
              aria-label="Đóng thông báo"
              className={`p-1.5 rounded-lg cursor-pointer transition-colors shrink-0 ${
                isLight
                  ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                  : 'hover:bg-white/10 text-white/60 hover:text-white'
              }`}
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

