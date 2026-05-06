'use client'

import Link from 'next/link'
import { Dumbbell, ChevronRight, AlertTriangle } from 'lucide-react'
import { useUserWorkouts } from '@/hooks/useWorkouts'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { workoutTypeFromNotes } from '@/lib/workoutType'

export default function MeusTreinosPage() {
  const { data: workouts, isLoading, isError, refetch } = useUserWorkouts()

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-5 pb-3">
        <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          Meus Treinos
        </h1>
        <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
          Todos os treinos em todas as divisões
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <AlertTriangle size={40} className="text-red-400" />
            <button onClick={() => refetch()} className="text-sm text-light-primary dark:text-dark-primary hover:underline">
              Tentar novamente
            </button>
          </div>
        ) : workouts?.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Dumbbell size={48} className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
            <p className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-center">
              Nenhum treino ainda.{' '}
              <Link href="/" className="text-light-primary dark:text-dark-primary hover:underline">
                Crie uma divisão
              </Link>{' '}
              e adicione treinos.
            </p>
          </div>
        ) : (
          workouts?.map((workout: any) => {
            const wtype = workoutTypeFromNotes(workout.notes)
            const splitId = workout.splitId ?? ''
            const workoutId = workout.workoutId ?? workout.id ?? ''
            return (
              <Link key={workoutId} href={splitId ? `/splits/${splitId}/workouts/${workoutId}` : '#'}>
                <Card clickable>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${wtype?.color ?? '#7C5CFC'}22` }}
                    >
                      <Dumbbell size={18} style={{ color: wtype?.color ?? '#7C5CFC' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-light-onSurface dark:text-dark-onSurface">
                        {workout.title ?? workout.name}
                      </p>
                      {wtype && (
                        <p className="text-xs font-semibold" style={{ color: wtype.color }}>
                          {wtype.label}
                        </p>
                      )}
                      <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                        {workout.exercises?.length ?? 0} exercícios
                      </p>
                    </div>
                    <span className="fitmark-muted-action">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
