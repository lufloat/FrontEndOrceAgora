import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { forgotPassword } from '../../api/auth'

const T = {
  teal1: '#027373', teal2: '#038C7F',
  mint: '#ADD9D1', coral: '#D95252',
  dark: '#0D0D0D', surface: '#F0F7F6', muted: '#5E7B78',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .fp-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .fp-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(145deg, #e8f5f3 0%, #f5f0ff 50%, #fef0ee 100%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    position: relative; overflow: hidden;
  }

  .fp-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.35; pointer-events: none;
  }
  .fp-blob-1 { width: 320px; height: 320px; background: ${T.mint}; top: -80px; left: -80px; }
  .fp-blob-2 { width: 240px; height: 240px; background: ${T.coral}; bottom: -60px; right: -60px; opacity: 0.18; }
  .fp-blob-3 { width: 180px; height: 180px; background: #b5a7f5; top: 40%; right: -40px; opacity: 0.2; }

  .fp-card {
    background: rgba(255,255,255,0.84);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 28px;
    padding: 44px 40px;
    width: 100%; max-width: 420px;
    box-shadow: 0 24px 64px rgba(2,115,115,0.13), 0 4px 16px rgba(0,0,0,0.05);
    position: relative; z-index: 1;
  }

  .fp-logo {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 700;
    color: ${T.dark};
    margin-bottom: 32px;
    display: inline-flex; align-items: center; gap: 8px;
    letter-spacing: -0.5px;
  }
  .fp-logo span { color: ${T.teal2}; }
  .fp-logo-dot {
    width: 9px; height: 9px; border-radius: 50%;
    background: linear-gradient(135deg, ${T.teal2}, ${T.coral});
    display: inline-block;
  }

  .fp-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500;
    color: ${T.muted};
    text-decoration: none;
    margin-bottom: 28px;
    transition: color 0.2s;
  }
  .fp-back:hover { color: ${T.teal2}; }
  .fp-back-arrow {
    width: 26px; height: 26px; border-radius: 8px;
    background: rgba(173,217,209,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; transition: background 0.2s;
  }
  .fp-back:hover .fp-back-arrow { background: rgba(3,140,127,0.12); }

  .fp-icon-wrap {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, rgba(3,140,127,0.1), rgba(173,217,209,0.2));
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    font-size: 30px;
    border: 1px solid rgba(173,217,209,0.4);
  }

  .fp-title {
    font-family: 'Sora', sans-serif;
    font-size: 26px; font-weight: 700;
    color: ${T.dark};
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .fp-title em { color: ${T.teal2}; font-style: normal; }

  .fp-subtitle {
    font-size: 14px; color: ${T.muted};
    line-height: 1.6; margin-bottom: 28px;
  }

  /* Input group */
  .fp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
  .fp-label {
    font-size: 13px; font-weight: 600;
    color: #3a5250;
    font-family: 'Sora', sans-serif;
  }
  .fp-input-wrap {
    position: relative;
    display: flex; align-items: center;
  }
  .fp-input-icon {
    position: absolute; left: 14px;
    color: ${T.teal2}; font-size: 16px;
    pointer-events: none;
  }
  .fp-input {
    width: 100%;
    padding: 14px 14px 14px 42px;
    border-radius: 14px;
    border: 1.5px solid rgba(173,217,209,0.5);
    background: rgba(240,247,246,0.6);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: ${T.dark};
    outline: none;
    transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .fp-input::placeholder { color: #a8c0bc; }
  .fp-input:focus {
    border-color: ${T.teal2};
    background: white;
    box-shadow: 0 0 0 4px rgba(3,140,127,0.1);
  }
  .fp-error { font-size: 12px; color: ${T.coral}; }

  /* Trust badge */
  .fp-trust {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: ${T.muted};
    margin-top: 12px;
  }
  .fp-trust-dot {
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(3,140,127,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: ${T.teal2};
    flex-shrink: 0;
  }

  /* Button */
  .fp-btn {
    width: 100%; padding: 16px;
    border-radius: 14px; border: none;
    font-family: 'Sora', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn-primary {
    background: linear-gradient(135deg, ${T.teal1} 0%, ${T.teal2} 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(2,115,115,0.28);
  }
  .fp-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(2,115,115,0.38);
  }
  .fp-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Success state */
  .fp-success-icon {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(3,140,127,0.12), rgba(173,217,209,0.25));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
    font-size: 36px;
    border: 2px solid rgba(173,217,209,0.4);
    position: relative;
  }
  .fp-success-ring {
    position: absolute; inset: -10px; border-radius: 50%;
    border: 2px dashed rgba(3,140,127,0.2);
    animation: rot 14s linear infinite;
  }
  @keyframes rot { to { transform: rotate(360deg); } }

  .fp-success-title {
    font-family: 'Sora', sans-serif;
    font-size: 26px; font-weight: 700;
    color: ${T.dark}; margin-bottom: 10px;
    letter-spacing: -0.5px; text-align: center;
  }
  .fp-success-title em { color: ${T.teal2}; font-style: normal; }
  .fp-success-desc {
    font-size: 14px; color: ${T.muted}; line-height: 1.7;
    text-align: center; margin-bottom: 32px;
  }

  .fp-info-box {
    background: rgba(173,217,209,0.12);
    border: 1px solid rgba(173,217,209,0.4);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 24px; text-align: left;
  }
  .fp-info-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .fp-info-text { font-size: 13px; color: ${T.muted}; line-height: 1.5; }
  .fp-info-text strong { color: ${T.teal1}; font-weight: 600; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fp-animate { animation: fadeUp 0.4s ease both; }
`

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

  return (
    <>
      <style>{css}</style>
      <div className="fp-root">
        <div className="fp-blob fp-blob-1" />
        <div className="fp-blob fp-blob-2" />
        <div className="fp-blob fp-blob-3" />

        <div className="fp-card">
          <div className="fp-logo">
            <span className="fp-logo-dot" />
            Orce<span>Agora</span>
          </div>

          {/* ── E-MAIL SENT ── */}
          {sent ? (
            <div className="fp-animate" style={{ textAlign: 'center' }}>
              <div className="fp-success-icon">
                <div className="fp-success-ring" />
                ✉️
              </div>
              <h2 className="fp-success-title">E-mail <em>enviado!</em></h2>
              <p className="fp-success-desc">
                Verifique sua caixa de entrada e siga as instruções
                para redefinir sua senha. O link expira em <strong>1 hora</strong>.
              </p>

              <div className="fp-info-box">
                <span className="fp-info-icon">🛡️</span>
                <p className="fp-info-text">
                  Não encontrou o e-mail? Verifique a pasta de spam ou
                  <strong> aguarde alguns minutos</strong> antes de tentar novamente.
                </p>
              </div>

              <Link to="/login" className="fp-btn fp-btn-primary" style={{ textDecoration: 'none' }}>
                Voltar ao login →
              </Link>
            </div>
          ) : (
            /* ── FORM ── */
            <div className="fp-animate">
              <Link to="/login" className="fp-back">
                <span className="fp-back-arrow">←</span>
                Voltar ao login
              </Link>

           

              <h1 className="fp-title">
                Esqueceu sua<br /><em>senha?</em>
              </h1>
              <p className="fp-subtitle">
                Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="fp-field">
                  <label className="fp-label">E-mail</label>
                  <div className="fp-input-wrap">
                    <span className="fp-input-icon">✉</span>
                    <input
                      className="fp-input"
                      type="email"
                      placeholder="seu@email.com"
                      {...register('email', { required: 'Informe o e-mail' })}
                    />
                  </div>
                  {errors.email && <span className="fp-error">{errors.email.message}</span>}
                </div>

                <button className="fp-btn fp-btn-primary" disabled={loading}>
                  {loading ? '⏳ Enviando...' : '🚀 Enviar instruções'}
                </button>

                <div className="fp-trust">
                  <span className="fp-trust-dot">🔒</span>
                  Seus dados estão protegidos com criptografia
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}