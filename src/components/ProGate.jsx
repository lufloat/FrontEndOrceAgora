import { useNavigate } from 'react-router-dom'
import { usePlan } from '../hooks/usePlan'
import { Crown, Lock } from 'lucide-react'

export function ProGate({ children, feature = 'este recurso' }) {
  const { isPro } = usePlan()
  const navigate = useNavigate()

  if (isPro) return children

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center
        justify-center mb-4">
        <Lock size={32} className="text-amber-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Recurso exclusivo Pro
      </h2>
      <p className="text-muted text-sm mb-6 max-w-xs">
        {feature} está disponível apenas no plano Pro.
        Faça upgrade para desbloquear.
      </p>
      <button
        onClick={() => navigate('/planos')}
        className="btn-primary flex items-center gap-2">
        <Crown size={18} /> Ver plano Pro — R$29,90/mês
      </button>
    </div>
  )
}