import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getStatus, upgradeToPro, cancelPro } from '../../api/subscriptions'
import { Layout } from '../../components/Layout'
import { Check, Zap, Crown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const BASIC_FEATURES = [
  '5 orçamentos por mês',
  'Geração de PDF',
  'Link de aprovação online',
  'Modelos de serviços',
  'Histórico de orçamentos',
  'Clientes ilimitados',
]

const PRO_FEATURES = [
  'Orçamentos ilimitados',
  'Tudo do plano Básico',
  'Dashboard financeiro',
  'Agenda com lembretes',
  'Relatórios de faturamento',
  'Top clientes e serviços',
  'Contas a receber',
  'Sem anúncios',
]

export default function Plans() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    getStatus()
      .then(r => setStatus(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)
      await upgradeToPro({ cpfCnpj: '70228556171' })
      setAuth({ ...user, plan: 'pro' }, token)
      toast.success('Plano Pro ativado! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao ativar Pro')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm(
      'Cancelar assinatura? Você continuará com acesso Pro até o fim do período pago.'
    )) return
    try {
      await cancelPro()
      const res = await getStatus()
      setStatus(res.data)
      toast.success(
        `Assinatura cancelada. Você tem acesso Pro por mais ${res.data.daysRemainingAfterCancel} dias.`,
        { duration: 6000 }
      )
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  const isPro = status?.plan === 'pro'

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Planos</h1>
          <p className="text-muted mt-1">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        {/* Aviso de cancelamento agendado — acima dos cards */}
        {isPro && status?.cancelAtPeriodEnd && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4
            text-sm text-amber-700 text-center">
            ⚠️ Assinatura cancelada — você ainda tem acesso Pro por{' '}
            <strong>{status.daysRemainingAfterCancel} dias</strong>
            {status.currentPeriodEnd && ` (até ${new Date(status.currentPeriodEnd)
              .toLocaleDateString('pt-BR')})`}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Card Básico */}
          <div className={`card border-2 ${!isPro ? 'border-primary' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Básico</h2>
                <p className="text-2xl font-bold text-slate-800 mt-1">Grátis</p>
              </div>
              {!isPro && (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  Plano atual
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {BASIC_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>

            {isPro && (
              <button onClick={handleCancel} className="btn-secondary w-full text-sm">
                Voltar para o Básico
              </button>
            )}
          </div>
          {/* Fim card Básico */}

          {/* Card Pro */}
          <div className={`card border-2 relative overflow-hidden
            ${isPro ? 'border-primary' : 'border-slate-100'}`}>

            <div className="absolute top-0 right-0 bg-primary text-white
              text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMENDADO
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Pro <Crown size={18} className="text-amber-400" />
                </h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className="text-2xl font-bold text-slate-800">R$29,90</p>
                  <span className="text-muted text-sm">/mês</span>
                </div>
              </div>
              {isPro && (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                  Plano atual
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-6">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>

            {!isPro && (
              <button onClick={handleUpgrade} disabled={upgrading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                <Zap size={16} />
                {upgrading ? 'Ativando...' : 'Assinar Pro — R$29,90/mês'}
              </button>
            )}

            {isPro && !status?.cancelAtPeriodEnd && status?.currentPeriodEnd && (
              <p className="text-xs text-center text-muted">
                Próxima cobrança:{' '}
                {new Date(status.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {/* Fim card Pro */}

        </div>

        {/* Status do mês */}
        {!isPro && status && (
          <div className="card mt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Uso este mês</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Orçamentos criados</span>
              <span className="text-sm font-medium text-slate-800">
                {status.budgetsThisMonth}/{status.budgetLimit}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all
                  ${status.budgetsThisMonth >= status.budgetLimit
                    ? 'bg-red-500'
                    : status.budgetsThisMonth >= status.budgetLimit - 1
                    ? 'bg-amber-400'
                    : 'bg-primary'}`}
                style={{
                  width: `${Math.min(
                    (status.budgetsThisMonth / status.budgetLimit) * 100,
                    100)}%`
                }}
              />
            </div>
          </div>
        )}

        <div className="h-20 md:h-0" />
      </div>
    </Layout>
  )
}