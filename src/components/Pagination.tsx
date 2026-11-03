'use client';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = getTotalPages(items.length, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    start,
    end: Math.min(start + pageSize, items.length),
    items: items.slice(start, start + pageSize),
  };
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  if (total <= pageSize) return null;

  const totalPages = getTotalPages(total, pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const pages: number[] = [];
  const windowSize = 5;
  let from = Math.max(1, safePage - Math.floor(windowSize / 2));
  let to = Math.min(totalPages, from + windowSize - 1);
  from = Math.max(1, to - windowSize + 1);
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {start}–{end} of {total}
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm ${p === safePage ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(p)}
            aria-current={p === safePage ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
