import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PlanBanner } from './PlanBanner'
import { usePlan } from '../hooks/usePlan'
import {
  FileText, Users, Layers, LogOut,
  UserCircle, CalendarDays, Crown,
  LayoutDashboard, Lock
} from 'lucide-react'

export function Layout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const { isPro } = usePlan()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const nav = [
    // Básico + Pro
    { to: '/budgets', icon: FileText, label: 'Orçamentos', pro: false },
    { to: '/clients', icon: Users, label: 'Clientes', pro: false },
    { to: '/templates', icon: Layers, label: 'Modelos', pro: false },

    // Só Pro
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', pro: true },
    { to: '/agenda', icon: CalendarDays, label: 'Agenda', pro: true },

    // Sempre
    { to: '/planos', icon: Crown, label: 'Planos', pro: false },
    { to: '/profile', icon: UserCircle, label: 'Perfil', pro: false },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white
        border-r border-slate-100 p-4 gap-1">
        <div className="px-3 py-4 mb-2">
          <h1 className="text-xl font-bold text-primary">OrceAgora</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted truncate">{user?.name}</p>
            {isPro && (
              <span className="text-xs bg-amber-100 text-amber-600
                font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Crown size={10} /> Pro
              </span>
            )}
          </div>
        </div>

        {nav.map(({ to, icon: Icon, label, pro }) => {
          const locked = pro && !isPro
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-colors
                ${pathname.startsWith(to)
                  ? 'bg-primary/10 text-primary'
                  : locked
                  ? 'text-slate-300 hover:bg-slate-50'
                  : 'text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {locked && <Lock size={13} className="text-slate-300" />}
            </Link>
          )
        })}

        <button onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2.5
            rounded-lg text-sm text-slate-500 hover:bg-slate-50">
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        <PlanBanner />
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>

      {/* Bottom nav mobile — só itens principais */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white
        border-t border-slate-100 flex">
        {[
          { to: '/budgets', icon: FileText, label: 'Orçamentos' },
          { to: '/clients', icon: Users, label: 'Clientes' },
          { to: '/templates', icon: Layers, label: 'Modelos' },
          { to: '/planos', icon: Crown, label: 'Planos' },
          { to: '/profile', icon: UserCircle, label: 'Perfil' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center py-3
              text-xs gap-1 transition-colors
              ${pathname.startsWith(to)
                ? 'text-primary' : 'text-slate-400'}`}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}