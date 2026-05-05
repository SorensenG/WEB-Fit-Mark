'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useCreateWorkout } from '@/hooks/useWorkouts'
import { workoutTypes } from '@/lib/workoutType'

export default function CreateWorkoutPage() {
  const { splitId } = useParams<{ splitId: string }>()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const createWorkout = useCreateWorkout()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const notes = selectedType ? `[type:${selectedType}]` : undefined
    // WorkoutResponse: {id, splitID, title, ...}
    const workout = await createWorkout.mutateAsync({ splitId, title: title.trim(), notes })
    const newId = (workout as any).id ?? (workout as any).workoutId
    router.push(`/splits/${splitId}/workouts/${newId}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/splits/${splitId}`}
          className="p-2 rounded-xl hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          Novo Treino
        </h1>
      </div>

      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center">
          <Dumbbell size={36} className="text-light-primary dark:text-dark-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Nome do treino"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Treino A, Peito e Tríceps..."
          required
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-light-onSurface dark:text-dark-onSurface mb-2">
            Tipo (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {workoutTypes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedType(selectedType === t.key ? '' : t.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  borderColor: selectedType === t.key ? t.color : undefined,
                  backgroundColor: selectedType === t.key ? `${t.color}22` : undefined,
                  color: selectedType === t.key ? t.color : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {createWorkout.isError && (
          <p className="text-sm text-red-500">
            {(createWorkout.error as Error)?.message ?? 'Erro ao criar treino'}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          isLoading={createWorkout.isPending}
          disabled={!title.trim()}
        >
          Criar treino
        </Button>
      </form>
    </div>
  )
}
