'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlarmClock,
  ArrowLeft,
  Check,
  CheckCircle,
  History,
  Info,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  Trophy,
  X,
} from 'lucide-react'
import { useExerciseLog } from '@/hooks/useWorkouts'
import { useSessionDetail, useLogSet } from '@/hooks/useSessions'
import { SetType } from '@/types'

type TimerMode = 'stopwatch' | 'countdown'

const SET_TYPES: { value: SetType; label: string; color: string; countsForPr: boolean }[] = [
  { value: 'WORK', label: 'Work', color: '#7C5CFC', countsForPr: true },
  { value: 'WARMUP', label: 'Aquec.', color: '#FF9F43', countsForPr: false },
  { value: 'DROP', label: 'Drop', color: '#A855F7', countsForPr: false },
  { value: 'CUSTOM', label: 'Custom', color: '#9C27B0', countsForPr: false },
]

const COUNTDOWN_PRESETS = [30, 60, 120, 180]

function setTypeInfo(type?: string) {
  return SET_TYPES.find((item) => item.value === type) ?? SET_TYPES[0]
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`
}

function formatWeight(value: unknown, decimals = 1) {
  const numeric = Number(value ?? 0)
  if (!numeric) return '—'
  return `${numeric.toFixed(decimals)} kg`
}

function numericValue(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function ClockFace({
  seconds,
  progress,
}: {
  seconds: number
  progress: number
}) {
  const radius = 86
  const center = 90
  const handAngle = ((seconds % 60) / 60) * 360
  const ticks = Array.from({ length: 60 }, (_, index) => index)

  return (
    <div className="relative mx-auto h-[180px] w-[180px] rounded-full bg-light-surfaceVariant dark:bg-dark-surfaceVariant">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#7C5CFC ${Math.max(0, Math.min(1, progress)) * 360}deg, transparent 0deg)`,
          opacity: progress > 0 ? 0.35 : 0,
        }}
      />
      <div className="absolute inset-[4px] rounded-full bg-light-surfaceVariant dark:bg-dark-surfaceVariant" />
      <div className="absolute inset-0 rounded-full border-2 border-light-primary/25 dark:border-dark-primary/25" />
      {ticks.map((tick) => {
        const major = tick % 5 === 0
        return (
          <span
            key={tick}
            className={`absolute left-1/2 top-1/2 origin-[0_0] rounded-full bg-light-primary dark:bg-dark-primary ${
              major ? 'h-[10px] w-[2px] opacity-60' : 'h-[5px] w-px opacity-20'
            }`}
            style={{
              transform: `rotate(${tick * 6}deg) translateY(-${radius}px) translateX(-50%)`,
            }}
          />
        )
      })}
      <div
        className="absolute left-1/2 top-1/2 h-[58px] w-[3px] origin-bottom rounded-full bg-light-primary dark:bg-dark-primary"
        style={{
          transform: `translate(-50%, -100%) rotate(${handAngle}deg)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[16px] w-[3px] origin-top rounded-full bg-light-primary dark:bg-dark-primary"
        style={{
          transform: `translate(-50%, 0) rotate(${handAngle}deg)`,
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-light-primary dark:bg-dark-primary" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-light-surfaceVariant dark:bg-dark-surfaceVariant" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-rajdhani text-4xl font-bold text-light-onSurface dark:text-dark-onSurface">
          {formatTime(seconds)}
        </span>
      </div>
      <span className="sr-only">{center}</span>
    </div>
  )
}

function RestTimerWidget({
  onTimeStopped,
}: {
  onTimeStopped: (seconds: number) => void
}) {
  const [mode, setMode] = useState<TimerMode>('stopwatch')
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [countdownTarget, setCountdownTarget] = useState(60)
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('1')
  const [customSeconds, setCustomSeconds] = useState('0')
  const startedAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      const startedAt = startedAtRef.current ?? Date.now()
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)

      if (mode === 'countdown') {
        const remaining = Math.max(0, countdownTarget - elapsed)
        setSeconds(remaining)
        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          startedAtRef.current = null
          setIsRunning(false)
          onTimeStopped(countdownTarget)
        }
        return
      }

      setSeconds(elapsed)
    }, 250)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [countdownTarget, isRunning, mode, onTimeStopped])

  function start() {
    if (mode === 'countdown' && seconds === 0) {
      setSeconds(countdownTarget)
    }
    startedAtRef.current =
      mode === 'countdown'
        ? Date.now() - (countdownTarget - (seconds || countdownTarget)) * 1000
        : Date.now() - seconds * 1000
    setIsRunning(true)
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    startedAtRef.current = null
    setIsRunning(false)
    onTimeStopped(mode === 'stopwatch' ? seconds : countdownTarget - seconds)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    startedAtRef.current = null
    setIsRunning(false)
    setSeconds(mode === 'countdown' ? countdownTarget : 0)
  }

  function changeMode(nextMode: TimerMode) {
    if (isRunning) return
    setMode(nextMode)
    setSeconds(nextMode === 'countdown' ? countdownTarget : 0)
  }

  function selectPreset(preset: number) {
    if (isRunning) return
    setCountdownTarget(preset)
    setSeconds(preset)
  }

  function applyCustomTimer() {
    const total = Math.max(0, (parseInt(customMinutes, 10) || 0) * 60 + (parseInt(customSeconds, 10) || 0))
    if (total > 0) {
      setCountdownTarget(total)
      setSeconds(total)
    }
    setShowCustom(false)
  }

  const progress =
    mode === 'stopwatch'
      ? (seconds % 60) / 60
      : countdownTarget > 0
        ? (countdownTarget - seconds) / countdownTarget
        : 0

  return (
    <div className="space-y-5">
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-2 rounded-full border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg p-0.5">
        <button
          type="button"
          onClick={() => changeMode('stopwatch')}
          className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-colors ${
            mode === 'stopwatch'
              ? 'bg-light-secondary dark:bg-dark-secondary text-black'
              : 'text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant'
          }`}
        >
          {mode === 'stopwatch' && <Check size={17} />}
          <Timer size={17} />
          Cronômetro
        </button>
        <button
          type="button"
          onClick={() => changeMode('countdown')}
          className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-colors ${
            mode === 'countdown'
              ? 'bg-light-secondary dark:bg-dark-secondary text-black'
              : 'text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant'
          }`}
        >
          {mode === 'countdown' && <Check size={17} />}
          <AlarmClock size={17} />
          Timer
        </button>
      </div>

      <ClockFace seconds={seconds} progress={progress} />

      {mode === 'countdown' && !isRunning && (
        <div className="flex flex-wrap justify-center gap-2">
          {COUNTDOWN_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => selectPreset(preset)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                countdownTarget === preset
                  ? 'border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary'
                  : 'border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface'
              }`}
            >
              {preset < 60 ? `${preset}s` : `${preset / 60}min`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              !COUNTDOWN_PRESETS.includes(countdownTarget)
                ? 'border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary'
                : 'border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface'
            }`}
          >
            Personalizado
          </button>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={isRunning ? stop : start}
          className="inline-flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-full bg-light-primary dark:bg-dark-primary px-5 text-sm font-bold text-white"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Parar' : 'Iniciar'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 min-w-[148px] items-center justify-center gap-2 rounded-2xl border-2 border-light-primary dark:border-dark-primary px-5 text-sm font-bold text-light-primary dark:text-dark-primary"
        >
          <RotateCcw size={18} />
          Zerar
        </button>
      </div>

      {showCustom && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs rounded-2xl border border-light-outline dark:border-dark-outline bg-light-bg dark:bg-dark-bg p-4">
            <h3 className="mb-4 text-lg font-bold text-light-onSurface dark:text-dark-onSurface">
              Tempo personalizado
            </h3>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <input
                value={customMinutes}
                onChange={(event) => setCustomMinutes(event.target.value)}
                type="number"
                min="0"
                max="59"
                className="rounded-xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface px-3 py-3 text-center text-2xl font-bold text-light-onSurface dark:text-dark-onSurface outline-none"
              />
              <span className="text-2xl font-bold text-light-onSurface dark:text-dark-onSurface">:</span>
              <input
                value={customSeconds}
                onChange={(event) => setCustomSeconds(event.target.value)}
                type="number"
                min="0"
                max="59"
                step="5"
                className="rounded-xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface px-3 py-3 text-center text-2xl font-bold text-light-onSurface dark:text-dark-onSurface outline-none"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-light-onSurface dark:text-dark-onSurface"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyCustomTimer}
                className="rounded-xl bg-light-primary dark:bg-dark-primary px-4 py-2 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseHistoryModal({
  splitId,
  workoutId,
  exerciseId,
  exerciseName,
  onClose,
}: {
  splitId: string
  workoutId: string
  exerciseId: string
  exerciseName: string
  onClose: () => void
}) {
  const { data: logs, isLoading } = useExerciseLog(splitId, workoutId, exerciseId)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 lg:items-center lg:p-4">
      <div className="max-h-[82vh] w-full max-w-lg overflow-hidden rounded-t-3xl border border-light-outline bg-light-bg dark:border-dark-outline dark:bg-dark-bg lg:rounded-3xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-light-outline dark:bg-dark-outline" />
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-light-primary/10 dark:bg-dark-primary/10">
            <History size={20} className="text-light-primary dark:text-dark-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-light-onSurface dark:text-dark-onSurface">
              {exerciseName}
            </p>
            <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Histórico de séries
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-light-onSurfaceVariant hover:bg-light-surfaceVariant dark:text-dark-onSurfaceVariant dark:hover:bg-dark-surfaceVariant"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto border-t border-light-outline p-4 dark:border-dark-outline">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Carregando...
            </p>
          ) : !logs?.length ? (
            <p className="py-10 text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Nenhum histórico ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any, index) => {
                const info = setTypeInfo(log.setType)
                return (
                  <div
                    key={`${log.realizedAt ?? index}-${index}`}
                    className="rounded-2xl border border-light-outline bg-light-surface px-4 py-3 dark:border-dark-outline dark:bg-dark-surface"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-light-onSurface dark:text-dark-onSurface">
                          {log.customLabel || info.label} · {log.reps ?? 0} reps
                        </p>
                        <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                          {log.realizedAt ? new Date(log.realizedAt).toLocaleString('pt-BR') : ''}
                        </p>
                      </div>
                      <p className="font-bold" style={{ color: info.color }}>
                        {formatWeight(log.weight)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExerciseDetailPage() {
  const router = useRouter()
  const { splitId, workoutId, sessionId, exerciseId } = useParams<{
    splitId: string
    workoutId: string
    sessionId: string
    exerciseId: string
  }>()
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const logSet = useLogSet()
  const [storedSession, setStoredSession] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<SetType>('WORK')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [restSeconds, setRestSeconds] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(`fitmark-active-session-${sessionId}`)
    if (raw) setStoredSession(JSON.parse(raw))
  }, [sessionId])

  const activeExercises: any[] = storedSession?.workoutExercises ?? storedSession?.exercises ?? []
  const sessionExercises: any[] = session?.exercises ?? []
  const templateExercise = activeExercises.find(
    (ex: any) => String(ex.exerciseId ?? ex.id ?? '') === exerciseId,
  )
  const loggedExercise = sessionExercises.find(
    (ex: any) => String(ex.exerciseId ?? ex.id ?? '') === exerciseId,
  )
  const exercise = templateExercise ?? loggedExercise
  const loggedSets: any[] = Array.isArray(loggedExercise?.sets) ? loggedExercise.sets : []
  const nextSetNumber = loggedSets.length + 1
  const exerciseName = exercise?.exerciseName ?? exercise?.name ?? 'Exercício'
  const plannedSets =
    typeof templateExercise?.sets === 'number'
      ? templateExercise.sets
      : templateExercise?.plannedSets ?? exercise?.plannedSets ?? 0
  const maxWeight = Number(exercise?.weight ?? exercise?.maxWeight ?? 0)
  const lastTopSetReps = Number(exercise?.lastTopSetReps ?? 0)
  const selectedInfo = setTypeInfo(selectedType)
  const canSubmit = Number(reps) > 0 && !logSet.isPending

  const sortedSets = useMemo(
    () =>
      [...loggedSets].sort(
        (a, b) => Number(a.setNumber ?? 0) - Number(b.setNumber ?? 0),
      ),
    [loggedSets],
  )

  async function handleLogSet(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    await logSet.mutateAsync({
      splitId,
      workoutId,
      sessionId,
      setData: {
        exerciseId,
        setNumber: nextSetNumber,
        setType: selectedType,
        weight: numericValue(weight),
        reps: parseInt(reps, 10) || 0,
        restSeconds: restSeconds > 0 ? restSeconds : undefined,
        customLabel: selectedType === 'CUSTOM' ? customLabel.trim() : undefined,
      },
    })

    setWeight('')
    setReps('')
    setCustomLabel('')
    setRestSeconds(0)
    setShowCheck(true)
    window.setTimeout(() => setShowCheck(false), 1000)
  }

  return (
    <div className="flex h-full flex-col bg-light-bg text-light-onBg dark:bg-dark-bg dark:text-dark-onBg">
      <header className="fitmark-header">
        <button
          type="button"
          onClick={() => router.back()}
          className="fitmark-back-button"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="min-w-0 flex-1 truncate font-rajdhani text-xl font-bold text-light-onSurface dark:text-dark-onSurface sm:text-center sm:text-2xl">
          {exerciseName}
        </h1>
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="whitespace-nowrap rounded-xl px-2 py-2 text-sm font-bold text-light-primary transition-colors hover:bg-light-primaryContainer dark:text-dark-primary dark:hover:bg-dark-primaryContainer"
        >
          Ver Histórico
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 lg:pb-8">
        {maxWeight > 0 && (
          <div className="mb-8 mt-3 inline-flex min-w-[252px] flex-col rounded-xl border border-light-primary/40 bg-light-primary/10 px-4 py-3 text-light-primary dark:border-dark-primary/40 dark:bg-dark-primary/10 dark:text-dark-primary">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} />
              <span className="text-xs font-bold">PR</span>
            </div>
            <span className="mt-1 text-lg font-bold">
              {maxWeight.toFixed(1)} kg{lastTopSetReps > 0 ? ` × ${lastTopSetReps}` : ''}
            </span>
            <span className="text-sm font-semibold text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Seu último peso máximo
            </span>
          </div>
        )}

        {sortedSets.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 text-base font-bold text-light-onSurface dark:text-dark-onSurface">
              Total de séries
            </h2>
            <div className="grid grid-cols-[40px_1fr_80px_52px] px-2 text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              <span>#</span>
              <span>Tipo</span>
              <span className="text-right">Peso</span>
              <span className="text-right">Reps</span>
            </div>
            <div className="my-2 h-px bg-light-outline dark:bg-dark-outline" />
            <div className="space-y-1">
              {sortedSets.map((set: any, index) => {
                const info = setTypeInfo(set.setType)
                return (
                  <div
                    key={`${set.setNumber ?? index}-${index}`}
                    className="grid grid-cols-[40px_1fr_80px_52px] items-center py-1.5 text-sm"
                  >
                    <span className="text-center font-semibold text-light-onSurface dark:text-dark-onSurface">
                      {set.setNumber ?? index + 1}
                    </span>
                    <span
                      className="w-fit rounded px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: info.color }}
                    >
                      {set.customLabel || info.label}
                    </span>
                    <span className="text-right text-light-onSurface dark:text-dark-onSurface">
                      {formatWeight(set.weight)}
                    </span>
                    <span className="text-right font-semibold text-light-onSurface dark:text-dark-onSurface">
                      {set.reps ?? 0}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {showCheck && (
          <div className="mb-4 flex justify-center text-green-500">
            <CheckCircle size={48} />
          </div>
        )}

        <form
          onSubmit={handleLogSet}
          className="rounded-3xl border border-light-outline bg-light-surface p-4 dark:border-dark-outline dark:bg-dark-surface"
        >
          <h2 className="font-rajdhani text-2xl font-bold text-light-onSurface dark:text-dark-onSurface">
            Série {nextSetNumber}
            {plannedSets > 0 ? ` de ${plannedSets} planejadas` : ''}
          </h2>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {SET_TYPES.map((type) => {
              const selected = selectedType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`h-[54px] min-w-[85px] rounded-xl border px-4 text-base font-semibold transition-colors ${
                    selected
                      ? 'border-transparent text-white'
                      : 'border-light-outline bg-transparent text-light-onSurfaceVariant dark:border-dark-outline dark:text-dark-onSurfaceVariant'
                  }`}
                  style={selected ? { backgroundColor: type.color } : undefined}
                >
                  {type.label}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: selectedInfo.countsForPr ? selectedInfo.color : undefined }}>
            {selectedInfo.countsForPr ? <Trophy size={13} /> : <Info size={13} />}
            <span className={!selectedInfo.countsForPr ? 'text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant' : ''}>
              {selectedInfo.countsForPr ? 'Conta para PR' : 'Não conta para PR'}
            </span>
          </div>

          {selectedType === 'CUSTOM' && (
            <input
              value={customLabel}
              onChange={(event) => setCustomLabel(event.target.value)}
              placeholder="Nome do tipo (ex: Cluster, Giant set...)"
              className="mt-3 w-full rounded-xl border border-light-outline bg-light-surfaceVariant px-4 py-3 text-sm text-light-onSurface outline-none dark:border-dark-outline dark:bg-dark-surfaceVariant dark:text-dark-onSurface"
            />
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <input
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              placeholder="Peso (kg)"
              className="h-20 min-w-0 rounded-xl border-0 bg-light-surfaceVariant px-4 text-lg font-medium text-light-onSurface placeholder:text-light-onSurfaceVariant focus:outline-none focus:ring-2 focus:ring-light-primary dark:bg-dark-surfaceVariant dark:text-dark-onSurface dark:placeholder:text-dark-onSurfaceVariant"
            />
            <input
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Repetições"
              className="h-20 min-w-0 rounded-xl border-0 bg-light-surfaceVariant px-4 text-lg font-medium text-light-onSurface placeholder:text-light-onSurfaceVariant focus:outline-none focus:ring-2 focus:ring-light-primary dark:bg-dark-surfaceVariant dark:text-dark-onSurface dark:placeholder:text-dark-onSurfaceVariant"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 flex h-[74px] w-full items-center justify-center gap-3 rounded-2xl bg-light-primary text-base font-bold uppercase tracking-wide text-white transition-opacity disabled:opacity-50 dark:bg-dark-primary"
          >
            <Plus size={24} />
            {logSet.isPending ? 'Registrando...' : 'Registrar Série'}
          </button>
        </form>

        <section className="mt-6 rounded-3xl border border-light-outline bg-light-surface p-4 dark:border-dark-outline dark:bg-dark-surface">
          <h2 className="text-center font-rajdhani text-2xl font-bold text-light-onSurface dark:text-dark-onSurface">
            Cronômetro de Descanso
          </h2>
          <div className="mt-5">
            <RestTimerWidget onTimeStopped={setRestSeconds} />
          </div>
        </section>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-light-primary bg-light-surface text-base font-bold text-light-primary shadow-sm dark:border-dark-primary dark:bg-dark-surface dark:text-dark-primary"
        >
          <CheckCircle size={22} />
          Concluir
        </button>

        {isLoading && !exercise && (
          <p className="py-6 text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Carregando exercício...
          </p>
        )}
      </main>

      {showHistory && (
        <ExerciseHistoryModal
          splitId={splitId}
          workoutId={workoutId}
          exerciseId={exerciseId}
          exerciseName={exerciseName}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
