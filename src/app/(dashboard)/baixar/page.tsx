import { Smartphone, Download } from 'lucide-react'

export default function BaixarPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center py-16">
      <div className="w-24 h-24 rounded-3xl bg-light-primaryContainer dark:bg-dark-primaryContainer flex items-center justify-center mb-6">
        <Smartphone size={48} className="text-light-primary dark:text-dark-primary" />
      </div>

      <h1 className="font-rajdhani font-bold text-3xl text-light-onSurface dark:text-dark-onSurface mb-3">
        Aplicativo Mobile
      </h1>

      <p className="text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-sm max-w-xs leading-relaxed mb-8">
        Leve o FitMark no seu bolso! O app mobile oferece experiência completa com notificações,
        timer de descanso e modo offline.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
          <Download size={20} className="text-light-primary dark:text-dark-primary" />
          <div className="text-left">
            <p className="text-sm font-semibold text-light-onSurface dark:text-dark-onSurface">
              Android (APK)
            </p>
            <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Em breve
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
          <Download size={20} className="text-light-primary dark:text-dark-primary" />
          <div className="text-left">
            <p className="text-sm font-semibold text-light-onSurface dark:text-dark-onSurface">
              iOS (App Store)
            </p>
            <p className="text-xs text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
              Em breve
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
