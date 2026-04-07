import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClients, createClient, updateClient, deleteClient } from '../../api/clients'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    try {
      setLoading(true)
      const res = await getClients(search)
      setClients(res.data)
    } catch {
      toast.error('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', phone: '', email: '', address: '' })
    setModalOpen(true)
  }

  const openEdit = (client) => {
    setEditing(client)
    reset(client)
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await updateClient(editing.id, data)
        toast.success('Cliente atualizado!')
      } else {
        await createClient(data)
        toast.success('Cliente criado!')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar cliente')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deletar este cliente?')) return
    try {
      await deleteClient(id)
      toast.success('Cliente removido')
      load()
    } catch {
      toast.error('Erro ao deletar')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-muted">{clients.length} cadastrados</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={18} /> Novo cliente
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-3 text-muted" />
        <input className="input pl-9" placeholder="Buscar por nome ou telefone..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState icon="👥" title="Nenhum cliente ainda"
          description="Cadastre seus clientes para agilizar a criação de orçamentos"
          action={
            <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
              <Plus size={18} /> Novo cliente
            </button>
          } />
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map(c => (
            <div key={c.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center
                text-primary font-bold text-lg flex-shrink-0">
                {c.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{c.name}</p>
                <p className="text-sm text-muted">
                  {[c.phone, c.email].filter(Boolean).join(' · ') || 'Sem contato'}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil size={16} className="text-slate-500" />
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente' : 'Novo cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome *" placeholder="João Silva"
            error={errors.name?.message}
            {...register('name', { required: 'Informe o nome' })} />
          <Input label="Telefone" placeholder="11999999999"
            {...register('phone')} />
          <Input label="E-mail" type="email" placeholder="joao@email.com"
            {...register('email')} />
          <Input label="Endereço" placeholder="Rua das Flores, 123"
            {...register('address')} />
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1"
              onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Salvar' : 'Criar cliente'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="h-20 md:h-0" />
    </Layout>
  )
}