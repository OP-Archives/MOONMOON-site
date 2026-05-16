import { useQuery, QueryClient, keepPreviousData } from '@tanstack/react-query';
import { getChaptersLibrary, type LibraryChapterItem } from './archive-client';

interface LibraryParams {
  game_id?: string;
  game_name?: string;
  chapter_name?: string;
  sort?: string;
  order?: string;
  page?: number | string;
  limit?: number | string;
}

interface ChaptersResponse {
  data: LibraryChapterItem[];
  meta: { total: number };
}

export function useChapters(params: LibraryParams) {
  return useQuery<ChaptersResponse>({
    queryKey: ['chapters', params],
    queryFn: ({ signal }) => getChaptersLibrary({ ...params, signal }),
    enabled: params.limit !== undefined && params.page !== undefined,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export const prefetchNextPageChapters = (queryClient: QueryClient, params: LibraryParams) => {
  queryClient.prefetchQuery({
    queryKey: ['chapters', params],
    queryFn: ({ signal }) => getChaptersLibrary({ ...params, signal }),
    staleTime: 5 * 60 * 1000,
  });
};
