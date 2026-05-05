'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dumbbell, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Erro ao criar conta')
        return
      }
      // Auto login after register
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (loginRes.ok) {
        router.push('/')
        router.refresh()
      } else {
        router.push('/login')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-light-primary dark:bg-dark-primary flex items-center justify-center mb-4">
          <Dumbbell size={32} className="text-white" />
        </div>
        <h1 className="font-rajdhani font-bold text-4xl text-light-primary dark:text-dark-primary">
          FitMark
        </h1>
        <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">
          Crie sua conta
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <TextField
          label="Nome de usuário"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          prefixIcon={<User size={16} />}
          placeholder="seuusuario"
          required
          autoComplete="username"
        />

        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          prefixIcon={<Mail size={16} />}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />

        <TextField
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          prefixIcon={<Lock size={16} />}
          suffixIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="p-0.5"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth isLoading={loading}>
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="text-light-primary dark:text-dark-primary font-medium hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
