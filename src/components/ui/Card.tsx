import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean
}

export function Card({ className, clickable, onClick, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface p-4 shadow-sm',
        clickable && 'cursor-pointer hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors',
        className,
      )}
      {...props}
    />
  )
}
