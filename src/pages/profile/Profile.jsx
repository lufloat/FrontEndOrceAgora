import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, updateLogo } from '../../api/profile'
import { useAuthStore } from '../../store/authStore'
import { Layout } from '../../components/Layout'
import { Camera, User, Building2, Phone, MapPin, Palette, CheckCircle2, Upload } from 'lucide-react'

const PALETTE = ['#027373', '#038C7F', '#D95252', '#422F29', '#1A56DB', '#9333EA', '#EA580C', '#16A34A', '#0891B2', '#1E293B']

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const { register, handleSubmit, reset, watch, setValue } = useForm()
  const brandColor = watch('brandColor', '#027373')

  useEffect(() => {
    getProfile().then(r => {
      reset(r.data)
      setLogoPreview(r.data.logoUrl)
    }).finally(() => setLoading(false))
  }, [])

  const onSubmit = async (data) => {
    try {
      setSaving(true)
      const res = await updateProfile(data)
      setAuth(res.data, token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      toast.success('Perfil atualizado!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 500000) { toast.error('Imagem muito grande. Máx 500KB'); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setLogoPreview(base64)
      try {
        await updateLogo(base64)
        toast.success('Logo atualizada!')
      } catch {
        toast.error('Erro ao salvar logo')
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(2,115,115,.15)', borderTop: '3px solid #027373', animation: 'pfspin .7s linear infinite' }} />
        <style>{`@keyframes pfspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .pf, .pf * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .pf { padding: 32px 0 80px; max-width: 560px; margin: 0 auto; }

        .pf-page-title { font-size: 26px; font-weight: 800; color: #0D0D0D; margin: 0 0 4px; letter-spacing: -.5px; }
        .pf-page-sub { font-size: 13px; color: #9CA3AF; margin: 0 0 28px; }

        /* Section card */
        .pf-section { background: #fff; border-radius: 18px; border: 1.5px solid #EBEBEB; overflow: hidden; margin-bottom: 16px; }
        .pf-section-hd { display: flex; align-items: center; gap: 10px; padding: 18px 22px; border-bottom: 1px solid #F3F4F6; }
        .pf-section-hd-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pf-section-hd-text h3 { font-size: 14px; font-weight: 700; color: #0D0D0D; margin: 0 0 2px; letter-spacing: -.2px; }
        .pf-section-hd-text p { font-size: 12px; color: #9CA3AF; margin: 0; }
        .pf-section-body { padding: 22px; display: flex; flex-direction: column; gap: 16px; }

        /* Logo */
        .pf-logo-wrap { display: flex; align-items: center; gap: 20px; }
        .pf-logo-box { position: relative; flex-shrink: 0; cursor: pointer; }
        .pf-logo-img { width: 88px; height: 88px; border-radius: 18px; border: 2px solid #EBEBEB; background: #F9FAFB; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border .2s; }
        .pf-logo-box:hover .pf-logo-img { border-color: #ADD9D1; }
        .pf-logo-overlay { position: absolute; inset: 0; border-radius: 18px; background: rgba(2,115,115,.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; }
        .pf-logo-box:hover .pf-logo-overlay { opacity: 1; }
        .pf-logo-badge { position: absolute; bottom: -5px; right: -5px; width: 26px; height: 26px; background: #027373; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
        .pf-logo-info p { font-size: 14px; font-weight: 600; color: #0D0D0D; margin: 0 0 4px; }
        .pf-logo-info span { font-size: 12px; color: #9CA3AF; line-height: 1.5; display: block; }
        .pf-upload-btn { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: #F0FAFA; color: #027373; border: 1.5px solid #ADD9D1; border-radius: 9px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .pf-upload-btn:hover { background: #ADD9D1; }

        /* Field */
        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-label { font-size: 11px; font-weight: 700; color: #6B7280; letter-spacing: .4px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .pf-label svg { color: #9CA3AF; }
        .pf-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E5E7EB; border-radius: 11px; font-size: 14px; color: #0D0D0D; outline: none; transition: all .15s; background: #FAFAFA; font-family: 'Inter', sans-serif; }
        .pf-input:focus { border-color: #038C7F; background: #fff; box-shadow: 0 0 0 3px rgba(3,140,127,.08); }
        .pf-input::placeholder { color: #C4C8CF; }

        /* Color picker */
        .pf-color-row { display: flex; align-items: center; gap: 12px; }
        .pf-color-preview { width: 48px; height: 48px; border-radius: 13px; border: 2px solid rgba(0,0,0,.08); flex-shrink: 0; transition: background .2s; position: relative; overflow: hidden; cursor: pointer; }
        .pf-color-preview input[type=color] { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); opacity: 0; cursor: pointer; }
        .pf-color-input-wrap { flex: 1; }
        .pf-palette { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
        .pf-swatch { width: 32px; height: 32px; border-radius: 9px; border: 2.5px solid transparent; cursor: pointer; transition: all .15s; flex-shrink: 0; }
        .pf-swatch:hover { transform: scale(1.15); }
        .pf-swatch.active { border-color: #0D0D0D; box-shadow: 0 0 0 2px #fff inset; }

        /* PDF preview strip */
        .pf-pdf-preview { border-radius: 11px; overflow: hidden; border: 1.5px solid #E5E7EB; }
        .pf-pdf-header { height: 36px; display: flex; align-items: center; padding: 0 16px; gap: 8px; }
        .pf-pdf-body { background: #FAFAFA; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
        .pf-pdf-line { height: 8px; border-radius: 4px; background: #E5E7EB; }

        /* Save button */
        .pf-save { width: 100%; padding: 14px; border-radius: 13px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .2s; letter-spacing: -.2px; }
        .pf-save-idle { background: #027373; color: #fff; }
        .pf-save-idle:hover { background: #038C7F; box-shadow: 0 6px 20px rgba(2,115,115,.3); transform: translateY(-1px); }
        .pf-save-idle:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
        .pf-save-done { background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0; }
      `}</style>

      <div className="pf">
        <p className="pf-page-title">Perfil da empresa</p>
        <p className="pf-page-sub">Informações que aparecem nos seus orçamentos em PDF</p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Logo ── */}
          <div className="pf-section">
            <div className="pf-section-hd">
              <div className="pf-section-hd-icon" style={{ background: '#F0FAFA' }}>
                <Camera size={16} color="#027373" />
              </div>
              <div className="pf-section-hd-text">
                <h3>Identidade visual</h3>
                <p>Logo exibida no cabeçalho do PDF</p>
              </div>
            </div>
            <div className="pf-section-body">
              <div className="pf-logo-wrap">
                <div className="pf-logo-box" onClick={() => fileRef.current.click()}>
                  <div className="pf-logo-img">
                    {logoPreview
                      ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="logo" />
                      : <Building2 size={30} color="#D1D5DB" />
                    }
                  </div>
                  <div className="pf-logo-overlay">
                    <Camera size={20} color="#fff" />
                  </div>
                  <div className="pf-logo-badge">
                    <Camera size={11} color="#fff" />
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
                </div>
                <div className="pf-logo-info">
                  <p>Logo da empresa</p>
                  <span>PNG ou JPG · Máximo 500KB</span>
                  <span>Aparece no topo do PDF do orçamento</span>
                  <button type="button" className="pf-upload-btn" onClick={() => fileRef.current.click()}>
                    <Upload size={12} />
                    {logoPreview ? 'Trocar logo' : 'Enviar logo'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Informações ── */}
          <div className="pf-section">
            <div className="pf-section-hd">
              <div className="pf-section-hd-icon" style={{ background: '#F5F3FF' }}>
                <User size={16} color="#7C3AED" />
              </div>
              <div className="pf-section-hd-text">
                <h3>Informações</h3>
                <p>Dados exibidos no rodapé dos orçamentos</p>
              </div>
            </div>
            <div className="pf-section-body">
              <div className="pf-field">
                <label className="pf-label"><User size={12} /> Seu nome</label>
                <input className="pf-input" placeholder="João Silva" {...register('name')} />
              </div>
              <div className="pf-field">
                <label className="pf-label"><Building2 size={12} /> Nome da empresa</label>
                <input className="pf-input" placeholder="Empresa Ltda." {...register('companyName')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="pf-field">
                  <label className="pf-label"><Phone size={12} /> Telefone</label>
                  <input className="pf-input" placeholder="(11) 99999-9999" {...register('phone')} />
                </div>
                <div className="pf-field">
                  <label className="pf-label"><MapPin size={12} /> Endereço</label>
                  <input className="pf-input" placeholder="Rua, número..." {...register('address')} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Cor da marca ── */}
          <div className="pf-section">
            <div className="pf-section-hd">
              <div className="pf-section-hd-icon" style={{ background: '#FFF0F2' }}>
                <Palette size={16} color="#D95252" />
              </div>
              <div className="pf-section-hd-text">
                <h3>Cor da marca</h3>
                <p>Usada no cabeçalho, tabela e totais do PDF</p>
              </div>
            </div>
            <div className="pf-section-body">
              <div className="pf-color-row">
                <div className="pf-color-preview" style={{ background: brandColor || '#027373' }}>
                  <input type="color" {...register('brandColor')}
                    onChange={e => setValue('brandColor', e.target.value)} />
                </div>
                <div className="pf-color-input-wrap">
                  <div className="pf-field">
                    <label className="pf-label">Código hexadecimal</label>
                    <input className="pf-input" placeholder="#027373"
                      {...register('brandColor')}
                      onChange={e => setValue('brandColor', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="pf-palette">
                {PALETTE.map(c => (
                  <button key={c} type="button"
                    className={`pf-swatch${brandColor === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setValue('brandColor', c)}
                  />
                ))}
              </div>

              {/* PDF preview */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.4px', margin: '0 0 8px' }}>Prévia no PDF</p>
                <div className="pf-pdf-preview">
                  <div className="pf-pdf-header" style={{ background: brandColor || '#027373' }}>
                    <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,.25)', borderRadius: 6 }} />
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.4)', borderRadius: 4 }} />
                    <div style={{ width: 60, height: 8, background: 'rgba(255,255,255,.3)', borderRadius: 4 }} />
                  </div>
                  <div className="pf-pdf-body">
                    <div className="pf-pdf-line" style={{ width: '55%' }} />
                    <div className="pf-pdf-line" style={{ width: '35%' }} />
                    <div style={{ height: 10 }} />
                    <div style={{ height: 24, background: (brandColor || '#027373') + '18', borderRadius: 6, border: `1px solid ${brandColor || '#027373'}30` }} />
                    <div className="pf-pdf-line" style={{ width: '100%' }} />
                    <div className="pf-pdf-line" style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <div style={{ width: 80, height: 20, background: brandColor || '#027373', borderRadius: 6, opacity: .85 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className={`pf-save ${saved ? 'pf-save-done' : 'pf-save-idle'}`}
          >
            {saved
              ? <><CheckCircle2 size={17} /> Perfil salvo com sucesso</>
              : saving
              ? 'Salvando...'
              : 'Salvar perfil'
            }
          </button>
        </form>
      </div>
    </Layout>
  )
}