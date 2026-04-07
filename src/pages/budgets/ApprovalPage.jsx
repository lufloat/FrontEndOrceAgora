import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getByToken, processApproval } from '../../api/budgets'
import { currency, date } from '../../utils/format'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ApprovalPage() {
  const { token } = useParams()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [done, setDone] = useState(null) // 'approved' | 'rejected'
  const [reason, setReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  useEffect(() => {
    getByToken(token)
      .then(r => setBudget(r.data))
      .catch(() => setBudget(null))
      .finally(() => setLoading(false))
  }, [token])

  const handleAction = async (action) => {
    try {
      setActionLoading(true)
      await processApproval(token, { action, reason })
      setDone(action === 'approve' ? 'approved' : 'rejected')
    } catch {
      alert('Erro ao processar resposta. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!budget) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-slate-700">Orçamento não encontrado</h2>
        <p className="text-muted mt-2">O link pode ter expirado ou ser inválido.</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="text-center card max-w-sm w-full">
        {done === 'approved' ? (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Orçamento aprovado!</h2>
            <p className="text-muted text-sm">O profissional foi notificado e entrará em contato em breve.</p>
          </>
        ) : (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Orçamento recusado</h2>
            <p className="text-muted text-sm">Sua resposta foi registrada. Obrigado pelo retorno.</p>
          </>
        )}
      </div>
    </div>
  )

  const isExpired = new Date(budget.expiresAt) < new Date()
  const canAct = !isExpired && budget.status !== 'approved' && budget.status !== 'rejected'

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">OrceAgora</h1>
          <p className="text-muted text-sm">Orçamento #{String(budget.number).padStart(4, '0')}</p>
        </div>

        {/* Status banner */}
        {budget.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center text-green-700 font-medium">
            ✅ Este orçamento já foi aprovado
          </div>
        )}
        {budget.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center text-red-600 font-medium">
            ❌ Este orçamento foi recusado
          </div>
        )}
        {isExpired && budget.status === 'sent' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-center text-amber-700 font-medium">
            ⚠️ Este orçamento expirou em {date(budget.expiresAt)}
          </div>
        )}

        {/* Info do orçamento */}
        <div className="card mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Emitido em</p>
              <p className="font-medium text-slate-800">{date(budget.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted uppercase tracking-wide">Válido até</p>
              <p className={`font-medium ${isExpired ? 'text-red-500' : 'text-slate-800'}`}>
                {date(budget.expiresAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="card mb-4">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Serviços e Materiais</p>
          <div className="flex flex-col divide-y divide-slate-100">
            {budget.items.map(item => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-muted">{item.qty} × {currency(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-slate-800">{currency(item.total)}</p>
              </div>
            ))}
          </div>

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
            <div className="flex justify-between text-xl font-bold text-primary pt-1">
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

        {/* Botões de ação */}
        {canAct && (
          <div className="card">
            <p className="text-sm font-medium text-slate-700 text-center mb-4">
              O que você deseja fazer com este orçamento?
            </p>

            {showReject && (
              <div className="mb-4">
                <label className="text-sm text-muted">Motivo da recusa (opcional)</label>
                <textarea
                  className="input mt-1 h-20 resize-none"
                  placeholder="Ex: Valor fora do orçado, prazo não adequado..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3">
              {!showReject ? (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <CheckCircle size={20} />
                    {actionLoading ? 'Processando...' : 'Aprovar'}
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <XCircle size={20} /> Recusar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                    {actionLoading ? 'Processando...' : 'Confirmar recusa'}
                  </button>
                  <button
                    onClick={() => setShowReject(false)}
                    className="btn-secondary">
                    Voltar
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Gerado por OrceAgora · orceagora.com.br
        </p>
      </div>
    </div>
  )
}