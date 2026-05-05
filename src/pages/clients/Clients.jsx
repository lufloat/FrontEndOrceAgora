import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClients, createClient, updateClient, deleteClient } from '../../api/clients'
import { Layout } from '../../components/Layout'
import { Modal } from '../../components/ui/Modal'
import { useForm } from 'react-hook-form'
import {
  Plus, Pencil, Trash2, Search, Users,
  Phone, Mail, MapPin, X, UserPlus, ChevronRight
} from 'lucide-react'

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    try {
      setLoading(true)
      const res = await getClients(search)
      setClients(res.data)
    } catch { toast.error('Erro ao carregar clientes') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setEditing(null); reset({ name:'', phone:'', email:'', address:'' }); setModalOpen(true) }
  const openEdit   = (c)  => { setEditing(c);  reset(c);                                          setModalOpen(true) }

  const onSubmit = async (data) => {
    try {
      if (editing) { await updateClient(editing.id, data); toast.success('Cliente atualizado!') }
      else         { await createClient(data);             toast.success('Cliente criado!') }
      setModalOpen(false); load()
    } catch { toast.error('Erro ao salvar cliente') }
  }

  const handleDelete = async (id) => {
    try { await deleteClient(id); toast.success('Cliente removido'); setDeleteConfirm(null); load() }
    catch { toast.error('Erro ao deletar') }
  }

  const getInitials = (name = '') => name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
  const AVATAR_COLORS = ['#027373','#038C7F','#025E5E','#04A89A','#026060']
  const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .cl-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 32px 0 64px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Header ── */
        .cl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cl-header-left { display: flex; align-items: center; gap: 18px; }
        .cl-header-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #027373, #038C7F);
          display: flex; align-items: center; justify-content: center;
          color: #fff; box-shadow: 0 6px 20px rgba(2,115,115,.28); flex-shrink: 0;
        }
        .cl-page-title {
          font-size: 22px; font-weight: 800; color: #0D0D0D;
          margin: 0 0 3px; letter-spacing: -.4px;
          display: flex; align-items: center; gap: 10px;
        }
        .cl-page-sub { font-size: 13px; color: #6B7280; margin: 0; }
        .cl-count {
          display: inline-flex; align-items: center;
          background: #EBF5F4; color: #027373;
          font-size: 12px; font-weight: 700; padding: 2px 10px;
          border-radius: 20px;
        }

        /* ── New button ── */
        .cl-btn-new {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px;
          border: none; background: linear-gradient(135deg, #027373, #038C7F);
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: .2s; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(2,115,115,.3);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-btn-new:hover {
          background: linear-gradient(135deg, #025E5E, #027373);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2,115,115,.4);
        }

        /* ── Stats bar ── */
        .cl-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .cl-stat {
          background: #fff; border: 1px solid #E9ECEF; border-radius: 14px;
          padding: 20px 22px; display: flex; align-items: center; gap: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,.04); transition: .2s;
        }
        .cl-stat:hover {
          border-color: #ADD9D1;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(2,115,115,.08);
        }
        .cl-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #EBF5F4; display: flex; align-items: center;
          justify-content: center; color: #027373; flex-shrink: 0;
        }
        .cl-stat-num { font-size: 24px; font-weight: 800; color: #0D0D0D; line-height: 1; margin-bottom: 3px; }
        .cl-stat-lbl { font-size: 12px; color: #6B7280; font-weight: 500; }

        /* ── Search ── */
        .cl-search-wrap {
          position: relative; margin-bottom: 28px;
        }
        .cl-search-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none;
        }
        .cl-search {
          width: 100%; padding: 13px 16px 13px 46px;
          border: 1.5px solid #E5E7EB; border-radius: 12px;
          font-size: 14px; color: #374151; background: #fff;
          outline: none; transition: .2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .cl-search:focus { border-color: #027373; box-shadow: 0 0 0 4px rgba(2,115,115,.08); }
        .cl-search::placeholder { color: #C4C8CF; }
        .cl-search-clear {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border-radius: 50%;
          border: none; background: #E5E7EB; color: #6B7280;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: .15s;
        }
        .cl-search-clear:hover { background: #CBD5E1; }

        /* ── Grid ── */
        .cl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        /* ── Card ── */
        .cl-card {
          background: #fff; border: 1px solid #E9ECEF;
          border-radius: 18px; overflow: hidden;
          transition: .22s; cursor: default;
          box-shadow: 0 2px 8px rgba(0,0,0,.05);
        }
        .cl-card:hover {
          border-color: #ADD9D1;
          box-shadow: 0 10px 32px rgba(2,115,115,.12);
          transform: translateY(-3px);
        }
        .cl-card-accent {
          height: 5px;
          background: linear-gradient(90deg, #027373, #038C7F, #ADD9D1);
        }
        .cl-card-body { padding: 24px 24px 20px; }

        .cl-avatar-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 16px;
        }
        .cl-avatar {
          width: 54px; height: 54px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
          font-size: 19px; font-weight: 800; color: #fff; flex-shrink: 0;
          letter-spacing: -.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .cl-card-actions { display: flex; gap: 8px; }
        .cl-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          border: 1.5px solid #E5E7EB; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: .15s; color: #9CA3AF;
        }
        .cl-action-btn.edit:hover   { border-color: #027373; color: #027373; background: #EBF5F4; }
        .cl-action-btn.delete:hover { border-color: #FCA5A5; color: #D95252; background: #FFF5F5; }

        .cl-name {
          font-size: 16px; font-weight: 700; color: #0D0D0D;
          margin-bottom: 14px; letter-spacing: -.2px; line-height: 1.3;
        }
        .cl-contacts { display: flex; flex-direction: column; gap: 8px; }
        .cl-contact-row {
          display: flex; align-items: center; gap: 9px;
          font-size: 13px; color: #6B7280;
        }
        .cl-contact-row svg { color: #4FADA8; flex-shrink: 0; }
        .cl-contact-val {
          font-weight: 500; color: #374151;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .cl-card-footer {
          border-top: 1px solid #F3F4F6;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
          background: #FAFAFA;
        }
        .cl-footer-badge {
          font-size: 11px; font-weight: 700; padding: 4px 12px;
          border-radius: 20px; background: #EBF5F4; color: #027373;
          letter-spacing: .2px;
        }
        .cl-footer-link {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; color: #027373;
          cursor: pointer; transition: .15s; border: none; background: none; padding: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-footer-link:hover { color: #025E5E; gap: 6px; }

        /* ── Empty state ── */
        .cl-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
        }
        .cl-empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: linear-gradient(135deg, #EBF5F4, #ADD9D1);
          display: flex; align-items: center; justify-content: center;
          color: #027373; margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(2,115,115,.15);
        }
        .cl-empty-title { font-size: 20px; font-weight: 800; color: #0D0D0D; margin-bottom: 8px; }
        .cl-empty-sub   { font-size: 14px; color: #6B7280; margin-bottom: 24px; max-width: 320px; line-height: 1.6; }

        /* ── Loading ── */
        .cl-loading {
          display: flex; justify-content: center; align-items: center; padding: 80px 0;
        }
        .cl-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #ADD9D1; border-top-color: #027373;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Modal fields ── */
        .cl-modal-field { margin-bottom: 16px; }
        .cl-modal-label {
          font-size: 12px; font-weight: 600; color: #374151;
          margin-bottom: 6px; display: block; letter-spacing: .2px;
        }
        .cl-modal-input {
          width: 100%; padding: 11px 14px 11px 40px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; font-size: 14px; color: #374151;
          outline: none; transition: .15s; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-modal-input:focus { border-color: #027373; box-shadow: 0 0 0 3px rgba(2,115,115,.1); }
        .cl-modal-input::placeholder { color: #C4C8CF; }
        .cl-modal-input.error { border-color: #D95252; }
        .cl-modal-error { font-size: 11px; color: #D95252; margin-top: 4px; }
        .cl-modal-input-icon { position: relative; }
        .cl-modal-input-icon svg {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: #ADD9D1; pointer-events: none;
        }

        .cl-modal-footer { display: flex; gap: 10px; padding-top: 8px; }
        .cl-modal-cancel {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-size: 14px; font-weight: 600; color: #374151;
          cursor: pointer; transition: .15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-modal-cancel:hover { border-color: #CBD5E1; background: #F9FAFB; }
        .cl-modal-save {
          flex: 1; padding: 12px; border-radius: 10px;
          border: none; background: linear-gradient(135deg, #027373, #038C7F);
          font-size: 14px; font-weight: 700; color: #fff;
          cursor: pointer; transition: .2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(2,115,115,.25);
        }
        .cl-modal-save:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(2,115,115,.35); }

        /* ── Delete confirm ── */
        .cl-delete-overlay {
          position: fixed; inset: 0; background: rgba(13,13,13,.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; backdrop-filter: blur(4px);
          animation: fadeIn .15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cl-delete-box {
          background: #fff; border-radius: 20px; padding: 32px;
          width: 100%; max-width: 380px; text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,.15);
          animation: scaleIn .15s ease;
        }
        @keyframes scaleIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .cl-delete-icon-wrap {
          width: 64px; height: 64px; border-radius: 18px;
          background: #FFF5F5; display: flex; align-items: center; justify-content: center;
          color: #D95252; margin: 0 auto 18px;
        }
        .cl-delete-title { font-size: 18px; font-weight: 800; color: #0D0D0D; margin-bottom: 8px; }
        .cl-delete-sub   { font-size: 13px; color: #6B7280; margin-bottom: 24px; line-height: 1.6; }
        .cl-delete-actions { display: flex; gap: 10px; }
        .cl-delete-cancel {
          flex: 1; padding: 12px; border-radius: 10px;
          border: 1.5px solid #E5E7EB; background: #fff;
          font-size: 14px; font-weight: 600; color: #374151;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: .15s;
        }
        .cl-delete-cancel:hover { background: #F9FAFB; }
        .cl-delete-confirm {
          flex: 1; padding: 12px; border-radius: 10px;
          border: none; background: #D95252; color: #fff;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: .15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cl-delete-confirm:hover { background: #B94040; }

        @media (max-width: 900px) {
          .cl-stats { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .cl-root { padding: 20px 0 48px; }
          .cl-stats { grid-template-columns: 1fr; }
          .cl-grid  { grid-template-columns: 1fr; }
          .cl-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="cl-root">

        {/* Header */}
        <div className="cl-header">
          <div className="cl-header-left">
            <div className="cl-header-icon"><Users size={22} /></div>
            <div>
              <h1 className="cl-page-title">
                Clientes
                {!loading && <span className="cl-count">{clients.length}</span>}
              </h1>
              <p className="cl-page-sub">Gerencie sua base de clientes</p>
            </div>
          </div>
          <button className="cl-btn-new" onClick={openCreate}>
            <UserPlus size={16} /> Novo cliente
          </button>
        </div>

        {/* Stats */}
        {!loading && clients.length > 0 && (
          <div className="cl-stats">
            <div className="cl-stat">
              <div className="cl-stat-icon"><Users size={18} /></div>
              <div>
                <div className="cl-stat-num">{clients.length}</div>
                <div className="cl-stat-lbl">Total de clientes</div>
              </div>
            </div>
            <div className="cl-stat">
              <div className="cl-stat-icon"><Phone size={18} /></div>
              <div>
                <div className="cl-stat-num">{clients.filter(c => c.phone).length}</div>
                <div className="cl-stat-lbl">Com telefone</div>
              </div>
            </div>
            <div className="cl-stat">
              <div className="cl-stat-icon"><Mail size={18} /></div>
              <div>
                <div className="cl-stat-num">{clients.filter(c => c.email).length}</div>
                <div className="cl-stat-lbl">Com e-mail</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="cl-search-wrap">
          <Search size={16} className="cl-search-icon" />
          <input
            className="cl-search"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="cl-search-clear" onClick={() => setSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="cl-loading"><div className="cl-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="cl-empty">
            <div className="cl-empty-icon"><Users size={32} /></div>
            <div className="cl-empty-title">{search ? 'Nenhum resultado' : 'Nenhum cliente ainda'}</div>
            <div className="cl-empty-sub">
              {search
                ? `Nenhum cliente encontrado para "${search}". Tente outro termo.`
                : 'Cadastre seus clientes para agilizar a criação de orçamentos.'}
            </div>
            {!search && (
              <button className="cl-btn-new" onClick={openCreate}>
                <UserPlus size={16} /> Adicionar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          <div className="cl-grid">
            {filtered.map(c => (
              <div key={c.id} className="cl-card">
                <div className="cl-card-accent" />
                <div className="cl-card-body">
                  <div className="cl-avatar-row">
                    <div className="cl-avatar" style={{ background: avatarColor(c.name) }}>
                      {getInitials(c.name)}
                    </div>
                    <div className="cl-card-actions">
                      <button className="cl-action-btn edit" onClick={() => openEdit(c)} title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button className="cl-action-btn delete" onClick={() => setDeleteConfirm(c)} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cl-name">{c.name}</div>
                  <div className="cl-contacts">
                    {c.phone && (
                      <div className="cl-contact-row">
                        <Phone size={13} />
                        <span className="cl-contact-val">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="cl-contact-row">
                        <Mail size={13} />
                        <span className="cl-contact-val">{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="cl-contact-row">
                        <MapPin size={13} />
                        <span className="cl-contact-val">{c.address}</span>
                      </div>
                    )}
                    {!c.phone && !c.email && !c.address && (
                      <div className="cl-contact-row">
                        <span style={{ color:'#C4C8CF', fontSize:12 }}>Sem informações de contato</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="cl-card-footer">
                  <span className="cl-footer-badge">Cliente</span>
                  <button className="cl-footer-link">
                    Ver orçamentos <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal criar/editar */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}
          title={editing ? 'Editar cliente' : 'Novo cliente'}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="cl-modal-field">
              <label className="cl-modal-label">Nome *</label>
              <div className="cl-modal-input-icon">
                <Users size={15} />
                <input className={`cl-modal-input${errors.name ? ' error' : ''}`} placeholder="João Silva"
                  {...register('name', { required: 'Informe o nome' })} />
              </div>
              {errors.name && <div className="cl-modal-error">{errors.name.message}</div>}
            </div>
            <div className="cl-modal-field">
              <label className="cl-modal-label">Telefone</label>
              <div className="cl-modal-input-icon">
                <Phone size={15} />
                <input className="cl-modal-input" placeholder="(11) 99999-9999" {...register('phone')} />
              </div>
            </div>
            <div className="cl-modal-field">
              <label className="cl-modal-label">E-mail</label>
              <div className="cl-modal-input-icon">
                <Mail size={15} />
                <input className="cl-modal-input" type="email" placeholder="joao@email.com" {...register('email')} />
              </div>
            </div>
            <div className="cl-modal-field">
              <label className="cl-modal-label">Endereço</label>
              <div className="cl-modal-input-icon">
                <MapPin size={15} />
                <input className="cl-modal-input" placeholder="Rua das Flores, 123" {...register('address')} />
              </div>
            </div>
            <div className="cl-modal-footer">
              <button type="button" className="cl-modal-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="cl-modal-save">{editing ? 'Salvar alterações' : 'Criar cliente'}</button>
            </div>
          </form>
        </Modal>

        {/* Confirmar exclusão */}
        {deleteConfirm && (
          <div className="cl-delete-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="cl-delete-box" onClick={e => e.stopPropagation()}>
              <div className="cl-delete-icon-wrap"><Trash2 size={26} /></div>
              <div className="cl-delete-title">Excluir cliente?</div>
              <div className="cl-delete-sub">
                Tem certeza que deseja excluir <strong>{deleteConfirm.name}</strong>? Esta ação não pode ser desfeita.
              </div>
              <div className="cl-delete-actions">
                <button className="cl-delete-cancel" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                <button className="cl-delete-confirm" onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}