'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Camera, Sun, Moon, LogOut, AlertTriangle } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Image from 'next/image'

export default function PerfilPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { data: user, isLoading, isError, refetch } = useMe()
  const { theme, toggle } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUri = reader.result as string
      await api.patch(endpoints.profilePhoto, { profilePhotoUrl: dataUri })
      qc.invalidateQueries({ queryKey: ['me'] })
    }
    reader.readAsDataURL(file)
  }

  async function handleLogout() {
    if (!confirm('Deseja sair da sua conta?')) return
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  if (isLoading) return <LoadingSpinner className="mt-20" />

  if (isError) {
    return (
      <div className="fitmark-page max-w-lg">
        <div className="rounded-2xl border border-light-outline bg-light-surface p-6 text-center dark:border-dark-outline dark:bg-dark-surface">
          <AlertTriangle size={36} className="mx-auto mb-3 text-light-primary dark:text-dark-primary" />
          <h1 className="font-rajdhani text-2xl font-bold text-light-onSurface dark:text-dark-onSurface">
            Não consegui carregar seu perfil
          </h1>
          <p className="mt-2 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            Sua sessão pode ter ficado parada por um tempo. Tente renovar os dados.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button onClick={() => refetch()}>
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              isLoading={loggingOut}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const photoUrl = user?.profilePhotoUrl
  const hasPhoto = !!photoUrl

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center overflow-hidden">
            {hasPhoto ? (
              <img
                src={photoUrl!}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-light-primary dark:text-dark-primary" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <h1 className="font-rajdhani font-bold text-2xl text-light-onSurface dark:text-dark-onSurface">
          {user?.username}
        </h1>
        <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
          {user?.email}
        </p>
        {user?.createdAt && (
          <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
            Membro desde: {formatDate(user.createdAt)}
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-2 mb-8">
        <div className="rounded-2xl border border-light-outline dark:border-dark-outline overflow-hidden">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-light-surfaceVariant dark:hover:bg-dark-primaryContainer/35 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-light-primary dark:text-dark-secondary" />
            ) : (
              <Moon size={20} className="text-light-primary dark:text-dark-secondary" />
            )}
            <span className="text-sm text-light-onSurface dark:text-dark-onSurface">
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </span>
            <div
              className={`ml-auto w-10 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-light-primary dark:bg-dark-primary' : 'bg-light-outline dark:bg-dark-outline'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                  theme === 'dark' ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="destructive"
        fullWidth
        onClick={handleLogout}
        isLoading={loggingOut}
        className="gap-2"
      >
        <LogOut size={16} />
        Sair da conta
      </Button>
    </div>
  )
}
