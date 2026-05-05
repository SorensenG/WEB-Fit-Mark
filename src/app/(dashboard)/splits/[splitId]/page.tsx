'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Plus, Dumbbell, ChevronRight,
  Trash2, AlertTriangle, Loader2,
} from 'lucide-react'
import { useSplit } from '@/hooks/useSplits'
import { useDeleteWorkout } from '@/hooks/useWorkouts'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { workoutTypeFromNotes } from '@/lib/workoutType'

export default function SplitDetailPage() {
  const { splitId } = useParams<{ splitId: string }>()
  const router = useRouter()
  const { data: split, isLoading, isError, refetch } = useSplit(splitId)
  const deleteWorkout = useDeleteWorkout()

  async function handleDeleteWorkout(workoutId: string) {
    if (!confirm('Excluir este treino?')) return
    await deleteWorkout.mutateAsync({ splitId, workoutId })
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-rajdhani font-bold text-xl flex-1 text-light-onSurface dark:text-dark-onSurface truncate">
          {isLoading ? '...' : (split?.title || 'Divisão')}
        </h1>
        <Link
          href={`/splits/${splitId}/workouts/create`}
          className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus size={20} className="text-white" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <AlertTriangle size={40} className="text-red-400" />
            <button
              onClick={() => refetch()}
              className="text-sm text-light-primary dark:text-dark-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : split?.workouts?.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center">
              <Dumbbell size={36} className="text-light-primary dark:text-dark-primary" />
            </div>
            <p className="text-center text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Nenhum treino ainda.{' '}
              <Link
                href={`/splits/${splitId}/workouts/create`}
                className="text-light-primary dark:text-dark-primary font-medium hover:underline"
              >
                Adicionar treino
              </Link>
            </p>
          </div>
        ) : (
          split?.workouts?.map((workout) => {
            const wtype = workoutTypeFromNotes(workout.notes)
            return (
              <Card key={workout.workoutId} className="group">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${wtype?.color ?? '#7C5CFC'}22` }}
                  >
                    <Dumbbell size={18} style={{ color: wtype?.color ?? '#7C5CFC' }} />
                  </div>
                  <Link
                    href={`/splits/${splitId}/workouts/${workout.workoutId}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-semibold text-light-onSurface dark:text-dark-onSurface">
                      {workout.title}
                    </p>
                    {wtype && (
                      <p className="text-xs font-semibold" style={{ color: wtype.color }}>
                        {wtype.label}
                      </p>
                    )}
                    {workout.exercises?.slice(0, 3).map((ex) => (
                      <p
                        key={ex.id ?? ex.exerciseId}
                        className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant"
                      >
                        • {ex.name ?? ex.exerciseName}
                      </p>
                    ))}
                    {(workout.exercises?.length ?? 0) > 3 && (
                      <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                        +{workout.exercises.length - 3} exercícios
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteWorkout(workout.workoutId)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                      {deleteWorkout.isPending ? (
                        <Loader2 size={14} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={14} className="text-red-500" />
                      )}
                    </button>
                    <Link href={`/splits/${splitId}/workouts/${workout.workoutId}`}>
                      <ChevronRight size={18} className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
