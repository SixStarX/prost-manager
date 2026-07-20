import { cn } from '@/lib/utils';

/**
 * Diagrama do veículo (vista superior) — arte vetorial própria (line-art), usada
 * como base do Mapeamento de Avarias e da impressão. Herda a cor via currentColor.
 */
export function CarDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      role="img"
      aria-label="Diagrama do veículo"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-full w-full', className)}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Carroceria */}
      <rect x="70" y="26" width="260" height="148" rx="46" />
      {/* Capô / para-choque dianteiro */}
      <path d="M70 92 q-14 8 -14 8 q14 0 14 0" />
      <line x1="96" y1="30" x2="96" y2="170" opacity="0.6" />
      {/* Vidro dianteiro */}
      <path d="M104 60 q26 -14 96 -14 q70 0 96 14 l-14 40 q-82 -10 -164 0 z" opacity="0.85" />
      {/* Teto */}
      <rect x="126" y="104" width="148" height="0" opacity="0" />
      <path d="M118 104 q82 -8 164 0 l-10 44 q-72 8 -144 0 z" opacity="0.85" />
      {/* Vidro traseiro */}
      <path d="M112 152 q88 10 176 0 l-12 12 q-76 8 -152 0 z" opacity="0.6" />
      {/* Linha central */}
      <line x1="200" y1="26" x2="200" y2="46" opacity="0.4" />
      <line x1="200" y1="164" x2="200" y2="174" opacity="0.4" />
      {/* Retrovisores */}
      <path d="M104 74 q-16 -2 -16 8 q0 8 16 6" />
      <path d="M104 126 q-16 2 -16 -8 q0 -8 16 -6" />
      {/* Rodas */}
      <rect x="120" y="14" width="46" height="16" rx="6" opacity="0.7" />
      <rect x="234" y="14" width="46" height="16" rx="6" opacity="0.7" />
      <rect x="120" y="170" width="46" height="16" rx="6" opacity="0.7" />
      <rect x="234" y="170" width="46" height="16" rx="6" opacity="0.7" />
      {/* Faróis */}
      <circle cx="86" cy="52" r="6" opacity="0.6" />
      <circle cx="86" cy="148" r="6" opacity="0.6" />
    </svg>
  );
}
