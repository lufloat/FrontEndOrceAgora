import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getBudget, downloadPdf } from '../../api/budgets'
import { currency, date } from '../../utils/format'
import { StatusBadge } from '../../components/ui/Badge'
import { Layout } from '../../components/Layout'
import { FileDown, Link2, ArrowLeft } from 'lucide-react'

export default function BudgetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBudget(id)
      .then(r => setBudget(r.data))
      .catch(() => toast.error('Orçamento não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/aprovar/${budget.approvalToken}`)
    toast.success('Link copiado! Envie para o cliente.')
  }

  const handlePdf = async () => {
    try {
      const res = await downloadPdf(id)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `orcamento-${String(budget.number).padStart(4, '0')}.pdf`
      a.click()
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  )

  if (!budget) return null

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/budgets')}
            className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Orçamento #{String(budget.number).padStart(4, '0')}
              </h1>
              <StatusBadge status={budget.status} />
            </div>
            <p className="text-sm text-muted">
              {date(budget.createdAt)} · válido até {date(budget.expiresAt)}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 mb-6">
          <button onClick={copyLink}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Link2 size={18} /> Copiar link do cliente
          </button>
          <button onClick={handlePdf}
            className="btn-secondary flex items-center gap-2">
            <FileDown size={18} /> PDF
          </button>
        </div>

        {/* Info visualização */}
        {budget.viewedAt && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4 text-sm text-purple-700">
            Cliente visualizou em {date(budget.viewedAt)}
          </div>
        )}

        {/* Cliente */}
        {budget.client && (
          <div className="card mb-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Cliente</p>
            <p className="font-semibold text-slate-800">{budget.client.name}</p>
            {budget.client.phone && <p className="text-sm text-muted">{budget.client.phone}</p>}
          </div>
        )}

        {/* Itens */}
        <div className="card mb-4">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Itens</p>
          <div className="flex flex-col divide-y divide-slate-100">
            {budget.items.map(item => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.qty} × {currency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-slate-800">{currency(item.total)}</p>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span><span>{currency(budget.subtotal)}</span>
            </div>
            {budget.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Desconto</span><span>- {currency(budget.discountAmount)}</span>
              </div>
            )}
            {budget.extras > 0 && (
              <div className="flex justify-between text-sm text-muted">
                <span>{budget.extrasDescription || 'Extras'}</span>
                <span>{currency(budget.extras)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary pt-1">
              <span>Total</span><span>{currency(budget.total)}</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        {budget.notes && (
          <div className="card mb-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">Observações</p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{budget.notes}</p>
          </div>
        )}

        {budget.paymentMethods && (
          <div className="card mb-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-2">Formas de pagamento</p>
            <p className="text-sm text-slate-700">{budget.paymentMethods}</p>
          </div>
        )}

        <div className="h-20 md:h-0" />
      </div>
    </Layout>
  )
}