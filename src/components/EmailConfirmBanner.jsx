import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Mail, X } from 'lucide-react'

export function EmailConfirmBanner() {
  const user = useAuthStore(s => s.user)
  const [dismissed, setDismissed] = useState(false)

  if (!user || user.emailConfirmed || dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3
      flex items-center gap-3">
      <Mail size={18} className="text-amber-500 flex-shrink-0" />
      <p className="text-sm text-amber-700 flex-1">
        Confirme seu e-mail para garantir acesso contínuo à sua conta.
        Verifique sua caixa de entrada.
      </p>
      <button onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600">
        <X size={16} />
      </button>
    </div>
  )
}