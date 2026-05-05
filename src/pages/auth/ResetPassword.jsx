import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { resetPassword } from '../../api/auth'

const T = {
  teal1: '#027373', teal2: '#038C7F',
  mint: '#ADD9D1', coral: '#D95252',
  dark: '#0D0D0D', muted: '#5E7B78',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .rp-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(145deg, #e8f5f3 0%, #f5f0ff 50%, #fef0ee 100%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    position: relative; overflow: hidden;
  }

  .rp-blob {
    position: absolute; border-radius: 50%;
    filter: blur(80px); opacity: 0.35; pointer-events: none;
  }
  .rp-blob-1 { width: 320px; height: 320px; background: ${T.mint}; top: -80px; left: -80px; }
  .rp-blob-2 { width: 240px; height: 240px; background: ${T.coral}; bottom: -60px; right: -60px; opacity: 0.18; }
  .rp-blob-3 { width: 180px; height: 180px; background: #b5a7f5; top: 30%; right: -40px; opacity: 0.2; }

  .rp-card {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 28px;
    padding: 44px 40px;
    width: 100%; max-width: 420px;
    box-shadow: 0 24px 64px rgba(2,115,115,0.13), 0 4px 16px rgba(0,0,0,0.05);
    position: relative; z-index: 1;
  }

  .rp-logo {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 700; color: ${T.dark};
    margin-bottom: 32px; display: inline-flex; align-items: center; gap: 8px;
    letter-spacing: -0.5px;
  }
  .rp-logo span { color: ${T.teal2}; }
  .rp-logo-dot {
    width: 9px; height: 9px; border-radius: 50%;
    background: linear-gradient(135deg, ${T.teal2}, ${T.coral}); display: inline-block;
  }

  /* Icon */
  .rp-icon-wrap {
    width: 80px; height: 80px; border-radius: 24px;
    background: linear-gradient(135deg, rgba(3,140,127,0.1), rgba(173,217,209,0.2));
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px; font-size: 32px;
    border: 1px solid rgba(173,217,209,0.4);
  }

  .rp-title {
    font-family: 'Sora', sans-serif;
    font-size: 26px; font-weight: 700; color: ${T.dark};
    margin-bottom: 8px; letter-spacing: -0.5px; line-height: 1.2;
  }
  .rp-title em { color: ${T.teal2}; font-style: normal; }
  .rp-subtitle { font-size: 14px; color: ${T.muted}; line-height: 1.6; margin-bottom: 28px; }

  /* Field */
  .rp-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .rp-label { font-size: 13px; font-weight: 600; color: #3a5250; font-family: 'Sora', sans-serif; }
  .rp-input-wrap { position: relative; display: flex; align-items: center; }
  .rp-input-icon { position: absolute; left: 14px; color: ${T.teal2}; font-size: 15px; pointer-events: none; }
  .rp-input {
    width: 100%; padding: 14px 48px 14px 42px;
    border-radius: 14px; border: 1.5px solid rgba(173,217,209,0.5);
    background: rgba(240,247,246,0.6);
    font-family: 'DM Sans', sans-serif; font-size: 15px; color: ${T.dark};
    outline: none; transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .rp-input::placeholder { color: #a8c0bc; }
  .rp-input:focus {
    border-color: ${T.teal2}; background: white;
    box-shadow: 0 0 0 4px rgba(3,140,127,0.1);
  }
  .rp-toggle {
    position: absolute; right: 14px;
    background: none; border: none; cursor: pointer;
    color: ${T.muted}; font-size: 16px; padding: 4px;
    transition: color 0.2s;
  }
  .rp-toggle:hover { color: ${T.teal2}; }
  .rp-error { font-size: 12px; color: ${T.coral}; }

  /* Strength bar */
  .rp-strength { margin-bottom: 20px; }
  .rp-strength-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .rp-strength-label { font-size: 12px; font-weight: 600; color: #3a5250; font-family: 'Sora', sans-serif; }
  .rp-strength-value { font-size: 12px; font-weight: 600; }
  .rp-strength-value.weak   { color: ${T.coral}; }
  .rp-strength-value.fair   { color: #e8a830; }
  .rp-strength-value.good   { color: ${T.teal2}; }
  .rp-strength-value.strong { color: ${T.teal1}; }
  .rp-strength-bars { display: flex; gap: 6px; }
  .rp-strength-bar {
    flex: 1; height: 5px; border-radius: 10px;
    background: rgba(173,217,209,0.25);
    transition: background 0.3s;
  }
  .rp-strength-bar.active.weak   { background: ${T.coral}; }
  .rp-strength-bar.active.fair   { background: #e8a830; }
  .rp-strength-bar.active.good   { background: ${T.teal2}; }
  .rp-strength-bar.active.strong { background: ${T.teal1}; }

  /* Security tip box */
  .rp-tip {
    background: rgba(173,217,209,0.1);
    border: 1px solid rgba(173,217,209,0.35);
    border-radius: 14px; padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 24px;
  }
  .rp-tip-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .rp-tip-text { font-size: 13px; color: ${T.muted}; line-height: 1.5; }
  .rp-tip-text strong { color: ${T.teal1}; font-weight: 600; font-family: 'Sora', sans-serif; font-size: 12px; }

  /* Button */
  .rp-btn {
    width: 100%; padding: 16px; border-radius: 14px; border: none;
    font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .rp-btn-primary {
    background: linear-gradient(135deg, ${T.teal1} 0%, ${T.teal2} 100%);
    color: white; box-shadow: 0 8px 24px rgba(2,115,115,0.28);
  }
  .rp-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px); box-shadow: 0 14px 32px rgba(2,115,115,0.38);
  }
  .rp-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .rp-btn-outline {
    background: transparent; color: ${T.teal2};
    border: 1.5px solid rgba(3,140,127,0.3);
    text-decoration: none;
  }
  .rp-btn-outline:hover { background: rgba(3,140,127,0.06); }

  .rp-footer-trust {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 20px; font-size: 12px; color: ${T.muted};
  }

  /* Success screen */
  .rp-success { text-align: center; }
  .rp-success-circle {
    width: 100px; height: 100px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(3,140,127,0.08), rgba(173,217,209,0.2));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px; font-size: 44px;
    border: 2px solid rgba(173,217,209,0.4);
    position: relative;
  }
  .rp-success-ring {
    position: absolute; inset: -10px; border-radius: 50%;
    border: 2px dashed rgba(3,140,127,0.2);
    animation: rot 14s linear infinite;
  }
  /* confetti dots */
  .rp-confetti span {
    position: absolute; width: 8px; height: 8px; border-radius: 2px;
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(-10px) rotate(180deg); }
  }
  @keyframes rot { to { transform: rotate(360deg); } }

  .rp-success-title {
    font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700;
    color: ${T.dark}; margin-bottom: 10px; letter-spacing: -0.5px;
  }
  .rp-success-desc { font-size: 14px; color: ${T.muted}; line-height: 1.7; margin-bottom: 28px; }

  .rp-countdown {
    background: rgba(173,217,209,0.1); border: 1px solid rgba(173,217,209,0.35);
    border-radius: 14px; padding: 16px;
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px; text-align: left;
  }
  .rp-countdown-icon { font-size: 22px; flex-shrink: 0; }
  .rp-countdown-text { font-size: 14px; color: ${T.teal1}; font-weight: 500; flex: 1; }
  .rp-countdown-bar {
    height: 4px; border-radius: 10px; background: rgba(173,217,209,0.3);
    margin-top: 6px; overflow: hidden;
  }
  .rp-countdown-fill {
    height: 100%; border-radius: 10px;
    background: linear-gradient(90deg, ${T.teal1}, ${T.teal2});
    animation: shrink 3s linear forwards;
  }
  @keyframes shrink { from { width: 100%; } to { width: 0%; } }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-animate { animation: fadeUp 0.4s ease both; }
`

function getStrength(pwd) {
  if (!pwd || pwd.length < 4) return { level: 0, label: 'Fraca', cls: 'weak' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { level: 1, label: 'Fraca', cls: 'weak' }
  if (score === 2) return { level: 2, label: 'Regular', cls: 'fair' }
  if (score === 3) return { level: 3, label: 'Boa', cls: 'good' }
  return { level: 4, label: 'Forte', cls: 'strong' }
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [done, setDone] = useState(false)
  const [pwdValue, setPwdValue] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const token = params.get('token')

  const onSubmit = async ({ newPassword }) => {
    if (!token) { toast.error('Token inválido'); return }
    try {
      setLoading(true)
      await resetPassword(token, newPassword)
      setDone(true)
      setTimeout(() => navigate('/login'), 3500)
    } catch {
      toast.error('Link inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  const strength = getStrength(pwdValue)

  return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        <div className="rp-blob rp-blob-1" />
        <div className="rp-blob rp-blob-2" />
        <div className="rp-blob rp-blob-3" />

        <div className="rp-card">
          <div className="rp-logo">
            <span className="rp-logo-dot" />
            Orce<span>Agora</span>
          </div>

          {/* ── SUCCESS ── */}
          {done ? (
            <div className="rp-success rp-animate">
              <div className="rp-success-circle">
                <div className="rp-success-ring" />
                <div className="rp-confetti">
                  <span style={{ background: T.teal2, top: '-10px', left: '10px', animationDelay: '0s' }} />
                  <span style={{ background: T.coral, top: '-5px', right: '8px', animationDelay: '0.5s' }} />
                  <span style={{ background: '#b5a7f5', bottom: '-8px', left: '20px', animationDelay: '1s' }} />
                  <span style={{ background: '#e8a830', bottom: '-5px', right: '15px', animationDelay: '1.5s' }} />
                </div>
                ✅
              </div>

              <h2 className="rp-success-title">Senha redefinida<br />com sucesso!</h2>
              <p className="rp-success-desc">
                Sua senha foi alterada e sua conta está segura.<br />
                Em instantes, você será redirecionado para o login.
              </p>

              <div className="rp-countdown">
                <span className="rp-countdown-icon">⏱️</span>
                <div style={{ flex: 1 }}>
                  <div className="rp-countdown-text">Redirecionando em 3 segundos...</div>
                  <div className="rp-countdown-bar">
                    <div className="rp-countdown-fill" />
                  </div>
                </div>
              </div>

              <Link to="/login" className="rp-btn rp-btn-outline">
                Ir para o login agora →
              </Link>

              <div className="rp-footer-trust" style={{ marginTop: 16 }}>
                🔒 Obrigado por manter sua conta segura.
              </div>
            </div>
          ) : (
            /* ── FORM ── */
            <div className="rp-animate">
              <div className="rp-icon-wrap">🔒</div>
              <h1 className="rp-title">Redefinir<br /><em>senha</em></h1>
              <p className="rp-subtitle">
                Digite sua nova senha para continuar e recuperar o acesso à sua conta.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="rp-field">
                  <label className="rp-label">Nova senha</label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon">🔑</span>
                    <input
                      className="rp-input"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      {...register('newPassword', {
                        required: 'Informe a nova senha',
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                        onChange: (e) => setPwdValue(e.target.value),
                      })}
                    />
                    <button
                      type="button"
                      className="rp-toggle"
                      onClick={() => setShowPwd(!showPwd)}
                    >
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <span className="rp-error">{errors.newPassword.message}</span>
                  )}
                </div>

                {/* Strength */}
                {pwdValue && (
                  <div className="rp-strength rp-animate">
                    <div className="rp-strength-header">
                      <span className="rp-strength-label">Força da senha</span>
                      <span className={`rp-strength-value ${strength.cls}`}>{strength.label}</span>
                    </div>
                    <div className="rp-strength-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`rp-strength-bar ${i <= strength.level ? `active ${strength.cls}` : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="rp-tip">
                  <span className="rp-tip-icon">🛡️</span>
                  <div className="rp-tip-text">
                    <strong>Dica de segurança</strong><br />
                    Use letras maiúsculas, minúsculas, números e caracteres especiais para uma senha mais forte.
                  </div>
                </div>

                <button className="rp-btn rp-btn-primary" disabled={loading}>
                  {loading ? '⏳ Salvando...' : '🔐 Redefinir senha'}
                </button>
              </form>

              <div className="rp-footer-trust">
                🔒 Seus dados estão protegidos com criptografia
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}