'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefixIcon?: ReactNode
  suffixIcon?: ReactNode
}

export function TextField({
  label,
  error,
  prefixIcon,
  suffixIcon,
  className,
  id,
  ...props
}: TextFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-light-onSurface dark:text-dark-onSurface mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-3 text-light-onSurfaceVariant dark:text-[#B9B8D3]">
            {prefixIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-sm bg-light-surfaceVariant dark:bg-dark-surfaceVariant text-light-onSurface dark:text-dark-onSurface placeholder:text-light-onSurfaceVariant dark:placeholder:text-dark-onSurfaceVariant border-light-outline dark:border-dark-outline focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary transition-colors',
            prefixIcon && 'pl-10',
            suffixIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {suffixIcon && (
          <span className="absolute right-3 text-light-onSurfaceVariant dark:text-[#B9B8D3]">
            {suffixIcon}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
