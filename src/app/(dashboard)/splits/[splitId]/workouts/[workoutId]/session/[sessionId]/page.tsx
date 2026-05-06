'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Timer, CheckCircle, XCircle } from 'lucide-react'
import { useSessionDetail, useFinishSession, useAbandonSession } from '@/hooks/useSessions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer'
import { useEffect, useState } from 'react'

export default function ActiveSessionPage() {
  const { splitId, workoutId, sessionId } = useParams<{
    splitId: string
    workoutId: string
    sessionId: string
  }>()
  const router = useRouter()
  // SessionDetailsResponse: {sessionId, workoutId, workoutName, exercises: ExerciseWithSetsResponse[]}
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const finishSession = useFinishSession()
  const abandonSession = useAbandonSession()
  const [finishNotes, setFinishNotes] = useState('')
  const [showFinish, setShowFinish] = useState(false)
  const [storedSession, setStoredSession] = useState<any>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`fitmark-active-session-${sessionId}`)
    if (raw) setStoredSession(JSON.parse(raw))
  }, [sessionId])

  const storedExercises: any[] =
    storedSession?.workoutExercises ?? storedSession?.exercises ?? []
  const sessionExercises: any[] = session?.exercises ?? []
  const exercises: any[] = storedExercises.length
    ? storedExercises.map((templateExercise: any) => {
        const templateId = String(templateExercise.exerciseId ?? templateExercise.id ?? '')
        const loggedExercise = sessionExercises.find(
          (exercise: any) =>
            String(exercise.exerciseId ?? exercise.id ?? '') === templateId,
        )

        return {
          ...templateExercise,
          ...loggedExercise,
          sets: Array.isArray(loggedExercise?.sets)
            ? loggedExercise.sets
            : templateExercise.sets,
          plannedSets:
            templateExercise.plannedSets ??
            (typeof templateExercise.sets === 'number' ? templateExercise.sets : undefined) ??
            loggedExercise?.plannedSets,
        }
      })
    : sessionExercises
  const mergedSession = session ?? storedSession
  const startedAt = mergedSession?.startedAt ?? mergedSession?.workoutDate
  const elapsed = useWorkoutTimer(startedAt)

  function durationMinutes() {
    if (!startedAt) return 0
    const start = new Date(startedAt).getTime()
    if (!Number.isFinite(start)) return 0
    return Math.max(0, Math.floor((Date.now() - start) / 60000))
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault()
    const summary = await finishSession.mutateAsync({
      splitId,
      workoutId,
      sessionId,
      durationMinutes: durationMinutes(),
      notes: finishNotes,
    })
    sessionStorage.setItem(`fitmark-summary-${sessionId}`, JSON.stringify(summary))
    router.push(
      `/splits/${splitId}/workouts/${workoutId}/session/${sessionId}/summary`,
    )
  }

  async function handleAbandon() {
    if (!confirm('Abandonar sessão? Os dados serão perdidos.')) return
    await abandonSession.mutateAsync(sessionId)
    router.push(`/splits/${splitId}/workouts/${workoutId}`)
  }

  const title: string = mergedSession?.workoutName ?? mergedSession?.workoutTitle ?? 'Sessão'

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-rajdhani font-bold text-xl text-light-onSurface dark:text-dark-onSurface">
          {title}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-light-primary dark:text-dark-primary">
          <Timer size={16} />
          <span className="text-sm font-mono font-semibold">{elapsed}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          exercises.map((ex: any) => {
            // ExerciseWithSetsResponse uses exerciseId; ExerciseSessionResponse uses id
            const exId = String(ex.exerciseId ?? ex.id ?? '')
            const exName = ex.exerciseName ?? ex.name ?? ''
            const sets: any[] = Array.isArray(ex.sets) ? ex.sets : []
            const plannedSets = typeof ex.sets === 'number' ? ex.sets : ex.plannedSets ?? sets.length
            const loggedSets = sets.filter((s: any) => s.reps > 0)
            return (
              <Link
                key={exId}
                href={`/splits/${splitId}/workouts/${workoutId}/session/${sessionId}/exercise/${exId}`}
              >
                <Card clickable>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-light-onSurface dark:text-dark-onSurface">
                        {exName}
                      </p>
                      <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                        {loggedSets.length > 0
                          ? `${loggedSets.length}/${plannedSets || loggedSets.length} séries registradas`
                          : `0/${plannedSets || 0} séries registradas`}
                      </p>
                    </div>
                    {loggedSets.length > 0 && (
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    )}
                    <span className="fitmark-muted-action">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })
        )}

        {!isLoading && exercises.length === 0 && (
          <p className="text-center py-8 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Nenhum exercício nesta sessão.
          </p>
        )}
      </div>

      <div className="px-4 pb-6 pt-2 flex gap-3">
        <Button
          variant="destructive"
          onClick={handleAbandon}
          isLoading={abandonSession.isPending}
          className="flex-1"
        >
          <XCircle size={16} />
          Abandonar
        </Button>
        <Button
          onClick={() => setShowFinish(true)}
          isLoading={finishSession.isPending}
          className="flex-1"
        >
          <CheckCircle size={16} />
          Finalizar
        </Button>
      </div>

      {showFinish && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleFinish} className="w-full max-w-md rounded-2xl border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg p-4 space-y-4">
            <h2 className="font-rajdhani font-bold text-xl text-light-onSurface dark:text-dark-onSurface">
              Finalizar treino
            </h2>
            <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Duração: {durationMinutes()} min
            </p>
            <textarea
              value={finishNotes}
              onChange={(e) => setFinishNotes(e.target.value)}
              rows={3}
              placeholder="Notas do treino"
              className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFinish(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={finishSession.isPending}>
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
