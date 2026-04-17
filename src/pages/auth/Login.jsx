import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { GoogleButton } from '../../components/ui/GoogleButton'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setErrorMsg('')
      const res = await login(data)
      setAuth(res.data.user, res.data.token)
      navigate('/budgets')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || 'Erro ao entrar'
      if (status === 429) setIsLocked(true)
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary mb-1">StimServ</h1>
        <p className="text-muted text-sm mb-6">Entre na sua conta</p>

        {errorMsg && (
          <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 text-sm
            ${isLocked
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="E-mail" type="email" placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Informe o e-mail' })} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••"
                {...register('password', { required: 'Informe a senha' })} />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link to="/esqueci-senha"
                className="text-xs text-primary hover:underline mt-1">
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <button className="btn-primary w-full" disabled={loading || isLocked}>
            {loading ? 'Entrando...' : 'Entrar'}
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
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-medium">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}