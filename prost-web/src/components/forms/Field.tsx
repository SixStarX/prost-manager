import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  /** Marca o campo como obrigatório (asterisco). */
  req?: boolean;
  /** Mensagem de erro / dica abaixo do campo. */
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Campo de formulário padronizado (label + controle + dica).
 * Substitui o helper `Field` que estava duplicado em várias páginas.
 */
export function Field({ label, req, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label>
        {label}
        {req && <span className="text-brand ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <span className="text-[11px] text-t3">{hint}</span>}
    </div>
  );
}
