export interface WorkoutTypeInfo {
  key: string
  label: string
  color: string
}

const TYPES: WorkoutTypeInfo[] = [
  { key: 'PEITO', label: 'Peito', color: '#EF4444' },
  { key: 'COSTAS', label: 'Costas', color: '#3B82F6' },
  { key: 'PERNAS', label: 'Pernas', color: '#10B981' },
  { key: 'OMBRO', label: 'Ombro', color: '#F59E0B' },
  { key: 'BICEPS', label: 'Bíceps', color: '#8B5CF6' },
  { key: 'TRICEPS', label: 'Tríceps', color: '#EC4899' },
  { key: 'FULL_BODY', label: 'Full Body', color: '#7C5CFC' },
  { key: 'CARDIO', label: 'Cardio', color: '#06B6D4' },
  { key: 'HIIT', label: 'HIIT', color: '#F97316' },
  { key: 'PUSH', label: 'Push', color: '#EF4444' },
  { key: 'PULL', label: 'Pull', color: '#3B82F6' },
  { key: 'LEGS', label: 'Legs', color: '#10B981' },
]

const PREFIX = '[type:'
const SUFFIX = ']'

export function workoutTypeFromNotes(notes?: string | null): WorkoutTypeInfo | null {
  if (!notes) return null
  const start = notes.indexOf(PREFIX)
  if (start === -1) return null
  const end = notes.indexOf(SUFFIX, start)
  if (end === -1) return null
  const key = notes.slice(start + PREFIX.length, end).trim().toUpperCase()
  return TYPES.find((t) => t.key === key) ?? null
}

export function stripType(notes?: string | null): string {
  if (!notes) return ''
  return notes.replace(/\[type:[^\]]*\]/g, '').trim()
}

export { TYPES as workoutTypes }
