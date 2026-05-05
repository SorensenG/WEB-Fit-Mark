'use client'

import { useEffect, useState } from 'react'

export function useWorkoutTimer(startedAt?: string): string {
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    if (!startedAt) return
    const start = new Date(startedAt).getTime()

    function tick() {
      const diff = Math.max(0, Date.now() - start)
      const s = Math.floor(diff / 1000)
      const mins = Math.floor(s / 60).toString().padStart(2, '0')
      const secs = (s % 60).toString().padStart(2, '0')
      setElapsed(`${mins}:${secs}`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return elapsed
}
