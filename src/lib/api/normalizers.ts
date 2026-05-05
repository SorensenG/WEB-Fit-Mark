import { Exercise, SetLog, Split, Workout, WorkoutSession } from '@/types'

export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeSet(raw: any, index = 0): SetLog {
  return {
    id: raw?.id ? String(raw.id) : undefined,
    setLogId: raw?.setLogId ? String(raw.setLogId) : undefined,
    setNumber: toNumber(raw?.setNumber, index + 1),
    setType: raw?.setType ?? 'WORK',
    weight: toNumber(raw?.weight),
    reps: toNumber(raw?.reps),
    restSeconds: raw?.restSeconds == null ? undefined : toNumber(raw.restSeconds),
    customLabel: raw?.customLabel ?? undefined,
    completed: raw?.completed,
    isNewPr: raw?.isNewPr,
  }
}

export function normalizeExercise(raw: any): Exercise {
  const id = String(raw?.id ?? raw?.exerciseId ?? '')
  const rawSets = raw?.sets
  const normalizedSets = Array.isArray(rawSets)
    ? rawSets.map(normalizeSet)
    : undefined
  const plannedSets = Array.isArray(rawSets)
    ? rawSets.length
    : toNumber(rawSets, toNumber(raw?.plannedSets))

  return {
    id,
    exerciseId: String(raw?.exerciseId ?? raw?.id ?? ''),
    name: raw?.name ?? raw?.exerciseName ?? '',
    exerciseName: raw?.exerciseName ?? raw?.name ?? '',
    sets: normalizedSets ?? plannedSets,
    plannedSets,
    weight: raw?.weight == null ? undefined : toNumber(raw.weight),
    maxWeight: raw?.maxWeight == null ? undefined : toNumber(raw.maxWeight),
    lastTopSetReps: raw?.lastTopSetReps ?? raw?.lastTopReps,
    orderIndex: raw?.position ?? raw?.pos ?? raw?.orderIndex,
    position: raw?.position ?? raw?.pos ?? raw?.orderIndex,
  }
}

export function normalizeWorkout(raw: any): Workout {
  return {
    id: raw?.id ? String(raw.id) : undefined,
    workoutId: String(raw?.id ?? raw?.workoutId ?? ''),
    splitId: raw?.splitID || raw?.splitId ? String(raw.splitID ?? raw.splitId) : undefined,
    title: raw?.title ?? raw?.name ?? '',
    notes: raw?.notes ?? undefined,
    exercises: (raw?.exercises ?? raw?.workoutExercises ?? []).map(normalizeExercise),
  }
}

export function normalizeSplit(raw: any): Split {
  return {
    id: raw?.id ? String(raw.id) : undefined,
    splitId: String(raw?.id ?? raw?.splitId ?? ''),
    title: raw?.name ?? raw?.title ?? '',
    name: raw?.name ?? raw?.title ?? '',
    workouts: (raw?.workouts ?? []).map(normalizeWorkout),
  }
}

export function normalizeSession(raw: any): WorkoutSession {
  const sessionId = String(raw?.sessionId ?? raw?.id ?? '')
  const exercises = (raw?.exercises ?? []).map(normalizeExercise)
  const workoutExercises = (raw?.workoutExercises ?? raw?.exercises ?? []).map(normalizeExercise)

  return {
    id: sessionId,
    sessionId,
    splitId: raw?.splitId ? String(raw.splitId) : '',
    workoutId: raw?.workoutId ? String(raw.workoutId) : '',
    workoutTitle: raw?.workoutTitle ?? raw?.workoutName,
    workoutName: raw?.workoutName ?? raw?.workoutTitle,
    workoutNotes: raw?.workoutNotes,
    workoutExercises,
    exercises,
    startedAt: raw?.startedAt ?? raw?.workoutDate ?? '',
    workoutDate: raw?.workoutDate,
    durationMinutes: raw?.durationMinutes,
    totalVolumeKg: raw?.totalVolumeKg == null ? undefined : toNumber(raw.totalVolumeKg),
    completed: raw?.completed,
    notes: raw?.notes,
  }
}

