import { useQuery } from '@tanstack/react-query'
import { messageService } from '@services/message.service'
import type { SearchMessagesResult } from '@services/message.service'

interface UseMessageSearchOptions {
  roomId: string
  query: string
  page?: number
  enabled?: boolean
}

export function useMessageSearch({
  roomId,
  query,
  page = 1,
  enabled = true,
}: UseMessageSearchOptions) {
  return useQuery<SearchMessagesResult>({
    queryKey: ['messages', 'search', roomId, query, page],
    queryFn: () => messageService.search({ roomId, q: query, page }),
    enabled: enabled && query.length >= 1,
    staleTime: 1000 * 30, // 30s — search results don't change often
  })
}
