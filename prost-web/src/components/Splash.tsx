import { ProstMark } from '@/components/brand/Logo';

/** Splash screen / fallback de Suspense — exibido durante o carregamento de rotas. */
export default function Splash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-base animate-fade-in">
      <div className="relative">
        <ProstMark size={56} className="animate-rise" />
        <span className="absolute -inset-3 rounded-2xl border border-brand/30 animate-ping" />
      </div>
      <div className="flex items-center gap-2 text-[12px] font-medium text-t3">
        <span className="w-3.5 h-3.5 border-2 border-white/[.1] border-t-brand rounded-full animate-spin" />
        Carregando…
      </div>
    </div>
  );
}
