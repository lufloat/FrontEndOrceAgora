import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getEvents, createEvent, updateEvent, toggleDone, deleteEvent } from '../../api/agenda'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import {
  Plus, Trash2, Pencil, Bell,
  AlertCircle, ChevronLeft, ChevronRight, Calendar,
  Phone, FileText, Circle, CheckCircle
} from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────
const TODAY = new Date()
const pad = n => String(n).padStart(2, '0')
const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

const MOCK_EVENTS = [
  { id:1, title:'Follow-up com João Silva',      notes:'Orçamento #000123', reminderAt: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 14, 30).toISOString(), done:false, isOverdue:false, color:'#FD2245', icon:'bell'  },
  { id:2, title:'Ligar para Maria Santos',        notes:'Proposta enviada',  reminderAt: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()+1, 9, 0).toISOString(),  done:false, isOverdue:false, color:'#F59E0B', icon:'phone' },
  { id:3, title:'Reunião - Pedro Costa',          notes:'Apresentação de projeto', reminderAt: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()+5, 10, 0).toISOString(), done:false, isOverdue:false, color:'#027373', icon:'calendar' },
  { id:4, title:'Enviar orçamento atualizado',    notes:'Cliente: Empresa Alpha',  reminderAt: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()+8, 15, 0).toISOString(), done:false, isOverdue:false, color:'#4F46E5', icon:'file' },
  { id:5, title:'Verificar aprovação',            notes:'Orçamento #000120',       reminderAt: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()+12, 11, 0).toISOString(), done:false, isOverdue:false, color:'#7C3AED', icon:'bell' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fmtShortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const t = new Date()
  if (fmtDate(d) === fmtDate(t)) return 'Hoje'
  const tom = new Date(t); tom.setDate(t.getDate()+1)
  if (fmtDate(d) === fmtDate(tom)) return 'Amanhã'
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`
}

function getIconComp(icon, size=15) {
  if (icon === 'phone')    return <Phone size={size} />
  if (icon === 'calendar') return <Calendar size={size} />
  if (icon === 'file')     return <FileText size={size} />
  return <Bell size={size} />
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function MonthCalendar({ year, month, events }) {
  const [hovDay, setHovDay] = useState(null)
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDay-1; i >= 0; i--)
    cells.push({ day: prevDays-i, cur: false })
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, cur: true })
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false })

  const todayStr = fmtDate(TODAY)

  const eventsForDay = (day, cur) => {
    if (!cur) return []
    const dStr = `${year}-${pad(month+1)}-${pad(day)}`
    return events.filter(e => e.reminderAt && fmtDate(new Date(e.reminderAt)) === dStr)
  }

  const isToday   = (day, cur) => cur && `${year}-${pad(month+1)}-${pad(day)}` === todayStr
  const isWeekend = (i) => i % 7 === 0 || i % 7 === 6

  return (
    <div style={{ fontFamily:'Inter,sans-serif' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid #F3F4F6', padding:'0 4px' }}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} style={{
            padding:'14px 0', textAlign:'center',
            fontSize:11, fontWeight:700, letterSpacing:'.8px', textTransform:'uppercase',
            color: i===0||i===6 ? '#CBD5E1' : '#94A3B8'
          }}>{w}</div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
        {cells.map((c, i) => {
          const evs     = eventsForDay(c.day, c.cur)
          const today   = isToday(c.day, c.cur)
          const isHov   = hovDay === i
          const weekend = isWeekend(i)

          return (
            <div
              key={i}
              onMouseEnter={() => c.cur && setHovDay(i)}
              onMouseLeave={() => setHovDay(null)}
              style={{
                minHeight: 96,
                padding: '10px 10px 8px',
                borderRight: i%7===6 ? 'none' : '1px solid #F8F8F8',
                borderBottom: '1px solid #F8F8F8',
                background: today
                  ? 'linear-gradient(145deg,#FFFBF5,#FFF7ED)'
                  : isHov && c.cur ? '#FAFBFF'
                  : weekend && c.cur ? '#FCFCFC' : '#fff',
                transition: 'background .15s',
                cursor: c.cur ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:6 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13,
                  fontWeight: today ? 800 : c.cur ? 500 : 400,
                  color: today ? '#fff' : !c.cur ? '#D1D5DB' : weekend ? '#94A3B8' : '#374151',
                  background: today ? '#027373' : 'transparent',
                  boxShadow: today ? '0 2px 8px rgba(2,115,115,.35)' : 'none',
                  transition: 'all .15s',
                }}>
                  {c.day}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {evs.slice(0,2).map((e, j) => (
                  <div key={j} style={{
                    display:'flex', alignItems:'center', gap:4,
                    padding:'3px 7px', borderRadius:6,
                    background: e.color+'14', borderLeft:`3px solid ${e.color}`,
                    fontSize:10.5, fontWeight:600, color: e.color,
                    whiteSpace:'nowrap', overflow:'hidden',
                    boxShadow:`0 1px 3px ${e.color}20`, cursor:'pointer',
                  }}>
                    <span style={{ fontWeight:700, flexShrink:0, fontFamily:'monospace', fontSize:10 }}>
                      {fmtTime(e.reminderAt)}
                    </span>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>
                      {e.title.length > 12 ? e.title.slice(0,12)+'…' : e.title}
                    </span>
                  </div>
                ))}
                {evs.length > 2 && (
                  <div style={{ fontSize:10, color:'#94A3B8', fontWeight:600, paddingLeft:4 }}>
                    +{evs.length-2} mais
                  </div>
                )}
              </div>

              {evs.length > 0 && c.cur && !today && evs.length <= 2 && (
                <div style={{
                  position:'absolute', top:8, left:8,
                  width:5, height:5, borderRadius:'50%',
                  background: evs[0].color,
                  boxShadow:`0 0 0 2px ${evs[0].color}30`,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Agenda() {
  const [events, setEvents]       = useState(MOCK_EVENTS)
  const [loading, setLoading]     = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [calYear, setCalYear]     = useState(TODAY.getFullYear())
  const [calMonth, setCalMonth]   = useState(TODAY.getMonth())
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    try {
      setLoading(true)
      const res = await getEvents(false)
      setEvents(res.data)
    } catch {
      // keep mock
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({ title:'', notes:'', reminderAt:'' }); setModalOpen(true) }
  const openEdit   = (e) => { setEditing(e); reset({ title:e.title, notes:e.notes||'', reminderAt: e.reminderAt ? new Date(e.reminderAt).toISOString().slice(0,16) : '' }); setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, reminderAt: data.reminderAt ? new Date(data.reminderAt).toISOString() : null }
      if (editing) { await updateEvent(editing.id, payload); toast.success('Lembrete atualizado!') }
      else         { await createEvent(payload); toast.success('Lembrete criado!') }
      setModalOpen(false); load()
    } catch { toast.error('Erro ao salvar') }
  }

  const handleToggle = async (id) => {
    try { await toggleDone(id); load() } catch { toast.error('Erro') }
  }
  const handleDelete = async (id) => {
    if (!confirm('Deletar este lembrete?')) return
    try { await deleteEvent(id); toast.success('Removido'); load() } catch { toast.error('Erro') }
  }

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11) } else setCalMonth(m => m-1) }
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0) } else setCalMonth(m => m+1) }

  const pending    = events.filter(e => !e.done)
  const overdueEv  = events.filter(e => e.isOverdue)
  const thisWeek   = events.filter(e => {
    if (!e.reminderAt) return false
    const d = new Date(e.reminderAt), now = new Date()
    const diff = (d - now) / 86400000
    return diff >= 0 && diff <= 7
  })

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ag, .ag * { font-family:'Inter',sans-serif; box-sizing:border-box; }
        .ag { padding: 0 0 48px; }

        .ag-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

        .ag-header { display:flex; align-items:flex-start; justify-content:space-between; padding: 32px 0 22px; }
        .ag-title  { font-size:28px; font-weight:800; color:#0D0D0D; margin:0 0 3px; letter-spacing:-.5px; }
        .ag-sub    { font-size:13px; color:#9CA3AF; margin:0; }
        .ag-new-btn { display:flex; align-items:center; gap:7px; padding:10px 20px; background:#027373; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:.15s; white-space:nowrap; }
        .ag-new-btn:hover { background:#025E5E; box-shadow:0 4px 14px rgba(2,115,115,.3); }

        .ag-toolbar { display:flex; align-items:center; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
        .ag-filter-btn { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; border:1.5px solid #027373; background:#EBF5F4; font-size:13px; font-weight:500; color:#027373; cursor:default; }
        .ag-filter-badge { font-size:11px; font-weight:700; padding:1px 7px; border-radius:20px; background:#027373; color:#fff; }
        .ag-toolbar-sep { flex:1; }
        .ag-cal-nav { display:flex; align-items:center; gap:6px; }
        .ag-cal-nav-btn { width:32px; height:32px; border:1.5px solid #E5E7EB; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B7280; transition:.15s; }
        .ag-cal-nav-btn:hover { border-color:#027373; color:#027373; }
        .ag-cal-month { display:flex; align-items:center; gap:7px; padding:7px 14px; border:1.5px solid #E5E7EB; background:#fff; border-radius:8px; font-size:13px; font-weight:600; color:#374151; }
        .ag-view-btn { padding:7px 14px; border:1.5px solid #E5E7EB; background:#fff; border-radius:8px; font-size:13px; font-weight:500; color:#374151; cursor:pointer; display:flex; align-items:center; gap:5px; }

        .ag-layout { display:grid; grid-template-columns:340px 1fr; gap:18px; align-items:start; }

        .ag-panel { background:#fff; border:1px solid #EBEBEB; border-radius:14px; padding:20px; }
        .ag-panel-title { font-size:15px; font-weight:700; color:#0D0D0D; margin:0 0 14px; display:flex; align-items:center; gap:8px; }
        .ag-panel-count { font-size:12px; font-weight:700; background:#F1F1F1; color:#6B7280; padding:2px 8px; border-radius:20px; }

        .ag-ev { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid #F5F5F5; position:relative; }
        .ag-ev:last-of-type { border-bottom:none; }
        .ag-ev-bar  { width:3px; flex-shrink:0; border-radius:4px; align-self:stretch; min-height:48px; }
        .ag-ev-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ag-ev-body { flex:1; min-width:0; }
        .ag-ev-name { font-size:13px; font-weight:600; color:#0D0D0D; margin:0 0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ag-ev-note { font-size:11px; color:#9CA3AF; margin:0; }
        .ag-ev-right { text-align:right; flex-shrink:0; }
        .ag-ev-date  { font-size:12px; font-weight:500; color:#9CA3AF; margin:0 0 2px; }
        .ag-ev-time  { font-size:13px; font-weight:700; }
        .ag-ev-actions { display:flex; gap:2px; opacity:0; transition:.15s; }
        .ag-ev:hover .ag-ev-actions { opacity:1; }
        .ag-ev-act-btn { width:26px; height:26px; border:none; background:none; cursor:pointer; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#C4C8CF; transition:.15s; }
        .ag-ev-act-btn:hover { background:#F5F5F5; color:#6B7280; }
        .ag-ev-act-btn.del:hover { background:#FFF1F2; color:#FD2245; }

        .ag-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
        .ag-stat { border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
        .ag-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ag-stat-num { font-size:20px; font-weight:800; color:#0D0D0D; line-height:1; }
        .ag-stat-lbl { font-size:11px; color:#6B7280; margin-top:2px; }

        .ag-cal-card { background:#fff; border:1px solid #EBEBEB; border-radius:14px; overflow:hidden; }

        @media(max-width:1024px) { .ag-layout { grid-template-columns:1fr; } }
        @media(max-width:600px)  { .ag-stats { grid-template-columns:1fr 1fr; } .ag-toolbar { gap:6px; } }
      `}</style>

      <div className="ag">
        <div className="ag-inner">

          {/* Header */}
          <div className="ag-header">
            <div>
              <h1 className="ag-title">Agenda</h1>
              <p className="ag-sub">Organize seus lembretes e compromissos</p>
            </div>
            <button className="ag-new-btn" onClick={openCreate}>
              <Plus size={16} /> Novo lembrete
            </button>
          </div>

          {/* Toolbar */}
          <div className="ag-toolbar">
            <div className="ag-filter-btn">
              <Circle size={14} />
              Pendentes
              <span className="ag-filter-badge">{pending.length}</span>
            </div>

            <div className="ag-toolbar-sep" />

            <div className="ag-cal-nav">
              <button className="ag-cal-nav-btn" onClick={prevMonth}><ChevronLeft size={15} /></button>
              <div className="ag-cal-month">
                <Calendar size={14} style={{ color:'#027373' }} />
                {MONTHS[calMonth]} de {calYear}
              </div>
              <button className="ag-cal-nav-btn" onClick={nextMonth}><ChevronRight size={15} /></button>
            </div>
            <button className="ag-view-btn">Mês <ChevronRight size={14} /></button>
          </div>

          {/* Body */}
          <div className="ag-layout">

            {/* Left panel */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              <div className="ag-panel">
                <h2 className="ag-panel-title">
                  Próximos lembretes
                  <span className="ag-panel-count">{pending.length}</span>
                </h2>

                {pending.slice(0,5).map(ev => (
                  <div key={ev.id} className="ag-ev">
                    <div className="ag-ev-bar" style={{ background: ev.color }} />
                    <div className="ag-ev-icon" style={{ background: ev.color+'18', color: ev.color }}>
                      {getIconComp(ev.icon)}
                    </div>
                    <div className="ag-ev-body">
                      <p className="ag-ev-name">{ev.title}</p>
                      <p className="ag-ev-note">{ev.notes}</p>
                    </div>
                    <div className="ag-ev-right">
                      <p className="ag-ev-date" style={{ color: ev.isOverdue ? '#FD2245' : '#6B7280' }}>
                        {fmtShortDate(ev.reminderAt)}
                      </p>
                      <p className="ag-ev-time" style={{ color: ev.color }}>
                        {fmtTime(ev.reminderAt)}
                      </p>
                      <div className="ag-ev-actions" style={{ justifyContent:'flex-end', marginTop:4 }}>
                        <button className="ag-ev-act-btn" onClick={() => openEdit(ev)}><Pencil size={12} /></button>
                        <button className="ag-ev-act-btn del" onClick={() => handleDelete(ev.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div className="ag-panel">
                <h2 className="ag-panel-title">Resumo rápido</h2>
                <div className="ag-stats">
                  <div className="ag-stat" style={{ background:'#EBF5F4' }}>
                    <div className="ag-stat-icon" style={{ background:'#D1EAE8' }}>
                      <Circle size={16} color="#027373" />
                    </div>
                    <div>
                      <div className="ag-stat-num">{pending.length}</div>
                      <div className="ag-stat-lbl">Pendentes</div>
                    </div>
                  </div>
                  <div className="ag-stat" style={{ background:'#EFF6FF' }}>
                    <div className="ag-stat-icon" style={{ background:'#DBEAFE' }}>
                      <Calendar size={16} color="#2563EB" />
                    </div>
                    <div>
                      <div className="ag-stat-num">{thisWeek.length}</div>
                      <div className="ag-stat-lbl">Esta semana</div>
                    </div>
                  </div>
                  <div className="ag-stat" style={{ background:'#FFF1F2' }}>
                    <div className="ag-stat-icon" style={{ background:'#FFE4E6' }}>
                      <AlertCircle size={16} color="#FD2245" />
                    </div>
                    <div>
                      <div className="ag-stat-num" style={{ color:'#FD2245' }}>{overdueEv.length}</div>
                      <div className="ag-stat-lbl" style={{ color:'#FD2245' }}>Vencidos</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Calendar */}
            <div className="ag-cal-card">
              <MonthCalendar year={calYear} month={calMonth} events={events} />
            </div>

          </div>

        </div>{/* /ag-inner */}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar lembrete' : 'Novo lembrete'}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Input label="Título *" placeholder="Ex: Ligar para o João, Cobrar pagamento..."
            error={errors.title?.message}
            {...register('title', { required: 'Informe o título' })} />
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:6 }}>Observações</label>
            <textarea style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1.5px solid #E5E7EB', fontSize:13, color:'#374151', outline:'none', resize:'none', height:80, fontFamily:'Inter,sans-serif' }}
              placeholder="Detalhes do lembrete..." {...register('notes')} />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:'#374151', display:'block', marginBottom:6 }}>Data e hora do lembrete</label>
            <input type="datetime-local" style={{ width:'100%', padding:'10px 12px', borderRadius:9, border:'1.5px solid #E5E7EB', fontSize:13, color:'#374151', outline:'none', fontFamily:'Inter,sans-serif' }}
              {...register('reminderAt')} />
          </div>
          {editing && (
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#374151' }}>
              <input type="checkbox" style={{ accentColor:'#027373', width:16, height:16 }} {...register('done')} />
              Marcar como concluído
            </label>
          )}
          <div style={{ display:'flex', gap:10, paddingTop:6 }}>
            <button type="button" onClick={() => setModalOpen(false)}
              style={{ flex:1, padding:'10px 0', borderRadius:9, border:'1.5px solid #E5E7EB', background:'#fff', fontSize:13, fontWeight:500, color:'#6B7280', cursor:'pointer' }}>
              Cancelar
            </button>
            <button type="submit"
              style={{ flex:1, padding:'10px 0', borderRadius:9, border:'none', background:'#027373', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {editing ? 'Salvar' : 'Criar lembrete'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}