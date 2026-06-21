import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, X, Wifi } from 'lucide-react'

// ─── Update Prompt ─────────────────────────────────────────────────────────────
// Shows a bar at the bottom when a new version of the app is available.

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 seconds
      if (r) setInterval(() => r.update(), 60_000)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur-md shadow-2xl px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
          <RefreshCw className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Có phiên bản mới</p>
          <p className="text-xs text-muted-foreground">Cập nhật để có tính năng mới nhất</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => updateServiceWorker(true)}
          >
            Cập nhật
          </Button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Install Prompt ────────────────────────────────────────────────────────────
// Shows a banner to add the app to home screen (Android/desktop).
// iOS shows instructions since Safari doesn't fire beforeinstallprompt.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true

    setIsIOS(ios)
    setIsStandalone(standalone)

    // Check if already dismissed in this session
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
    dismiss()
  }

  // Already installed or dismissed
  if (isStandalone || dismissed) return null

  // Android / Desktop: native install prompt available
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 z-[59] w-[calc(100%-2rem)] max-w-sm">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur-md shadow-2xl px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
            <Download className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Cài đặt ứng dụng</p>
            <p className="text-xs text-muted-foreground">Dùng như app, hoạt động offline</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-500" onClick={install}>
              Cài đặt
            </Button>
            <button
              onClick={dismiss}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS: show manual instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[59] w-[calc(100%-2rem)] max-w-sm">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur-md shadow-2xl px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-400 shrink-0" />
              <p className="text-sm font-medium">Cài đặt ứng dụng (iOS)</p>
            </div>
            <button
              onClick={dismiss}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nhấn <span className="text-foreground font-medium">Chia sẻ</span> → chọn{' '}
            <span className="text-foreground font-medium">"Thêm vào màn hình chính"</span> để cài đặt app.
          </p>
        </div>
      </div>
    )
  }

  return null
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export function PWAPrompt() {
  return (
    <>
      <UpdatePrompt />
      <InstallPrompt />
    </>
  )
}
