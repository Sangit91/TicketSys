import { useEffect, useState } from 'react';

export function usePagedRows<T>(rows: T[], pageSize: number, resetKey: unknown[]) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetKey);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    setPage,
    totalPages,
    total: rows.length,
    start,
    rows: rows.slice(start, start + pageSize),
  };
}