import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { FileText, Users, Layers, LayoutDashboard, LogOut, UserCircle, CalendarDays } from 'lucide-react'


const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budgets', icon: FileText, label: 'Orçamentos' },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/templates', icon: Layers, label: 'Modelos' },
  { to: '/profile', icon: UserCircle, label: 'Perfil' },
]

export function Layout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-100 p-4 gap-1">
        <div className="px-3 py-4 mb-2">
          <h1 className="text-xl font-bold text-primary">OrceAgora</h1>
          <p className="text-xs text-muted truncate">{user?.name}</p>
        </div>
        {nav.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${pathname.startsWith(to)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50">
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex">
        {nav.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors
              ${pathname.startsWith(to) ? 'text-primary' : 'text-slate-400'}`}>
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}