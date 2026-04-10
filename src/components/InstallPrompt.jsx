import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      // Só mostra se o usuário não dispensou antes
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6
      md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50
      animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center
          flex-shrink-0">
          <span className="text-white font-bold text-lg">OA</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">Instalar OrceAgora</p>
          <p className="text-xs text-muted mt-0.5">
            Acesse direto da tela inicial, sem precisar do navegador
          </p>
        </div>
        <button onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          <X size={18} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleDismiss}
          className="flex-1 btn-secondary text-sm py-2">
          Agora não
        </button>
        <button onClick={handleInstall}
          className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-2">
          <Download size={16} /> Instalar
        </button>
      </div>
    </div>
  )
}