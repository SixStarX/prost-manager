import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Share2,
  Mail,
  ExternalLink,
  Settings2,
  History,
  Search,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadPDF, shareWhatsApp, shareEmail } from '@/lib/diagnostic-pdf';
import type { DiagnosticoResultado, Veiculo } from '@/lib/diagnostic-types';

function confiancaVariant(c: string): 'done' | 'in-progress' | 'pending' {
  if (/alta/i.test(c)) return 'done';
  if (/m[eé]dia/i.test(c)) return 'in-progress';
  return 'pending';
}

function probColor(p: number): string {
  if (p >= 70) return 'text-[#f87171]';
  if (p >= 45) return 'text-caution';
  return 'text-t3';
}
function probBar(p: number): string {
  if (p >= 70) return 'bg-brand';
  if (p >= 45) return 'bg-caution';
  return 'bg-white/20';
}

/** Laudo completo do diagnóstico por IA (resultado da análise). */
export function ResultadoView({
  resultado,
  veiculo,
  queixa,
  diagnosticId,
  onGerarOS,
  whatsapp,
  setWhatsapp,
  email,
  setEmail,
}: {
  resultado: DiagnosticoResultado;
  veiculo: Veiculo;
  queixa: string;
  diagnosticId: string | null;
  onGerarOS: () => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}) {
  const [openPeca, setOpenPeca] = useState(0);

  return (
    <div className="space-y-5 animate-rise">
      {/* Diagnóstico principal */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="open">{resultado.sistema_afetado}</Badge>
            <Badge variant={confiancaVariant(resultado.confianca)}>Confiança: {resultado.confianca}</Badge>
            {resultado.correlacao_tecnica && (
              <span className="text-[11.5px] text-caution flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {resultado.correlacao_tecnica}
              </span>
            )}
          </div>
          <p className="text-[14px] text-t1 leading-relaxed">{resultado.diagnostico_resumo}</p>
          {resultado.sintomas_identificados?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resultado.sintomas_identificados.map((s, i) => (
                <span key={i} className="text-[11.5px] text-t3 bg-raised border border-white/[.06] rounded-full px-2.5 py-0.5">{s}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => downloadPDF(resultado, veiculo, queixa)}>
              <FileText className="w-4 h-4 mr-1.5" /> Baixar PDF
            </Button>
            {diagnosticId && (
              <Button size="sm" onClick={onGerarOS}>
                <Wrench className="w-4 h-4 mr-1.5" /> Gerar Ordem de Serviço
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <Input placeholder="WhatsApp do cliente (DDD+número)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <Button variant="outline" size="sm" onClick={() => shareWhatsApp(resultado, veiculo, queixa, whatsapp)}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input placeholder="E-mail do cliente" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button variant="outline" size="sm" onClick={() => shareEmail(resultado, veiculo, queixa, email)}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico do modelo */}
      {resultado.resumo_modelo && (
        <Card>
          <CardHeader><CardTitle><History className="w-4 h-4 inline mr-1.5" />Histórico do Modelo</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-[13px] text-t2">
            <div className="flex gap-6">
              <span><b className="text-t3">Lançamento:</b> {resultado.resumo_modelo.lancamento}</span>
              <span><b className="text-t3">Encerramento:</b> {resultado.resumo_modelo.encerramento}</span>
            </div>
            {resultado.resumo_modelo.recalls?.length > 0 && (
              <div><b className="text-t3">Recalls:</b> {resultado.resumo_modelo.recalls.join('; ')}</div>
            )}
            <div><b className="text-t3">Defeitos crônicos:</b> {resultado.resumo_modelo.defeitos_cronicos}</div>
          </CardContent>
        </Card>
      )}

      {/* Peças ranqueadas */}
      <Card>
        <CardHeader><CardTitle><Settings2 className="w-4 h-4 inline mr-1.5" />Peças Suspeitas (ranqueadas)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {resultado.pecas?.map((p, i) => (
            <div key={i} className="border border-white/[.08] rounded-sm overflow-hidden">
              <button onClick={() => setOpenPeca(openPeca === i ? -1 : i)}
                className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-white/[.02] transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-t1">{p.nome}</div>
                  <div className="text-[11.5px] text-t4">{p.nome_tecnico}</div>
                </div>
                <div className="w-28 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[12px] font-black ${probColor(p.probabilidade)}`}>{p.probabilidade}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[.06] overflow-hidden">
                    <div className={`h-full rounded-full ${probBar(p.probabilidade)}`} style={{ width: `${p.probabilidade}%` }} />
                  </div>
                </div>
              </button>
              {openPeca === i && (
                <div className="px-3.5 pb-3 text-[12.5px] text-t2 space-y-1 border-t border-white/[.06] pt-2.5">
                  <div><b className="text-t3">Função:</b> {p.funcao}</div>
                  <div><b className="text-t3">Por que é suspeita:</b> {p.razao}</div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Checklist */}
      {resultado.checklist_sugerido?.length > 0 && (
        <Card>
          <CardHeader><CardTitle><CheckCircle2 className="w-4 h-4 inline mr-1.5" />Checklist Sugerido</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2.5">
              {resultado.checklist_sugerido.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand/[.15] border border-brand/30 flex items-center justify-center text-[11px] font-black text-brand shrink-0">{i + 1}</span>
                  <span className="text-[13px] text-t2 pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Cotações */}
      <Card>
        <CardHeader><CardTitle><Search className="w-4 h-4 inline mr-1.5" />Cotações de Peças</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {resultado.cotacoes?.map((c, i) => (
            <div key={i}>
              <div className="text-[13px] font-semibold text-t1 mb-2">{c.peca}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {c.resultados.map((r, j) => (
                  <a key={j} href={r.link} target="_blank" rel="noreferrer"
                    className={`block rounded-sm border p-3 transition-colors hover:bg-white/[.03]
                      ${r.recomendado ? 'border-ok/40 bg-ok/[.05]' : 'border-white/[.08]'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] font-medium text-t2">{r.canal}</span>
                      {r.recomendado && <Badge variant="done">Recomendado</Badge>}
                    </div>
                    <div className="text-[12.5px] text-t1 truncate" title={r.produto}>{r.produto}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11.5px] text-t3">
                      <span className="font-black text-[14px] text-ok">{r.preco}</span>
                      <span className="text-t4">·</span>
                      <span>{r.tipo}</span>
                      <span className="text-t4">·</span>
                      <span>{r.marca}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-t4">
                      <span>Frete: {r.frete}</span><span>·</span><span>{r.prazo}</span><span>·</span>
                      <span>{r.disponibilidade}</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumo de compra */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-t4">Custo estimado</div>
              <div className="text-[18px] font-black text-t1 mt-0.5">{resultado.custo_min} – {resultado.custo_max}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-t4">Peça prioritária</div>
              <div className="text-[15px] font-semibold text-brand mt-0.5">{resultado.peca_prioritaria}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-t4">Ação ao comprador</div>
              <div className="text-[12.5px] text-t2 mt-0.5">{resultado.acao_comprador}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
