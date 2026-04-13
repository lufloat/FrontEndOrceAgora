import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { confirmEmail } from '../../api/auth'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function ConfirmEmail() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const token = params.get('token')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    confirmEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800">Confirmando...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              E-mail confirmado!
            </h2>
            <p className="text-muted text-sm mb-6">
              Sua conta está ativa. Faça login para começar.
            </p>
            <Link to="/login" className="btn-primary w-full block text-center">
              Fazer login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Link inválido
            </h2>
            <p className="text-muted text-sm mb-6">
              O link expirou ou já foi usado. Faça login e solicite um novo.
            </p>
            <Link to="/login" className="btn-primary w-full block text-center">
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}