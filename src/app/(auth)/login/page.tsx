'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const googleError = searchParams.get('error')
    if (!googleError) return

    const messages: Record<string, string> = {
      google_cancelled: 'Login com Google cancelado.',
      google_token_failed: 'Não foi possível validar o login com Google.',
      google_userinfo_failed: 'Não foi possível buscar seus dados do Google.',
      fitmark_register_failed: 'Não foi possível criar sua conta FitMark com Google.',
      fitmark_auth_failed: 'Não foi possível entrar no FitMark com essa conta Google.',
    }

    setError(messages[googleError] ?? 'Erro ao entrar com Google.')
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Credenciais inválidas')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogle() {
    window.location.href = '/api/auth/google'
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
          Entre na sua conta
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          placeholder="Sua senha"
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-light-primary dark:text-dark-primary hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          Entrar
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-light-outline dark:border-dark-outline" />
          <span className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
            ou
          </span>
          <div className="flex-1 border-t border-light-outline dark:border-dark-outline" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-[#DADCE0] bg-white text-[#3C4043] text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <GoogleIcon />
          Entrar com Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
        Não tem conta?{' '}
        <Link
          href="/register"
          className="text-light-primary dark:text-dark-primary font-medium hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  )
}
