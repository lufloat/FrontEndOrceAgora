import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { resetPassword } from '../../api/auth'
import { Input } from '../../components/ui/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const token = params.get('token')

  const onSubmit = async ({ newPassword }) => {
    if (!token) { toast.error('Token inválido'); return }
    try {
      setLoading(true)
      await resetPassword(token, newPassword)
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      toast.error('Link inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm text-center">
        <p className="text-4xl mb-4">✅</p>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Senha redefinida!
        </h2>
        <p className="text-muted text-sm">
          Redirecionando para o login...
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary mb-1">OrceAgora</h1>
        <p className="text-muted text-sm mb-6">Digite sua nova senha</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Mínimo 8 caracteres"
                {...register('newPassword', {
                  required: 'Informe a nova senha',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                })} />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-xs text-red-500">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}