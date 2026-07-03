/**
 * PROST — Sistema de identidade visual.
 *
 * Componentes recolorívels e escaláveis (SVG / texto vetorial) usados em todos
 * os contextos da aplicação: login, sidebar, splash, favicon, rodapé.
 *
 * ── Como trocar pela arte oficial ───────────────────────────────────────────
 * O wordmark é renderizado como texto vetorial (nítido, leve, tematizável).
 * Caso você tenha o arquivo oficial (SVG/PNG), basta:
 *   1. colocá-lo em `public/brand/prost-wordmark.svg`
 *   2. substituir o <span> do `ProstWordmark` por
 *      `<img src="/brand/prost-wordmark.svg" alt="PROST" className={...} />`
 * Nenhum outro arquivo precisa mudar — toda a app consome apenas estes componentes.
 */
import { cn } from '@/lib/utils';

type MarkTone = 'brand' | 'neutral';

interface MarkProps {
  /** Lado do quadrado em pixels. */
  size?: number;
  /** `brand` = quadrado índigo · `neutral` = contorno discreto. */
  tone?: MarkTone;
  className?: string;
}

/** Símbolo (monograma "P") — ideal para favicon, splash e sidebar recolhida. */
export function ProstMark({ size = 36, tone = 'brand', className }: MarkProps) {
  const radius = size * 0.26;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="PROST"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="prost-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b7bff" />
          <stop offset="100%" stopColor="#6a5af2" />
        </linearGradient>
      </defs>
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx={radius}
        fill={tone === 'brand' ? 'url(#prost-mark-grad)' : 'transparent'}
        stroke={tone === 'brand' ? 'none' : 'currentColor'}
        strokeOpacity={tone === 'brand' ? 0 : 0.25}
        strokeWidth={1.5}
      />
      <path
        d="M11 23 V9 H18 a5 5 0 0 1 0 10 H11"
        fill="none"
        stroke={tone === 'brand' ? '#ffffff' : 'currentColor'}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
}

/** Wordmark "PROST" em texto vetorial — herda a cor do contexto (currentColor). */
export function ProstWordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        'font-black uppercase leading-none tracking-[-0.03em] select-none',
        className,
      )}
    >
      PROST
    </span>
  );
}

interface LogoProps {
  /** `full` = símbolo + wordmark · `wordmark` = só texto · `mark` = só símbolo. */
  variant?: 'full' | 'wordmark' | 'mark';
  /** Texto auxiliar abaixo do wordmark (ex.: "Manager"). */
  tagline?: string;
  markSize?: number;
  tone?: MarkTone;
  className?: string;
  wordmarkClassName?: string;
}

/** Logo composta — ponto único de uso em toda a aplicação. */
export default function Logo({
  variant = 'full',
  tagline,
  markSize = 36,
  tone = 'brand',
  className,
  wordmarkClassName,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {variant !== 'wordmark' && <ProstMark size={markSize} tone={tone} />}
      {variant !== 'mark' && (
        <div className="flex flex-col">
          <ProstWordmark className={cn('text-[17px] text-t1', wordmarkClassName)} />
          {tagline && (
            <span className="text-[9.5px] font-semibold text-t3 tracking-[0.18em] uppercase mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
