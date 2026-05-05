'use client'

import { useQuery } from '@tanstack/react-query'
import { User } from '@/types'

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) throw new Error('Não autenticado')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
