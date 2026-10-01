import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import type { Semestre } from '../types'
import type { Tab } from './dashboardTypes'
import { Icon, type IconName } from './Icon'
const navigation: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Início', icon: 'home' },
  { id: 'subjects', label: 'Disciplinas', icon: 'book' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
]
const TITLES: Record<Tab, string> = {
  home: 'Visão geral',
  subjects: 'Minhas disciplinas',
  agenda: 'Meu calendário',
  settings: 'Do seu jeito',
}

type Props = {
  demo: boolean
  user: User | null
  tab: Tab
  semestre?: Semestre
  semestres: Semestre[]
  busy: boolean
  navegar: (tab: Tab) => void
  onSemesterChange: (id: string) => void
  children: ReactNode
}
export function AppShell({
  demo,
  user,
  tab,
  semestre,
  semestres,
  busy,
  navegar,
  onSemesterChange,
  children,
}: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href={demo ? '?demo=1' : '/'}>
          <img src="/logo.svg" alt="SemDP" />
        </a>
        <p className="sidebar-caption">ESPAÇO DO ESTUDANTE</p>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'active' : ''}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => navegar(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <img src="/logo.svg" alt="SemDP" />{' '}
          </div>
          <div className="desktop-caption">ORGANIZE E PLANEJE SUAS FALTAS</div>
          <div className="account">
            <span className="account-avatar">
              {demo ? 'D' : (user?.displayName ?? user?.email ?? 'E').slice(0, 1).toUpperCase()}
            </span>
            <span>
              {demo
                ? 'Demonstração'
                : (user?.displayName ?? user?.email?.split('@')[0] ?? 'Estudante')}
            </span>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <span>Modo demonstração · dados fictícios</span>
            <a href="/">Entrar na minha conta →</a>
          </div>
        )}
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <h1>{TITLES[tab]}</h1>
          </div>
          {semestre && (
            <label className="semester-switch">
              <span className="sr-only">Semestre ativo</span>
              <select
                value={semestre.id}
                disabled={busy}
                onChange={(e) => onSemesterChange(e.target.value)}
              >
                {semestres.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {children}
        <footer className="page-footer">SemDP · Planeje suas faltas.</footer>
      </main>
      <nav className="bottom-nav" aria-label="Navegação pelo celular">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? 'active' : ''}
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => navegar(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
