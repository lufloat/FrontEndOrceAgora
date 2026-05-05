import { useState, useEffect } from 'react'
import { getDashboard } from '../../api/dashboard'
import { currency } from '../../utils/format'
import { Layout } from '../../components/Layout'
import {
  TrendingUp, TrendingDown, FileText, CheckCircle,
  Clock, ArrowRight, Send, XCircle, Eye
} from 'lucide-react'

const EMPTY = {
  userName: '',
  totalThisMonth: 0,
  percentChange: 0,
  totalBudgets: 0,
  budgetChange: 0,
  approvedCount: 0,
  approvedPct: 0,
  pendingCount: 0,
  monthlyRevenue: [],
  statusBreakdown: [],
  recentActivities: [],
  upcomingPayments: [],
  conversionRate: 0,
  approvedOfSent: 0,
  totalSent: 0,
  conversionChange: 0,
}

function Sparkline({ color = '#FD2245', up = true }) {
  const pts = up
    ? '0,30 20,25 40,21 60,16 80,12 100,7 120,3'
    : '0,8 20,12 40,18 60,22 80,17 100,21 120,26'
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2.2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BarChart({ data }) {
  const max = Math.max(...(data || []).map(d => d.total), 1)
  const H = 180
  const W = (data || []).length * 80
  const [hov, setHov] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4C8CF', fontSize: 13 }}>
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <svg width="100%" viewBox={`-32 -10 ${W + 40} ${H + 50}`} style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <g key={i}>
          <line x1="0" y1={H - f * H} x2={W} y2={H - f * H} stroke="#F3F4F6" strokeWidth="1" />
          <text x="-8" y={H - f * H + 4} textAnchor="end" fontSize="9" fill="#C4C8CF">
            R${Math.round(max * f / 1000)}k
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const barH = Math.max((d.total / max) * H, 4)
        const x = i * 80 + 10
        const y = H - barH
        const isHov = hov === i
        return (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={0} width={52} height={H} rx="6" fill="transparent" />
            <rect x={x} y={y} width={52} height={barH} rx="8"
              fill={isHov ? '#FD2245' : '#FEE2E7'} style={{ transition: 'fill .15s' }} />
            {isHov && (
              <>
                <rect x={x - 4} y={y - 38} width={60} height={28} rx="7" fill="#422F29" />
                <text x={x + 22} y={y - 19} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                  R${Math.round(d.total / 1000)}k
                </text>
                <text x={x + 22} y={y - 8} textAnchor="middle" fontSize="9" fill="#C4A89A">
                  {d.month}
                </text>
              </>
            )}
            <text x={x + 26} y={H + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">{d.month}</text>
          </g>
        )
      })}
    </svg>
  )
}

function DonutChart({ segments, total }) {
  const R = 68, cx = 90, cy = 90, sw = 26
  const circ = 2 * Math.PI * R
  let cum = 0
  const arcs = (segments || []).map(s => {
    const da = (s.pct / 100) * circ
    const off = -cum / 100 * circ
    cum += s.pct
    return { ...s, da, off }
  })
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={R}
          fill="none" stroke={a.color} strokeWidth={sw}
          strokeDasharray={`${a.da} ${circ}`}
          strokeDashoffset={a.off}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="800" fill="#422F29">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#9CA3AF">Total</text>
    </svg>
  )
}

function GaugeChart({ pct }) {
  const R = 66, cx = 100, cy = 100
  const circ = Math.PI * R
  const fill = (pct / 100) * circ
  return (
    <svg width="200" height="116" viewBox="0 0 200 116">
      <circle cx={cx} cy={cx} r={R} fill="none" stroke="#F1F1F1" strokeWidth="20"
        strokeDasharray={`${circ} ${circ}`}
        style={{ transform: 'rotate(180deg)', transformOrigin: `${cx}px ${cx}px` }} />
      <circle cx={cx} cy={cx} r={R} fill="none" stroke="#038C7F" strokeWidth="20"
        strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
        style={{ transform: 'rotate(180deg)', transformOrigin: `${cx}px ${cx}px`, transition: 'stroke-dasharray .8s ease' }} />
      <text x={cx} y={cx - 6} textAnchor="middle" fontSize="30" fontWeight="800" fill="#422F29">{pct}%</text>
      <text x={cx} y={cx + 14} textAnchor="middle" fontSize="11" fill="#9CA3AF">Taxa de conversão</text>
    </svg>
  )
}

const ACT = {
  approve: { Icon: CheckCircle, bg: '#ECFDF5', c: '#059669' },
  view:    { Icon: Eye,         bg: '#EFF6FF', c: '#2563EB' },
  send:    { Icon: Send,        bg: '#FFFBEB', c: '#D97706' },
  create:  { Icon: FileText,    bg: '#F5F3FF', c: '#7C3AED' },
  reject:  { Icon: XCircle,     bg: '#FFF1F2', c: '#FD2245' },
}

export default function Dashboard() {
  const [d, setD] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(r => setD(prev => ({ ...prev, ...r.data })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '4px solid #FD224530', borderTop: '4px solid #FD2245',
          animation: 'spin .8s linear infinite'
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .db, .db * { font-family:'Inter',sans-serif; box-sizing:border-box; }
        .db { background:#F1F1F1; padding:0 0 48px; }

        /* ── Topbar: apenas saudação, sem barra de pesquisa ── */
        .db-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0 28px;
        }
        .db-greeting { font-size:26px; font-weight:800; color:#422F29; margin:0 0 4px; letter-spacing:-.5px; }
        .db-greeting-sub { font-size:13px; color:#9CA3AF; margin:0; }

        .db-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
        .db-stat { background:#fff; border-radius:14px; padding:18px 20px; border:1px solid #EBEBEB; }
        .db-stat-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
        .db-stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-stat-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.6px; color:#9CA3AF; margin:0 0 4px; }
        .db-stat-val { font-size:20px; font-weight:800; color:#422F29; margin:0; letter-spacing:-.5px; }
        .db-stat-trend { display:flex; align-items:center; gap:4px; margin-top:3px; font-size:12px; font-weight:500; }

        .db-card { background:#fff; border-radius:14px; padding:22px 24px; border:1px solid #EBEBEB; }
        .db-card-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .db-card-title { font-size:15px; font-weight:700; color:#422F29; margin:0; }

        .db-row-main { display:grid; grid-template-columns:1fr 320px 264px; gap:14px; margin-bottom:14px; }
        .db-row-bot { display:grid; grid-template-columns:1fr 264px; gap:14px; }
        .db-right-col { display:flex; flex-direction:column; gap:14px; }

        .db-act { display:flex; flex-direction:column; gap:12px; }
        .db-act-item { display:flex; align-items:flex-start; gap:10px; }
        .db-act-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .db-act-num { font-size:13px; font-weight:600; color:#FD2245; margin:0 0 1px; }
        .db-act-sub { font-size:12px; color:#374151; margin:0 0 1px; }
        .db-act-time { font-size:11px; color:#9CA3AF; margin:0; }

        .db-legend { display:flex; flex-direction:column; gap:8px; }
        .db-legend-row { display:flex; align-items:center; gap:8px; }
        .db-legend-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .db-legend-lbl { font-size:12px; color:#6B7280; flex:1; }
        .db-legend-cnt { font-size:12px; font-weight:600; color:#422F29; }
        .db-legend-pct { font-size:11px; color:#9CA3AF; width:38px; text-align:right; }

        .db-upcoming { display:flex; flex-direction:column; }
        .db-up-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F1F1F1; }
        .db-up-row:last-child { border-bottom:none; }
        .db-up-num { font-size:13px; font-weight:700; color:#422F29; margin:0 0 2px; }
        .db-up-desc { font-size:11px; color:#9CA3AF; margin:0; }
        .db-up-val { font-size:14px; font-weight:700; color:#FD2245; }

        .db-empty-act { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:24px 0; color:#C4C8CF; font-size:13px; }

        .db-see-all { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:14px; padding-top:14px; border-top:1px solid #F1F1F1; font-size:13px; font-weight:600; color:#FD2245; cursor:pointer; text-decoration:none; background:none; border-left:none; border-right:none; border-bottom:none; width:100%; }

        .db-footer { text-align:center; font-size:12px; color:#C4C8CF; margin-top:32px; }

        @media(max-width:1200px) {
          .db-row-main { grid-template-columns:1fr 1fr; }
          .db-row-bot { grid-template-columns:1fr; }
        }
        @media(max-width:768px) {
          .db-stats { grid-template-columns:1fr 1fr; }
          .db-row-main, .db-row-bot { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="db">

        {/* ── Top bar — só saudação ── */}
        <div className="db-topbar">
          <div>
            <h1 className="db-greeting">Olá{d.userName ? `, ${d.userName}` : ''}! 👋</h1>
            <p className="db-greeting-sub">Aqui está o resumo do seu negócio hoje.</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="db-stats">
          {[
            { lbl:'FATURAMENTO', val: currency(d.totalThisMonth), trend: d.percentChange !== 0 ? `${d.percentChange > 0 ? '+' : ''}${d.percentChange}% vs mês anterior` : 'Sem variação', up: d.percentChange > 0 ? true : d.percentChange < 0 ? false : null, ic:<TrendingUp size={20} color="#FD2245" />, ibg:'#FFF0F2', sc: d.percentChange >= 0 ? '#059669' : '#FD2245', spark:'#FD2245' },
            { lbl:'ORÇAMENTOS',  val: d.totalBudgets,            trend: d.budgetChange !== 0 ? `${d.budgetChange > 0 ? '+' : ''}${d.budgetChange}% vs mês anterior` : 'Sem variação', up: d.budgetChange > 0 ? true : d.budgetChange < 0 ? false : null, ic:<FileText size={20} color="#059669" />, ibg:'#F0FDF4', sc:'#059669', spark:'#059669' },
            { lbl:'APROVADOS',   val: d.approvedCount,           trend: d.approvedPct > 0 ? `${d.approvedPct}% do total enviados` : 'Aguardando aprovações', up: null, ic:<CheckCircle size={20} color="#D97706" />, ibg:'#FFFBEB', sc:'#9CA3AF', spark:'#D97706' },
            { lbl:'PENDENTES',   val: d.pendingCount,            trend:'Aguardando resposta', up:false, ic:<Clock size={20} color="#422F29" />, ibg:'#F9FAFB', sc:'#9CA3AF', spark:'#422F29' },
          ].map((s, i) => (
            <div key={i} className="db-stat">
              <div className="db-stat-top">
                <div>
                  <p className="db-stat-lbl">{s.lbl}</p>
                  <p className="db-stat-val">{s.val}</p>
                  <div className="db-stat-trend">
                    {s.up === true  && <TrendingUp size={12} color="#059669" />}
                    {s.up === false && <TrendingDown size={12} color="#9CA3AF" />}
                    <span style={{ color: s.sc }}>{s.trend}</span>
                  </div>
                </div>
                <div className="db-stat-icon" style={{ background: s.ibg }}>{s.ic}</div>
              </div>
              <Sparkline color={s.spark} up={s.up !== false} />
            </div>
          ))}
        </div>

        {/* ── Main row ── */}
        <div className="db-row-main">

          <div className="db-card">
            <div className="db-card-hd">
              <h2 className="db-card-title">Faturamento dos últimos 6 meses</h2>
            </div>
            <BarChart data={d.monthlyRevenue} />
          </div>

          <div className="db-card">
            <div className="db-card-hd">
              <h2 className="db-card-title">Status dos orçamentos</h2>
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <DonutChart segments={d.statusBreakdown} total={d.totalBudgets} />
            </div>
            <div className="db-legend">
              {d.statusBreakdown && d.statusBreakdown.length > 0
                ? d.statusBreakdown.map(s => (
                    <div key={s.label} className="db-legend-row">
                      <span className="db-legend-dot" style={{ background: s.color }} />
                      <span className="db-legend-lbl">{s.label}</span>
                      <span className="db-legend-cnt">{s.count}</span>
                      <span className="db-legend-pct">({s.pct}%)</span>
                    </div>
                  ))
                : <p style={{ fontSize: 13, color: '#C4C8CF', textAlign: 'center', margin: 0 }}>Nenhum orçamento ainda</p>
              }
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-hd">
              <h2 className="db-card-title">Atividades recentes</h2>
            </div>
            <div className="db-act">
              {d.recentActivities && d.recentActivities.length > 0
                ? d.recentActivities.map((a, i) => {
                    const { Icon, bg, c } = ACT[a.icon] || ACT.create
                    return (
                      <div key={i} className="db-act-item">
                        <div className="db-act-icon" style={{ background: bg }}>
                          <Icon size={14} color={c} />
                        </div>
                        <div>
                          <p className="db-act-num">Orçamento #{a.num}</p>
                          <p className="db-act-sub">{a.action}{a.person ? ` ${a.person}` : ''}</p>
                          <p className="db-act-time">{a.time}</p>
                        </div>
                      </div>
                    )
                  })
                : (
                  <div className="db-empty-act">
                    <FileText size={28} color="#E5E7EB" />
                    <span>Nenhuma atividade recente</span>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="db-row-bot">

          <div className="db-card">
            <div className="db-card-hd"><h2 className="db-card-title">Conversão de orçamentos</h2></div>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <GaugeChart pct={d.conversionRate} />
            </div>
            <p style={{ textAlign:'center', fontSize:13, color:'#6B7280', marginTop:6 }}>
              {d.approvedOfSent} aprovados de {d.totalSent} enviados
            </p>
            {d.conversionChange !== 0 && (
              <p style={{ textAlign:'center', fontSize:12, fontWeight:600, color: d.conversionChange > 0 ? '#059669' : '#FD2245', marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                <TrendingUp size={12} /> {d.conversionChange > 0 ? '+' : ''}{d.conversionChange}% vs mês anterior
              </p>
            )}
          </div>

          <div className="db-right-col">
            <div className="db-card">
              <div className="db-card-hd"><h2 className="db-card-title">Próximos vencimentos</h2></div>
              <div className="db-upcoming">
                {d.upcomingPayments && d.upcomingPayments.length > 0
                  ? d.upcomingPayments.map((p, i) => (
                      <div key={i} className="db-up-row">
                        <div>
                          <p className="db-up-num">#{p.num}</p>
                          <p className="db-up-desc">{p.desc}</p>
                        </div>
                        <span className="db-up-val">{currency(p.value)}</span>
                      </div>
                    ))
                  : <p style={{ fontSize: 13, color: '#C4C8CF', textAlign: 'center', padding: '16px 0', margin: 0 }}>Nenhum vencimento próximo</p>
                }
              </div>
              <button className="db-see-all">Ver todos <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>

        <p className="db-footer">© 2026 StimServ. Todos os direitos reservados.</p>
      </div>
    </Layout>
  )
}