import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { createBudget } from '../../api/budgets'
import { getClients } from '../../api/clients'
import { getTemplates } from '../../api/templates'
import { currency } from '../../utils/format'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function NewBudget() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { discountType: 'fixed', discountValue: 0, extras: 0, validityDays: 7 }
  })

  const [clients, setClients] = useState([])
  const [templates, setTemplates] = useState([])
  const [items, setItems] = useState([])
  const [useNewClient, setUseNewClient] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [loading, setLoading] = useState(false)

  const discountType = watch('discountType')
  const discountValue = parseFloat(watch('discountValue') || 0)
  const extras = parseFloat(watch('extras') || 0)

  useEffect(() => {
    getClients().then(r => setClients(r.data))
    getTemplates().then(r => setTemplates(r.data))
  }, [])

  // Cálculos em tempo real
  const subtotal = items.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0)
  const discountAmount = discountType === 'percent'
    ? subtotal * (discountValue / 100)
    : discountValue
  const total = subtotal - discountAmount + extras

  const addItemFromTemplate = (template) => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name: template.name,
      qty: 1,
      unitPrice: template.defaultPrice,
      templateId: template.id,
      isLabor: false,
      laborType: null
    }])
    setShowTemplates(false)
  }

  const addCustomItem = (isLabor = false) => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name: isLabor ? 'Mão de obra' : '',
      qty: 1,
      unitPrice: 0,
      templateId: null,
      isLabor,
      laborType: isLabor ? 'total' : null
    }])
  }

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id
      ? {
          ...i,
          [field]: field === 'name' || field === 'laborType'
            ? value
            : parseFloat(value) || 0
        }
      : i
    ))
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item')
      return
    }
    try {
      setLoading(true)
      const payload = {
        clientId: useNewClient ? null : data.clientId || null,
        clientName: useNewClient ? data.clientName : null,
        clientPhone: useNewClient ? data.clientPhone : null,
        items: items.map(i => ({
          name: i.name,
          qty: i.qty,
          unitPrice: i.unitPrice,
          templateId: i.templateId,
          isLabor: i.isLabor,
          laborType: i.laborType
        })),
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue) || 0,
        extras: parseFloat(data.extras) || 0,
        extrasDescription: data.extrasDescription,
        validityDays: parseInt(data.validityDays),
        notes: data.notes,
        paymentMethods: data.paymentMethods
      }
      const res = await createBudget(payload)
      toast.success('Orçamento criado!')
      navigate(`/budgets/${res.data.id}`)
    }  catch (err) {
  const msg = err.response?.data?.message || ''
  if (msg.includes('Limite')) {
    toast.error(msg, { duration: 5000 })
    navigate('/planos')
  } else {
    toast.error('Erro ao criar orçamento')
  }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/budgets')}
            className="text-muted hover:text-slate-700 text-sm">← Voltar</button>
          <h1 className="text-2xl font-bold text-slate-800">Novo orçamento</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Cliente */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Cliente</h2>
            <div className="flex gap-3 mb-4">
              <button type="button"
                onClick={() => setUseNewClient(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${!useNewClient ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}>
                Cliente existente
              </button>
              <button type="button"
                onClick={() => setUseNewClient(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${useNewClient ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}>
                Novo cliente
              </button>
            </div>

            {useNewClient ? (
              <div className="flex flex-col gap-3">
                <Input label="Nome do cliente" placeholder="João Silva"
                  {...register('clientName', { required: 'Informe o nome' })}
                  error={errors.clientName?.message} />
                <Input label="Telefone" placeholder="11999999999"
                  {...register('clientPhone')} />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-700">Selecionar cliente</label>
                <select className="input mt-1" {...register('clientId')}>
                  <option value="">Selecione...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `— ${c.phone}` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Itens */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Itens do orçamento</h2>

            {items.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-2 items-start bg-slate-50 rounded-lg p-3">
                    <div className="flex-1">
                      <input className="input mb-2" placeholder="Descrição do item"
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)} />

                      {/* Toggle mão de obra */}
                      {item.isLabor && (
                        <div className="flex gap-2 mb-2">
                          {['hour', 'day', 'total'].map(type => (
                            <button key={type} type="button"
                              onClick={() => updateItem(item.id, 'laborType', type)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                ${item.laborType === type
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-slate-600 border-slate-200'}`}>
                              {type === 'hour' ? 'Por hora' : type === 'day' ? 'Por dia' : 'Total'}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted">
                            {item.laborType === 'hour' ? 'Horas' : item.laborType === 'day' ? 'Dias' : 'Qtd'}
                          </label>
                          <input type="number" step="0.01" min="0" className="input"
                            value={item.qty}
                            onChange={e => updateItem(item.id, 'qty', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted">
                            {item.laborType === 'hour' ? 'R$/hora' : item.laborType === 'day' ? 'R$/dia' : 'Valor (R$)'}
                          </label>
                          <input type="number" step="0.01" min="0" className="input"
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, 'unitPrice', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted">Total</label>
                          <div className="input bg-slate-100 text-slate-600">
                            {currency(item.qty * item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg mt-1">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar itens */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1">
                <button type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="btn-secondary w-full flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Plus size={16} /> Usar modelo salvo
                  </span>
                  {showTemplates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showTemplates && templates.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {templates.map(t => (
                      <button key={t.id} type="button"
                        onClick={() => addItemFromTemplate(t)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm flex justify-between items-center">
                        <span>{t.name}</span>
                        <span className="text-muted text-xs">{currency(t.defaultPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => addCustomItem(false)}
                className="btn-secondary flex items-center gap-2">
                <Plus size={16} /> Item avulso
              </button>
              <button type="button" onClick={() => addCustomItem(true)}
                className="btn-secondary flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                <Plus size={16} /> Mão de obra
              </button>
            </div>
          </div>

          {/* Valores */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Valores</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Desconto</label>
                  <div className="flex gap-2 mt-1">
                    <select className="input w-28" {...register('discountType')}>
                      <option value="fixed">R$</option>
                      <option value="percent">%</option>
                    </select>
                    <input type="number" step="0.01" min="0" className="input"
                      placeholder="0" {...register('discountValue')} />
                  </div>
                </div>
                <div className="flex-1">
                  <Input label="Extras (R$)" type="number" step="0.01" min="0"
                    placeholder="0" {...register('extras')} />
                </div>
              </div>
              <Input label="Descrição dos extras (opcional)"
                placeholder="Ex: taxa de deslocamento"
                {...register('extrasDescription')} />
            </div>

            {/* Resumo */}
            <div className="mt-4 bg-slate-50 rounded-lg p-4 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span><span>{currency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Desconto</span><span>- {currency(discountAmount)}</span>
                </div>
              )}
              {extras > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>Extras</span><span>{currency(extras)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-primary border-t border-slate-200 pt-2 mt-1">
                <span>Total</span><span>{currency(total)}</span>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Detalhes</h2>
            <div className="flex flex-col gap-3">
              <Input label="Validade (dias)" type="number" min="1"
                {...register('validityDays')} />
              <div>
                <label className="text-sm font-medium text-slate-700">Observações</label>
                <textarea className="input mt-1 h-24 resize-none"
                  placeholder="Condições, prazos, garantias..."
                  {...register('notes')} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Formas de pagamento</label>
                <textarea className="input mt-1 h-20 resize-none"
                  placeholder="Ex: Pix, cartão em até 3x, dinheiro..."
                  {...register('paymentMethods')} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? 'Criando orçamento...' : 'Criar orçamento'}
          </button>

          <div className="h-20 md:h-0" /> {/* espaço para nav mobile */}
        </form>
      </div>
    </Layout>
  )
}