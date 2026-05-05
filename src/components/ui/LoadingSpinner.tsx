import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader2
        size={32}
        className="animate-spin text-light-primary dark:text-dark-primary"
      />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-light-surfaceVariant dark:bg-dark-surfaceVariant" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-light-surfaceVariant dark:bg-dark-surfaceVariant rounded w-2/3" />
          <div className="h-3 bg-light-surfaceVariant dark:bg-dark-surfaceVariant rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}
