import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  preserveParams?: Record<string, string>;
  onHoverPage?: (_page: number) => void;
}

export default function PaginationControls({ page, totalPages, preserveParams, onHoverPage }: PaginationControlsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInputRef.current) {
      pageInputRef.current.value = String(page);
    }
  }, [page]);

  const baseParams = (() => {
    const params = new URLSearchParams();
    if (preserveParams) {
      Object.entries(preserveParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
    }
    return params;
  })();

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(baseParams);
    if (pageNum !== 1) params.set('page', String(pageNum));
    else params.delete('page');

    const queryStr = params.toString();
    return `${location.pathname}${queryStr ? `?${queryStr}` : ''}`;
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = pageInputRef.current?.value;
    if (e.key === 'Enter' && !isNaN(Number(value)) && Number(value) > 0) {
      navigate(buildPageUrl(Number(value)));
    }
  };

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1, 2];

    if (page > 3 && page < totalPages - 2) {
      pages.push('ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages - 1, totalPages);
    } else if (page <= 3) {
      pages.push(3, 4, 5, 'ellipsis', totalPages - 1, totalPages);
    } else if (page === totalPages - 2) {
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('ellipsis', totalPages - 2, totalPages - 1, totalPages);
    }

    return pages;
  })();

  return (
    <div className={`flex justify-center items-center ${totalPages <= 1 ? '' : 'mt-3 mb-3'}`}>
      {totalPages !== null && totalPages > 0 && (
        <>
          <div className="flex items-center gap-[1px]">
            {page <= 1 ? (
              <button
                disabled
className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 cursor-not-allowed text-sm text-white"
              >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Link
              to={buildPageUrl(page - 1)}
              onMouseEnter={() => onHoverPage && onHoverPage(page - 1)}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-dark-hover text-sm text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            {pageNumbers.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted">
                    ...
                  </span>
                );
              }
              return (
                <Link
                  key={`${p}-${idx}`}
                  to={buildPageUrl(p)}
                  onMouseEnter={() => onHoverPage && onHoverPage(p)}
                  className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm ${
                    p === page
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-border hover:bg-dark-hover text-white'
                  }`}
                >
                  {p}
                </Link>
              );
            })}
            {page >= totalPages ? (
              <button
                disabled
className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 cursor-not-allowed text-sm text-white"
              >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <Link
              to={buildPageUrl(page + 1)}
              onMouseEnter={() => onHoverPage && onHoverPage(page + 1)}
              className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-dark-hover text-sm text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <input
              ref={pageInputRef}
              className="w-14 ml-1 border border-border rounded-lg px-0 py-0 h-8 bg-dark-light text-white text-sm text-center placeholder-muted-dim"
              type="text"
              defaultValue={page}
              onKeyDown={handleSubmit}
              placeholder="Page"
              aria-label="Page number"
            />
          </div>
        </>
      )}
    </div>
  );
}
