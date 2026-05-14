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
      {/*
        ─── REGRA DE OURO ────────────────────────────────────────────────────
        Nenhum filho pode ter largura maior que 100vw.
        • Sem min-w fixo
        • Sem whitespace-nowrap em textos longos
        • Sem flex em linha que some mais de 100%
        ──────────────────────────────────────────────────────────────────────
      */}
      <div className="w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 box-border">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between py-6 sm:py-8 gap-2 min-w-0">

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0D0D0D]">
              Orçamentos
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
              Gerencie seus orçamentos com eficiência
            </p>
          </div>

          {/* Botão: ícone + texto curto — nunca vaza */}
          <button
            onClick={() => navigate('/budgets/new')}
            className="flex-shrink-0 flex items-center gap-1.5 bg-[#027373] hover:bg-[#038C7F] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Plus size={16} />
            <span>Novo</span>
          </button>
        </div>

        {/* ── FILTROS: grid que quebra linha automaticamente ──────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border
                ${status === f.value
                  ? 'bg-[#027373] text-white border-[#027373] shadow-sm'
                  : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── LOADING ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#ADD9D1] border-t-[#027373] rounded-full animate-spin" />
          </div>

        ) : budgets.length === 0 ? (
          <EmptyState
            icon="📄"
            title="Nenhum orçamento ainda"
            description="Crie seu primeiro orçamento em segundos"
            action={
              <button
                onClick={() => navigate('/budgets/new')}
                className="flex items-center gap-2 bg-[#027373] text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Plus size={16} />
                Novo orçamento
              </button>
            }
          />

        ) : (
          <div className="flex flex-col gap-3 pb-10">
            {budgets.map(b => (
              <div
                key={b.id}
                className="w-full min-w-0 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#ADD9D1] transition-all"
              >

                {/* LINHA 1 — número + badge + valor (nunca vaza) */}
                <div className="flex items-center justify-between gap-2 min-w-0 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-semibold text-[#0D0D0D] flex-shrink-0">
                      #{String(b.number).padStart(4, '0')}
                    </span>
                    <div className="flex-shrink-0">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-base font-semibold text-[#027373]">
                    {currency(b.total)}
                  </span>
                </div>

                {/* LINHA 2 — cliente */}
                <p className="text-sm text-gray-600 truncate w-full mb-1">
                  {b.clientName ?? 'Cliente não informado'}
                </p>

                {/* LINHA 3 — datas */}
                <p className="text-xs text-gray-400 mb-3">
                  Criado {date(b.createdAt)} · vence {date(b.expiresAt)}
                </p>

                {/* LINHA 4 — ações separadas para não encolher textos acima */}
                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/budgets/${b.id}`)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-1.5 text-xs font-medium text-[#027373] hover:bg-[#ADD9D1]/30 rounded-lg transition"
                  >
                    <Eye size={14} />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => copyLink(b.approvalToken)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-1.5 text-xs font-medium text-[#027373] hover:bg-[#ADD9D1]/30 rounded-lg transition"
                  >
                    <Link2 size={14} />
                    <span>Link</span>
                  </button>

                  <button
                    onClick={() => handlePdf(b.id, b.number)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-1.5 text-xs font-medium text-[#027373] hover:bg-[#ADD9D1]/30 rounded-lg transition"
                  >
                    <FileDown size={14} />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-1.5 text-xs font-medium text-[#D95252] hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                    <span>Excluir</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}