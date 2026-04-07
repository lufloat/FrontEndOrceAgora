import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, updateLogo } from '../../api/profile'
import { useAuthStore } from '../../store/authStore'
import { Layout } from '../../components/Layout'
import { Input } from '../../components/ui/Input'
import { Camera } from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const fileRef = useRef()
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const { register, handleSubmit, reset } = useForm()

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
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Perfil da empresa</h1>

        {/* Logo */}
        <div className="card mb-5 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-xl border-2 border-slate-200 overflow-hidden
              flex items-center justify-center bg-slate-50">
              {logoPreview
                ? <img src={logoPreview} className="w-full h-full object-contain" />
                : <Camera size={28} className="text-slate-300" />}
            </div>
            <button type="button"
              onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1.5
                hover:bg-primary-dark transition-colors">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handleLogo} />
          </div>
          <div>
            <p className="font-medium text-slate-700">Logo da empresa</p>
            <p className="text-xs text-muted mt-0.5">PNG ou JPG · Máx 500KB</p>
            <p className="text-xs text-muted">Aparece no PDF do orçamento</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <h2 className="font-semibold text-slate-700">Informações</h2>
            <Input label="Seu nome" {...register('name')} />
            <Input label="Nome da empresa" {...register('companyName')} />
            <Input label="Telefone" {...register('phone')} />
            <Input label="Endereço" {...register('address')} />
          </div>

          {/* Cor da marca */}
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-3">Cor da marca</h2>
            <p className="text-xs text-muted mb-3">
              Essa cor será usada no PDF do orçamento — cabeçalho, tabela e totais.
            </p>
            <div className="flex items-center gap-3">
              <input type="color" className="w-12 h-12 rounded-lg border border-slate-200
                cursor-pointer p-1" {...register('brandColor')} />
              <Input label="Código hexadecimal"
                placeholder="#1A56DB" {...register('brandColor')} />
            </div>
            {/* Preview de paleta rápida */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {['#1A56DB','#16A34A','#DC2626','#9333EA','#EA580C','#0891B2','#1E293B'].map(color => (
                <button key={color} type="button"
                  onClick={() => reset(v => ({ ...v, brandColor: color }))}
                  style={{ backgroundColor: color }}
                  className="w-8 h-8 rounded-full border-2 border-white shadow
                    hover:scale-110 transition-transform" />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>

        <div className="h-20 md:h-0" />
      </div>
    </Layout>
  )
}