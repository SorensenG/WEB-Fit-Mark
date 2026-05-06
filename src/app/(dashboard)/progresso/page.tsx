'use client'

import { useState } from 'react'
import { Calendar, Clock, Dumbbell, Flame, ChevronDown, ChevronUp, WifiOff } from 'lucide-react'
import { useUserSessions } from '@/hooks/useSessions'
import { api } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { workoutTypeFromNotes } from '@/lib/workoutType'

const SET_TYPE_COLORS: Record<string, string> = {
  WORK: '#7C5CFC', WARMUP: '#FF9F43', DROP: '#A855F7',
  FAILURE: '#EF4444', BACKOFF: '#14B8A6', AMRAP: '#F59E0B',
  REST_PAUSE: '#3B82F6', SUPERSET: '#EC4899', CUSTOM: '#9C27B0',
}
const SET_TYPE_LABELS: Record<string, string> = {
  WORK: 'Trabalho', WARMUP: 'Aquecimento', DROP: 'Drop Set',
  FAILURE: 'Falha', BACKOFF: 'Backoff', AMRAP: 'AMRAP',
  REST_PAUSE: 'Rest Pause', SUPERSET: 'Superset', CUSTOM: 'Custom',
}

function formatDateHeader(dateKey: string): string {
  const dt = new Date(dateKey + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const day = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  if (day.getTime() === today.getTime()) return 'Hoje'
  if (day.getTime() === yesterday.getTime()) return 'Ontem'
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function WeeklyCalendar({ trainedDates }: { trainedDates: Set<string> }) {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // Monday

  const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const todayStr = today.toISOString().slice(0, 10)
  const count = days.filter((d) => trainedDates.has(d.toISOString().slice(0, 10))).length

  return (
    <div className="rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surfaceVariant/50 dark:bg-dark-surfaceVariant/30 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-light-primary dark:text-dark-primary" />
          <span className="text-sm font-bold text-light-onSurface dark:text-dark-onSurface">
            Semana atual
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary">
          {count} {count === 1 ? 'treino' : 'treinos'}
        </span>
      </div>
      <div className="flex justify-around">
        {days.map((day, i) => {
          const dateStr = day.toISOString().slice(0, 10)
          const trained = trainedDates.has(dateStr)
          const isToday = dateStr === todayStr
          const isPast = day < today && !isToday
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                {dayLabels[i]}
              </span>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: trained
                    ? 'var(--tw-text-opacity, #7C5CFC)'
                    : isToday
                    ? '#7C5CFC22'
                    : 'transparent',
                  border: isToday && !trained ? '1.5px solid #7C5CFC' : undefined,
                  opacity: !trained && !isToday && !isPast ? 0.4 : 1,
                }}
                aria-hidden
              >
                {trained ? (
                  <span className="text-white text-xs font-bold">✓</span>
                ) : (
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isToday ? '#7C5CFC' : '#8888A0',
                    }}
                  >
                    {day.getDate()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionCard({ session }: { session: any }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const wtype = workoutTypeFromNotes(session.workoutNotes)
  const duration = session.durationMinutes ?? 0
  const typeColor = wtype?.color ?? '#7C5CFC'

  async function toggle() {
    setExpanded((v) => !v)
    if (!expanded && !detail) {
      setLoadingDetail(true)
      try {
        const d = await api.get(endpoints.userSessionById(session.id))
        setDetail(d)
      } catch {}
      setLoadingDetail(false)
    }
  }

  return (
    <div className="mx-0 mb-2">
      <Card clickable onClick={toggle} className="py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${typeColor}22` }}
          >
            <Dumbbell size={16} style={{ color: typeColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-light-onSurface dark:text-dark-onSurface">
              {session.workoutName}
            </p>
            {wtype && (
              <p className="text-xs font-semibold" style={{ color: typeColor }}>
                {wtype.label}
              </p>
            )}
          </div>
          {duration > 0 && (
            <div className="flex items-center gap-1 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              <Clock size={12} />
              <span className="text-xs">{duration}min</span>
            </div>
          )}
          <span className="fitmark-muted-action">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-light-outline dark:border-dark-outline">
            {loadingDetail ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-light-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detail == null ? (
              <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                Não foi possível carregar os detalhes.
              </p>
            ) : (
              (detail.exercises ?? []).map((ex: any) => (
                <div key={ex.exerciseName} className="mb-3 last:mb-0">
                  <p className="text-xs font-bold text-light-onSurface dark:text-dark-onSurface mb-1.5">
                    {ex.exerciseName}
                  </p>
                  <div className="grid grid-cols-4 text-[10px] text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">
                    <span>#</span><span>Tipo</span>
                    <span className="text-right">Peso</span>
                    <span className="text-right">Reps</span>
                  </div>
                  {(ex.sets ?? []).map((s: any, i: number) => {
                    const color = SET_TYPE_COLORS[s.setType] ?? '#7C5CFC'
                    return (
                      <div key={s.id ?? i} className="grid grid-cols-4 text-xs items-center py-0.5">
                        <span className="font-medium text-light-onSurface dark:text-dark-onSurface">
                          {s.setNumber ?? i + 1}
                        </span>
                        <span className="text-[10px] font-semibold px-1 py-0.5 rounded w-fit"
                          style={{ backgroundColor: `${color}22`, color }}>
                          {SET_TYPE_LABELS[s.setType] ?? s.setType}
                        </span>
                        <span className="text-right text-light-onSurface dark:text-dark-onSurface">
                          {s.weight > 0 ? `${s.weight}kg` : '—'}
                        </span>
                        <span className="text-right font-bold text-light-onSurface dark:text-dark-onSurface">
                          {s.reps}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default function ProgressoPage() {
  const { data: sessions, isLoading, isError, refetch } = useUserSessions()

  if (isLoading) return <LoadingSpinner className="mt-20" />

  if (isError) {
    return (
      <div className="flex flex-col items-center py-16 gap-4 px-4">
        <WifiOff size={40} className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
        <p className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
          Erro ao carregar histórico
        </p>
        <button onClick={() => refetch()} className="text-sm text-light-primary dark:text-dark-primary hover:underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!sessions?.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center">
          <Dumbbell size={36} className="text-light-primary dark:text-dark-primary" />
        </div>
        <h2 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          Nenhum treino concluído
        </h2>
        <p className="text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
          Seus treinos finalizados aparecerão aqui, agrupados por dia.
        </p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, any[]> = {}
  const trainedDates = new Set<string>()
  for (const s of sessions) {
    const raw = (s as any).createdAt ?? (s as any).startedAt ?? ''
    const dt = raw ? new Date(raw) : null
    if (!dt) continue
    const key = dt.toISOString().slice(0, 10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
    trainedDates.add(key)
  }
  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          Histórico de Treinos
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <WeeklyCalendar trainedDates={trainedDates} />

        {sortedKeys.map((dateKey) => (
          <div key={dateKey}>
            <div className="flex items-center gap-2 mb-2 mt-4">
              <Calendar size={13} className="text-light-primary dark:text-dark-primary" />
              <span className="text-xs font-bold text-light-primary dark:text-dark-primary uppercase tracking-wide">
                {formatDateHeader(dateKey)}
              </span>
            </div>
            {grouped[dateKey].map((session: any) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
