import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { confirmEmail } from '../../api/auth'

// ─── Inline styles / design tokens ───────────────────────────────────────────
const T = {
  teal1:  '#027373',
  teal2:  '#038C7F',
  mint:   '#ADD9D1',
  coral:  '#D95252',
  dark:   '#0D0D0D',
  surface:'#F0F7F6',
  white:  '#FFFFFF',
  muted:  '#5E7B78',
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .ce-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .ce-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #e8f5f3 0%, #f5f0ff 50%, #fef0ee 100%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* decorative blobs */
  .ce-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    pointer-events: none;
  }
  .ce-blob-1 { width: 340px; height: 340px; background: ${T.mint};  top: -80px;  left: -100px; }
  .ce-blob-2 { width: 260px; height: 260px; background: ${T.coral}; bottom: -60px; right: -80px; opacity: 0.2; }

  .ce-card {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 28px;
    padding: 48px 40px;
    width: 100%;
    max-width: 420px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(2,115,115,0.12), 0 4px 16px rgba(0,0,0,0.06);
    position: relative;
    z-index: 1;
  }

  /* Logo */
  .ce-logo {
    font-family: 'Sora', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: ${T.dark};
    margin-bottom: 36px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.5px;
  }
  .ce-logo span { color: ${T.teal2}; }
  .ce-logo-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${T.teal2}, ${T.coral});
    display: inline-block;
  }

  /* Icon area */
  .ce-icon-wrap {
    width: 88px; height: 88px;
    border-radius: 50%;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .ce-icon-wrap.loading { background: linear-gradient(135deg, #e8f5f3, #d1ede9); }
  .ce-icon-wrap.success { background: linear-gradient(135deg, #e8f5f3, #c5e8e2); }
  .ce-icon-wrap.error   { background: linear-gradient(135deg, #fef0ee, #fce0dc); }

  .ce-icon-ring {
    position: absolute; inset: -8px;
    border-radius: 50%;
    border: 2px dashed rgba(3,140,127,0.25);
    animation: spin 12s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ce-icon-svg { font-size: 36px; }

  /* Spinner */
  .ce-spinner {
    width: 40px; height: 40px;
    border: 3px solid ${T.mint};
    border-top-color: ${T.teal2};
    border-radius: 50%;
    animation: spin2 0.8s linear infinite;
  }
  @keyframes spin2 { to { transform: rotate(360deg); } }

  /* Label badge */
  .ce-badge {
    display: inline-block;
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${T.teal2};
    background: rgba(3,140,127,0.08);
    border-radius: 20px;
    padding: 4px 14px;
    margin-bottom: 12px;
  }
  .ce-badge.error { color: ${T.coral}; background: rgba(217,82,82,0.08); }

  .ce-title {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: ${T.dark};
    margin-bottom: 10px;
    letter-spacing: -0.5px;
  }

  .ce-desc {
    font-size: 15px;
    color: ${T.muted};
    line-height: 1.6;
    margin-bottom: 32px;
  }
  .ce-desc strong { color: ${T.teal1}; font-weight: 600; }

  /* Button */
  .ce-btn {
    display: block;
    width: 100%;
    padding: 15px 24px;
    border-radius: 14px;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    text-decoration: none;
    letter-spacing: 0.2px;
  }
  .ce-btn-primary {
    background: linear-gradient(135deg, ${T.teal1} 0%, ${T.teal2} 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(2,115,115,0.3);
  }
  .ce-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(2,115,115,0.4);
  }
  .ce-btn-outline {
    background: transparent;
    color: ${T.teal2};
    border: 1.5px solid rgba(3,140,127,0.3);
    margin-top: 10px;
  }
  .ce-btn-outline:hover {
    background: rgba(3,140,127,0.06);
    border-color: ${T.teal2};
  }

  /* Progress steps */
  .ce-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(173,217,209,0.3);
  }
  .ce-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: ${T.muted};
    font-family: 'Sora', sans-serif;
    font-weight: 500;
  }
  .ce-step.active { color: ${T.teal2}; }
  .ce-step.done   { color: ${T.mint}; }
  .ce-step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(173,217,209,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
  }
  .ce-step.active .ce-step-dot {
    background: linear-gradient(135deg, ${T.teal1}, ${T.teal2});
    border-color: transparent;
    color: white;
  }
  .ce-step.done .ce-step-dot {
    background: ${T.mint};
    border-color: transparent;
    color: ${T.teal1};
  }
  .ce-step-line {
    width: 48px; height: 2px;
    background: rgba(173,217,209,0.4);
    margin-bottom: 20px;
  }
  .ce-step-line.done { background: linear-gradient(90deg, ${T.mint}, rgba(173,217,209,0.4)); }

  /* fade-in */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ce-animate { animation: fadeUp 0.45s ease both; }
`

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
    <>
      <style>{css}</style>
      <div className="ce-root">
        <div className="ce-blob ce-blob-1" />
        <div className="ce-blob ce-blob-2" />

        <div className="ce-card">
          {/* Logo */}
          <div className="ce-logo">
            <span className="ce-logo-dot" />
            Orce<span>Agora</span>
          </div>

          {/* ── LOADING ── */}
          {status === 'loading' && (
            <div className="ce-animate">
              <div className="ce-icon-wrap loading">
                <div className="ce-icon-ring" />
                <div className="ce-spinner" />
              </div>
              <div className="ce-badge">Processando</div>
              <h2 className="ce-title">Confirmando...</h2>
              <p className="ce-desc">Aguarde enquanto verificamos seu e-mail.</p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <div className="ce-animate">
              <div className="ce-icon-wrap success">
                <div className="ce-icon-ring" />
                <span className="ce-icon-svg">✅</span>
              </div>
              <div className="ce-badge">E-mail confirmado</div>
              <h2 className="ce-title">Tudo certo!</h2>
              <p className="ce-desc">
                Sua conta está <strong>ativa</strong>. Faça login para começar a organizar sua empresa.
              </p>
              <Link to="/login" className="ce-btn ce-btn-primary">Fazer login agora →</Link>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <div className="ce-animate">
              <div className="ce-icon-wrap error">
                <div className="ce-icon-ring" style={{ borderColor: 'rgba(217,82,82,0.2)' }} />
                <span className="ce-icon-svg">❌</span>
              </div>
              <div className="ce-badge error">Link inválido</div>
              <h2 className="ce-title">Ops!</h2>
              <p className="ce-desc">
                O link expirou ou já foi utilizado.<br />
                Faça login e solicite um novo link de confirmação.
              </p>
              <Link to="/login" className="ce-btn ce-btn-primary">Voltar ao login</Link>
              <Link to="/login" className="ce-btn ce-btn-outline">Solicitar novo link</Link>
            </div>
          )}

          {/* Steps */}
          <div className="ce-steps">
            <div className={`ce-step ${status !== 'loading' ? 'done' : 'active'}`}>
              <div className="ce-step-dot">✓</div>
              <span>Cadastro</span>
            </div>
            <div className={`ce-step-line ${status !== 'loading' ? 'done' : ''}`} />
            <div className={`ce-step ${status === 'loading' ? 'active' : status === 'success' ? 'done' : 'active'}`}>
              <div className="ce-step-dot">✉</div>
              <span>Confirmação</span>
            </div>
            <div className="ce-step-line" />
            <div className={`ce-step ${status === 'success' ? 'active' : ''}`}>
              <div className="ce-step-dot">🚀</div>
              <span>Começar</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}