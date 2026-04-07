import { statusLabel } from '../../utils/format'

export function StatusBadge({ status }) {
  const { label, color } = statusLabel(status)
  return <span className={`badge ${color}`}>{label}</span>
}