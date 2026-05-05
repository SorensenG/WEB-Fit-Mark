'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

type Step = 'email' | 'code'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.message || 'Erro ao enviar código')
        return
      }
      setStep('code')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.message || 'Código inválido ou expirado')
        return
      }
      setSuccess('Senha redefinida com sucesso!')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-light-primary dark:hover:text-dark-primary mb-8"
      >
        <ArrowLeft size={16} />
        Voltar ao login
      </Link>

      <h1 className="font-rajdhani font-bold text-3xl text-light-onSurface dark:text-dark-onSurface mb-2">
        {step === 'email' ? 'Recuperar senha' : 'Redefinir senha'}
      </h1>
      <p className="text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-8">
        {step === 'email'
          ? 'Informe seu e-mail para receber o código de recuperação.'
          : `Código enviado para ${email}. Informe o código e a nova senha.`}
      </p>

      {success ? (
        <div className="text-center space-y-4">
          <p className="text-green-600 dark:text-green-400 font-medium">
            {success}
          </p>
          <Link
            href="/login"
            className="text-light-primary dark:text-dark-primary text-sm font-medium hover:underline"
          >
            Ir para o login →
          </Link>
        </div>
      ) : step === 'email' ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<Mail size={16} />}
            placeholder="seu@email.com"
            required
          />
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth isLoading={loading}>
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <TextField
            label="Código de verificação"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            prefixIcon={<KeyRound size={16} />}
            placeholder="000000"
            required
          />
          <TextField
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            prefixIcon={<Lock size={16} />}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth isLoading={loading}>
            Redefinir senha
          </Button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:underline"
          >
            Reenviar código
          </button>
        </form>
      )}
    </div>
  )
}
