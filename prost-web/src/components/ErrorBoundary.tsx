import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Captura erros de renderização de qualquer página e mostra um fallback amigável
 * em vez de derrubar o app para tela branca (o React Router não captura esses
 * erros). Se o Sentry estiver configurado, o erro também é reportado no console.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro de renderização:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="text-lg font-bold text-t1">Algo deu errado</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-t3">
            Encontramos um erro inesperado ao carregar esta tela. Recarregue a
            página; se persistir, avise o suporte.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
