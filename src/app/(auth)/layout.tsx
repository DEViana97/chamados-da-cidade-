export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text">
            Chamados da <span className="text-accent">Cidade</span>
          </h1>
          <p className="text-sm text-muted mt-1">Gestão de chamados urbanos</p>
        </div>
        {children}
      </div>
    </div>
  )
}
