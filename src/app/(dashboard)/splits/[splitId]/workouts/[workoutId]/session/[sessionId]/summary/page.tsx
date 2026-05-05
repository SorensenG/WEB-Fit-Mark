'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Dumbbell, Clock, Home } from 'lucide-react'
import { useSessionDetail } from '@/hooks/useSessions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const SET_TYPE_LABELS: Record<string, string> = {
  WORK: 'Trabalho',
  WARMUP: 'Aquecimento',
  DROP: 'Drop Set',
  FAILURE: 'Falha',
  BACKOFF: 'Backoff',
  AMRAP: 'AMRAP',
  REST_PAUSE: 'Rest Pause',
  SUPERSET: 'Superset',
  CUSTOM: 'Custom',
}

const SET_TYPE_COLORS: Record<string, string> = {
  WORK: '#7C5CFC',
  WARMUP: '#FF9F43',
  DROP: '#A855F7',
  FAILURE: '#EF4444',
  BACKOFF: '#14B8A6',
  AMRAP: '#F59E0B',
  REST_PAUSE: '#3B82F6',
  SUPERSET: '#EC4899',
  CUSTOM: '#9C27B0',
}

export default function SessionSummaryPage() {
  const { splitId, workoutId, sessionId } = useParams<{
    splitId: string
    workoutId: string
    sessionId: string
  }>()
  const router = useRouter()
  const { data: session } = useSessionDetail(sessionId)
  const [storedSummary, setStoredSummary] = useState<any>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`fitmark-summary-${sessionId}`)
    if (raw) setStoredSummary(JSON.parse(raw))
  }, [sessionId])

  const summary = storedSummary ?? session
  const title = summary?.workoutTitle ?? summary?.workoutName ?? 'Treino'
  const durationMinutes = summary?.durationMinutes ?? 0
  const totalVolumeKg = Number(summary?.totalVolumeKg ?? 0)
  const exercises = summary?.exercises ?? summary?.workoutExercises ?? []
  const startedAt = summary?.startedAt ?? summary?.workoutDate ?? ''

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 animate-bounce-once">
          <Trophy size={40} className="text-amber-500" />
        </div>
        <h1 className="font-rajdhani font-bold text-3xl text-light-onSurface dark:text-dark-onSurface">
          Parabéns!
        </h1>
        <p className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
          {title}
        </p>
        {startedAt && (
          <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
            {new Date(startedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="flex flex-col items-center py-4">
          <Dumbbell size={24} className="text-light-primary dark:text-dark-primary mb-2" />
          <p className="font-bold text-xl text-light-onSurface dark:text-dark-onSurface">
            {totalVolumeKg > 0 ? `${totalVolumeKg.toFixed(1)} kg` : '—'}
          </p>
          <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Volume total
          </p>
        </Card>
        <Card className="flex flex-col items-center py-4">
          <Clock size={24} className="text-light-secondary dark:text-dark-secondary mb-2" />
          <p className="font-bold text-xl text-light-onSurface dark:text-dark-onSurface">
            {durationMinutes > 0 ? `${durationMinutes} min` : '—'}
          </p>
          <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Duração
          </p>
        </Card>
      </div>

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-3 mb-8">
          {exercises.map((ex: any) => {
            const sets: any[] = ex.sets ?? []
            const hasSummaryStats = ex.totalSets != null || ex.totalReps != null || ex.totalVolume != null
            return (
              <Card key={ex.exerciseName ?? ex.name}>
                <p className="font-semibold text-sm text-light-onSurface dark:text-dark-onSurface mb-2">
                  {ex.exerciseName ?? ex.name ?? 'Exercício'}
                </p>
                {hasSummaryStats ? (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-light-primary dark:text-dark-primary">{ex.totalSets ?? 0}</p>
                      <p className="text-[10px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">Séries</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-light-primary dark:text-dark-primary">{ex.totalReps ?? 0}</p>
                      <p className="text-[10px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">Reps</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-light-primary dark:text-dark-primary">{Number(ex.topSetWeight ?? 0).toFixed(1)}kg</p>
                      <p className="text-[10px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">Top</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-light-primary dark:text-dark-primary">{Number(ex.totalVolume ?? 0).toFixed(0)}kg</p>
                      <p className="text-[10px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">Vol.</p>
                    </div>
                  </div>
                ) : sets.length > 0 && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                      <span>#</span>
                      <span>Tipo</span>
                      <span className="text-right">Peso</span>
                      <span className="text-right">Reps</span>
                    </div>
                    {sets.map((s: any, i: number) => {
                      const color = SET_TYPE_COLORS[s.setType] ?? '#7C5CFC'
                      return (
                        <div key={s.id ?? i} className="grid grid-cols-4 text-sm items-center">
                          <span className="text-light-onSurface dark:text-dark-onSurface font-medium">
                            {s.setNumber ?? i + 1}
                          </span>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded w-fit"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {SET_TYPE_LABELS[s.setType] ?? s.setType}
                          </span>
                          <span className="text-right text-light-onSurface dark:text-dark-onSurface">
                            {s.weight > 0 ? `${s.weight} kg` : '—'}
                          </span>
                          <span className="text-right font-semibold text-light-onSurface dark:text-dark-onSurface">
                            {s.reps}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Button fullWidth onClick={() => router.push('/')} className="gap-2">
        <Home size={18} />
        Ir para Início
      </Button>
    </div>
  )
}
