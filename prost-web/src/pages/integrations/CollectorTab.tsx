import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildBookmarklet } from '@/lib/oi-collector';
import type { OiSyncJob } from './types';
import { fmtDate } from './format';
import { SyncStatusBadge } from './ui';

/** Aba do Coletor (bookmarklet): instala o botão e lista as coletas recentes. */
export function CollectorTab() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [history, setHistory] = useState<OiSyncJob[]>([]);

  // Backend roda na porta 3000; o bookmarklet (fora do app) precisa do endereço absoluto.
  const apiUrl = `${window.location.protocol}//${window.location.hostname}:3000/oi/scrape`;
  const bookmarklet = buildBookmarklet(apiUrl);

  // React sanitiza href="javascript:..."; injetamos via setAttribute para preservar o bookmarklet.
  useEffect(() => {
    if (linkRef.current) linkRef.current.setAttribute('href', bookmarklet);
  }, [bookmarklet]);

  useEffect(() => {
    fetch('/api/oi/history?limit=10')
      .then((r) => r.json())
      .then((all: OiSyncJob[]) => setHistory(all.filter((j) => j.source === 'scrape')))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      {/* Instalação */}
      <Card>
        <CardHeader>
          <CardTitle>1. Instale o Coletor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-t3">
            O Coletor é um botão que fica na barra de favoritos do seu navegador. Como o painel da
            Oficina Inteligente não tem botão de exportar, este coletor lê os dados da tabela na tela
            e envia direto para o Prost.
          </p>

          <div className="bg-raised border border-white/[.08] rounded-sm p-4 flex items-center gap-4">
            <span className="text-[13px] text-t3">Arraste este botão para a barra de favoritos →</span>
            <a
              ref={linkRef}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Não clique aqui — arraste este botão para a barra de favoritos do navegador.');
              }}
              draggable
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-brand text-white font-bold text-[13px] cursor-grab active:cursor-grabbing
                         shadow-[0_0_20px_rgba(124,108,255,.35)] select-none"
            >
              🔧 Coletor Prost
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>2. Como coletar os dados</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              'Faça login no painel da Oficina Inteligente normalmente (resolvendo o captcha).',
              'Abra o relatório que deseja trazer: Clientes, Veículos ou Ordens de Serviço.',
              'Se houver paginação, deixe a tabela mostrando o máximo de linhas por página.',
              'Clique no favorito "🔧 Coletor Prost". Um painel vai aparecer no canto da tela.',
              'No painel, encontre a tabela certa e clique no tipo de dado (Clientes / Veículos / Ordens).',
              'Pronto! Os dados são enviados ao Prost e o painel mostra quantos foram criados.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand/[.15] border border-brand/30 flex items-center justify-center text-[11px] font-black text-brand shrink-0">
                  {i + 1}
                </span>
                <span className="text-[13px] text-t2 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 bg-raised border border-white/[.06] rounded-sm px-4 py-3 space-y-1">
            <p className="text-[12px] text-t3">
              <b className="text-t2">Ordem recomendada:</b> colete primeiro os <b>Clientes</b>, depois os <b>Veículos</b>,
              e por último as <b>Ordens de Serviço</b> — assim os vínculos (veículo→dono, OS→cliente) são montados corretamente.
            </p>
            <p className="text-[11.5px] text-t4">
              ⚠️ O backend do Prost precisa estar rodando em <code className="text-sky">localhost:3000</code> no mesmo computador.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de coletas */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de coletas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-sm border border-white/[.06]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Criados</TableHead>
                    <TableHead className="text-right">Atualizados</TableHead>
                    <TableHead className="text-right">Ignorados</TableHead>
                    <TableHead>Quando</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="text-[12px] text-t2 capitalize">{job.kind}</TableCell>
                      <TableCell>
                        <SyncStatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-t3">{job.total}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-ok">{job.created}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-sky">{job.updated}</TableCell>
                      <TableCell className="text-right tabular-nums text-[12px] text-caution">{job.skipped}</TableCell>
                      <TableCell className="text-[12px] text-t4 whitespace-nowrap">{fmtDate(job.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
