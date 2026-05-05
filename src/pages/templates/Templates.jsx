import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } from '../../api/templates'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { useForm } from 'react-hook-form'
import { currency } from '../../utils/format'
import { Plus, Pencil, Trash2, Copy, Package, Search, Tag, ChevronRight } from 'lucide-react'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
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

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .tm, .tm * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .tm { background: transparent; padding: 0 0 64px; }

        /* Header */
        .tm-header { display: flex; align-items: flex-end; justify-content: space-between; padding: 32px 0 24px; gap: 16px; flex-wrap: wrap; }
        .tm-title { font-size: 26px; font-weight: 800; color: #0D0D0D; margin: 0 0 6px; letter-spacing: -.5px; }
        .tm-sub { font-size: 13px; color: #9CA3AF; margin: 0; line-height: 1.4; }

        .tm-btn-new { display: flex; align-items: center; gap: 8px; background: #027373; color: #fff; border: none; border-radius: 12px; padding: 12px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; letter-spacing: -.2px; white-space: nowrap; }
        .tm-btn-new:hover { background: #038C7F; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2,115,115,.3); }

        /* Toolbar */
        .tm-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .tm-search { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 11px 16px; flex: 1; max-width: 340px; transition: border .15s; }
        .tm-search:focus-within { border-color: #038C7F; }
        .tm-search input { border: none; outline: none; font-size: 13px; color: #374151; background: transparent; width: 100%; letter-spacing: .1px; }
        .tm-search input::placeholder { color: #C4C8CF; }
        .tm-count { font-size: 12px; color: #6B7280; background: #fff; border: 1.5px solid #EBEBEB; border-radius: 10px; padding: 8px 16px; font-weight: 600; white-space: nowrap; letter-spacing: .2px; }

        /* Grid */
        .tm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }

        /* Card */
        .tm-card { background: #fff; border-radius: 16px; border: 1.5px solid #EBEBEB; padding: 22px 22px 18px 26px; display: flex; flex-direction: column; gap: 0; transition: all .15s; position: relative; overflow: hidden; }
        .tm-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #027373, #ADD9D1); border-radius: 16px 0 0 16px; }
        .tm-card:hover { border-color: #ADD9D1; box-shadow: 0 4px 20px rgba(2,115,115,.08); transform: translateY(-1px); }

        .tm-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
        .tm-card-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #027373, #038C7F); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tm-card-name { font-size: 15px; font-weight: 700; color: #0D0D0D; margin: 0 0 5px; line-height: 1.3; letter-spacing: -.2px; }
        .tm-card-desc { font-size: 12px; color: #9CA3AF; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tm-card-price { font-size: 20px; font-weight: 800; color: #027373; margin: 12px 0 16px; letter-spacing: -.5px; }

        .tm-card-actions { display: flex; align-items: center; gap: 8px; padding-top: 14px; border-top: 1px solid #F3F4F6; }
        .tm-card-btn { display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 9px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; flex: 1; justify-content: center; letter-spacing: .1px; }
        .tm-btn-edit { background: #F0FAFA; color: #027373; }
        .tm-btn-edit:hover { background: #ADD9D1; color: #027373; }
        .tm-btn-dup { background: #F9FAFB; color: #6B7280; }
        .tm-btn-dup:hover { background: #F3F4F6; color: #374151; }
        .tm-btn-del { background: #FFF5F5; color: #D95252; width: 38px; flex: none; padding: 9px; }
        .tm-btn-del:hover { background: #FFE4E4; }

        /* Empty */
        .tm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; background: #fff; border-radius: 18px; border: 1.5px dashed #D1FAF5; text-align: center; }
        .tm-empty-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #F0FAFA, #ADD9D1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .tm-empty-title { font-size: 17px; font-weight: 700; color: #0D0D0D; margin: 0 0 6px; }
        .tm-empty-desc { font-size: 13px; color: #9CA3AF; max-width: 280px; margin: 0 auto 20px; line-height: 1.5; }

        /* Spinner */
        .tm-spinner { display: flex; justify-content: center; padding: 64px 0; }
        .tm-spin { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(2,115,115,.15); border-top: 3px solid #027373; animation: tmspin .7s linear infinite; }
        @keyframes tmspin { to { transform: rotate(360deg); } }

        /* Modal overrides */
        .tm-modal-body { display: flex; flex-direction: column; gap: 16px; }
        .tm-label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; letter-spacing: .3px; text-transform: uppercase; }
        .tm-input { width: 100%; padding: 11px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 13px; color: #0D0D0D; outline: none; transition: border .15s; background: #fff; }
        .tm-input:focus { border-color: #038C7F; box-shadow: 0 0 0 3px rgba(3,140,127,.08); }
        .tm-input::placeholder { color: #C4C8CF; }
        .tm-textarea { width: 100%; padding: 11px 14px; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 13px; color: #0D0D0D; outline: none; transition: border .15s; background: #fff; resize: none; height: 80px; font-family: 'Inter', sans-serif; }
        .tm-textarea:focus { border-color: #038C7F; box-shadow: 0 0 0 3px rgba(3,140,127,.08); }
        .tm-textarea::placeholder { color: #C4C8CF; }
        .tm-error { font-size: 11px; color: #D95252; margin-top: 4px; }
        .tm-modal-footer { display: flex; gap: 10px; padding-top: 4px; }
        .tm-modal-cancel { flex: 1; padding: 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; background: #fff; font-size: 13px; font-weight: 600; color: #6B7280; cursor: pointer; transition: all .15s; }
        .tm-modal-cancel:hover { border-color: #D1D5DB; color: #374151; }
        .tm-modal-save { flex: 1; padding: 12px; border: none; border-radius: 10px; background: #027373; font-size: 13px; font-weight: 700; color: #fff; cursor: pointer; transition: all .15s; }
        .tm-modal-save:hover { background: #038C7F; }

        @media(max-width: 640px) {
          .tm-header { flex-direction: column; align-items: flex-start; }
          .tm-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="tm">

        {/* Header */}
        <div className="tm-header">
          <div>
            <h1 className="tm-title">Modelos</h1>
            <p className="tm-sub">Serviços e materiais prontos para usar nos orçamentos</p>
          </div>
          <button className="tm-btn-new" onClick={openCreate}>
            <Plus size={16} strokeWidth={2.5} />
            Novo modelo
          </button>
        </div>

        {/* Toolbar */}
        {templates.length > 0 && (
          <div className="tm-toolbar">
            <div className="tm-search">
              <Search size={14} color="#9CA3AF" />
              <input
                placeholder="Buscar modelos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span className="tm-count">
              {filtered.length} modelo{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="tm-spinner"><div className="tm-spin" /></div>
        ) : templates.length === 0 ? (
          <div className="tm-empty">
            <div className="tm-empty-icon">
              <Package size={28} color="#027373" />
            </div>
            <p className="tm-empty-title">Nenhum modelo criado</p>
            <p className="tm-empty-desc">
              Salve seus serviços e materiais mais usados para agilizar a criação de orçamentos
            </p>
            <button className="tm-btn-new" onClick={openCreate}>
              <Plus size={16} strokeWidth={2.5} />
              Criar primeiro modelo
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tm-empty">
            <div className="tm-empty-icon">
              <Search size={26} color="#027373" />
            </div>
            <p className="tm-empty-title">Nenhum resultado</p>
            <p className="tm-empty-desc">Tente buscar por outro nome ou descrição</p>
          </div>
        ) : (
          <div className="tm-grid">
            {filtered.map(t => (
              <div key={t.id} className="tm-card">
                <div className="tm-card-top">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                    <div className="tm-card-icon">
                      <Tag size={16} color="#fff" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="tm-card-name">{t.name}</p>
                      {t.description && <p className="tm-card-desc">{t.description}</p>}
                    </div>
                  </div>
                </div>
                <p className="tm-card-price">{currency(t.defaultPrice)}</p>
                <div className="tm-card-actions">
                  <button className="tm-card-btn tm-btn-edit" onClick={() => openEdit(t)}>
                    <Pencil size={13} strokeWidth={2.5} />
                    Editar
                  </button>
                  <button className="tm-card-btn tm-btn-dup" onClick={() => handleDuplicate(t.id)}>
                    <Copy size={13} strokeWidth={2} />
                    Duplicar
                  </button>
                  <button className="tm-card-btn tm-btn-del" onClick={() => handleDelete(t.id)}>
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar modelo' : 'Novo modelo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="tm-modal-body">
          <div>
            <label className="tm-label">Nome do serviço / material *</label>
            <input
              className="tm-input"
              placeholder="Ex: Pintura por m², Tinta 18L"
              {...register('name', { required: 'Informe o nome' })}
            />
            {errors.name && <p className="tm-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="tm-label">Valor padrão (R$) *</label>
            <input
              className="tm-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register('defaultPrice', { required: 'Informe o valor' })}
            />
            {errors.defaultPrice && <p className="tm-error">{errors.defaultPrice.message}</p>}
          </div>
          <div>
            <label className="tm-label">Descrição <span style={{ color: '#C4C8CF', textTransform: 'none', fontWeight: 400, fontSize: 11 }}>opcional</span></label>
            <textarea
              className="tm-textarea"
              placeholder="Detalhes sobre este serviço ou material..."
              {...register('description')}
            />
          </div>
          <div className="tm-modal-footer">
            <button type="button" className="tm-modal-cancel" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="tm-modal-save">
              {editing ? 'Salvar alterações' : 'Criar modelo'}
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ height: 80 }} />
    </Layout>
  )
}