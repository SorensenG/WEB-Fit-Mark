'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { normalizeExercise, normalizeWorkout } from '@/lib/api/normalizers'
import { Workout } from '@/types'

export function useWorkout(splitId: string, workoutId: string) {
  return useQuery<Workout & { splitId?: string }>({
    queryKey: ['workout', splitId, workoutId],
    queryFn: async () => {
      const data = await api.get<any>(endpoints.workoutById(splitId, workoutId))
      return normalizeWorkout(data)
    },
    enabled: !!splitId && !!workoutId,
  })
}

export function useUserWorkouts() {
  return useQuery<any[]>({
    queryKey: ['userWorkouts'],
    queryFn: async () => {
      // Returns { workouts: WorkoutResponse[], totalWorkouts: N }
      const data = await api.get<any>(endpoints.userWorkouts)
      const arr = Array.isArray(data) ? data : (data?.workouts ?? [])
      return arr.map(normalizeWorkout)
    },
  })
}

export function useCreateWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      title,
      notes,
    }: {
      splitId: string
      title: string
      notes?: string
    }) =>
      api.post<any>(endpoints.workouts(splitId), {
        title,
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['splits', vars.splitId] })
    },
  })
}

export function useUpdateWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      title,
      notes,
    }: {
      splitId: string
      workoutId: string
      title: string
      notes?: string
    }) =>
      api.put(endpoints.workoutById(splitId, workoutId), {
        title,
        ...(notes?.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['splits', vars.splitId] })
      qc.invalidateQueries({ queryKey: ['workout', vars.splitId, vars.workoutId] })
      qc.invalidateQueries({ queryKey: ['userWorkouts'] })
    },
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
    }: {
      splitId: string
      workoutId: string
    }) => api.delete(endpoints.workoutById(splitId, workoutId)),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['splits', vars.splitId] })
      qc.invalidateQueries({ queryKey: ['userWorkouts'] })
    },
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      name,
      sets,
      weight,
      lastTopSetReps,
    }: {
      splitId: string
      workoutId: string
      name: string
      sets?: number
      weight?: number
      lastTopSetReps?: number
    }) =>
      api.post(endpoints.exercises(splitId, workoutId), {
        name,
        sets: sets ?? 3,
        ...(weight != null ? { weight } : {}),
        ...(lastTopSetReps != null ? { lastTopSetReps } : {}),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.splitId, vars.workoutId] })
      qc.invalidateQueries({ queryKey: ['splits', vars.splitId] })
    },
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      exerciseId,
      name,
      sets,
      weight,
      lastTopSetReps,
    }: {
      splitId: string
      workoutId: string
      exerciseId: string
      name: string
      sets: number
      weight?: number
      lastTopSetReps?: number
    }) =>
      api.put(endpoints.exerciseById(splitId, workoutId, exerciseId), {
        name,
        sets,
        ...(weight != null ? { weight } : {}),
        ...(lastTopSetReps != null ? { lastTopSetReps } : {}),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.splitId, vars.workoutId] })
    },
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      exerciseId,
    }: {
      splitId: string
      workoutId: string
      exerciseId: string
    }) => api.delete(endpoints.exerciseById(splitId, workoutId, exerciseId)),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.splitId, vars.workoutId] })
    },
  })
}

export function useReorderExercises() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      exercises,
    }: {
      splitId: string
      workoutId: string
      exercises: { id?: string; exerciseId?: string }[]
    }) =>
      api.patch(endpoints.reorderExercises(splitId, workoutId), {
        exercises: exercises.map((exercise, position) => ({
          id: exercise.id ?? exercise.exerciseId,
          position,
        })),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.splitId, vars.workoutId] })
    },
  })
}

export function useExerciseLog(splitId: string, workoutId: string, exerciseId: string) {
  return useQuery<any[]>({
    queryKey: ['exerciseLog', splitId, workoutId, exerciseId],
    queryFn: async () => {
      const data = await api.get<any[]>(endpoints.exerciseLog(splitId, workoutId, exerciseId))
      return Array.isArray(data) ? data : []
    },
    enabled: !!splitId && !!workoutId && !!exerciseId,
  })
}

export { normalizeExercise }
