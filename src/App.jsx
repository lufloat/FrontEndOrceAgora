import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Budgets from './pages/budgets/Budgets'
import NewBudget from './pages/budgets/NewBudget'
import BudgetDetail from './pages/budgets/BudgetDetail'
import ApprovalPage from './pages/budgets/ApprovalPage'
import Clients from './pages/clients/Clients'
import Templates from './pages/templates/Templates'
import Dashboard from './pages/dashboard/Dashboard'
import ForgotPassword from './pages/auth/ForgotPassword'
import Profile from './pages/profile/Profile'
import Agenda from './pages/agenda/Agenda'
import { InstallPrompt } from './components/InstallPrompt'
import Plans from './pages/plans/Plans'
import { ProGate } from './components/ProGate'
import { usePlan } from './hooks/usePlan'
import ConfirmEmail from './pages/auth/ConfirmEmail'
import ResetPassword from './pages/auth/ResetPassword'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useAuthStore.persist.hasHydrated())
    return unsub
  }, [])

  if (!hydrated) return null

  return token ? children : <Navigate to="/login" replace />
}

function HomeRedirect() {
  const { isPro } = usePlan()
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to="/budgets" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aprovar/:token" element={<ApprovalPage />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <ProGate feature="O dashboard financeiro">
              <Dashboard />
            </ProGate>
          </PrivateRoute>
        } />
        <Route path="/budgets" element={<PrivateRoute><Budgets /></PrivateRoute>} />
        <Route path="/budgets/new" element={<PrivateRoute><NewBudget /></PrivateRoute>} />
        <Route path="/budgets/:id" element={<PrivateRoute><BudgetDetail /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/confirmar-email" element={<ConfirmEmail />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/planos" element={<PrivateRoute><Plans /></PrivateRoute>} />
        <Route path="/agenda" element={
          <PrivateRoute>
            <ProGate feature="A agenda com lembretes">
              <Agenda />
            </ProGate>
          </PrivateRoute>
        } />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}