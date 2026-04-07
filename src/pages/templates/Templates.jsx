import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } from '../../api/templates'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { useForm } from 'react-hook-form'
import { currency } from '../../utils/format'
import { Plus, Pencil, Trash2, Copy } from 'lucide-react'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    try {
      setLoading(true)
      const res = await getTemplates()
      setTemplates(res.data)
    } catch {
      toast.error('Erro ao carregar modelos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', defaultPrice: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    reset({ name: t.name, defaultPrice: t.defaultPrice, description: t.description })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, defaultPrice: parseFloat(data.defaultPrice) }
      if (editing) {
        await updateTemplate(editing.id, payload)
        toast.success('Modelo atualizado!')
      } else {
        await createTemplate(payload)
        toast.success('Modelo criado!')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar modelo')
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await duplicateTemplate(id)
      toast.success('Modelo duplicado!')
      load()
    } catch {
      toast.error('Erro ao duplicar')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deletar este modelo?')) return
    try {
      await deleteTemplate(id)
      toast.success('Modelo removido')
      load()
    } catch {
      toast.error('Erro ao deletar')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Modelos</h1>
          <p className="text-sm text-muted">Serviços e materiais mais usados</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={18} /> Novo modelo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState icon="📦" title="Nenhum modelo ainda"
          description="Salve seus serviços e materiais mais usados para criar orçamentos mais rápido"
          action={
            <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
              <Plus size={18} /> Novo modelo
            </button>
          } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(t => (
            <div key={t.id} className="card flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{t.name}</p>
                {t.description && (
                  <p className="text-xs text-muted mt-0.5 truncate">{t.description}</p>
                )}
                <p className="text-primary font-bold mt-1">{currency(t.defaultPrice)}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => handleDuplicate(t.id)} title="Duplicar"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Copy size={15} className="text-slate-500" />
                </button>
                <button onClick={() => openEdit(t)} title="Editar"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={15} className="text-slate-500" />
                </button>
                <button onClick={() => handleDelete(t.id)} title="Deletar"
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar modelo' : 'Novo modelo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome do serviço/material *"
            placeholder="Ex: Pintura por m², Tinta 18L"
            error={errors.name?.message}
            {...register('name', { required: 'Informe o nome' })} />
          <Input label="Valor padrão (R$) *" type="number" step="0.01" min="0"
            placeholder="0,00"
            error={errors.defaultPrice?.message}
            {...register('defaultPrice', { required: 'Informe o valor' })} />
          <div>
            <label className="text-sm font-medium text-slate-700">Descrição (opcional)</label>
            <textarea className="input mt-1 h-20 resize-none"
              placeholder="Detalhes sobre este serviço ou material..."
              {...register('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1"
              onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Salvar' : 'Criar modelo'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="h-20 md:h-0" />
    </Layout>
  )
}