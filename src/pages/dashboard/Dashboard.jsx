import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBudgets } from '../../api/budgets'
import { currency, date } from '../../utils/format'
import { Layout } from '../../components/Layout'
import {
  TrendingUp, FileText, CheckCircle, XCircle,
  Clock, ArrowRight, RefreshCw, Star, AlertTriangle
} from 'lucide-react'

/* ── Utilitários ── */
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [, m] = key.split('-')
  return MONTH_LABELS[parseInt(m, 10) - 1]
}

/* ── Calcula todas as stats ── */
function computeStats(budgets) {
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()

  const total    = budgets.length
  const approved = budgets.filter(b => b.status === 'approved')
  const rejected = budgets.filter(b => b.status === 'rejected')
  const pending  = budgets.filter(b => b.status === 'sent' || b.status === 'viewed')
  const draft    = budgets.filter(b => b.status === 'draft')
  const sent     = budgets.filter(b => ['sent','viewed','approved','rejected'].includes(b.status))

  const revenue = approved.reduce((s, b) => s + (Number(b.total) || 0), 0)
  const conversionRate = sent.length > 0
    ? Math.round((approved.length / sent.length) * 100)
    : 0

  // Últimos 6 meses
  const last6 = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    last6.push({ key, month: monthLabel(key), total: 0, count: 0 })
  }
  approved.forEach(b => {
    const key = monthKey(b.createdAt)
    const slot = last6.find(s => s.key === key)
    if (slot) { slot.total += Number(b.total) || 0; slot.count += 1 }
  })

  // Status breakdown
  const statusBreakdown = [
    { label: 'Aprovados', count: approved.length, color: '#059669', status: 'approved' },
    { label: 'Pendentes', count: pending.length,  color: '#F59E0B', status: 'pending'  },
    { label: 'Recusados', count: rejected.length, color: '#FD2245', status: 'rejected' },
    { label: 'Rascunhos', count: draft.length,    color: '#9CA3AF', status: 'draft'    },
  ].filter(s => s.count > 0).map(s => ({
    ...s,
    pct: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }))

  // Atividades recentes
  const recentActivities = [...budgets]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 6)
    .map(b => ({
      num: String(b.number).padStart(4, '0'),
      status: b.status,
      clientName: b.clientName || 'Cliente não informado',
      total: b.total,
      updatedAt: b.updatedAt || b.createdAt,
      id: b.id,
    }))

  // Top clientes por faturamento (apenas aprovados)
  const clientMap = {}
  approved.forEach(b => {
    const name = b.clientName || 'Cliente não informado'
    if (!clientMap[name]) clientMap[name] = { name, total: 0, count: 0, lastDate: null }
    clientMap[name].total += Number(b.total) || 0
    clientMap[name].count += 1
    const d = new Date(b.updatedAt || b.createdAt)
    if (!clientMap[name].lastDate || d > clientMap[name].lastDate)
      clientMap[name].lastDate = d
  })
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    total, revenue, conversionRate,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    pendingCount:  pending.length,
    draftCount:    draft.length,
    sentCount:     sent.length,
    monthlyRevenue: last6,
    statusBreakdown,
    recentActivities,
    topClients,
  }
}

/* ── Sparkline ── */
function Sparkline({ data = [], color = '#FD2245' }) {
  const vals = data.length >= 2 ? data.map(d => d.total) : null
  if (!vals || vals.every(v => v === 0)) {
    return (
      <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
        <line x1="0" y1="18" x2="120" y2="18" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
    )
  }
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const step = 120 / (vals.length - 1)
  const pts = vals.map((v, i) => `${i * step},${30 - ((v - min) / range) * 26}`).join(' ')
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2.2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Bar Chart ── */
function BarChart({ data }) {
  const [hov, setHov] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4C8CF', fontSize: 13 }}>
        Nenhum dado disponível
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.total), 1)
  const H = 160
  const BAR_W = 48
  const GAP   = 32
  const W     = data.length * (BAR_W + GAP) - GAP
  const VB_H  = H + 80

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        width="100%"
        viewBox={`-48 -50 ${W + 96} ${VB_H}`}
        style={{ overflow: 'visible', display: 'block' }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const val = max * f
          const label = val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : `R$${val.toFixed(0)}`
          return (
            <g key={i}>
              <line x1="0" y1={H - f * H} x2={W} y2={H - f * H}
                stroke="#F3F4F6" strokeWidth="1" />
              <text x="-8" y={H - f * H + 4}
                textAnchor="end" fontSize="9" fill="#C4C8CF">{label}</text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const barH  = d.total > 0 ? Math.max((d.total / max) * H, 6) : 0
          const x     = i * (BAR_W + GAP)
          const y     = H - barH
          const isHov = hov === i
          const ttY   = Math.max(y - 44, -46)

          return (
            <g key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x - 4} y={-50} width={BAR_W + 8} height={H + 50} fill="transparent" />

              {barH > 0
                ? <rect x={x} y={y} width={BAR_W} height={barH} rx="8"
                    fill={isHov ? '#FD2245' : '#FEE2E7'}
                    style={{ transition: 'fill .15s' }} />
                : <rect x={x} y={H - 3} width={BAR_W} height={3} rx="2" fill="#F3F4F6" />
              }

              {isHov && barH > 0 && (
                <g>
                  <rect x={x - 10} y={ttY} width={BAR_W + 20} height={34} rx="8" fill="#422F29" />
                  <polygon
                    points={`${x + BAR_W/2 - 5},${ttY + 34} ${x + BAR_W/2 + 5},${ttY + 34} ${x + BAR_W/2},${ttY + 42}`}
                    fill="#422F29"
                  />
                  <text x={x + BAR_W / 2} y={ttY + 13}
                    textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                    {currency(d.total)}
                  </text>
                  <text x={x + BAR_W / 2} y={ttY + 27}
                    textAnchor="middle" fontSize="9" fill="#C4A89A">
                    {d.count} aprovado{d.count !== 1 ? 's' : ''}
                  </text>
                </g>
              )}

              <text x={x + BAR_W / 2} y={H + 18}
                textAnchor="middle" fontSize="10" fill="#9CA3AF">{d.month}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Donut Chart ── */
function DonutChart({ segments, total }) {
  const [hov, setHov] = useState(null)
  const R = 68, cx = 90, cy = 90, sw = 28
  const circ = 2 * Math.PI * R
  let cum = 0
  const arcs = segments.map((s, i) => {
    const da = total > 0 ? (s.count / total) * circ : 0
    const off = -(cum / total) * circ
    cum += s.count
    return { ...s, da, off, i }
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        {arcs.map((a) => (
          <circle key={a.i} cx={cx} cy={cy} r={R}
            fill="none" stroke={a.color}
            strokeWidth={hov === a.i ? sw + 4 : sw}
            strokeDasharray={`${a.da} ${circ}`}
            strokeDashoffset={a.off}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-width .15s', cursor: 'pointer' }}
            onMouseEnter={() => setHov(a.i)}
            onMouseLeave={() => setHov(null)}
          />
        ))}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="800" fill="#422F29">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#9CA3AF">
          {hov !== null ? segments[hov]?.label : 'Total'}
        </text>
        {hov !== null && (
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="13" fontWeight="700" fill={segments[hov]?.color}>
            {segments[hov]?.count}
          </text>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((s, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default',
              opacity: hov !== null && hov !== i ? 0.5 : 1, transition: 'opacity .15s' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6B7280', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#422F29', minWidth: 20, textAlign: 'right' }}>{s.count}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', minWidth: 36, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Gauge ── */
function GaugeChart({ pct, approved, sent }) {
  const safe = Math.min(Math.max(Number(pct) || 0, 0), 100)
  const R = 66, cx = 100, cy = 100
  const circ = Math.PI * R
  const fill = (safe / 100) * circ
  const color = safe >= 70 ? '#059669' : safe >= 40 ? '#F59E0B' : '#FD2245'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="200" height="116" viewBox="0 0 200 116">
        <circle cx={cx} cy={cx} r={R} fill="none" stroke="#F1F1F1" strokeWidth="22"
          strokeDasharray={`${circ} ${circ}`}
          style={{ transform: 'rotate(180deg)', transformOrigin: `${cx}px ${cx}px` }} />
        <circle cx={cx} cy={cx} r={R} fill="none" stroke={color} strokeWidth="22"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
          style={{ transform: 'rotate(180deg)', transformOrigin: `${cx}px ${cx}px`, transition: 'stroke-dasharray .8s ease, stroke .4s' }} />
        <text x={cx} y={cx - 6} textAnchor="middle" fontSize="32" fontWeight="800" fill="#422F29">{safe}%</text>
        <text x={cx} y={cx + 14} textAnchor="middle" fontSize="11" fill="#9CA3AF">Taxa de conversão</text>
      </svg>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', textAlign: 'center' }}>
        {sent > 0
          ? <>{approved} aprovado{approved !== 1 ? 's' : ''} de {sent} enviado{sent !== 1 ? 's' : ''}</>
          : 'Nenhum orçamento enviado ainda'
        }
      </p>
    </div>
  )
}

/* ── Badge de status ── */
const STATUS_CONFIG = {
  draft:    { label: 'Rascunho',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Enviado',     bg: '#FFFBEB', color: '#D97706' },
  viewed:   { label: 'Visualizado', bg: '#EFF6FF', color: '#2563EB' },
  approved: { label: 'Aprovado',    bg: '#ECFDF5', color: '#059669' },
  rejected: { label: 'Recusado',    bg: '#FFF1F2', color: '#FD2245' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
      background: cfg.bg, color: cfg.color, letterSpacing: '.3px', textTransform: 'uppercase' }}>
      {cfg.label}
    </span>
  )
}

/* ── Top Clientes ── */
function TopClientes({ clients }) {
  if (!clients || clients.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, padding: '32px 0', color: '#C4C8CF', fontSize: 13 }}>
        <Star size={28} color="#E5E7EB" />
        <span>Nenhum cliente com aprovação ainda</span>
      </div>
    )
  }

  const topTotal = clients[0]?.total || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {clients.map((c, i) => {
        const barPct = Math.round((c.total / topTotal) * 100)
        const medals = ['🥇', '🥈', '🥉']
        return (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{medals[i] || `${i + 1}º`}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#422F29',
                  maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {c.count} orç.
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                {currency(c.total)}
              </span>
            </div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${barPct}%`,
                background: i === 0 ? '#FD2245' : i === 1 ? '#F59E0B' : '#059669',
                borderRadius: 99,
                transition: 'width .6s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Dashboard ── */
export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const navigate              = useNavigate()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await getBudgets({ page: 1, pageSize: 500 })
      const budgets = res.data?.items || []
      setStats(computeStats(budgets))
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const STAT_CARDS = stats ? [
    {
      lbl: 'FATURAMENTO',
      val: currency(stats.revenue),
      sub: `${stats.approvedCount} orçamento${stats.approvedCount !== 1 ? 's' : ''} aprovado${stats.approvedCount !== 1 ? 's' : ''}`,
      ic: <TrendingUp size={20} color="#FD2245" />,
      ibg: '#FFF0F2',
      spark: '#FD2245',
    },
    {
      lbl: 'TOTAL DE ORÇAMENTOS',
      val: stats.total,
      sub: `${stats.draftCount} rascunho${stats.draftCount !== 1 ? 's' : ''}`,
      ic: <FileText size={20} color="#059669" />,
      ibg: '#F0FDF4',
      spark: '#059669',
    },
    {
      lbl: 'APROVADOS',
      val: stats.approvedCount,
      sub: stats.sentCount > 0
        ? `${Math.round((stats.approvedCount / stats.sentCount) * 100)}% dos enviados`
        : 'Nenhum enviado ainda',
      ic: <CheckCircle size={20} color="#059669" />,
      ibg: '#ECFDF5',
      spark: '#059669',
    },
    {
      lbl: 'RECUSADOS',
      val: stats.rejectedCount,
      sub: stats.sentCount > 0
        ? `${Math.round((stats.rejectedCount / stats.sentCount) * 100)}% dos enviados`
        : 'Nenhum enviado ainda',
      ic: <XCircle size={20} color="#FD2245" />,
      ibg: '#FFF1F2',
      spark: '#FD2245',
    },
  ] : []

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .db, .db * { font-family:'Inter',sans-serif; box-sizing:border-box; }
        .db { background:#F1F1F1; padding:0 0 48px; }

        .db-topbar { display:flex; align-items:center; justify-content:space-between; padding:28px 0 24px; }
        .db-greeting { font-size:26px; font-weight:800; color:#422F29; margin:0 0 4px; letter-spacing:-.5px; }
        .db-greeting-sub { font-size:13px; color:#9CA3AF; margin:0; }
        .db-refresh { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500; color:#9CA3AF; background:#fff; border:1px solid #EBEBEB; border-radius:10px; padding:8px 14px; cursor:pointer; transition:all .15s; }
        .db-refresh:hover { color:#422F29; border-color:#D1D5DB; }

        .db-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
        .db-stat { background:#fff; border-radius:14px; padding:16px 18px; border:1px solid #EBEBEB; }
        .db-stat-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
        .db-stat-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-stat-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#9CA3AF; margin:0 0 4px; }
        .db-stat-val { font-size:22px; font-weight:800; color:#422F29; margin:0; letter-spacing:-.5px; }
        .db-stat-sub { font-size:11px; color:#9CA3AF; margin:3px 0 0; }

        .db-card { background:#fff; border-radius:14px; padding:22px 24px; border:1px solid #EBEBEB; }
        .db-card-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .db-card-title { font-size:14px; font-weight:700; color:#422F29; margin:0; }
        .db-card-link { font-size:12px; color:#FD2245; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; background:none; border:none; padding:0; }

        .db-row-main { display:grid; grid-template-columns:1fr 420px; gap:14px; margin-bottom:14px; }
        .db-row-bot { display:grid; grid-template-columns:1fr 360px; gap:14px; }

        .db-act { display:flex; flex-direction:column; gap:0; }
        .db-act-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #F9FAFB; cursor:pointer; border-radius:8px; transition:all .12s; }
        .db-act-item:last-child { border-bottom:none; }
        .db-act-item:hover { background:#FAFAFA; padding-left:8px; padding-right:8px; margin:0 -8px; }
        .db-act-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .db-act-num { font-size:13px; font-weight:700; color:#422F29; margin:0; }
        .db-act-client { font-size:11px; color:#9CA3AF; margin:2px 0 0; }
        .db-act-val { font-size:13px; font-weight:600; color:#059669; margin-left:auto; white-space:nowrap; }

        .db-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:32px 0; color:#C4C8CF; font-size:13px; }
        .db-footer { text-align:center; font-size:12px; color:#C4C8CF; margin-top:32px; }
        .db-error { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:60px 0; color:#9CA3AF; font-size:14px; }

        @media(max-width:1300px) { .db-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:1100px) { .db-row-main, .db-row-bot { grid-template-columns:1fr; } }
        @media(max-width:768px)  { .db-stats { grid-template-columns:1fr 1fr; } }
      `}</style>

      <div className="db">

        {/* ── Topbar ── */}
        <div className="db-topbar">
          <div>
            <h1 className="db-greeting">Olá! 👋</h1>
            <p className="db-greeting-sub">Aqui está o resumo dos seus orçamentos.</p>
          </div>
          <button className="db-refresh" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin .8s linear infinite' : 'none' }} />
            Atualizar
          </button>
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #FEE2E7', borderTop: '4px solid #FD2245', animation: 'spin .8s linear infinite' }} />
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="db-error">
            <XCircle size={32} color="#FCA5A5" />
            <span>Erro ao carregar os dados</span>
            <button onClick={load} style={{ fontSize: 13, color: '#FD2245', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* ── Stat Cards ── */}
            <div className="db-stats">
              {STAT_CARDS.map((s, i) => (
                <div key={i} className="db-stat">
                  <div className="db-stat-top">
                    <div>
                      <p className="db-stat-lbl">{s.lbl}</p>
                      <p className="db-stat-val">{s.val}</p>
                      <p className="db-stat-sub">{s.sub}</p>
                    </div>
                    <div className="db-stat-icon" style={{ background: s.ibg }}>{s.ic}</div>
                  </div>
                  <Sparkline data={stats.monthlyRevenue} color={s.spark} />
                </div>
              ))}
            </div>

            {/* ── Main row: Gráfico + Donut ── */}
            <div className="db-row-main">
              <div className="db-card">
                <div className="db-card-hd">
                  <h2 className="db-card-title">Faturamento (últimos 6 meses)</h2>
                </div>
                <BarChart data={stats.monthlyRevenue} />
              </div>

              <div className="db-card">
                <div className="db-card-hd">
                  <h2 className="db-card-title">Status dos orçamentos</h2>
                  <button className="db-card-link" onClick={() => navigate('/budgets')}>
                    Ver todos <ArrowRight size={12} />
                  </button>
                </div>
                {stats.statusBreakdown.length > 0
                  ? <DonutChart segments={stats.statusBreakdown} total={stats.total} />
                  : (
                    <div className="db-empty">
                      <FileText size={28} color="#E5E7EB" />
                      <span>Nenhum orçamento ainda</span>
                    </div>
                  )
                }
              </div>
            </div>

            {/* ── Bottom row ── */}
            <div className="db-row-bot">

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Taxa de conversão */}
                <div className="db-card">
                  <div className="db-card-hd">
                    <h2 className="db-card-title">Taxa de conversão</h2>
                  </div>
                  <GaugeChart
                    pct={stats.conversionRate}
                    approved={stats.approvedCount}
                    sent={stats.sentCount}
                  />
                </div>

                {/* Atividades recentes */}
                <div className="db-card">
                  <div className="db-card-hd">
                    <h2 className="db-card-title">Atividades recentes</h2>
                    <button className="db-card-link" onClick={() => navigate('/budgets')}>
                      Ver todos <ArrowRight size={12} />
                    </button>
                  </div>
                  {stats.recentActivities.length > 0
                    ? (
                      <div className="db-act">
                        {stats.recentActivities.map((a, i) => {
                          const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.draft
                          return (
                            <div key={i} className="db-act-item" onClick={() => navigate(`/budgets/${a.id}`)}>
                              <span className="db-act-dot" style={{ background: cfg.color }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="db-act-num">#{a.num} <StatusPill status={a.status} /></p>
                                <p className="db-act-client">{a.clientName}</p>
                              </div>
                              <span className="db-act-val">{currency(a.total)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                    : (
                      <div className="db-empty">
                        <FileText size={28} color="#E5E7EB" />
                        <span>Nenhuma atividade ainda</span>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* ── Top Clientes ── */}
              <div className="db-card" style={{ alignSelf: 'flex-start' }}>
                <div className="db-card-hd">
                  <h2 className="db-card-title">🏆 Top clientes</h2>
                  <button className="db-card-link" onClick={() => navigate('/budgets?status=approved')}>
                    Ver aprovados <ArrowRight size={12} />
                  </button>
                </div>
                <TopClientes clients={stats.topClients} />
              </div>

            </div>
          </>
        )}

        <p className="db-footer">© 2026 StimServ. Todos os direitos reservados.</p>
      </div>
    </Layout>
  )
}