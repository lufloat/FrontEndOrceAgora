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

      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-6">

        <div className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#0D0D0D]">
              Orçamentos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie seus orçamentos com eficiência
            </p>
          </div>

          <button
            onClick={() => navigate('/budgets/new')}
            className="flex items-center gap-2 bg-[#027373] hover:bg-[#038C7F] text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Novo orçamento
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-gray-200 w-fit shadow-sm">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition
                ${status === f.value
                  ? 'bg-[#027373] text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LOADING */}
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
                className="flex items-center gap-2 bg-[#027373] text-white px-4 py-2 rounded-lg"
              >
                <Plus size={18} />
                Novo orçamento
              </button>
            }
          />
        ) : (

          <div className="flex flex-col gap-3 pb-10">

            {budgets.map(b => (
              <div
                key={b.id}
                className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-md hover:border-[#ADD9D1] transition-all"
              >

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#0D0D0D]">
                      #{String(b.number).padStart(4, '0')}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  <p className="text-sm text-gray-600 truncate">
                    {b.clientName ?? 'Cliente não informado'}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Criado em {date(b.createdAt)} • vence {date(b.expiresAt)}
                  </p>
                </div>

                {/* VALOR */}
                <div className="text-right min-w-[130px]">
                  <p className="text-lg font-semibold text-[#027373]">
                    {currency(b.total)}
                  </p>
                </div>

                {/* AÇÕES */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">

                  <button
                    onClick={() => navigate(`/budgets/${b.id}`)}
                    title="Visualizar"
                    className="p-2 hover:bg-[#ADD9D1]/40 rounded-lg transition"
                  >
                    <Eye size={16} className="text-[#027373]" />
                  </button>

                  <button
                    onClick={() => copyLink(b.approvalToken)}
                    title="Copiar link"
                    className="p-2 hover:bg-[#ADD9D1]/40 rounded-lg transition"
                  >
                    <Link2 size={16} className="text-[#027373]" />
                  </button>

                  <button
                    onClick={() => handlePdf(b.id, b.number)}
                    title="Baixar PDF"
                    className="p-2 hover:bg-[#ADD9D1]/40 rounded-lg transition"
                  >
                    <FileDown size={16} className="text-[#027373]" />
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    title="Deletar"
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} className="text-[#D95252]" />
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