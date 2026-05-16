import { useQueryClient } from '@tanstack/react-query';
import X from 'lucide-react/dist/esm/icons/x.mjs';
import { useEffect, useState, useRef, startTransition } from 'react';
import { type LoaderFunctionArgs, useSearchParams, useLocation } from 'react-router-dom';
import type SimpleBarCore from 'simplebar-core';
import SimpleBar from 'simplebar-react';
import { getChaptersLibrary } from '../utils/archive-client';
import { useDebouncedSetter } from '../utils/debounceHelper';
import Footer from '../utils/Footer';
import Loading from '../utils/Loading';
import PaginationControls from '../utils/PaginationControls';
import { queryClient } from '../utils/queryClient';
import { useChapters, prefetchNextPageChapters } from '../utils/useChapters';
import { useMediaQuery } from '../utils/useMediaQuery';
import Chapter from './Chapter';

export const chaptersLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'recent';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 20;

  const apiSort = sort === 'recent' ? 'recent' : sort === 'chapter_name' ? 'chapter_name' : 'count';
  const queryKeyParams = {
    page,
    limit,
    ...(searchTerm.length > 0 ? { chapter_name: searchTerm } : {}),
    sort: apiSort,
    order: sort === 'chapter_name' ? 'asc' : 'desc',
  };

  await queryClient.ensureQueryData({
    queryKey: ['chapters', queryKeyParams],
    queryFn: ({ signal }: { signal: AbortSignal }) => getChaptersLibrary({ ...queryKeyParams, signal }),
    staleTime: 5 * 60 * 1000,
  });

  return null;
};

const SORTS = ['Recently Played', 'Most Played', 'Game Name'];

export default function ChaptersLibrary() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const location = useLocation();

  const scrollRef = useRef<SimpleBarCore | null>(null);

  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  const [inputSearch, setInputSearch] = useState(searchTerm);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const el = scrollRef.current?.getScrollElement();
    if (!el) return;

    const savedScroll = sessionStorage.getItem(`scroll-${location.key}`);

    if (savedScroll) {
      el.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
    } else {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let scrollTimeout: number;

    const handleScroll = () => {
      if (scrollTimeout) window.clearTimeout(scrollTimeout);

      scrollTimeout = window.setTimeout(() => {
        sessionStorage.setItem(`scroll-${location.key}`, el.scrollTop.toString());
      }, 150);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) window.clearTimeout(scrollTimeout);
    };
  }, [page, location.key]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);

          for (const [key, val] of Object.entries(updates)) {
            if (val) nextParams.set(key, val);
            else nextParams.delete(key);
          }
          return nextParams;
        },
        { replace: true }
      );
    });
  };

  const debouncedSetSearchTerm = useDebouncedSetter((val: string) => {
    updateUrlParams({ search: val, page: '1' });
  }, 500);

  const apiSort = sort === 'recent' ? 'recent' : sort === 'chapter_name' ? 'chapter_name' : 'count';
  const displaySort = sort === 'recent' ? 'Recently Played' : sort === 'chapter_name' ? 'Game Name' : 'Most Played';

  const queryKeyParams = {
    page,
    limit,
    ...(searchTerm.length > 0 ? { chapter_name: searchTerm } : {}),
    sort: apiSort,
    order: sort === 'chapter_name' ? 'asc' : 'desc',
  };

  const { data, isLoading, isFetching } = useChapters(queryKeyParams);
  const chapters = data?.data ?? null;
  const totalChapters = data?.meta?.total ?? null;
  const totalPages = Math.ceil((totalChapters || 0) / limit);
  const isBackgroundFetching = isFetching && !isLoading;

  const paginationParams = {
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(sort !== 'count' ? { sort } : {}),
  };

  useEffect(() => {
    if (totalPages !== null && page < totalPages) {
      prefetchNextPageChapters(queryClient, { ...queryKeyParams, page: page + 1 });
    }
  }, [page, totalPages, queryKeyParams, queryClient]);

  const changeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const apiValue = newSort === 'Recently Played' ? 'recent' : newSort === 'Game Name' ? 'chapter_name' : 'count';
    updateUrlParams({ sort: apiValue, page: '1' });
  };

  const handleClearSearch = () => {
    setInputSearch('');
    updateUrlParams({ search: null, page: '1' });
    if (nativeInputRef.current) nativeInputRef.current.value = '';
  };

  return (
    <SimpleBar ref={scrollRef} className="min-h-0 h-full">
      <div className="px-2 py-1">
        <div className="flex justify-center mt-2 flex-col items-center">
          {totalChapters !== null && (
            <h4 className="text-blue-500 text-3xl uppercase font-medium">{`${totalChapters} Games`}</h4>
          )}
        </div>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-center py-1 pb-2 gap-2">
            <div className="w-52 relative">
              <input
                ref={nativeInputRef}
                type="text"
                placeholder="Search by Game"
                onChange={(e) => {
                  setInputSearch(e.target.value);
                  debouncedSetSearchTerm(e.target.value);
                }}
                value={inputSearch}
                className="w-full bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 pr-8"
              />
              {inputSearch && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <select
              value={displaySort}
              onChange={changeSort}
              className="mt-1 sm:mt-0 bg-dark-light border border-gray-600 rounded px-3 py-1.5 text-sm w-max"
            >
              {SORTS.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
          {isLoading && <Loading />}

          {!isLoading && chapters && chapters.length === 0 && (
            <p className="mt-12 text-center text-gray-400 text-sm">No library games found matching your search text.</p>
          )}

          {chapters && chapters.length > 0 && (
            <div
              className={`mt-2 grid gap-1.5 transition-opacity duration-200 ${isBackgroundFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              style={{
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
              }}
            >
              {chapters.map((chapter, index) => (
                <Chapter key={chapter.game_id} chapter={chapter} priority={index < (isMobile ? 4 : 10)} />
              ))}
            </div>
          )}
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          preserveParams={paginationParams}
          onHoverPage={(targetPage) => prefetchNextPageChapters(queryClient, { ...queryKeyParams, page: targetPage })}
        />
      </div>
      <Footer />
    </SimpleBar>
  );
}
