import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getBudget, downloadPdf } from '../../api/budgets'
import { currency, date } from '../../utils/format'
import { StatusBadge } from '../../components/ui/Badge'
import { Layout } from '../../components/Layout'
import {
  FileDown, Link2, ArrowLeft, CheckCircle2, Clock,
  User, CreditCard, FileText, Eye, Calendar, Hash,
  Copy, Download, ChevronRight, Sparkles
} from 'lucide-react'

const statusConfig = {
  draft:    { label: 'Rascunho',  color: '#6B7280', bg: '#F3F4F6' },
  pending:  { label: 'Pendente',  color: '#D97706', bg: '#FEF3C7' },
  approved: { label: 'Aprovado',  color: '#059669', bg: '#D1FAE5' },
  rejected: { label: 'Recusado', color: '#DC2626', bg: '#FEE2E2' },
}

export default function BudgetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    getBudget(id)
      .then(r => setBudget(r.data))
      .catch(() => toast.error('Orçamento não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const copyLink = async () => {
    setCopying(true)
    await navigator.clipboard.writeText(`${window.location.origin}/aprovar/${budget.approvalToken}`)
    toast.success('Link copiado! Envie para o cliente.')
    setTimeout(() => setCopying(false), 2000)
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
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:400 }}>
        <div style={{
          width:40, height:40, borderRadius:'50%',
          border:'3px solid #EBF5F4', borderTopColor:'#027373',
          animation:'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    </Layout>
  )

  if (!budget) return null

  const statusCfg = statusConfig[budget.status] || statusConfig.draft
  const budgetNum = String(budget.number).padStart(4, '0')

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .bd-root {
          font-family:'Plus Jakarta Sans',sans-serif;
          max-width:780px;
          margin:0 auto;
          padding-bottom:60px;
        }

        /* ── Back button ── */
        .bd-back {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; font-weight:500; color:#6B7280;
          background:none; border:none; cursor:pointer;
          padding:0; margin-bottom:24px; transition:.15s;
        }
        .bd-back:hover { color:#027373; }

        /* ── Hero card ── */
        .bd-hero {
          border-radius:20px; overflow:hidden;
          background:linear-gradient(135deg, #027373 0%, #014F4F 60%, #013535 100%);
          margin-bottom:20px;
          box-shadow:0 20px 60px rgba(2,115,115,.25);
          position:relative;
        }
        .bd-hero::before {
          content:''; position:absolute; inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .bd-hero-top {
          padding:32px 32px 24px;
          display:flex; align-items:flex-start; justify-content:space-between;
          position:relative;
        }
        .bd-hero-label {
          font-size:11px; font-weight:600; letter-spacing:1.5px;
          text-transform:uppercase; color:rgba(255,255,255,.5);
          margin-bottom:6px;
        }
        .bd-hero-num {
          font-size:36px; font-weight:800; color:#fff;
          letter-spacing:-1px; line-height:1;
          margin-bottom:8px;
        }
        .bd-hero-date {
          font-size:13px; color:rgba(255,255,255,.6);
          display:flex; align-items:center; gap:6px;
        }
        .bd-status-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 14px; border-radius:100px;
          font-size:12px; font-weight:700;
          background:rgba(255,255,255,.12);
          color:#fff;
          backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.15);
        }
        .bd-status-dot {
          width:7px; height:7px; border-radius:50%; background:#fff;
        }

        /* hero bottom: total */
        .bd-hero-bottom {
          padding:20px 32px 28px;
          border-top:1px solid rgba(255,255,255,.08);
          display:flex; align-items:center; justify-content:space-between;
          position:relative;
        }
        .bd-total-label { font-size:12px; font-weight:500; color:rgba(255,255,255,.5); margin-bottom:4px; }
        .bd-total-val { font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
        .bd-validity-info {
          text-align:right;
        }
        .bd-validity-label { font-size:11px; color:rgba(255,255,255,.45); margin-bottom:4px; }
        .bd-validity-val { font-size:14px; font-weight:600; color:rgba(255,255,255,.8); display:flex; align-items:center; gap:5px; justify-content:flex-end; }

        /* ── Action buttons ── */
        .bd-actions { display:flex; gap:12px; margin-bottom:20px; }
        .bd-btn-copy {
          flex:1; display:flex; align-items:center; justify-content:center; gap:9px;
          padding:15px 24px; border-radius:14px;
          border:none; cursor:pointer;
          font-size:14px; font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif;
          background:#027373; color:#fff;
          box-shadow:0 4px 20px rgba(2,115,115,.3);
          transition:.2s; position:relative; overflow:hidden;
        }
        .bd-btn-copy:hover { background:#025E5E; transform:translateY(-1px); box-shadow:0 8px 28px rgba(2,115,115,.35); }
        .bd-btn-copy.copied { background:#059669; }

        .bd-btn-pdf {
          display:flex; align-items:center; gap:8px;
          padding:15px 22px; border-radius:14px;
          border:1.5px solid #E5E7EB; background:#fff; color:#374151;
          font-size:14px; font-weight:600; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          transition:.2s;
        }
        .bd-btn-pdf:hover { border-color:#027373; color:#027373; background:#EBF5F4; transform:translateY(-1px); }

        /* ── Viewed banner ── */
        .bd-viewed-banner {
          display:flex; align-items:center; gap:10px;
          background:linear-gradient(135deg, #F5F3FF, #EDE9FE);
          border:1px solid #DDD6FE; border-radius:12px;
          padding:14px 18px; margin-bottom:16px;
          font-size:13px; color:#6D28D9;
          font-weight:500;
        }

        /* ── Section cards ── */
        .bd-card {
          background:#fff; border:1px solid #E5E7EB;
          border-radius:16px; overflow:hidden;
          margin-bottom:14px;
          box-shadow:0 1px 4px rgba(0,0,0,.04);
        }
        .bd-card-head {
          display:flex; align-items:center; gap:10px;
          padding:16px 20px;
          border-bottom:1px solid #F3F4F6;
        }
        .bd-card-head-icon {
          width:30px; height:30px; border-radius:8px;
          background:#EBF5F4; display:flex; align-items:center; justify-content:center;
          color:#027373; flex-shrink:0;
        }
        .bd-card-head-title {
          font-size:13px; font-weight:700; color:#0D0D0D;
          text-transform:uppercase; letter-spacing:.5px;
        }
        .bd-card-body { padding:20px; }

        /* ── Client info ── */
        .bd-client-row {
          display:flex; align-items:center; gap:14px;
        }
        .bd-client-avatar {
          width:44px; height:44px; border-radius:12px;
          background:linear-gradient(135deg, #027373, #ADD9D1);
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:18px; font-weight:700; flex-shrink:0;
        }
        .bd-client-name { font-size:16px; font-weight:700; color:#0D0D0D; margin-bottom:2px; }
        .bd-client-phone { font-size:13px; color:#6B7280; }

        /* ── Items ── */
        .bd-item-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:14px 0;
          border-bottom:1px solid #F9FAFB;
        }
        .bd-item-row:last-of-type { border-bottom:none; }
        .bd-item-name { font-size:14px; font-weight:600; color:#1F2937; margin-bottom:3px; }
        .bd-item-qty  { font-size:12px; color:#9CA3AF; }
        .bd-item-total { font-size:15px; font-weight:700; color:#0D0D0D; }

        /* ── Totals ── */
        .bd-totals { border-top:1px solid #F3F4F6; padding-top:16px; margin-top:4px; }
        .bd-total-row {
          display:flex; justify-content:space-between; align-items:center;
          font-size:13px; padding:5px 0;
        }
        .bd-total-row .lbl { color:#6B7280; }
        .bd-total-row .val { font-weight:500; color:#374151; }
        .bd-total-row.discount .val { color:#DC2626; }
        .bd-grand-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:16px 20px;
          background:linear-gradient(135deg, #EBF5F4 0%, #D4EEEB 100%);
          border-radius:12px; margin-top:10px;
        }
        .bd-grand-lbl { font-size:14px; font-weight:700; color:#0D0D0D; }
        .bd-grand-val { font-size:22px; font-weight:800; color:#027373; }

        /* ── Notes / payment ── */
        .bd-text-block {
          font-size:13px; color:#4B5563; line-height:1.7;
          white-space:pre-line;
        }

        /* ── Bottom spacer ── */
        .bd-spacer { height:40px; }

        @keyframes spin { to { transform:rotate(360deg) } }

        @media(max-width:640px) {
          .bd-hero-top { flex-direction:column; gap:16px; }
          .bd-hero-bottom { flex-direction:column; align-items:flex-start; gap:12px; }
          .bd-validity-info { text-align:left; }
          .bd-validity-val { justify-content:flex-start; }
          .bd-total-val { font-size:26px; }
          .bd-actions { flex-direction:column; }
        }
      `}</style>

      <div className="bd-root">

        {/* ── Back ── */}
        <button className="bd-back" onClick={() => navigate('/budgets')}>
          <ArrowLeft size={15} /> Voltar para orçamentos
        </button>

        {/* ── Hero ── */}
        <div className="bd-hero">
          <div className="bd-hero-top">
            <div>
              <div className="bd-hero-label">Orçamento</div>
              <div className="bd-hero-num">#{budgetNum}</div>
              <div className="bd-hero-date">
                <Calendar size={13} />
                {date(budget.createdAt)} · válido até {date(budget.expiresAt)}
              </div>
            </div>
            <div className="bd-status-pill">
              <div className="bd-status-dot" style={{
                background: budget.status === 'approved' ? '#34D399'
                  : budget.status === 'rejected' ? '#F87171'
                  : budget.status === 'pending' ? '#FCD34D'
                  : 'rgba(255,255,255,.5)'
              }} />
              {statusCfg.label}
            </div>
          </div>

          <div className="bd-hero-bottom">
            <div>
              <div className="bd-total-label">Valor total</div>
              <div className="bd-total-val">{currency(budget.total)}</div>
            </div>
            <div className="bd-validity-info">
              <div className="bd-validity-label">Itens</div>
              <div className="bd-validity-val">
                <Sparkles size={14} />
                {budget.items?.length || 0} {(budget.items?.length || 0) === 1 ? 'item' : 'itens'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="bd-actions">
          <button className={`bd-btn-copy ${copying ? 'copied' : ''}`} onClick={copyLink}>
            {copying ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
            {copying ? 'Link copiado!' : 'Copiar link do cliente'}
          </button>
          <button className="bd-btn-pdf" onClick={handlePdf}>
            <Download size={18} /> PDF
          </button>
        </div>

        {/* ── Viewed banner ── */}
        {budget.viewedAt && (
          <div className="bd-viewed-banner">
            <Eye size={16} />
            Cliente visualizou em {date(budget.viewedAt)}
          </div>
        )}

        {/* ── Client ── */}
        {budget.client && (
          <div className="bd-card">
            <div className="bd-card-head">
              <div className="bd-card-head-icon"><User size={14} /></div>
              <span className="bd-card-head-title">Cliente</span>
            </div>
            <div className="bd-card-body">
              <div className="bd-client-row">
                <div className="bd-client-avatar">
                  {budget.client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="bd-client-name">{budget.client.name}</div>
                  {budget.client.phone && (
                    <div className="bd-client-phone">{budget.client.phone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Items ── */}
        {budget.items?.length > 0 && (
          <div className="bd-card">
            <div className="bd-card-head">
              <div className="bd-card-head-icon"><FileText size={14} /></div>
              <span className="bd-card-head-title">Itens</span>
            </div>
            <div className="bd-card-body">
              {budget.items.map(item => (
                <div key={item.id} className="bd-item-row">
                  <div>
                    <div className="bd-item-name">{item.name}</div>
                    <div className="bd-item-qty">{item.qty} × {currency(item.unitPrice)}</div>
                  </div>
                  <div className="bd-item-total">{currency(item.total)}</div>
                </div>
              ))}

              <div className="bd-totals">
                <div className="bd-total-row">
                  <span className="lbl">Subtotal</span>
                  <span className="val">{currency(budget.subtotal)}</span>
                </div>
                {budget.discountAmount > 0 && (
                  <div className="bd-total-row discount">
                    <span className="lbl">Desconto</span>
                    <span className="val">− {currency(budget.discountAmount)}</span>
                  </div>
                )}
                {budget.extras > 0 && (
                  <div className="bd-total-row">
                    <span className="lbl">{budget.extrasDescription || 'Extras'}</span>
                    <span className="val">{currency(budget.extras)}</span>
                  </div>
                )}
              </div>

              <div className="bd-grand-row">
                <span className="bd-grand-lbl">Total</span>
                <span className="bd-grand-val">{currency(budget.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Notes ── */}
        {budget.notes && (
          <div className="bd-card">
            <div className="bd-card-head">
              <div className="bd-card-head-icon"><FileText size={14} /></div>
              <span className="bd-card-head-title">Observações</span>
            </div>
            <div className="bd-card-body">
              <p className="bd-text-block">{budget.notes}</p>
            </div>
          </div>
        )}

        {/* ── Payment ── */}
        {budget.paymentMethods && (
          <div className="bd-card">
            <div className="bd-card-head">
              <div className="bd-card-head-icon"><CreditCard size={14} /></div>
              <span className="bd-card-head-title">Formas de pagamento</span>
            </div>
            <div className="bd-card-body">
              <p className="bd-text-block">{budget.paymentMethods}</p>
            </div>
          </div>
        )}

        <div className="bd-spacer" />
      </div>
    </Layout>
  )
}