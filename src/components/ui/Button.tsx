'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  isLoading,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary:
      'bg-light-primary dark:bg-dark-primary text-white hover:opacity-90 focus:ring-light-primary dark:focus:ring-dark-primary',
    outline:
      'border border-light-outline dark:border-dark-outline text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant focus:ring-light-primary dark:focus:ring-dark-primary',
    ghost:
      'text-light-primary dark:text-dark-primary hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant focus:ring-light-primary dark:focus:ring-dark-primary',
    destructive:
      'border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 focus:ring-red-500',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
