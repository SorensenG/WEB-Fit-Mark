export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-light-bg px-4 py-6 dark:bg-dark-bg">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
