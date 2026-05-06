'use client'

import { useEffect, useState, type DragEvent } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  GripVertical,
  AlertTriangle,
  Loader2,
  Settings2,
  Trophy,
  History,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react'
import {
  useWorkout,
  useCreateExercise,
  useDeleteExercise,
  useExerciseLog,
  useReorderExercises,
  useUpdateExercise,
  useUpdateWorkout,
} from '@/hooks/useWorkouts'
import { useStartSession, useActiveSession, useAbandonSession } from '@/hooks/useSessions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { stripType, workoutTypeFromNotes, workoutTypes } from '@/lib/workoutType'
import { Exercise } from '@/types'

function encodeWorkoutType(typeKey: string, notes: string) {
  return `${typeKey ? `[type:${typeKey}]` : ''}${notes.trim()}`
}

function plannedSets(exercise: Exercise) {
  return typeof exercise.sets === 'number'
    ? exercise.sets
    : exercise.plannedSets ?? exercise.sets?.length ?? 0
}

function ExerciseHistoryModal({
  splitId,
  workoutId,
  exercise,
  onClose,
}: {
  splitId: string
  workoutId: string
  exercise: Exercise
  onClose: () => void
}) {
  const exerciseId = exercise.id || exercise.exerciseId || ''
  const { data: logs, isLoading } = useExerciseLog(splitId, workoutId, exerciseId)

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-t-2xl lg:rounded-2xl border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-light-outline dark:border-dark-outline">
          <History size={18} className="text-light-primary dark:text-dark-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-light-onSurface dark:text-dark-onSurface truncate">
              {exercise.name}
            </p>
            <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Histórico de séries
            </p>
          </div>
          <button onClick={onClose} className="fitmark-muted-action" aria-label="Fechar histórico">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2 max-h-[65vh]">
          {isLoading ? (
            <SkeletonCard />
          ) : !logs?.length ? (
            <p className="text-center py-10 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Nenhum histórico ainda.
            </p>
          ) : (
            logs.map((log: any, index) => (
              <Card key={`${log.realizedAt ?? index}-${index}`} className="py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-light-onSurface dark:text-dark-onSurface">
                      {log.setType ?? 'WORK'} · {log.reps ?? 0} reps
                    </p>
                    <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                      {log.realizedAt ? new Date(log.realizedAt).toLocaleString('pt-BR') : ''}
                    </p>
                  </div>
                  <p className="font-bold text-light-primary dark:text-dark-primary">
                    {Number(log.weight ?? 0) > 0 ? `${Number(log.weight).toFixed(1)} kg` : '-'}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkoutDetailPage() {
  const { splitId, workoutId } = useParams<{ splitId: string; workoutId: string }>()
  const router = useRouter()
  const { data: workout, isLoading, isError, refetch } = useWorkout(splitId, workoutId)
  const { data: activeSession, refetch: refetchActiveSession } = useActiveSession()
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise()
  const deleteExercise = useDeleteExercise()
  const updateWorkout = useUpdateWorkout()
  const reorderExercises = useReorderExercises()
  const startSession = useStartSession()
  const abandonSession = useAbandonSession()

  const [showAddExercise, setShowAddExercise] = useState(false)
  const [exerciseName, setExerciseName] = useState('')
  const [exerciseSets, setExerciseSets] = useState('3')
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [historyExercise, setHistoryExercise] = useState<Exercise | null>(null)
  const [showWorkoutSettings, setShowWorkoutSettings] = useState(false)
  const [workoutTitle, setWorkoutTitle] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [workoutType, setWorkoutType] = useState('')
  const [localExercises, setLocalExercises] = useState<Exercise[]>([])
  const [draggedExerciseId, setDraggedExerciseId] = useState<string | null>(null)
  const [dragOverExerciseId, setDragOverExerciseId] = useState<string | null>(null)

  useEffect(() => {
    setLocalExercises(workout?.exercises ?? [])
    setWorkoutTitle(workout?.title ?? '')
    setWorkoutNotes(stripType(workout?.notes))
    setWorkoutType(workoutTypeFromNotes(workout?.notes)?.key ?? '')
  }, [workout])

  const wtype = workoutTypeFromNotes(workout?.notes)
  const notes = stripType(workout?.notes)

  async function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault()
    if (!workoutTitle.trim()) return
    await updateWorkout.mutateAsync({
      splitId,
      workoutId,
      title: workoutTitle.trim(),
      notes: encodeWorkoutType(workoutType, workoutNotes),
    })
    setShowWorkoutSettings(false)
  }

  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault()
    if (!exerciseName.trim()) return
    await createExercise.mutateAsync({
      splitId,
      workoutId,
      name: exerciseName.trim(),
      sets: Math.max(1, parseInt(exerciseSets, 10) || 3),
    })
    setExerciseName('')
    setExerciseSets('3')
    setShowAddExercise(false)
  }

  async function handleUpdateExercise(e: React.FormEvent) {
    e.preventDefault()
    if (!editingExercise) return
    const form = new FormData(e.currentTarget as HTMLFormElement)
    const name = String(form.get('name') ?? '').trim()
    const sets = Math.max(1, Number(form.get('sets') ?? 3))
    const weightRaw = String(form.get('weight') ?? '').replace(',', '.')
    const repsRaw = String(form.get('lastTopSetReps') ?? '')
    if (!name) return
    await updateExercise.mutateAsync({
      splitId,
      workoutId,
      exerciseId: editingExercise.id || editingExercise.exerciseId || '',
      name,
      sets,
      weight: weightRaw ? Number(weightRaw) : undefined,
      lastTopSetReps: repsRaw ? Number(repsRaw) : undefined,
    })
    setEditingExercise(null)
  }

  function exerciseId(exercise: Exercise) {
    return exercise.id || exercise.exerciseId || ''
  }

  async function persistExerciseOrder(next: Exercise[]) {
    const previous = localExercises
    setLocalExercises(next)
    try {
      await reorderExercises.mutateAsync({ splitId, workoutId, exercises: next })
    } catch (error) {
      setLocalExercises(previous)
      throw error
    }
  }

  async function moveExercise(index: number, direction: -1 | 1) {
    if (reorderExercises.isPending) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= localExercises.length) return
    const next = [...localExercises]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    await persistExerciseOrder(next)
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, exercise: Exercise) {
    const id = exerciseId(exercise)
    if (!id || reorderExercises.isPending) {
      event.preventDefault()
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    setDraggedExerciseId(id)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, exercise: Exercise) {
    const id = exerciseId(exercise)
    if (!draggedExerciseId || draggedExerciseId === id || reorderExercises.isPending) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverExerciseId(id)
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedExerciseId
    setDraggedExerciseId(null)
    setDragOverExerciseId(null)
    if (!sourceId || reorderExercises.isPending) return

    const sourceIndex = localExercises.findIndex((exercise) => exerciseId(exercise) === sourceId)
    if (sourceIndex < 0 || sourceIndex === targetIndex) return

    const next = [...localExercises]
    const [item] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, item)
    await persistExerciseOrder(next)
  }

  function handleDragEnd() {
    setDraggedExerciseId(null)
    setDragOverExerciseId(null)
  }

  async function handleStartSession() {
    try {
      const session = await startSession.mutateAsync({ splitId, workoutId })
      const sessionId = String((session as any).sessionId ?? (session as any).id ?? '')
      sessionStorage.setItem(`fitmark-active-session-${sessionId}`, JSON.stringify({
        ...(session as any),
        splitId,
      }))
      router.push(`/splits/${splitId}/workouts/${workoutId}/session/${sessionId}`)
    } catch (error: any) {
      const status = error?.status
      if (status !== 409) throw error

      const { data } = await refetchActiveSession()
      const active = data ?? activeSession
      const sessionId = String((active as any)?.sessionId ?? '')
      const activeSplitId = String((active as any)?.splitId ?? splitId)
      const activeWorkoutId = String((active as any)?.workoutId ?? workoutId)
      if (!sessionId) return

      if (confirm('Já existe uma sessão ativa. Deseja continuar nela?')) {
        router.push(`/splits/${activeSplitId}/workouts/${activeWorkoutId}/session/${sessionId}`)
        return
      }

      if (confirm('Abandonar a sessão ativa e iniciar esta?')) {
        await abandonSession.mutateAsync(sessionId)
        const newSession = await startSession.mutateAsync({ splitId, workoutId })
        const newId = String((newSession as any).sessionId ?? (newSession as any).id ?? '')
        sessionStorage.setItem(`fitmark-active-session-${newId}`, JSON.stringify({
          ...(newSession as any),
          splitId,
        }))
        router.push(`/splits/${splitId}/workouts/${workoutId}/session/${newId}`)
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="fitmark-header">
        <Link href={`/splits/${splitId}`} className="fitmark-back-button" aria-label="Voltar">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-rajdhani font-bold text-xl text-light-onSurface dark:text-dark-onSurface truncate">
            {isLoading ? '...' : workout?.title}
          </h1>
          {wtype && <p className="text-xs font-semibold" style={{ color: wtype.color }}>{wtype.label}</p>}
        </div>
        {workout && (
          <button onClick={() => setShowWorkoutSettings(true)} className="fitmark-icon-button" aria-label="Configurações do treino">
            <Settings2 size={20} />
          </button>
        )}
      </header>

      {notes && <p className="px-4 pb-3 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">{notes}</p>}

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-24 lg:pb-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <AlertTriangle size={40} className="text-red-400" />
            <button onClick={() => refetch()} className="text-sm text-light-primary dark:text-dark-primary hover:underline">Tentar novamente</button>
          </div>
        ) : (
          <>
            {localExercises.length === 0 && !showAddExercise && (
              <p className="text-center py-12 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                Nenhum exercício. Adicione o primeiro.
              </p>
            )}

            {localExercises.map((ex, idx) => {
              const exId = exerciseId(ex)
              const prWeight = ex.weight ?? ex.maxWeight ?? 0
              const prReps = ex.lastTopSetReps ?? 0
              return (
                <Card
                  key={exId}
                  onDragOver={(event) => handleDragOver(event, ex)}
                  onDrop={(event) => handleDrop(event, idx)}
                  className={`group transition-all ${
                    draggedExerciseId === exId ? 'opacity-50 scale-[0.99]' : ''
                  } ${
                    dragOverExerciseId === exId
                      ? 'ring-2 ring-light-primary dark:ring-dark-primary bg-light-surfaceVariant dark:bg-dark-surfaceVariant'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      draggable={!!exId && !reorderExercises.isPending}
                      onDragStart={(event) => handleDragStart(event, ex)}
                      onDragEnd={handleDragEnd}
                      className="fitmark-muted-action -ml-1 cursor-grab active:cursor-grabbing touch-none"
                      title="Arrastar para reordenar"
                      aria-label="Arrastar exercício para reordenar"
                    >
                      <GripVertical size={16} />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-light-primary dark:text-dark-primary">{idx + 1}</span>
                    </div>
                    <button onClick={() => setHistoryExercise(ex)} className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-light-onSurface dark:text-dark-onSurface truncate">{ex.name}</p>
                      <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                        {plannedSets(ex)} séries planejadas
                      </p>
                    </button>
                    {prWeight > 0 && (
                      <div className="hidden sm:flex items-center gap-1 rounded-lg bg-light-primary/10 dark:bg-dark-primary/10 px-2 py-1 text-light-primary dark:text-dark-primary">
                        <Trophy size={12} />
                        <span className="text-xs font-bold">{Number(prWeight).toFixed(1)}kg{prReps ? ` x ${prReps}` : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0} className="fitmark-muted-action disabled:opacity-30" aria-label="Mover exercício para cima">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveExercise(idx, 1)} disabled={idx === localExercises.length - 1} className="fitmark-muted-action disabled:opacity-30" aria-label="Mover exercício para baixo">
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => setEditingExercise(ex)} className="fitmark-muted-action" aria-label="Editar exercício">
                        <Settings2 size={14} />
                      </button>
                      <button onClick={() => deleteExercise.mutate({ splitId, workoutId, exerciseId: exId })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}

            {showAddExercise ? (
              <form onSubmit={handleAddExercise} className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-[1fr_88px_auto_auto]">
                <input autoFocus value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} placeholder="Nome do exercício" className="min-w-0 px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-primary dark:border-dark-primary text-light-onSurface dark:text-dark-onSurface focus:outline-none" />
                <input value={exerciseSets} onChange={(e) => setExerciseSets(e.target.value)} type="number" min="1" className="px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-primary dark:border-dark-primary text-light-onSurface dark:text-dark-onSurface focus:outline-none" />
                <button type="submit" disabled={createExercise.isPending} className="px-4 py-2 rounded-xl bg-light-primary dark:bg-dark-primary text-white text-sm font-medium disabled:opacity-50">
                  {createExercise.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                </button>
                <button type="button" onClick={() => setShowAddExercise(false)} className="px-3 py-2 rounded-xl border border-light-outline dark:border-dark-outline text-sm">Cancelar</button>
              </form>
            ) : (
              <button onClick={() => setShowAddExercise(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-light-outline dark:border-dark-outline text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:border-light-primary dark:hover:border-dark-primary hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                <Plus size={16} />
                Adicionar exercício
              </button>
            )}
          </>
        )}
      </div>

      {!isLoading && !isError && localExercises.length > 0 && (
        <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 px-4 pb-3 pt-2 lg:static lg:pb-6">
          <Button fullWidth onClick={handleStartSession} isLoading={startSession.isPending || abandonSession.isPending} className="gap-2 h-14 text-base">
            <Play size={18} />
            Iniciar Sessão
          </Button>
        </div>
      )}

      {showWorkoutSettings && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveWorkout} className="w-full max-w-md rounded-2xl border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg p-4 space-y-4">
            <h2 className="font-rajdhani font-bold text-xl text-light-onSurface dark:text-dark-onSurface">Editar treino</h2>
            <input value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Nome do treino" />
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map((type) => (
                <button key={type.key} type="button" onClick={() => setWorkoutType(workoutType === type.key ? '' : type.key)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: workoutType === type.key ? type.color : undefined, backgroundColor: workoutType === type.key ? `${type.color}22` : undefined, color: workoutType === type.key ? type.color : undefined }}>
                  {type.label}
                </button>
              ))}
            </div>
            <textarea value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Observações" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowWorkoutSettings(false)}>Cancelar</Button>
              <Button type="submit" isLoading={updateWorkout.isPending}>Salvar</Button>
            </div>
          </form>
        </div>
      )}

      {editingExercise && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateExercise} className="w-full max-w-md rounded-2xl border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg p-4 space-y-4">
            <h2 className="font-rajdhani font-bold text-xl text-light-onSurface dark:text-dark-onSurface">Editar exercício</h2>
            <input name="name" defaultValue={editingExercise.name} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Nome" />
            <input name="sets" type="number" min="1" defaultValue={plannedSets(editingExercise) || 3} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Séries planejadas" />
            <div className="grid grid-cols-2 gap-2">
              <input name="weight" defaultValue={editingExercise.weight ?? editingExercise.maxWeight ?? ''} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Peso PR" />
              <input name="lastTopSetReps" type="number" min="0" defaultValue={editingExercise.lastTopSetReps ?? ''} className="w-full px-3 py-2 rounded-xl text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface" placeholder="Reps PR" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingExercise(null)}>Cancelar</Button>
              <Button type="submit" isLoading={updateExercise.isPending}>Salvar</Button>
            </div>
          </form>
        </div>
      )}

      {historyExercise && (
        <ExerciseHistoryModal splitId={splitId} workoutId={workoutId} exercise={historyExercise} onClose={() => setHistoryExercise(null)} />
      )}
    </div>
  )
}
