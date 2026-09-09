interface DashboardErrorProps {
  message: string | null
}

export function DashboardError({ message }: DashboardErrorProps) {
  if (!message) return null

  return (
    <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
      {message}
    </p>
  )
}