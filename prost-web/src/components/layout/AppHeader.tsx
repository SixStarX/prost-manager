import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { ProstLogotype } from '@/components/brand/Logo';

interface AppHeaderProps {
  /** Legenda sob a marca (ex.: "Sistema de Check-list"). */
  tagline: string;
  /** Exibe a seta de voltar no slot esquerdo. */
  back?: boolean;
  /** Destino do voltar — padrão: histórico anterior. */
  onBack?: () => void;
  /** Ações do slot direito (ex.: imprimir). */
  actions?: ReactNode;
  /** Abre a navegação lateral. Ocupa o slot esquerdo quando não há `back`. */
  onMenu?: () => void;
}

/**
 * Cabeçalho global — réplica do app antigo: três colunas de largura fixa
 * (slot esquerdo · marca centralizada · slot direito), sem menu de navegação.
 */
export default function AppHeader({
  tagline,
  back,
  onBack,
  actions,
  onMenu,
}: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex justify-center px-4 py-4">
        <div className="flex w-full max-w-[1280px] items-center justify-between">
          <div className="w-10">
            {back ? (
              <button
                onClick={onBack ?? (() => navigate(-1))}
                className="rounded-lg p-2 transition-colors hover:bg-secondary"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            ) : (
              onMenu && (
                <button
                  onClick={onMenu}
                  className="rounded-lg p-2 transition-colors hover:bg-secondary"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
              )
            )}
          </div>

          <div
            className="flex cursor-pointer flex-col items-center"
            onClick={() => navigate('/')}
          >
            <ProstLogotype className="h-10 md:h-12" />
            <p className="mt-1 text-xs text-muted-foreground">{tagline}</p>
          </div>

          <div className="flex w-10 justify-end">{actions}</div>
        </div>
      </div>
    </header>
  );
}

/** Botão de ícone do cabeçalho — mesmo tratamento do original. */
export function HeaderIconButton({
  icon: Icon,
  title,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="rounded-lg p-2 transition-colors hover:bg-secondary disabled:opacity-50"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
