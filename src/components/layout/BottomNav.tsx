'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, TrendingUp, User, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { icon: LayoutDashboard, label: 'Divisões', href: '/' },
  { icon: Dumbbell, label: 'Treinos', href: '/meus-treinos' },
  { icon: TrendingUp, label: 'Progresso', href: '/progresso' },
  { icon: Download, label: 'Baixar', href: '/baixar' },
  { icon: User, label: 'Perfil', href: '/perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="fitmark-bottom-safe lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-light-outline/80 dark:border-dark-outline/80 bg-light-surface/95 dark:bg-dark-surface/95 shadow-[0_-8px_30px_rgba(15,15,20,0.08)] backdrop-blur">
      <div className="flex">
        {items.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors',
              isActive(href)
                ? 'text-light-primary dark:text-dark-primary'
                : 'text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant',
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
