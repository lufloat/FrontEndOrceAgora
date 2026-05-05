import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PlanBanner } from './PlanBanner'
import { usePlan } from '../hooks/usePlan'
import {
  FileText, Users, Layers, LogOut,
  UserCircle, CalendarDays, Crown,
  LayoutDashboard, Lock, ChevronRight
} from 'lucide-react'

export function Layout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const { isPro } = usePlan()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { to: '/budgets',   icon: FileText,        label: 'Orçamentos', pro: false },
        { to: '/clients',   icon: Users,           label: 'Clientes',   pro: false },
        { to: '/templates', icon: Layers,          label: 'Modelos',    pro: false },
      ]
    },
    {
      label: 'Gestão',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  pro: true },
        { to: '/agenda',    icon: CalendarDays,    label: 'Agenda',     pro: true },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/planos',  icon: Crown,      label: 'Planos', pro: false },
        { to: '/profile', icon: UserCircle, label: 'Perfil', pro: false },
      ]
    },
  ]

  const mobileNav = [
    { to: '/budgets',   icon: FileText,   label: 'Orçamentos' },
    { to: '/clients',   icon: Users,      label: 'Clientes'   },
    { to: '/templates', icon: Layers,     label: 'Modelos'    },
    { to: '/planos',    icon: Crown,      label: 'Planos'     },
    { to: '/profile',   icon: UserCircle, label: 'Perfil'     },
  ]

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .ly-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #F4F6F8;
        }

        /* ── Sidebar ── */
        .ly-sidebar {
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #022E2E 0%, #027373 45%, #038C7F 100%);
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 40;
          overflow: hidden;
        }

        .ly-sidebar::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 220px; height: 220px;
          background: rgba(173,217,209,.12);
          border-radius: 50%;
          pointer-events: none;
        }
        .ly-sidebar::after {
          content: '';
          position: absolute;
          bottom: 60px; left: -60px;
          width: 180px; height: 180px;
          background: rgba(217,82,82,.08);
          border-radius: 50%;
          pointer-events: none;
        }

        .ly-logo-area {
          padding: 22px 20px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .ly-logo-img {
          height: 125px;
          width: auto;
          object-fit: contain;
        }

        .ly-user-card {
          margin: 0 14px 20px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(4px);
        }
        .ly-avatar {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ADD9D1, #027373);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #fff;
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,.2);
        }
        .ly-user-name {
          font-size: 13px; font-weight: 700; color: #fff;
          margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ly-pro-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(255,200,50,.15); color: #FFD166;
          border: 1px solid rgba(255,200,50,.25);
          font-size: 10px; font-weight: 700;
          padding: 2px 8px; border-radius: 20px;
        }
        .ly-free-badge {
          font-size: 10px; color: rgba(255,255,255,.4); font-weight: 500;
        }

        .ly-nav { flex: 1; padding: 0 10px; overflow-y: auto; position: relative; z-index: 1; }
        .ly-nav::-webkit-scrollbar { display: none; }

        .ly-group-label {
          font-size: 9px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1.2px;
          color: rgba(255,255,255,.3);
          padding: 10px 10px 6px;
          margin-top: 4px;
        }

        .ly-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px;
          border-radius: 11px;
          text-decoration: none;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.6);
          transition: all .15s;
          margin-bottom: 2px;
          position: relative;
        }
        .ly-nav-item:hover {
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.9);
        }
        .ly-nav-item.active {
          background: rgba(255,255,255,.14);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
        }
        .ly-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 3px;
          background: #ADD9D1;
          border-radius: 0 3px 3px 0;
        }
        .ly-nav-item.locked {
          color: rgba(255,255,255,.25);
          cursor: default;
        }
        .ly-nav-item.locked:hover {
          background: transparent;
          color: rgba(255,255,255,.25);
        }
        .ly-nav-icon { flex-shrink: 0; }
        .ly-nav-label { flex: 1; }
        .ly-lock-icon { opacity: .4; }

        .ly-nav-divider {
          height: 1px;
          background: rgba(255,255,255,.07);
          margin: 10px 10px;
        }

        .ly-logout {
          margin: 0 10px 24px;
          position: relative;
          z-index: 1;
        }
        .ly-logout-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px;
          border-radius: 11px;
          background: none; border: none;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.35);
          cursor: pointer; transition: all .15s;
          font-family: 'Inter', sans-serif;
        }
        .ly-logout-btn:hover {
          background: rgba(217,82,82,.15);
          color: #D95252;
        }

        /* ── Main ── */
        .ly-main {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .ly-content {
          flex: 1;
          padding: 0 40px 48px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        /* ── Mobile bottom nav ── */
        .ly-mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1px solid #E5E7EB;
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .ly-mobile-nav-inner { display: flex; }
        .ly-mobile-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 10px 4px 8px;
          text-decoration: none;
          font-size: 10px; font-weight: 500;
          color: #9CA3AF; gap: 4px; transition: color .15s;
        }
        .ly-mobile-item.active { color: #027373; }
        .ly-mobile-item.active svg { stroke: #027373; }

        @media (max-width: 768px) {
          .ly-sidebar { display: none; }
          .ly-main { margin-left: 0; padding-bottom: 64px; }
          .ly-content { padding: 0 20px 32px; }
          .ly-mobile-nav { display: flex; flex-direction: column; }
        }
      `}</style>

      <div className="ly-root">

        <aside className="ly-sidebar">

          <div className="ly-logo-area">
            <img src="/StimServlogo.png" alt="StimServ" className="ly-logo-img" />
          </div>

          <div className="ly-user-card">
            <div className="ly-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p className="ly-user-name">{user?.name || 'Usuário'}</p>
              {isPro
                ? <span className="ly-pro-badge"><Crown size={9} /> Pro</span>
                : <span className="ly-free-badge">Plano Básico</span>
              }
            </div>
          </div>

          <nav className="ly-nav">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {gi > 0 && <div className="ly-nav-divider" />}
                <p className="ly-group-label">{group.label}</p>
                {group.items.map(({ to, icon: Icon, label, pro }) => {
                  const locked = pro && !isPro
                  const active = pathname.startsWith(to)
                  return (
                    <Link
                      key={to}
                      to={locked ? '/planos' : to}
                      className={`ly-nav-item${active ? ' active' : ''}${locked ? ' locked' : ''}`}
                    >
                      <Icon size={17} className="ly-nav-icon" strokeWidth={active ? 2.5 : 2} />
                      <span className="ly-nav-label">{label}</span>
                      {locked
                        ? <Lock size={12} className="ly-lock-icon" />
                        : active
                        ? <ChevronRight size={13} style={{ opacity: .5 }} />
                        : null
                      }
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="ly-logout">
            <div className="ly-nav-divider" style={{ margin: '0 0 12px' }} />
            <button className="ly-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>
        </aside>

        <main className="ly-main">
          <PlanBanner />
          <div className="ly-content">{children}</div>
        </main>

        <nav className="ly-mobile-nav">
          <div className="ly-mobile-nav-inner">
            {mobileNav.map(({ to, icon: Icon, label }) => {
              const active = pathname.startsWith(to)
              return (
                <Link key={to} to={to} className={`ly-mobile-item${active ? ' active' : ''}`}>
                  <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>

      </div>
    </>
  )
}