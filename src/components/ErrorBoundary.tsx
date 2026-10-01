import { Component, type ReactNode } from 'react'
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state: { error: string | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error)
      return (
        <main className="panel" style={{ maxWidth: 600, margin: '40px auto' }}>
          <h1>Não foi possível abrir esta tela.</h1>
          <p className="message error" role="alert">
            {this.state.error}
          </p>
          <p className="hint">
            Seus registros não foram apagados. Recarregue a página ou revise datas e horários
            antigos.
          </p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </main>
      )
    return this.props.children
  }
}
