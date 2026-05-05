export const FITMARK_BASE_URL = 'https://api-fitmark.onrender.com'

export const endpoints = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',

  // Splits
  splits: '/splits',
  splitById: (id: string) => `/splits/${id}`,

  // Workouts
  workouts: (splitId: string) => `/splits/${splitId}/workouts`,
  workoutById: (splitId: string, workoutId: string) =>
    `/splits/${splitId}/workouts/${workoutId}`,

  // Exercises
  exercises: (splitId: string, workoutId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/exercises`,
  exerciseById: (splitId: string, workoutId: string, exerciseId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}`,
  reorderExercises: (splitId: string, workoutId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/exercises/reorder`,
  exerciseLog: (splitId: string, workoutId: string, exerciseId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/exercises/exerciselog/${exerciseId}`,

  // Sessions
  startSession: (splitId: string, workoutId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/workoutsession-start`,
  logSet: (splitId: string, workoutId: string, sessionId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/sessions/${sessionId}/sets`,
  finishSession: (splitId: string, workoutId: string, sessionId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/sessions/${sessionId}/finish`,
  updateSet: (splitId: string, workoutId: string, sessionId: string, setId: string) =>
    `/splits/${splitId}/workouts/${workoutId}/sessions/${sessionId}/sets/${setId}`,

  // Users
  userWorkouts: '/users/workouts',
  userSessions: '/users/sessions',
  activeSession: '/users/sessions/active',
  userSessionById: (id: string) => `/users/sessions/${id}`,
  abandonSession: (id: string) => `/users/sessions/${id}/abandon`,
  profilePhoto: '/users/profile-photo',
}
