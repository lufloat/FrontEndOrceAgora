import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  FileText,
  BarChart2,
  Bell,
  Mail,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Orçamentos profissionais",
    desc: "Crie e envie orçamentos bonitos em segundos. Seu cliente aprova com um clique.",
  },
  {
    icon: BarChart2,
    title: "Dashboard financeiro",
    desc: "Acompanhe faturamento, conversões e crescimento em tempo real.",
  },
  {
    icon: Bell,
    title: "Agenda com lembretes",
    desc: "Nunca perca um follow-up. Crie tarefas vinculadas aos seus orçamentos.",
  },
];

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [remember, setRemember] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await login(data);
      setAuth(res.data.user, res.data.token);
      navigate("/budgets");
    } catch {
      setErrorMsg("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        .container {
          display: flex;
          min-height: 100vh;
          background: #fff;
        }

        .left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .left-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(2, 80, 75, 0.88) 0%,
            rgba(2, 100, 90, 0.78) 40%,
            rgba(1, 60, 55, 0.70) 100%
          );
        }

        .dot-grid {
          position: absolute;
          top: 28px;
          left: 28px;
          display: grid;
          grid-template-columns: repeat(6, 8px);
          gap: 8px;
          z-index: 2;
        }
        .dot-grid span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: block;
        }

        .left-content {
          position: relative;
          z-index: 3;
          padding: 56px 60px;
        }

        .left-title {
          font-size: 52px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .left-title-accent { color: #5ECFC5; }

        .left-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.75);
          max-width: 380px;
          line-height: 1.6;
          margin-bottom: 36px;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 48px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 20px;
          border-radius: 14px;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          max-width: 460px;
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }

        .feature-text strong {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 3px;
        }

        .feature-text span {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
        }

        .left-footer {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          background: rgba(0,180,160,0.18);
          filter: blur(60px);
          z-index: 1;
        }
        .blob-1 { width: 300px; height: 300px; bottom: -80px; left: -60px; }
        .blob-2 { width: 200px; height: 200px; top: 120px; right: -40px; }

        .right {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          background: #fff;
        }

        .form-wrap {
          width: 100%;
          max-width: 360px;
        }

        .form-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .form-logo img { width: 300px; height: auto; }
        .form-logo-name {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.3px;
        }

        .form-title {
          font-size: 32px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.8px;
          margin-bottom: 6px;
        }

        .form-desc {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 32px;
        }

        .field { margin-bottom: 18px; }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 7px;
        }

        .input-wrap { position: relative; }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
          display: flex;
        }

        .input {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          border: 1.5px solid #E5E7EB;
          padding: 0 14px 0 42px;
          font-size: 14px;
          color: #111;
          background: #fff;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }

        .input::placeholder { color: #C4C8CF; }

        .input:focus {
          border-color: #027373;
          box-shadow: 0 0 0 3px rgba(2,115,115,0.12);
        }

        .input-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          display: flex;
          padding: 0;
        }

        .row-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .remember input[type="checkbox"] {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          accent-color: #027373;
          cursor: pointer;
        }

        .remember span { font-size: 13px; color: #374151; }

        /* ✅ CORRIGIDO: era .forgot como <a>, agora é Link estilizado */
        .forgot {
          font-size: 13px;
          font-weight: 500;
          color: #027373;
          text-decoration: none;
        }
        .forgot:hover { text-decoration: underline; }

        .btn-primary {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: none;
          background: #027373;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .2s, transform .15s, box-shadow .2s;
          letter-spacing: 0.1px;
          margin-bottom: 20px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #025E5E;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(2,115,115,0.28);
        }

        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .divider-line { flex: 1; height: 1px; background: #E5E7EB; }
        .divider-text { font-size: 12px; color: #9CA3AF; white-space: nowrap; }

        .btn-google {
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: 1.5px solid #E5E7EB;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color .2s, box-shadow .15s;
          margin-bottom: 28px;
        }
        .btn-google:hover {
          border-color: #D1D5DB;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }

        .google-icon { width: 20px; height: 20px; }

        .signup-text {
          text-align: center;
          font-size: 13px;
          color: #6B7280;
        }
        .signup-text a {
          color: #027373;
          font-weight: 600;
          text-decoration: none;
        }
        .signup-text a:hover { text-decoration: underline; }

        .error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          color: #B91C1C;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        @media (max-width: 900px) {
          .left { display: none; }
          .right { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      <div className="container">
        <div className="left">
          <img src="/budgetsphone.jpg" className="left-photo" alt="" />
          <div className="left-overlay" />

          <div className="dot-grid">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className="blob blob-1" />
          <div className="blob blob-2" />

          <div className="left-content">
            <h1 className="left-title">
              Seu negócio
              <br />
              <span className="left-title-accent">mais organizado</span>
            </h1>

            <p className="left-subtitle">
              Gerencie orçamentos, clientes e tarefas com eficiência em um só
              lugar.
            </p>

            <div className="features">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="feature">
                  <div className="feature-icon">
                    <Icon size={18} />
                  </div>
                  <div className="feature-text">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right">
          <div className="form-wrap">
            <div className="form-logo">
              <img src="/StimServlogo.png" alt="StimServ" />
            </div>
            <h2 className="form-title">Entrar</h2>
            <p className="form-desc">Acesse sua conta para continuar</p>

            {errorMsg && (
              <div className="error">
                <AlertTriangle size={15} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label>E-mail</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    className="input"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                  />
                </div>
              </div>

              <div className="field">
                <label>Senha</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="input-eye"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="row-options">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>
                {/* ✅ CORRIGIDO: Link ao invés de <a href> */}
                <Link to="/esqueci-senha" className="forgot">
                  Esqueci minha senha
                </Link>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">ou continue com</span>
              <div className="divider-line" />
            </div>

            <button className="btn-google" type="button">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>

            <p className="signup-text">
              Ainda não tem uma conta?{" "}
              <Link to="/register">Criar conta grátis</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
