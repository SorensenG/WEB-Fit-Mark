'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { normalizeSession } from '@/lib/api/normalizers'

// StartWorkOutSessionResponse: {sessionId, workoutId, workoutTitle, startedAt, completed, workoutExercises}
// ExerciseSessionResponse: {id, name, sets (count), lastTopSetReps, weight, position}
// SessionDetailsResponse: {sessionId, workoutId, workoutName, exercises: ExerciseWithSetsResponse[]}
// ExerciseWithSetsResponse: {exerciseId, exerciseName, sets: SetLogDetails[]}
// SetLogDetails: {setNumber, reps, weight, setType, restSeconds, customLabel}
// ActiveSessionResponse: {sessionId, workoutId, splitId, workoutTitle, startedAt}
// ListAllSessionsResponse: {id, workoutName, notas, status, durationMinutes, createdAt, workoutNotes}

export function useActiveSession() {
  return useQuery<any | null>({
    queryKey: ['activeSession'],
    queryFn: async () => {
      try {
        return normalizeSession(await api.get<any>(endpoints.activeSession))
      } catch {
        return null
      }
    },
    staleTime: 0,
  })
}

export function useUserSessions() {
  return useQuery<any[]>({
    queryKey: ['userSessions'],
    queryFn: async () => {
      const data = await api.get<any>(endpoints.userSessions)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useSessionDetail(sessionId: string) {
  return useQuery<any>({
    queryKey: ['session', sessionId],
    queryFn: async () => normalizeSession(await api.get<any>(endpoints.userSessionById(sessionId))),
    enabled: !!sessionId,
    staleTime: 0,
  })
}

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
    }: {
      splitId: string
      workoutId: string
    }) =>
      api.post<any>(endpoints.startSession(splitId, workoutId), {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activeSession'] }),
  })
}

export function useLogSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      sessionId,
      setData,
    }: {
      splitId: string
      workoutId: string
      sessionId: string
      setData: {
        exerciseId: string
        setNumber: number
        setType: string
        weight: number
        reps: number
        restSeconds?: number
        customLabel?: string
      }
    }) => api.post<any>(endpoints.logSet(splitId, workoutId, sessionId), setData),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['session', vars.sessionId] })
    },
  })
}

export function useUpdateSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      sessionId,
      setId,
      setData,
    }: {
      splitId: string
      workoutId: string
      sessionId: string
      setId: string
      setData: {
        weight?: number
        reps?: number
        setType?: string
        restSeconds?: number
        customLabel?: string
      }
    }) =>
      api.patch(
        endpoints.updateSet(splitId, workoutId, sessionId, setId),
        setData,
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['session', vars.sessionId] })
    },
  })
}

export function useFinishSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      splitId,
      workoutId,
      sessionId,
      durationMinutes,
      notes,
    }: {
      splitId: string
      workoutId: string
      sessionId: string
      durationMinutes: number
      notes?: string
    }) =>
      api.patch<any>(
        endpoints.finishSession(splitId, workoutId, sessionId),
        {
          durationMinutes,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['userSessions'] })
    },
  })
}

export function useAbandonSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => api.patch(endpoints.abandonSession(sessionId), {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
    },
  })
}
