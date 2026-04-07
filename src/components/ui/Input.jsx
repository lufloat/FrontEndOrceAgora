export function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input className="input" {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}