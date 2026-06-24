import { useEffect } from 'react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: number) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-5 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <div className={`animate-toast-in flex items-center gap-2.5 px-4 py-[13px] rounded-md text-[13px] font-medium
                     min-w-[280px] max-w-[380px] pointer-events-auto border
                     shadow-[0_12px_40px_rgba(0,0,0,.7)] backdrop-blur-md
                     ${isSuccess
                       ? 'bg-ok/[.10] border-ok/25 text-[#34d399]'
                       : 'bg-brand/[.12] border-brand/25 text-[#f87171]'}`}>
      <span className="text-[15px] shrink-0">{isSuccess ? '✓' : '✕'}</span>
      <span className="flex-1 text-t1 font-medium">{toast.message}</span>
      <button
        className="ml-auto text-[16px] opacity-40 hover:opacity-90 transition-opacity duration-150"
        onClick={() => onRemove(toast.id)}
      >
        ×
      </button>
    </div>
  );
}
