import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getEvents, createEvent, updateEvent, toggleDone, deleteEvent } from '../../api/agenda'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { Plus, Trash2, Pencil, Bell, BellOff, CheckCircle, Circle, AlertCircle } from 'lucide-react'

function EventCard({ event, onToggle, onEdit, onDelete }) {
  const isOverdue = event.isOverdue
  const formatDate = (d) => {
    if (!d) return null
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className={`card flex items-start gap-3 transition-opacity
      ${event.done ? 'opacity-50' : ''}`}>

      <button onClick={() => onToggle(event.id)}
        className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-primary transition-colors">
        {event.done
          ? <CheckCircle size={22} className="text-green-500" />
          : <Circle size={22} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-slate-800 ${event.done ? 'line-through' : ''}`}>
          {event.title}
        </p>

        {event.notes && (
          <p className="text-sm text-muted mt-0.5 truncate">{event.notes}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {event.reminderAt && (
            <div className={`flex items-center gap-1 text-xs
              ${isOverdue ? 'text-red-500' : 'text-muted'}`}>
              {isOverdue
                ? <AlertCircle size={12} />
                : <Bell size={12} />}
              {formatDate(event.reminderAt)}
              {isOverdue && ' · Atrasado'}
            </div>
          )}

          {event.budgetNumber && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              Orç. #{String(event.budgetNumber).padStart(4, '0')}
              {event.clientName ? ` · ${event.clientName}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(event)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Pencil size={15} className="text-slate-400" />
        </button>
        <button onClick={() => onDelete(event.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={15} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}

export default function Agenda() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('pending') // 'pending' | 'done' | 'all'
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    try {
      setLoading(true)
      const done = filter === 'pending' ? false : filter === 'done' ? true : undefined
      const res = await getEvents(done)
      setEvents(res.data)
    } catch {
      toast.error('Erro ao carregar agenda')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const openCreate = () => {
    setEditing(null)
    reset({ title: '', notes: '', reminderAt: '' })
    setModalOpen(true)
  }

  const openEdit = (event) => {
    setEditing(event)
    reset({
      title: event.title,
      notes: event.notes || '',
      reminderAt: event.reminderAt
        ? new Date(event.reminderAt).toISOString().slice(0, 16)
        : '',
      done: event.done
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        reminderAt: data.reminderAt ? new Date(data.reminderAt).toISOString() : null
      }
      if (editing) {
        await updateEvent(editing.id, payload)
        toast.success('Lembrete atualizado!')
      } else {
        await createEvent(payload)
        toast.success('Lembrete criado!')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleDone(id)
      load()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deletar este lembrete?')) return
    try {
      await deleteEvent(id)
      toast.success('Removido')
      load()
    } catch {
      toast.error('Erro ao deletar')
    }
  }

  const overdue = events.filter(e => e.isOverdue)
  const today = events.filter(e => {
    if (!e.reminderAt || e.isOverdue || e.done) return false
    const d = new Date(e.reminderAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const upcoming = events.filter(e => {
    if (!e.reminderAt || e.isOverdue || e.done) return false
    const d = new Date(e.reminderAt)
    const now = new Date()
    return d.toDateString() !== now.toDateString()
  })
  const noDate = events.filter(e => !e.reminderAt && !e.done)
  const done = events.filter(e => e.done)

  function Section({ title, items, color = '' }) {
    if (items.length === 0) return null
    return (
      <div className="mb-6">
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${color || 'text-muted'}`}>
          {title} · {items.length}
        </h3>
        <div className="flex flex-col gap-2">
          {items.map(e => (
            <EventCard key={e.id} event={e}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
          <p className="text-sm text-muted">{events.length} lembretes</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={18} /> Novo lembrete
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'pending', label: 'Pendentes' },
          { value: 'done', label: 'Concluídos' },
          { value: 'all', label: 'Todos' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === f.value
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon="🗓️" title="Nenhum lembrete"
          description="Crie lembretes para acompanhar seus orçamentos e compromissos"
          action={
            <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
              <Plus size={18} /> Novo lembrete
            </button>
          } />
      ) : (
        <div>
          <Section title="Atrasados" items={overdue} color="text-red-500" />
          <Section title="Hoje" items={today} color="text-amber-500" />
          <Section title="Próximos" items={upcoming} color="text-blue-600" />
          <Section title="Sem data" items={noDate} />
          <Section title="Concluídos" items={done} color="text-green-600" />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar lembrete' : 'Novo lembrete'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Título *" placeholder="Ex: Ligar para o João, Cobrar pagamento..."
            error={errors.title?.message}
            {...register('title', { required: 'Informe o título' })} />

          <div>
            <label className="text-sm font-medium text-slate-700">Observações</label>
            <textarea className="input mt-1 h-20 resize-none"
              placeholder="Detalhes do lembrete..."
              {...register('notes')} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Data e hora do lembrete
            </label>
            <input type="datetime-local" className="input mt-1"
              {...register('reminderAt')} />
          </div>

          {editing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary"
                {...register('done')} />
              <span className="text-sm text-slate-700">Marcar como concluído</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1"
              onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Salvar' : 'Criar lembrete'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="h-20 md:h-0" />
    </Layout>
  )
}