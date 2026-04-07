import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getDashboard } from '../../api/dashboard'
import { currency, date } from '../../utils/format'
import { Layout } from '../../components/Layout'
import { TrendingUp, TrendingDown, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, trend, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && (
          <div className="flex items-center gap-1 mt-1">
            {trend > 0
              ? <TrendingUp size={13} className="text-green-500" />
              : trend < 0
              ? <TrendingDown size={13} className="text-red-400" />
              : null}
            <span className={`text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-muted'}`}>
              {sub}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function MiniBar({ label, value, max, formatted }) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-700 truncate flex-1 mr-2">{label}</span>
        <span className="text-sm font-semibold text-slate-800 flex-shrink-0">{formatted}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Erro ao carregar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  )

  if (!data) return null

  const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.total), 1)
  const maxClient = Math.max(...data.topClients.map(c => c.total), 1)
  const maxService = Math.max(...data.topServices.map(s => s.count), 1)

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-muted">Visão geral do seu negócio</p>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Faturamento este mês"
          value={currency(data.totalThisMonth)}
          sub={`${data.percentChange > 0 ? '+' : ''}${data.percentChange}% vs mês anterior`}
          trend={data.percentChange}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          label="Taxa de conversão"
          value={`${data.conversionRate}%`}
          sub={`${data.approvedThisMonth} aprovados de ${data.sentThisMonth} enviados`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Total orçado"
          value={currency(data.totalBudgeted)}
          sub="todos os orçamentos"
          icon={FileText}
          color="purple"
        />
        <StatCard
          label="Total aprovado"
          value={currency(data.totalApproved)}
          sub="receita confirmada"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Receita mensal */}
      {data.monthlyRevenue.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-slate-700 mb-4">Receita — últimos 6 meses</h2>
          <div className="flex flex-col gap-3">
            {data.monthlyRevenue.map(m => (
              <MiniBar key={m.month} label={m.month}
                value={m.total} max={maxRevenue}
                formatted={currency(m.total)} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Top clientes */}
        {data.topClients.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Melhores clientes</h2>
            <div className="flex flex-col gap-3">
              {data.topClients.map(c => (
                <MiniBar key={c.name} label={c.name}
                  value={c.total} max={maxClient}
                  formatted={currency(c.total)} />
              ))}
            </div>
          </div>
        )}

        {/* Top serviços */}
        {data.topServices.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Serviços mais vendidos</h2>
            <div className="flex flex-col gap-3">
              {data.topServices.map(s => (
                <MiniBar key={s.name} label={s.name}
                  value={s.count} max={maxService}
                  formatted={`${s.count}x`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagamentos pendentes */}
      {data.pendingPayments.length > 0 && (
        <div className="card mb-4">
          <h2 className="font-semibold text-slate-700 mb-4">Contas a receber</h2>
          <div className="flex flex-col divide-y divide-slate-100">
            {data.pendingPayments.map((p, i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                {p.isOverdue
                  ? <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                  : <Clock size={18} className="text-amber-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    #{String(p.budgetNumber).padStart(4, '0')} · {p.clientName ?? 'Cliente'}
                  </p>
                  {p.dueDate && (
                    <p className={`text-xs ${p.isOverdue ? 'text-red-500' : 'text-muted'}`}>
                      {p.isOverdue ? 'Venceu em ' : 'Vence em '}
                      {p.dueDate}
                    </p>
                  )}
                </div>
                <p className="font-bold text-slate-800">{currency(p.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.pendingPayments.length === 0 && data.topClients.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <h3 className="font-semibold text-slate-700">Dados aparecerão aqui</h3>
          <p className="text-sm text-muted mt-1">Crie orçamentos e aprove-os para ver seu dashboard</p>
        </div>
      )}

      <div className="h-20 md:h-0" />
    </Layout>
  )
}