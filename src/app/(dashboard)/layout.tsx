import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
