export interface User {
  id: string
  username: string
  email: string
  profilePhotoUrl?: string
  createdAt?: string
}

export interface Split {
  splitId: string
  id?: string
  title: string
  name?: string
  workouts: Workout[]
}

export interface Workout {
  workoutId: string
  id?: string
  splitId?: string
  title: string
  notes?: string
  exercises: Exercise[]
}

export interface Exercise {
  id: string
  exerciseId?: string
  name: string
  exerciseName?: string
  sets?: number | SetLog[]
  plannedSets?: number
  weight?: number
  maxWeight?: number
  lastTopSetReps?: number
  orderIndex?: number
  position?: number
}

export interface SetLog {
  id?: string
  setLogId?: string
  setNumber: number
  setType: SetType
  weight: number
  reps: number
  restSeconds?: number
  customLabel?: string
  completed?: boolean
  isNewPr?: boolean
}

export type SetType =
  | 'WORK'
  | 'WARMUP'
  | 'DROP'
  | 'FAILURE'
  | 'BACKOFF'
  | 'AMRAP'
  | 'REST_PAUSE'
  | 'SUPERSET'
  | 'CUSTOM'

export interface WorkoutSession {
  id: string
  sessionId?: string
  workoutId: string
  workoutTitle?: string
  workoutName?: string
  workoutNotes?: string
  splitId: string
  workoutExercises?: Exercise[]
  startedAt: string
  workoutDate?: string
  durationMinutes?: number
  totalVolumeKg?: number
  status?: 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
  completed?: boolean
  exercises?: Exercise[]
  notes?: string
}

export interface SessionSummary {
  sessionId?: string
  workoutId?: string
  workoutTitle: string
  totalVolumeKg: number
  durationMinutes: number
  exercises: {
    name?: string
    exerciseName?: string
    totalSets?: number
    totalReps?: number
    totalVolume?: number
    topSetWeight?: number
    topSetReps?: number
    topSetVolume?: number
    sets?: SetLog[]
  }[]
  startedAt: string
  notes?: string
  completed?: boolean
}

export interface ActiveSession {
  sessionId: string
  splitId: string
  workoutId: string
  workoutTitle: string
  workoutExercises: Exercise[]
  startedAt: string
}
