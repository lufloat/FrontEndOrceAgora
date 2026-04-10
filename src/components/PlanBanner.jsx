import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStatus } from '../api/subscriptions'
import { Zap, AlertTriangle } from 'lucide-react'

export function PlanBanner() {
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getStatus().then(r => setStatus(r.data)).catch(() => {})
  }, [])

  if (!status || status.plan === 'pro') return null

  const isAlmostFull = status.remainingBudgets <= 1
  const isFull = status.remainingBudgets === 0

  if (!isAlmostFull) return null

  return (
    <div className={`mx-4 md:mx-8 mt-4 p-3 rounded-xl flex items-center gap-3
      ${isFull
        ? 'bg-red-50 border border-red-200'
        : 'bg-amber-50 border border-amber-200'}`}>
      <AlertTriangle size={18}
        className={isFull ? 'text-red-500' : 'text-amber-500'} />
      <div className="flex-1">
        <p className={`text-sm font-medium
          ${isFull ? 'text-red-700' : 'text-amber-700'}`}>
          {isFull
            ? 'Limite mensal atingido — 0 orçamentos restantes'
            : `Atenção — apenas ${status.remainingBudgets} orçamento restante este mês`}
        </p>
        <p className="text-xs text-muted">
          Plano Básico: {status.budgetsThisMonth}/{status.budgetLimit} orçamentos usados
        </p>
      </div>
      <button
        onClick={() => navigate('/planos')}
        className="flex items-center gap-1.5 bg-primary text-white text-xs
          font-medium px-3 py-1.5 rounded-lg hover:bg-primary-dark
          transition-colors flex-shrink-0">
        <Zap size={14} /> Ver Pro
      </button>
    </div>
  )
}