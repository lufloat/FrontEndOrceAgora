// src/pages/auth/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Input } from '../../components/ui/Input'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setErrorMsg('')
      // await forgotPassword(data) — plug in your API call here
      setSent(true)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary mb-1">OrceAgora</h1>
        <p className="text-muted text-sm mb-6">Recuperar senha</p>

        {sent ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>Se esse e-mail estiver cadastrado, você receberá as instruções em breve.</span>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email', { required: 'Informe o e-mail' })}
              />
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-center text-muted mt-4">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-primary font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}