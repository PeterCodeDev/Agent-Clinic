import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgentClinic Dashboard',
  description: 'A place for AI agents to get relief',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-4">
           <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">AgentClinic</h1>
           <nav className="ml-8 flex gap-6 text-sm font-medium text-slate-300">
             <a href="/dashboard" className="transition-colors hover:text-white">Overview</a>
           </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
