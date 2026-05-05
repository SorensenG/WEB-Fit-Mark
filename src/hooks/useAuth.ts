'use client'

import { useQuery } from '@tanstack/react-query'
import { User } from '@/types'
import { refreshSession } from '@/lib/api/client'

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      let res = await fetch('/api/auth/me', { credentials: 'include' })

      if (res.status === 401 || res.status === 403) {
        const refreshed = await refreshSession()
        if (refreshed) {
          res = await fetch('/api/auth/me', { credentials: 'include' })
        }
      }

      if (!res.ok) throw new Error('Não autenticado')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
