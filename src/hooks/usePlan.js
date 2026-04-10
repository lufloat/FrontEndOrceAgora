import { useAuthStore } from '../store/authStore'

export function usePlan() {
  const user = useAuthStore(s => s.user)
  const isPro = user?.plan === 'pro'
  const isBasic = !isPro

  return { isPro, isBasic, plan: user?.plan ?? 'basic' }
}