import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/errors';
import type { ImportResult } from './types';
import { Stat, Spinner } from './ui';

/** Card de upload de um CSV (drag-and-drop ou seleção), com painel de resultado. */
function UploadCard({
  title,
  description,
  endpoint,
  templateHint,
}: {
  title: string;
  description: string;
  endpoint: string;
  templateHint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/${endpoint}`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      const data: ImportResult = await res.json();
      setResult(data);
      toast.success(`${data.imported} registros importados com sucesso.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao importar arquivo.'));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[13px] text-t3">{description}</p>
        <p className="text-[11.5px] text-t4 font-mono bg-raised rounded-xs px-2.5 py-2 border border-white/[.06]">
          {templateHint}
        </p>

        <div
          className="border-2 border-dashed border-white/[.10] rounded-sm flex flex-col items-center justify-center gap-2 py-8 px-4 text-center
                     transition-colors duration-150 hover:border-brand/40 hover:bg-brand/[.03] cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
        >
          <span className="text-3xl">📄</span>
          <p className="text-[13px] font-medium text-t2">
            Arraste um CSV ou <span className="text-brand underline underline-offset-2">clique para selecionar</span>
          </p>
          <p className="text-[11px] text-t4">Máximo 5 MB · .csv ou .txt</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-t3">
            <Spinner />
            Processando…
          </div>
        )}

        {result && (
          <div className="rounded-sm border border-white/[.08] bg-raised overflow-hidden">
            <div className="flex items-center gap-5 px-4 py-3 border-b border-white/[.06]">
              <Stat label="Total" value={result.total} />
              <Stat label="Importados" value={result.imported} color="text-ok" />
              <Stat label="Ignorados" value={result.skipped} color="text-caution" />
              {result.errors.length > 0 && (
                <Stat label="Erros" value={result.errors.length} color="text-brand" />
              )}
            </div>
            {result.errors.length > 0 && (
              <ul className="px-4 py-2 space-y-1 max-h-36 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-[11.5px] text-t3 font-mono">{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Aba de importação: cards de Clientes e Veículos lado a lado. */
export function ImportTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <UploadCard
        title="Importar Clientes"
        description="Importe clientes de um CSV. Clientes já existentes (mesmo nome) são ignorados."
        endpoint="integrations/import/clients"
        templateHint="Colunas: nome, telefone (ou celular), email"
      />
      <UploadCard
        title="Importar Veículos"
        description="Importe veículos com vínculo ao proprietário. Importe os clientes primeiro."
        endpoint="integrations/import/vehicles"
        templateHint="Colunas: placa, marca, modelo, ano, cliente (ou proprietario)"
      />
    </div>
  );
}
