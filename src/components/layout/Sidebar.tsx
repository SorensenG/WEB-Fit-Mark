'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  User,
  Download,
  Plus,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Divisões', href: '/' },
  { icon: Dumbbell, label: 'Treinos', href: '/meus-treinos' },
  { icon: TrendingUp, label: 'Progresso', href: '/progresso' },
  { icon: User, label: 'Perfil', href: '/perfil' },
  { icon: Download, label: 'Baixar App', href: '/baixar' },
]

export function Sidebar({ onNewSplit }: { onNewSplit?: () => void }) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-light-surface dark:bg-dark-surface border-r border-light-outline dark:border-dark-outline">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-light-primary dark:bg-dark-primary flex items-center justify-center">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="font-rajdhani font-bold text-xl text-light-primary dark:text-dark-primary">
            FitMark
          </span>
        </div>
        <div className="my-4 border-t border-light-outline dark:border-dark-outline" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-light-primaryContainer dark:bg-dark-primaryContainer text-light-primary dark:text-dark-primary'
                : 'text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant',
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 space-y-3 border-t border-light-outline dark:border-dark-outline">
        {onNewSplit && (
          <button
            onClick={onNewSplit}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-light-primary dark:bg-dark-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Nova Divisão
          </button>
        )}
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:bg-light-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>
      </div>
    </aside>
  )
}
