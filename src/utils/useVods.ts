import { useQuery, QueryClient, keepPreviousData } from '@tanstack/react-query';
import { listVods, type VodData } from './archive-client';

interface ListVodsParams {
  limit?: number | string;
  page?: number | string;
  sort?: string;
  order?: string;
  platform?: string;
  from?: string;
  to?: string;
  uploaded?: string;
  game?: string;
  game_id?: string;
  title?: string;
  chapter?: string;
}

interface VodsResponse {
  data: VodData[];
  meta: { total: number };
}

export function useVods(params: ListVodsParams) {
  return useQuery<VodsResponse>({
    queryKey: ['vods', params],
    queryFn: ({ signal }) => listVods({ ...params, signal }),
    enabled: params.limit !== undefined && params.page !== undefined,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export const prefetchNextPageVods = (queryClient: QueryClient, params: ListVodsParams) => {
  queryClient.prefetchQuery({
    queryKey: ['vods', params],
    queryFn: ({ signal }) => listVods({ ...params, signal }),
    staleTime: 5 * 60 * 1000,
  });
};
