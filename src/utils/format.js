export const currency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

export const date = (v) =>
  new Date(v).toLocaleDateString('pt-BR')

export const statusLabel = (s) => ({
  draft:    { label: 'Rascunho',   color: 'bg-slate-100 text-slate-600' },
  sent:     { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Visualizado',color: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Aprovado',   color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusado',   color: 'bg-red-100 text-red-700' },
  done:     { label: 'Executado',  color: 'bg-teal-100 text-teal-700' },
}[s] ?? { label: s, color: 'bg-gray-100 text-gray-600' })