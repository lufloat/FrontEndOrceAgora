import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { createBudget } from '../../api/budgets'
import { getClients } from '../../api/clients'
import { getTemplates } from '../../api/templates'
import { currency } from '../../utils/format'
import { Layout } from '../../components/Layout'
import {
  Plus, Trash2, ChevronDown, FileText,
  Users, ShoppingCart, Tag, ClipboardList,
  Minus, ArrowRight, Eye, Link2, Upload, Wrench
} from 'lucide-react'

const LABOR_TYPES = [
  { value: 'hourly', label: 'Por hora' },
  { value: 'daily',  label: 'Por dia'  },
]

export default function NewBudget() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { discountType: 'fixed', discountValue: 0, extras: 0, validityDays: 30 }
  })

  const [clients, setClients]           = useState([])
  const [templates, setTemplates]       = useState([])
  const [items, setItems]               = useState([
    { id: '1', name: '', desc: '', qty: 1, unitPrice: 0 },
    { id: '2', name: '', desc: '', qty: 1, unitPrice: 0 },
  ])
  const [labor, setLabor] = useState({ name: '', laborType: 'hourly', qty: 1, unitPrice: 0 })
  const [useNewClient, setUseNewClient] = useState(false)
  const [loading, setLoading]           = useState(false)

  const discountType  = watch('discountType')
  const discountValue = parseFloat(watch('discountValue') || 0)
  const extras        = parseFloat(watch('extras') || 0)

  useEffect(() => {
    getClients().then(r => setClients(r.data)).catch(() => {})
    getTemplates().then(r => setTemplates(r.data)).catch(() => {})
  }, [])

  const subtotalMat    = items.reduce((a, i) => a + i.qty * i.unitPrice, 0)
  const subtotalLabor  = labor.unitPrice > 0 ? labor.qty * labor.unitPrice : 0
  const subtotal       = subtotalMat + subtotalLabor
  const discountAmount = discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue
  const total          = subtotal - discountAmount + extras

  const addItem    = () => setItems(p => [...p, {
    id: crypto.randomUUID(), name: '', desc: '', qty: 1, unitPrice: 0
  }])
  const updateItem = (id, field, value) => setItems(p => p.map(i => {
    if (i.id !== id) return i
    if (['name', 'desc'].includes(field)) return { ...i, [field]: value }
    return { ...i, [field]: parseFloat(value) || 0 }
  }))
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id))
  const changeQty  = (id, delta) => setItems(p => p.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))

  const updateLabor = (field, value) => setLabor(p => ({
    ...p,
    [field]: ['name', 'laborType'].includes(field) ? value : (parseFloat(value) || 0)
  }))
  const changeLaborQty = (delta) => setLabor(p => ({ ...p, qty: Math.max(1, p.qty + delta) }))

  const handleValidityDate = (e) => {
    if (!e.target.value) return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const chosen = new Date(e.target.value + 'T00:00:00')
    const diffDays = Math.round((chosen - today) / (1000 * 60 * 60 * 24))
    setValue('validityDays', diffDays > 0 ? diffDays : 1)
  }

  const defaultDateValue = (() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })()

  const onSubmit = async (data) => {
    if (!items.length && !labor.unitPrice) { toast.error('Adicione pelo menos um item'); return }
    try {
      setLoading(true)
      const allItems = [
        ...items.map(i => ({
          name: i.name, qty: i.qty, unitPrice: i.unitPrice,
          isLabor: false, laborType: null, desc: i.desc
        })),
        ...(labor.unitPrice > 0 ? [{
          name: labor.name || 'Mão de obra',
          qty: labor.qty,
          unitPrice: labor.unitPrice,
          isLabor: true,
          laborType: labor.laborType,
          desc: ''
        }] : [])
      ]
      const payload = {
        clientId: useNewClient ? null : data.clientId || null,
        clientName: useNewClient ? data.clientName : null,
        clientPhone: useNewClient ? data.clientPhone : null,
        items: allItems,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue) || 0,
        extras: parseFloat(data.extras) || 0,
        extrasDescription: data.extrasDescription,
        validityDays: parseInt(data.validityDays),
        notes: data.notes,
        paymentMethods: data.paymentMethods,
      }
      const res = await createBudget(payload)
      toast.success('Orçamento criado!')
      navigate(`/budgets/${res.data.id}`)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.includes('Limite')) { toast.error(msg, { duration: 5000 }); navigate('/planos') }
      else toast.error('Erro ao criar orçamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .nb-root { font-family:'Inter',sans-serif; padding:0 0 40px; }
        .nb-layout { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
        .nb-card { background:#fff; border:1px solid #E5E7EB; border-radius:14px; padding:24px; margin-bottom:16px; }
        .nb-card-title { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:#0D0D0D; margin-bottom:20px; }
        .nb-card-title-icon { width:32px; height:32px; border-radius:8px; background:#EBF5F4; display:flex; align-items:center; justify-content:center; color:#027373; }
        .nb-toggle { display:flex; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:4px; gap:4px; margin-bottom:16px; }
        .nb-toggle-btn { flex:1; padding:9px 0; border-radius:7px; border:none; font-size:13px; font-weight:500; cursor:pointer; transition:.15s; display:flex; align-items:center; justify-content:center; gap:6px; color:#6B7280; background:transparent; }
        .nb-toggle-btn.active { background:#027373; color:#fff; box-shadow:0 2px 8px rgba(2,115,115,.25); }
        .nb-search { display:flex; align-items:center; gap:10px; border:1.5px solid #E5E7EB; border-radius:10px; padding:0 14px; background:#fff; transition:.15s; }
        .nb-search:focus-within { border-color:#027373; box-shadow:0 0 0 3px rgba(2,115,115,.1); }
        .nb-search input { flex:1; border:none; outline:none; font-size:14px; color:#374151; padding:12px 0; background:transparent; }
        .nb-search input::placeholder { color:#C4C8CF; }
        .nb-items-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .nb-btn-outline { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:9px; border:1.5px solid #E5E7EB; background:#fff; font-size:12px; font-weight:500; color:#374151; cursor:pointer; transition:.15s; }
        .nb-btn-outline:hover { border-color:#027373; color:#027373; }
        .nb-btn-primary { display:flex; align-items:center; gap:6px; padding:9px 16px; border-radius:9px; border:none; background:#027373; color:#fff; font-size:13px; font-weight:600; cursor:pointer; transition:.15s; }
        .nb-btn-primary:hover { background:#025E5E; }
        .nb-btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .nb-col-headers { display:grid; grid-template-columns:2fr 2fr 120px 130px 110px 36px; gap:12px; padding:8px 12px; font-size:11px; font-weight:600; color:#9CA3AF; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #F3F4F6; margin-bottom:4px; }
        .nb-item-row { display:grid; grid-template-columns:2fr 2fr 120px 130px 110px 36px; gap:12px; align-items:center; padding:12px; border:1px solid #F3F4F6; border-radius:10px; margin-bottom:6px; background:#FAFAFA; transition:.15s; }
        .nb-item-row:hover { border-color:#E5E7EB; background:#fff; }
        .nb-input { width:100%; padding:8px 10px; border-radius:8px; border:1.5px solid #E5E7EB; font-size:13px; color:#374151; outline:none; background:#fff; transition:.15s; box-sizing:border-box; }
        .nb-input:focus { border-color:#027373; box-shadow:0 0 0 3px rgba(2,115,115,.1); }
        .nb-input::placeholder { color:#C4C8CF; }
        .nb-qty-ctrl { display:flex; align-items:center; gap:4px; }
        .nb-qty-btn { width:26px; height:26px; border-radius:6px; border:1.5px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6B7280; transition:.15s; }
        .nb-qty-btn:hover { border-color:#027373; color:#027373; }
        .nb-qty-val { width:32px; text-align:center; font-size:13px; font-weight:600; color:#0D0D0D; }
        .nb-item-total { font-size:14px; font-weight:600; color:#0D0D0D; }
        .nb-del-btn { width:32px; height:32px; border-radius:7px; border:1.5px solid #FEE2E2; background:#FFF5F5; display:flex; align-items:center; justify-content:center; color:#D95252; cursor:pointer; transition:.15s; flex-shrink:0; }
        .nb-del-btn:hover { background:#FEE2E2; }
        .nb-add-row { width:100%; margin-top:8px; padding:14px; border-radius:10px; border:1.5px dashed #E5E7EB; background:#FAFAFA; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; font-weight:500; color:#9CA3AF; cursor:pointer; transition:.15s; }
        .nb-add-row:hover { border-color:#027373; color:#027373; background:#EBF5F4; }
        .nb-val-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .nb-label { font-size:12px; font-weight:500; color:#374151; margin-bottom:6px; display:block; }
        .nb-select { width:100%; padding:10px 12px; border-radius:9px; border:1.5px solid #E5E7EB; font-size:13px; color:#374151; outline:none; background:#fff; cursor:pointer; transition:.15s; }
        .nb-select:focus { border-color:#027373; }
        .nb-summary-box { background:#F9FAFB; border-radius:10px; padding:16px; margin-top:16px; border:1px solid #F3F4F6; }
        .nb-summary-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; padding:4px 0; }
        .nb-summary-row .lbl { color:#6B7280; }
        .nb-summary-row .val { font-weight:500; color:#374151; }
        .nb-summary-row.discount .val { color:#D95252; }
        .nb-summary-row.labor-row .lbl { color:#027373; }
        .nb-summary-row.labor-row .val { color:#027373; }
        .nb-summary-row.total-row { border-top:1px solid #E5E7EB; margin-top:8px; padding-top:12px; }
        .nb-summary-row.total-row .lbl { font-size:15px; font-weight:700; color:#0D0D0D; }
        .nb-summary-row.total-row .val { font-size:18px; font-weight:700; color:#027373; }
        .nb-summary-divider { border:none; border-top:1px dashed #E5E7EB; margin:6px 0; }
        .nb-textarea { width:100%; padding:10px 12px; border-radius:9px; border:1.5px solid #E5E7EB; font-size:13px; color:#374151; outline:none; background:#fff; resize:none; transition:.15s; font-family:'Inter',sans-serif; }
        .nb-textarea:focus { border-color:#027373; box-shadow:0 0 0 3px rgba(2,115,115,.1); }
        .nb-textarea::placeholder { color:#C4C8CF; }
        .nb-sidebar { position:sticky; top:20px; }
        .nb-resume-card { border-radius:14px; overflow:hidden; border:1px solid #E5E7EB; box-shadow:0 4px 24px rgba(0,0,0,.07); }
        .nb-resume-head { background:#027373; padding:20px 22px; display:flex; align-items:center; justify-content:space-between; }
        .nb-resume-head-title { font-size:15px; font-weight:600; color:#fff; }
        .nb-resume-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; background:rgba(255,255,255,.2); color:#fff; }
        .nb-resume-meta { background:#025E5E; padding:14px 22px; display:flex; align-items:center; gap:12px; }
        .nb-resume-meta-icon { width:36px; height:36px; border-radius:9px; background:rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; color:#fff; }
        .nb-resume-num { font-size:14px; font-weight:600; color:#fff; margin-bottom:2px; }
        .nb-resume-date { font-size:11px; color:rgba(255,255,255,.6); }
        .nb-resume-body { background:#fff; padding:20px 22px; }
        .nb-resume-line { display:flex; justify-content:space-between; align-items:center; font-size:13px; padding:8px 0; border-bottom:1px solid #F3F4F6; }
        .nb-resume-line:last-of-type { border-bottom:none; }
        .nb-resume-line .lbl { color:#6B7280; display:flex; align-items:center; gap:5px; }
        .nb-resume-line .val { font-weight:500; color:#374151; }
        .nb-resume-line .discount { color:#D95252; }
        .nb-resume-line .labor { color:#027373; }
        .nb-resume-total { display:flex; justify-content:space-between; align-items:center; padding:14px 0 6px; }
        .nb-resume-total .lbl { font-size:15px; font-weight:700; color:#0D0D0D; }
        .nb-resume-total .val { font-size:20px; font-weight:700; color:#027373; }
        .nb-link-hint { display:flex; align-items:flex-start; gap:10px; background:#EBF5F4; border-radius:10px; padding:14px; margin:14px 0; }
        .nb-link-hint-icon { color:#027373; flex-shrink:0; margin-top:1px; }
        .nb-link-hint-title { font-size:13px; font-weight:600; color:#027373; margin-bottom:2px; }
        .nb-link-hint-sub { font-size:11px; color:#5A9E99; }
        .nb-btn-continue { width:100%; padding:13px; border-radius:10px; border:none; background:#027373; color:#fff; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:.15s; margin-bottom:8px; }
        .nb-btn-continue:hover { background:#025E5E; box-shadow:0 4px 16px rgba(2,115,115,.3); }
        .nb-btn-continue:disabled { opacity:.6; cursor:not-allowed; }
        .nb-btn-preview { width:100%; padding:11px; border-radius:10px; border:1.5px solid #E5E7EB; background:#fff; color:#374151; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:.15s; }
        .nb-btn-preview:hover { border-color:#027373; color:#027373; }
        .nb-date-input { width:100%; padding:10px 12px; border-radius:9px; border:1.5px solid #E5E7EB; font-size:13px; color:#374151; outline:none; background:#fff; transition:.15s; font-family:'Inter',sans-serif; }
        .nb-date-input:focus { border-color:#027373; }

        /* ── Mão de obra — paleta teal ── */
        .nb-labor-card { background:#F0FAF9; border:1.5px solid #ADD9D1; border-radius:14px; padding:20px 24px; margin-bottom:16px; }
        .nb-labor-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .nb-labor-icon { width:32px; height:32px; border-radius:8px; background:#ADD9D1; display:flex; align-items:center; justify-content:center; color:#027373; flex-shrink:0; }
        .nb-labor-title { font-size:15px; font-weight:600; color:#027373; }
        .nb-labor-sub { font-size:12px; color:#038C7F; margin-top:1px; }
        .nb-labor-toggle { display:flex; background:#fff; border:1.5px solid #ADD9D1; border-radius:10px; padding:4px; gap:4px; margin-bottom:16px; width:fit-content; }
        .nb-labor-toggle-btn { padding:7px 20px; border-radius:7px; border:none; font-size:13px; font-weight:500; cursor:pointer; transition:.15s; color:#038C7F; background:transparent; }
        .nb-labor-toggle-btn.active { background:#027373; color:#fff; box-shadow:0 2px 8px rgba(2,115,115,.25); }
        .nb-labor-grid { display:grid; grid-template-columns:2fr 120px 1.2fr 1fr; gap:12px; align-items:end; }
        .nb-labor-input { width:100%; padding:10px 12px; border-radius:9px; border:1.5px solid #ADD9D1; font-size:13px; color:#374151; outline:none; background:#fff; transition:.15s; box-sizing:border-box; }
        .nb-labor-input:focus { border-color:#027373; box-shadow:0 0 0 3px rgba(2,115,115,.12); }
        .nb-labor-input::placeholder { color:#C4C8CF; }
        .nb-labor-qty { display:flex; align-items:center; gap:6px; }
        .nb-labor-qty-btn { width:30px; height:30px; border-radius:7px; border:1.5px solid #ADD9D1; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#027373; transition:.15s; flex-shrink:0; }
        .nb-labor-qty-btn:hover { background:#ADD9D1; border-color:#027373; }
        .nb-labor-qty-val { min-width:28px; text-align:center; font-size:14px; font-weight:700; color:#027373; }
        .nb-labor-total { font-size:15px; font-weight:700; color:#027373; text-align:right; padding-bottom:2px; }
        .nb-labor-total-zero { font-size:13px; color:#C4C8CF; text-align:right; padding-bottom:2px; }
        .nb-labor-label { font-size:12px; font-weight:500; color:#027373; margin-bottom:6px; display:block; }

        @media(max-width:900px){
          .nb-layout { grid-template-columns:1fr; }
          .nb-sidebar { position:static; }
          .nb-col-headers { display:none; }
          .nb-item-row { grid-template-columns:1fr 1fr; gap:8px; }
          .nb-labor-grid { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="nb-root">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="nb-layout">
            <div>

              {/* ── Cliente ── */}
              <div className="nb-card">
                <div className="nb-card-title">
                  <div className="nb-card-title-icon"><Users size={15} /></div>
                  Cliente
                </div>
                <div className="nb-toggle">
                  <button type="button" className={`nb-toggle-btn ${!useNewClient ? 'active' : ''}`} onClick={() => setUseNewClient(false)}>
                    <Users size={14} /> Cliente existente
                  </button>
                  <button type="button" className={`nb-toggle-btn ${useNewClient ? 'active' : ''}`} onClick={() => setUseNewClient(true)}>
                    <Plus size={14} /> Novo cliente
                  </button>
                </div>
                {useNewClient ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div><span className="nb-label">Nome do cliente</span><input className="nb-input" placeholder="João Silva" {...register('clientName', { required: true })} /></div>
                    <div><span className="nb-label">Telefone</span><input className="nb-input" placeholder="(11) 99999-9999" {...register('clientPhone')} /></div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display:'flex', gap:10 }}>
                      <div className="nb-search" style={{ flex:1 }}>
                        <Users size={15} style={{ color:'#9CA3AF', flexShrink:0 }} />
                        <input placeholder="Buscar cliente por nome, e-mail ou telefone..." />
                        <ChevronDown size={15} style={{ color:'#9CA3AF', flexShrink:0 }} />
                      </div>
                      <button type="button" className="nb-btn-outline" onClick={() => setUseNewClient(true)}><Plus size={14} /> Novo cliente</button>
                    </div>
                    {clients.length > 0 && (
                      <select className="nb-select" style={{ marginTop:10 }} {...register('clientId')}>
                        <option value="">Selecione um cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* ── Itens ── */}
              <div className="nb-card">
                <div className="nb-items-header">
                  <div className="nb-card-title" style={{ marginBottom:0 }}>
                    <div className="nb-card-title-icon"><ShoppingCart size={15} /></div>
                    Itens do orçamento
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="button" className="nb-btn-outline"><Upload size={13} /> Importar</button>
                    <button type="button" className="nb-btn-primary" onClick={addItem}><Plus size={14} /> Adicionar item</button>
                  </div>
                </div>

                <div className="nb-col-headers" style={{ marginTop:16 }}>
                  <span>Item</span>
                  <span>Descrição</span>
                  <span>Qtd.</span>
                  <span>Valor unit.</span>
                  <span>Total</span>
                  <span></span>
                </div>

                {items.map(item => (
                  <div key={item.id} className="nb-item-row">
                    <input
                      className="nb-input"
                      placeholder="Nome do item"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      style={{ fontSize:13, fontWeight:500 }}
                    />
                    <input
                      className="nb-input"
                      placeholder="Descrição opcional"
                      value={item.desc}
                      onChange={e => updateItem(item.id, 'desc', e.target.value)}
                      style={{ fontSize:12 }}
                    />
                    <div className="nb-qty-ctrl">
                      <button type="button" className="nb-qty-btn" onClick={() => changeQty(item.id, -1)}><Minus size={12} /></button>
                      <span className="nb-qty-val">{item.qty}</span>
                      <button type="button" className="nb-qty-btn" onClick={() => changeQty(item.id, 1)}><Plus size={12} /></button>
                    </div>
                    <input
                      type="number" step="0.01" min="0"
                      className="nb-input"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      placeholder="0,00"
                    />
                    <span className="nb-item-total">{currency(item.qty * item.unitPrice)}</span>
                    <button type="button" className="nb-del-btn" onClick={() => removeItem(item.id)}><Trash2 size={14} /></button>
                  </div>
                ))}

                <button type="button" className="nb-add-row" onClick={addItem}>
                  <Plus size={15} /> Adicionar item
                </button>
              </div>

              {/* ── Mão de obra ── */}
              <div className="nb-labor-card">
                <div className="nb-labor-header">
                  <div className="nb-labor-icon"><Wrench size={15} /></div>
                  <div>
                    <div className="nb-labor-title">Mão de obra</div>
                    <div className="nb-labor-sub">Preencha somente se houver cobrança de mão de obra</div>
                  </div>
                </div>

                {/* Toggle Por hora / Por dia */}
                <div className="nb-labor-toggle">
                  {LABOR_TYPES.map(lt => (
                    <button
                      key={lt.value}
                      type="button"
                      className={`nb-labor-toggle-btn ${labor.laborType === lt.value ? 'active' : ''}`}
                      onClick={() => updateLabor('laborType', lt.value)}
                    >
                      {lt.label}
                    </button>
                  ))}
                </div>

                <div className="nb-labor-grid">
                  {/* Descrição */}
                  <div>
                    <span className="nb-labor-label">Descrição</span>
                    <input
                      className="nb-labor-input"
                      placeholder="Ex: Instalação, pintura, montagem..."
                      value={labor.name}
                      onChange={e => updateLabor('name', e.target.value)}
                    />
                  </div>

                  {/* Quantidade */}
                  <div>
                    <span className="nb-labor-label">
                      {labor.laborType === 'hourly' ? 'Horas' : 'Dias'}
                    </span>
                    <div className="nb-labor-qty">
                      <button type="button" className="nb-labor-qty-btn" onClick={() => changeLaborQty(-1)}><Minus size={12} /></button>
                      <span className="nb-labor-qty-val">{labor.qty}</span>
                      <button type="button" className="nb-labor-qty-btn" onClick={() => changeLaborQty(1)}><Plus size={12} /></button>
                    </div>
                  </div>

                  {/* Valor unitário */}
                  <div>
                    <span className="nb-labor-label">
                      {labor.laborType === 'hourly' ? 'Valor / hora' : 'Valor / dia'}
                    </span>
                    <input
                      type="number" step="0.01" min="0"
                      className="nb-labor-input"
                      value={labor.unitPrice || ''}
                      onChange={e => updateLabor('unitPrice', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  {/* Total */}
                  <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                    <span className="nb-labor-label">Total mão de obra</span>
                    {subtotalLabor > 0
                      ? <div className="nb-labor-total">{currency(subtotalLabor)}</div>
                      : <div className="nb-labor-total-zero">—</div>
                    }
                  </div>
                </div>
              </div>

              {/* ── Valores e descontos ── */}
              <div className="nb-card">
                <div className="nb-card-title">
                  <div className="nb-card-title-icon"><Tag size={15} /></div>
                  Valores e descontos
                </div>
                <div className="nb-val-grid">
                  <div>
                    <span className="nb-label">Tipo de desconto</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <select className="nb-select" style={{ width:80 }} {...register('discountType')}>
                        <option value="fixed">R$</option>
                        <option value="percent">%</option>
                      </select>
                      <input type="number" step="0.01" min="0" className="nb-input" placeholder="0" {...register('discountValue')} />
                    </div>
                  </div>
                  <div>
                    <span className="nb-label">Extras (R$)</span>
                    <input type="number" step="0.01" min="0" className="nb-input" placeholder="0" {...register('extras')} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <span className="nb-label">Descrição dos extras</span>
                    <input className="nb-input" placeholder="Ex: taxa de deslocamento" {...register('extrasDescription')} />
                  </div>
                </div>
                <div className="nb-summary-box">
                  {subtotalLabor > 0 && subtotalMat > 0 && (
                    <>
                      <div className="nb-summary-row">
                        <span className="lbl" style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <Tag size={11} /> Materiais / Serviços
                        </span>
                        <span className="val">{currency(subtotalMat)}</span>
                      </div>
                      <div className="nb-summary-row labor-row">
                        <span className="lbl" style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <Wrench size={11} /> Mão de obra
                        </span>
                        <span className="val">{currency(subtotalLabor)}</span>
                      </div>
                      <hr className="nb-summary-divider" />
                    </>
                  )}
                  <div className="nb-summary-row"><span className="lbl">Subtotal</span><span className="val">{currency(subtotal)}</span></div>
                  {discountAmount > 0 && <div className="nb-summary-row discount"><span className="lbl">Desconto</span><span className="val">− {currency(discountAmount)}</span></div>}
                  <div className="nb-summary-row"><span className="lbl">Impostos (0%)</span><span className="val">R$ 0,00</span></div>
                  {extras > 0 && <div className="nb-summary-row"><span className="lbl">Extras</span><span className="val">{currency(extras)}</span></div>}
                  <div className="nb-summary-row total-row"><span className="lbl">Total</span><span className="val">{currency(total)}</span></div>
                </div>
              </div>

              {/* ── Detalhes adicionais ── */}
              <div className="nb-card">
                <div className="nb-card-title">
                  <div className="nb-card-title-icon"><ClipboardList size={15} /></div>
                  Detalhes adicionais
                </div>
                <div className="nb-val-grid" style={{ marginBottom:14 }}>
                  <div>
                    <span className="nb-label">Validade do orçamento</span>
                    <input
                      type="date"
                      className="nb-date-input"
                      defaultValue={defaultDateValue}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleValidityDate}
                    />
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <span className="nb-label">Observações (opcional)</span>
                  <textarea className="nb-textarea" rows={4} placeholder="Condições, prazos, garantias..." {...register('notes')} />
                </div>
                <div>
                  <span className="nb-label">Formas de pagamento</span>
                  <textarea className="nb-textarea" rows={3} placeholder="Ex: Pix, cartão em até 3x, dinheiro..." {...register('paymentMethods')} />
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="nb-sidebar">
              <div className="nb-resume-card">
                <div className="nb-resume-head">
                  <span className="nb-resume-head-title">Resumo do orçamento</span>
                  <span className="nb-resume-badge">Rascunho</span>
                </div>
                <div className="nb-resume-meta">
                  <div className="nb-resume-meta-icon"><FileText size={16} /></div>
                  <div>
                    <div className="nb-resume-num">Nº 000123</div>
                    <div className="nb-resume-date">Criado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                </div>
                <div className="nb-resume-body">
                  {subtotalMat > 0 && (
                    <div className="nb-resume-line">
                      <span className="lbl"><Tag size={11} /> Materiais ({items.length})</span>
                      <span className="val">{currency(subtotalMat)}</span>
                    </div>
                  )}
                  {subtotalLabor > 0 && (
                    <div className="nb-resume-line">
                      <span className="lbl"><Wrench size={11} /> Mão de obra</span>
                      <span className="labor">{currency(subtotalLabor)}</span>
                    </div>
                  )}
                  {subtotalMat === 0 && subtotalLabor === 0 && (
                    <div className="nb-resume-line">
                      <span className="lbl">Itens ({items.length})</span>
                      <span className="val">{currency(subtotal)}</span>
                    </div>
                  )}
                  <div className="nb-resume-line">
                    <span className="lbl">Desconto</span>
                    <span className={discountAmount > 0 ? 'discount' : 'val'}>{discountAmount > 0 ? `− ${currency(discountAmount)}` : 'R$ 0,00'}</span>
                  </div>
                  <div className="nb-resume-line"><span className="lbl">Impostos (0%)</span><span className="val">R$ 0,00</span></div>
                  <div className="nb-resume-total">
                    <span className="lbl">Total</span>
                    <span className="val">{currency(total)}</span>
                  </div>
                  <div className="nb-link-hint">
                    <Link2 size={16} className="nb-link-hint-icon" />
                    <div>
                      <div className="nb-link-hint-title">Link de aprovação</div>
                      <div className="nb-link-hint-sub">Será gerado após a finalização do orçamento.</div>
                    </div>
                  </div>
                  <button type="submit" className="nb-btn-continue" disabled={loading}>
                    {loading ? 'Criando...' : <><span>Criar Orçamento</span><ArrowRight size={16} /></>}
                  </button>
                  <button type="button" className="nb-btn-preview" onClick={() => navigate('/budgets')}>
                    <Eye size={14} /> Visualizar prévia
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </Layout>
  )
}