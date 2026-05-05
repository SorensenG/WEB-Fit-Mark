'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Layers } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useCreateSplit } from '@/hooks/useSplits'

export default function CreateSplitPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const createSplit = useCreateSplit()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    // SplitCreateResponse: {splitId, userId, title}
    const split = await createSplit.mutateAsync(title.trim())
    const newId = (split as any).splitId ?? (split as any).id
    router.push(`/splits/${newId}`)
  }

  return (
    <div className="fitmark-page max-w-lg">
      <div className="fitmark-header">
        <Link
          href="/"
          className="fitmark-back-button"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          Nova Divisão
        </h1>
      </div>

      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center">
          <Layers size={36} className="text-light-primary dark:text-dark-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Nome da divisão"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: PPL, Full Body, ABC..."
          required
          autoFocus
        />

        {createSplit.isError && (
          <p className="text-sm text-red-500">
            {(createSplit.error as Error)?.message ?? 'Erro ao criar divisão'}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          isLoading={createSplit.isPending}
          disabled={!title.trim()}
        >
          Criar divisão
        </Button>
      </form>
    </div>
  )
}
