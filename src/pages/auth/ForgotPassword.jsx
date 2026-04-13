import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { forgotPassword } from '../../api/auth'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true)
      await forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center
          justify-center mx-auto mb-4">
          <Mail size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">E-mail enviado!</h2>
        <p className="text-sm text-muted mb-6">
          Verifique sua caixa de entrada e siga as instruções
          para redefinir sua senha. O link expira em 1 hora.
        </p>
        <Link to="/login" className="btn-primary w-full block text-center">
          Voltar ao login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm">
        <Link to="/login"
          className="flex items-center gap-1 text-sm text-muted mb-6
            hover:text-slate-600">
          <ArrowLeft size={16} /> Voltar ao login
        </Link>

        <h1 className="text-xl font-bold text-slate-800 mb-1">
          Esqueceu sua senha?
        </h1>
        <p className="text-sm text-muted mb-6">
          Informe seu e-mail e enviaremos as instruções.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="E-mail" type="email" placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Informe o e-mail' })} />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instruções'}
          </button>
        </form>
      </div>
    </div>
  )
}