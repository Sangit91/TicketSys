import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}

function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('gap');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('gap');
  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, pageSize, onPage }) => {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const baseBtn =
    'min-w-[30px] h-8 px-2 rounded-md border border-white/15 bg-panel-deep text-white/70 hover:text-white hover:border-white/40 disabled:opacity-35 disabled:cursor-not-allowed transition-colors font-mono text-xs cursor-pointer flex items-center justify-center';
  const activeBtn = 'bg-acid-lime border-acid-lime text-black font-bold hover:text-black';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
      <span className="font-mono text-[11px] text-white/50">
        Hiển thị {start}–{end} / {total} bản ghi
      </span>
      <nav aria-label="Phân trang kết quả" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Trang trước"
          className={baseBtn}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageWindow(page, totalPages).map((p, idx) =>
          p === 'gap' ? (
            <span key={`gap-${idx}`} className="px-1 text-white/40 font-mono text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              disabled={p === page}
              aria-current={p === page ? 'page' : undefined}
              className={`${baseBtn} ${p === page ? activeBtn : ''}`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Trang sau"
          className={baseBtn}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};