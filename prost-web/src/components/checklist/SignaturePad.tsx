import { useEffect, useRef } from 'react';
import { Eraser } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/forms/Field';

/**
 * Pad de assinatura: desenho por mouse/touch em <canvas>, exportado como PNG
 * (dataURL) via `onImage`. Inclui campo de nome opcional e botão de limpar.
 * No modo edição, a imagem inicial é redesenhada no canvas.
 */
export function SignaturePad({
  role,
  name,
  onName,
  image,
  onImage,
}: {
  role: string;
  name: string;
  onName: (v: string) => void;
  image: string | null;
  onImage: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);

  // Dimensiona o canvas ao container e redesenha a imagem inicial (edição).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fafafa';
    if (image) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = image;
      hasInk.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    hasInk.current = true;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas && hasInk.current) onImage(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    onImage(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-t4">
          {role}
        </span>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 text-[11px] text-t3 transition-colors hover:text-t1"
        >
          <Eraser className="h-3.5 w-3.5" /> Limpar
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-28 w-full touch-none rounded-sm border border-white/[.1] bg-raised"
      />
      <Field label="Nome">
        <Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Nome completo" />
      </Field>
    </div>
  );
}
