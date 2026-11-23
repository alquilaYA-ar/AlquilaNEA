'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `/propiedades?${queryString}` : '/propiedades';
  };

  // Mostrar un rango acotado de páginas para no saturar la UI
  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Paginación de resultados" className="flex items-center justify-center gap-2 mt-8">
      <Link
        href={buildUrl(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border text-sm font-bold transition ${
          currentPage <= 1
            ? 'border-slate-200 text-slate-300 pointer-events-none'
            : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {visiblePages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="text-slate-400 px-1">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page as number)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition ${
              currentPage === page
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildUrl(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border text-sm font-bold transition ${
          currentPage >= totalPages
            ? 'border-slate-200 text-slate-300 pointer-events-none'
            : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
