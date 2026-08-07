import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => (
  <div className="w-full space-y-6" role="status" aria-label="Đang tải dữ liệu">
    {/* KPI cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface/80 border border-white/10 p-4 rounded-xl shadow-lg"
        >
          <div className="h-3 w-24 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-9 w-14 bg-white/10 rounded animate-pulse" />
        </div>
      ))}
    </div>

    {/* Table / panel skeleton */}
    <div className="bg-panel/90 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-xl">
      <div className="flex items-center gap-3 pb-4">
        <div className="h-8 flex-1 bg-white/5 rounded animate-pulse" />
        <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
        <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 bg-white/5 rounded animate-pulse mb-2" />
      ))}
    </div>

    <span className="sr-only">Đang tải...</span>
  </div>
);