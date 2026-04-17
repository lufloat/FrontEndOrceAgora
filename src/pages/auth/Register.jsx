import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { register as registerApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { GoogleButton } from '../../components/ui/GoogleButton'
import { Eye, EyeOff, Check, X } from 'lucide-react'

function PasswordStrength({ password }) {
  const rules = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Letra minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /[0-9]/.test(password) },
    { label: 'Caractere especial', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = rules.filter(r => r.ok).length
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-amber-400', 'bg-green-500']
  const labels = ['', 'Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte']

  if (!password) return null

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300
              ${i <= score ? colors[score - 1] : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? 'text-green-600' : 'text-amber-600'}`}>
        {labels[score]}
      </p>
      <div className="flex flex-col gap-1">
        {rules.map(r => (
          <div key={r.label} className="flex items-center gap-1.5">
            {r.ok
              ? <Check size={12} className="text-green-500 flex-shrink-0" />
              : <X size={12} className="text-slate-300 flex-shrink-0" />}
            <span className={`text-xs ${r.ok ? 'text-green-600' : 'text-slate-400'}`}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()
  const password = watch('password', '')

  const isStrongEnough = (pwd) => {
    return pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd)
  }

  const onSubmit = async (data) => {
    if (!isStrongEnough(data.password)) {
      toast.error('Crie uma senha mais forte')
      return
    }
    try {
      setLoading(true)
      const res = await registerApi(data)
      setAuth(res.data.user, res.data.token)
      toast.success('Conta criada!')
      navigate('/budgets')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary mb-1">StimServ</h1>
        <p className="text-muted text-sm mb-6">Crie sua conta grátis</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Seu nome" placeholder="João Silva"
            error={errors.name?.message}
            {...register('name', { required: 'Informe seu nome' })} />

          <Input label="Nome da empresa (opcional)" placeholder="Marcenaria do João"
            {...register('companyName')} />

          <Input label="E-mail" type="email" placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Informe o e-mail' })} />

          <Input label="Telefone" placeholder="11999999999"
            {...register('phone')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Crie uma senha forte"
                {...register('password', { required: true })} />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <button className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-muted">ou continue com</span>
          </div>
        </div>
        <GoogleButton />

        <p className="text-sm text-center text-muted mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}