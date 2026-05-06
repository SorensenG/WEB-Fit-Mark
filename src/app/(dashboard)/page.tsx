'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Layers, ChevronRight, Play, AlertTriangle, Edit2, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useMe } from '@/hooks/useAuth'
import { useSplits, useDeleteSplit, useUpdateSplit } from '@/hooks/useSplits'
import { useActiveSession } from '@/hooks/useSessions'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { Split } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { data: user } = useMe()
  const { data: splits, isLoading, isError, refetch } = useSplits()
  const { data: activeSession } = useActiveSession()
  const deleteSplit = useDeleteSplit()
  const updateSplit = useUpdateSplit()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  function startEdit(split: Split) {
    setEditingId(split.splitId)
    setEditTitle(split.title)
  }

  async function saveEdit(splitId: string) {
    if (!editTitle.trim()) return
    await updateSplit.mutateAsync({ splitId, title: editTitle.trim() })
    setEditingId(null)
  }

  async function handleDelete(splitId: string) {
    if (!confirm('Excluir esta divisão?')) return
    await deleteSplit.mutateAsync(splitId)
  }

  async function handleForceLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const activeSessionIds = activeSession
    ? {
        splitId: (activeSession as any).splitId ?? '',
        workoutId: (activeSession as any).workoutId ?? '',
        sessionId: (activeSession as any).sessionId ?? (activeSession as any).id ?? '',
      }
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
            {user ? `Olá, ${user.username} 👋` : 'FitMark'}
          </h1>
          <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Suas divisões de treino
          </p>
        </div>
        <Link
          href="/splits/create"
          className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary flex items-center justify-center hover:opacity-90 transition-opacity lg:hidden"
        >
          <Plus size={20} className="text-white" />
        </Link>
      </header>

      {/* Active session banner */}
      {activeSessionIds && activeSessionIds.sessionId && (
        <div className="mx-4 mb-3">
          <Card
            clickable
            onClick={() =>
              router.push(
                `/splits/${activeSessionIds.splitId}/workouts/${activeSessionIds.workoutId}/session/${activeSessionIds.sessionId}`,
              )
            }
            className="bg-gradient-to-r from-light-primary/10 dark:from-dark-primary/10 to-transparent border-light-primary/30 dark:border-dark-primary/30"
          >
            <div className="flex items-center gap-3">
              <Play size={24} className="text-light-primary dark:text-dark-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-light-primary dark:text-dark-primary">
                  Sessão ativa
                </p>
                <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                  Toque para continuar o treino
                </p>
              </div>
              <ChevronRight size={18} className="text-light-primary dark:text-dark-primary" />
            </div>
          </Card>
        </div>
      )}

      {/* Splits list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <AlertTriangle size={40} className="text-red-400" />
            <p className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Erro ao carregar divisões
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => refetch()}
                className="rounded-xl bg-light-primary px-4 py-2 text-sm font-semibold text-white dark:bg-dark-primary"
              >
                Tentar novamente
              </button>
              <button
                onClick={handleForceLogout}
                className="rounded-xl border border-light-outline px-4 py-2 text-sm font-semibold text-light-onSurface dark:border-dark-outline dark:text-dark-onSurface"
              >
                Sair
              </button>
            </div>
          </div>
        ) : splits?.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 flex items-center justify-center">
              <Layers size={36} className="text-light-primary dark:text-dark-primary" />
            </div>
            <p className="text-center text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Nenhuma divisão ainda.{' '}
              <Link
                href="/splits/create"
                className="text-light-primary dark:text-dark-primary font-medium hover:underline"
              >
                Criar primeira divisão
              </Link>
            </p>
          </div>
        ) : (
          splits?.map((split) => (
            <Card key={split.splitId} className="group">
              {editingId === split.splitId ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(split.splitId)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant border border-light-primary dark:border-dark-primary text-light-onSurface dark:text-dark-onSurface focus:outline-none"
                  />
                  <button
                    onClick={() => saveEdit(split.splitId)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-light-primary dark:bg-dark-primary text-white font-medium"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-light-outline dark:border-dark-outline text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center flex-shrink-0">
                    <Layers size={20} className="text-light-primary dark:text-dark-primary" />
                  </div>
                  <Link
                    href={`/splits/${split.splitId}`}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-semibold text-light-onSurface dark:text-dark-onSurface truncate">
                      {split.title || '(sem título)'}
                    </p>
                    <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                      {split.workouts?.length ?? 0} treino
                      {split.workouts?.length !== 1 ? 's' : ''}
                    </p>
                  </Link>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(split)}
                      className="p-1.5 rounded-lg hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant"
                    >
                      <Edit2 size={14} className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
                    </button>
                    <button
                      onClick={() => handleDelete(split.splitId)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {deleteSplit.isPending ? (
                        <Loader2 size={14} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={14} className="text-red-500" />
                      )}
                    </button>
                  </div>
                  <Link href={`/splits/${split.splitId}`}>
                    <ChevronRight size={18} className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
                  </Link>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
