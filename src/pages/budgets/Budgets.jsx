import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getBudgets, deleteBudget, downloadPdf } from '../../api/budgets'
import { currency, date } from '../../utils/format'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Layout } from '../../components/Layout'
import { Plus, FileDown, Trash2, Eye, Link2 } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'sent', label: 'Enviados' },
  { value: 'viewed', label: 'Visualizados' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
]

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      setLoading(true)
      const res = await getBudgets({ status, page: 1, pageSize: 50 })
      setBudgets(res.data.items)
    } catch {
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status])

  const handleDelete = async (id) => {
    if (!confirm('Deletar este orçamento?')) return
    await deleteBudget(id)
    toast.success('Deletado')
    load()
  }

  const handlePdf = async (id, number) => {
    try {
      const res = await downloadPdf(id)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `orcamento-${String(number).padStart(4, '0')}.pdf`
      a.click()
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/aprovar/${token}`)
    toast.success('Link copiado!')
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orçamentos</h1>
          <p className="text-sm text-muted">{budgets.length} encontrados</p>
        </div>
        <button className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/budgets/new')}>
          <Plus size={18} /> Novo orçamento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button key={f.value}
            onClick={() => setStatus(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${status === f.value
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState icon="📄" title="Nenhum orçamento ainda"
          description="Crie seu primeiro orçamento em segundos"
          action={
            <button className="btn-primary flex items-center gap-2"
              onClick={() => navigate('/budgets/new')}>
              <Plus size={18} /> Novo orçamento
            </button>
          } />
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map(b => (
            <div key={b.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">#{String(b.number).padStart(4,'0')}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-muted truncate">{b.clientName ?? 'Cliente não informado'}</p>
                <p className="text-xs text-slate-400">{date(b.createdAt)} · vence {date(b.expiresAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{currency(b.total)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button title="Ver" onClick={() => navigate(`/budgets/${b.id}`)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Eye size={16} className="text-slate-500" />
                </button>
                <button title="Copiar link" onClick={() => copyLink(b.approvalToken)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Link2 size={16} className="text-slate-500" />
                </button>
                <button title="Baixar PDF" onClick={() => handlePdf(b.id, b.number)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <FileDown size={16} className="text-slate-500" />
                </button>
                <button title="Deletar" onClick={() => handleDelete(b.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}