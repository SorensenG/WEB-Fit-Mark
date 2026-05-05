import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/contexts/QueryProvider'

export const metadata: Metadata = {
  title: 'FitMark',
  description: 'Seu app de treinos',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('fm_theme');
                const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                if ((stored || preferred) === 'dark') document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
