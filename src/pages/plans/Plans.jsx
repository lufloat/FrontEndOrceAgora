import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getStatus, upgradeToPro, cancelPro } from '../../api/subscriptions'
import { Layout } from '../../components/Layout'
import { Check, Zap, Crown } from 'lucide-react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  .pp { background: #fff; min-height: 100vh; padding: 48px 24px 80px; font-family: 'Inter', sans-serif; color: #111; }
  .pp-inner { max-width: 780px; margin: 0 auto; }

  .pp-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0faf8; border: 1px solid #b2ddd6; color: #0a7a6a; font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 100px; margin-bottom: 18px; letter-spacing: .07em; text-transform: uppercase; }
  .pp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #038C7F; animation: ppPulse 2s infinite; }
  @keyframes ppPulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  .pp-title { font-size: clamp(28px, 4vw, 40px); font-weight: 600; color: #0d0d0d; line-height: 1.15; margin-bottom: 8px; letter-spacing: -.5px; }
  .pp-title span { color: #038C7F; }
  .pp-sub { color: #6b7280; font-size: 15px; font-weight: 300; margin-bottom: 40px; }

  .pp-alert { display: flex; align-items: center; gap: 10px; background: #fff5f5; border: 1px solid #f5c6c6; border-radius: 12px; padding: 12px 18px; margin-bottom: 28px; font-size: 13px; color: #b91c1c; }

  .pp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 580px) { .pp-grid { grid-template-columns: 1fr; } }

  .pp-card { border-radius: 18px; padding: 28px; position: relative; border: 1px solid #e5e7eb; background: #fff; transition: box-shadow .25s ease; }
  .pp-card:hover { box-shadow: 0 4px 24px rgba(3,140,127,0.09); }
  .pp-card--pro { border: 1.5px solid #038C7F; background: #fafffe; }
  .pp-card--pro::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #038C7F, transparent); border-radius: 18px 18px 0 0; }

  .pp-rec { position: absolute; top: 18px; right: 18px; background: #038C7F; color: #fff; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 100px; letter-spacing: .06em; text-transform: uppercase; }

  .pp-plan-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 18px; }
  .pp-plan-icon--basic { background: #f3f4f6; }
  .pp-plan-icon--pro { background: #e6f7f4; color: #038C7F; }

  .pp-plan-name { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #9ca3af; margin-bottom: 4px; }
  .pp-plan-name--pro { color: #0a7a6a; }

  .pp-price-row { display: flex; align-items: baseline; gap: 2px; margin-bottom: 4px; }
  .pp-price { font-size: 36px; font-weight: 600; color: #0d0d0d; line-height: 1; }
  .pp-price-cents { font-size: 20px; font-weight: 500; color: #0d0d0d; }
  .pp-price-period { font-size: 13px; color: #9ca3af; margin-left: 2px; }

  .pp-plan-tag { font-size: 12px; color: #9ca3af; margin-bottom: 22px; font-weight: 300; }
  .pp-plan-tag--current { color: #038C7F; font-weight: 400; }

  .pp-divider { height: 1px; background: #f0f0f0; margin-bottom: 18px; }

  .pp-feat { display: flex; align-items: center; gap: 9px; padding: 4px 0; font-size: 13.5px; color: #374151; }
  .pp-feat-icon { width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pp-feat-icon--basic { background: #f0fdf4; }
  .pp-feat-icon--pro { background: #e6f7f4; }

  .pp-btn { width: 100%; padding: 13px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s ease; display: flex; align-items: center; justify-content: center; gap: 7px; border: none; }
  .pp-btn--cancel { background: transparent; border: 1px solid #fca5a5; color: #dc2626; margin-top: 20px; }
  .pp-btn--cancel:hover { background: #fff5f5; }
  .pp-btn--upgrade { background: #038C7F; color: #fff; }
  .pp-btn--upgrade:hover { background: #027363; }
  .pp-btn--upgrade:disabled { opacity: .55; cursor: not-allowed; }
  .pp-btn--current { background: #f0fdf9; border: 1.5px solid #b2ddd6; color: #038C7F; cursor: default; margin-top: 24px; }
  .pp-next-charge { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 8px; }

  .pp-input { width: 100%; padding: 11px 13px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; color: #111; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: border-color .2s; margin-top: 14px; }
  .pp-input:focus { border-color: #038C7F; }
  .pp-input::placeholder { color: #9ca3af; }

  .pp-usage { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin-top: 18px; }
  .pp-usage-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 14px; }
  .pp-usage-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .pp-usage-text { font-size: 13px; color: #6b7280; }
  .pp-usage-count { font-size: 14px; font-weight: 600; color: #038C7F; }
  .pp-bar-bg { height: 5px; background: #e5e7eb; border-radius: 100px; overflow: hidden; }
  .pp-bar-fill { height: 100%; border-radius: 100px; background: #038C7F; transition: width .5s ease; }
  .pp-bar-fill--warn { background: #f59e0b; }
  .pp-bar-fill--danger { background: #ef4444; }

  .pix-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; }
  .pix-back { position: absolute; inset: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(3px); }
  .pix-modal { position: relative; background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 32px; width: 100%; max-width: 360px; margin: 0 16px; text-align: center; box-shadow: 0 20px 60px rgba(3,140,127,0.12); }
  .pix-modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #038C7F, transparent); border-radius: 20px 20px 0 0; }
  .pix-title { font-size: 20px; font-weight: 600; margin-bottom: 6px; color: #0d0d0d; }
  .pix-sub { font-size: 13px; color: #6b7280; margin-bottom: 22px; font-weight: 300; }
  .pix-qr { width: 160px; height: 160px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 0 auto 18px; }
  .pix-code-row { display: flex; gap: 8px; margin-bottom: 14px; }
  .pix-code-input { flex: 1; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 9px; color: #111; font-size: 12px; min-width: 0; }
  .pix-copy-btn { padding: 10px 14px; background: #038C7F; border: none; border-radius: 9px; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; }
  .pix-copy-btn:hover { background: #027363; }
  .pix-info { background: #f0fdf9; border: 1px solid #b2ddd6; border-radius: 9px; padding: 10px; margin-bottom: 14px; font-size: 12px; color: #0a7a6a; }
  .pix-close { font-size: 13px; color: #9ca3af; background: none; border: none; cursor: pointer; }
  .pix-close:hover { color: #374151; }
`

const BASIC_FEATURES = [
  '5 orçamentos por mês', 'Geração de PDF', 'Link de aprovação online',
  'Modelos de serviços', 'Histórico de orçamentos', 'Clientes ilimitados',
]
const PRO_FEATURES = [
  'Orçamentos ilimitados', 'Tudo do plano Básico', 'Dashboard financeiro',
  'Agenda com lembretes', 'Relatórios de faturamento', 'Top clientes e serviços',
  'Contas a receber', 'Sem anúncios',
]

export default function Plans() {
  const [status, setStatus]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [showCpf, setShowCpf]     = useState(false)
  const [cpf, setCpf]             = useState('')
  const [pixData, setPixData]     = useState(null)

  useEffect(() => {
    getStatus().then(r => setStatus(r.data)).finally(() => setLoading(false))
  }, [])

  const handleUpgrade = async () => {
    if (!showCpf) { setShowCpf(true); return }
    if (!cpf || cpf.replace(/\D/g, '').length < 11) { toast.error('Informe um CPF válido'); return }
    try {
      setUpgrading(true)
      const res = await upgradeToPro({ cpfCnpj: cpf.replace(/\D/g, '') })
      setPixData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao ativar Pro')
    } finally { setUpgrading(false) }
  }

  const handleCancel = async () => {
    if (!confirm('Cancelar assinatura? Você continuará com acesso Pro até o fim do período pago.')) return
    try {
      await cancelPro()
      const res = await getStatus()
      setStatus(res.data)
      toast.success(`Assinatura cancelada. Acesso Pro por mais ${res.data.daysRemainingAfterCancel} dias.`, { duration: 6000 })
    } catch { toast.error('Erro ao cancelar') }
  }

  const isPro      = status?.plan === 'pro'
  const pct        = status ? Math.min((status.budgetsThisMonth / status.budgetLimit) * 100, 100) : 0
  const barVariant = pct >= 100 ? '--danger' : pct >= 80 ? '--warn' : ''

  return (
    <Layout>
      <style>{styles}</style>
      <div className="pp">
        <div className="pp-inner">

          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <span className="pp-badge">
              <span className="pp-badge-dot" />
              Planos &amp; Preços
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 className="pp-title">Cresça sem <span>limites</span></h1>
            <p className="pp-sub">Escolha o plano ideal para o seu negócio. Sem surpresas.</p>
          </div>

          {isPro && status?.cancelAtPeriodEnd && (
            <div className="pp-alert">
              <span style={{ fontSize: 16 }}>⚠</span>
              <span>
                Assinatura cancelada — acesso Pro por mais{' '}
                <strong>{status.daysRemainingAfterCancel} dias</strong>
                {status.currentPeriodEnd && ` (até ${new Date(status.currentPeriodEnd).toLocaleDateString('pt-BR')})`}
              </span>
            </div>
          )}

          <div className="pp-grid">
            {/* BÁSICO */}
            <div className="pp-card">
              <div className="pp-plan-icon pp-plan-icon--basic">🚀</div>
              <p className="pp-plan-name">Básico</p>
              <div className="pp-price-row"><span className="pp-price">Grátis</span></div>
              <p className="pp-plan-tag">{!isPro ? '✓ Plano atual' : 'Para começar'}</p>
              <div className="pp-divider" />
              {BASIC_FEATURES.map(f => (
                <div key={f} className="pp-feat">
                  <span className="pp-feat-icon pp-feat-icon--basic">
                    <Check size={10} color="#10b981" strokeWidth={3} />
                  </span>
                  {f}
                </div>
              ))}
              {isPro && (
                <button onClick={handleCancel} className="pp-btn pp-btn--cancel">
                  Voltar para o Básico
                </button>
              )}
            </div>

            {/* PRO */}
            <div className="pp-card pp-card--pro">
              <span className="pp-rec">✦ Recomendado</span>
              <div className="pp-plan-icon pp-plan-icon--pro">
                <Crown size={20} color="#038C7F" />
              </div>
              <p className="pp-plan-name pp-plan-name--pro">Pro</p>
              <div className="pp-price-row">
                <span className="pp-price">R$29</span>
                <span className="pp-price-cents">,90</span>
                <span className="pp-price-period">/mês</span>
              </div>
              <p className={`pp-plan-tag${isPro ? ' pp-plan-tag--current' : ''}`}>
                {isPro ? '✓ Plano atual' : 'Desbloqueie tudo'}
              </p>
              <div className="pp-divider" />
              {PRO_FEATURES.map(f => (
                <div key={f} className="pp-feat">
                  <span className="pp-feat-icon pp-feat-icon--pro">
                    <Check size={10} color="#038C7F" strokeWidth={3} />
                  </span>
                  {f}
                </div>
              ))}

              {!isPro ? (
                <div style={{ marginTop: 24 }}>
                  {showCpf && (
                    <input
                      type="text" placeholder="CPF (somente números)"
                      value={cpf} onChange={e => setCpf(e.target.value)}
                      maxLength={14} className="pp-input"
                    />
                  )}
                  <button
                    onClick={handleUpgrade} disabled={upgrading}
                    className="pp-btn pp-btn--upgrade"
                    style={{ marginTop: showCpf ? 12 : 0 }}
                  >
                    <Zap size={15} />
                    {upgrading ? 'Processando...' : showCpf ? 'Confirmar e gerar Pix' : 'Assinar Pro — R$29,90/mês'}
                  </button>
                </div>
              ) : (
                <>
                  <button className="pp-btn pp-btn--current">Plano Atual</button>
                  {!status?.cancelAtPeriodEnd && status?.currentPeriodEnd && (
                    <p className="pp-next-charge">
                      Próxima cobrança: {new Date(status.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {!isPro && status && (
            <div className="pp-usage">
              <p className="pp-usage-label">Uso este mês</p>
              <div className="pp-usage-row">
                <span className="pp-usage-text">Orçamentos criados</span>
                <span className="pp-usage-count">{status.budgetsThisMonth}/{status.budgetLimit}</span>
              </div>
              <div className="pp-bar-bg">
                <div className={`pp-bar-fill${barVariant}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

        </div>
      </div>

      {pixData && (
        <div className="pix-overlay">
          <div className="pix-back" onClick={() => setPixData(null)} />
          <div className="pix-modal">
            <h2 className="pix-title">Pagar com Pix</h2>
            <p className="pix-sub">Escaneie o QR Code ou copie o código para ativar o Pro</p>
            {pixData.pixQrCodeUrl && (
              <img src={`data:image/png;base64,${pixData.pixQrCodeUrl}`} className="pix-qr" alt="QR Code Pix" />
            )}
            {pixData.pixCode && (
              <div className="pix-code-row">
                <input readOnly value={pixData.pixCode} className="pix-code-input" />
                <button onClick={() => { navigator.clipboard.writeText(pixData.pixCode); toast.success('Código copiado!') }} className="pix-copy-btn">
                  Copiar
                </button>
              </div>
            )}
            <div className="pix-info">⚡ Após o pagamento, o Pro é ativado automaticamente em até 5 minutos.</div>
            {pixData.paymentUrl && (
              <a href={pixData.paymentUrl} target="_blank" rel="noreferrer"
                style={{ display:'block', padding:'11px', border:'1px solid #b2ddd6', borderRadius:10, color:'#038C7F', textDecoration:'none', fontSize:13, marginBottom:13 }}>
                Abrir página de pagamento ↗
              </a>
            )}
            <button onClick={() => setPixData(null)} className="pix-close">Fechar — pagarei depois</button>
          </div>
        </div>
      )}
    </Layout>
  )
}