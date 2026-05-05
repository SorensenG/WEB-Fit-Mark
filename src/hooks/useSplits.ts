'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { normalizeSplit } from '@/lib/api/normalizers'
import { Split } from '@/types'

export function useSplits() {
  return useQuery<Split[]>({
    queryKey: ['splits'],
    queryFn: async () => {
      const data = await api.get<any[]>(endpoints.splits)
      const arr = Array.isArray(data) ? data : []
      return arr.map(normalizeSplit)
    },
  })
}

export function useSplit(splitId: string) {
  return useQuery<Split>({
    queryKey: ['splits', splitId],
    queryFn: async () => {
      const data = await api.get<any>(endpoints.splitById(splitId))
      return normalizeSplit(data)
    },
    enabled: !!splitId,
  })
}

export function useCreateSplit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => api.post<any>(endpoints.splits, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['splits'] }),
  })
}

export function useUpdateSplit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ splitId, title }: { splitId: string; title: string }) =>
      api.put(endpoints.splitById(splitId), { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['splits'] }),
  })
}

export function useDeleteSplit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (splitId: string) => api.delete(endpoints.splitById(splitId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['splits'] }),
  })
}
