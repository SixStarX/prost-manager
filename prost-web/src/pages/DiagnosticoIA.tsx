import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car, Search, Fingerprint, Loader2, AlertTriangle, CheckCircle2,
  FileText, Share2, Mail, ExternalLink, Gauge, Settings2, History, Zap, Wrench,
} from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  VEHICLE_DATA, SUB_MODELS, COMMON_OBD_CODES, anos, combustiveis, cambios,
} from '@/lib/vehicle-data';
import {
  type DiagnosticoResultado, type Veiculo, EMPTY_VEICULO,
} from '@/lib/diagnostic-types';
import { downloadPDF, shareWhatsApp, shareEmail } from '@/lib/diagnostic-pdf';

type Status = 'form' | 'loading' | 'results' | 'error';

const LOAD_MSGS = [
  'Identificando veículo e buscando documentação técnica…',
  'Analisando a queixa do cliente…',
  'Consultando manuais de serviço e boletins (TSBs)…',
  'Verificando recalls e falhas conhecidas do modelo…',
  'Ranqueando peças por probabilidade…',
  'Pesquisando preços no Mercado Livre e portais de autopeças…',
  'Consolidando diagnóstico e relatório de compras…',
];

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

export default function DiagnosticoIA() {
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState<string>(''); // veículo cadastrado p/ persistência
  const [veiculo, setVeiculo] = useState<Veiculo>(EMPTY_VEICULO);
  const [vin, setVin] = useState('');
  const [searchingVin, setSearchingVin] = useState(false);
  const [queixa, setQueixa] = useState('');
  const [obd, setObd] = useState('');
  const [scannerPdf, setScannerPdf] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>('form');
  const [loadMsg, setLoadMsg] = useState('');
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get('/diagnostics/ai/status').then((r) => setAiReady(r.data.configured)).catch(() => setAiReady(false));
    api.get('/vehicles').then((r) => setVehicles(r.data)).catch(() => {});
  }, []);

  const set = (k: keyof Veiculo, v: string) => setVeiculo((p) => ({ ...p, [k]: v }));

  // Selecionar veículo cadastrado → prefill + vincula para persistência
  function pickVehicle(id: string) {
    setVehicleId(id);
    const v = vehicles.find((x) => x.id === id);
    if (v) {
      setVeiculo((p) => ({
        ...p,
        marca: v.brand && VEHICLE_DATA[v.brand] ? v.brand : p.marca,
        modelo: v.model || p.modelo,
        ano_fabricacao: v.year ? String(v.year) : p.ano_fabricacao,
        ano_modelo: v.year ? String(v.year) : p.ano_modelo,
      }));
      toast.info(`Veículo ${v.plate} selecionado. Complete os dados técnicos abaixo.`);
    }
  }

  async function buscarChassis() {
    if (!vin || vin.length < 10) { toast.error('Insira um chassis (VIN) válido.'); return; }
    setSearchingVin(true);
    try {
      const { data } = await api.post('/diagnostics/ai/vin', { vin });
      setVeiculo((p) => ({
        ...p, chassis: vin,
        marca: data.marca || p.marca, modelo: data.modelo || p.modelo,
        sub_modelo: data.sub_modelo || p.sub_modelo, versao: data.versao || p.versao,
        ano_fabricacao: data.ano_fabricacao || p.ano_fabricacao, ano_modelo: data.ano_modelo || p.ano_modelo,
        motor: data.motor || p.motor, combustivel: data.combustivel || p.combustivel, cambio: data.cambio || p.cambio,
      }));
      toast.success('Veículo identificado pela IA!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Não foi possível identificar o veículo. Preencha manualmente.');
    } finally {
      setSearchingVin(false);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
  }

  async function analisar() {
    if (!veiculo.marca || !veiculo.modelo || !queixa.trim()) {
      toast.error('Preencha ao menos marca, modelo e a queixa do cliente.');
      return;
    }
    setStatus('loading');
    setErro('');
    setResultado(null);
    let i = 0;
    setLoadMsg(LOAD_MSGS[0]);
    intervalRef.current = setInterval(() => { i = (i + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[i]); }, 2800);

    try {
      const scannerPdfBase64 = scannerPdf ? await fileToBase64(scannerPdf) : undefined;
      const { data } = await api.post('/diagnostics/ai/analyze', {
        vehicleId: vehicleId || undefined,
        veiculo, queixa, obd: obd || undefined,
        scannerPdfBase64,
        persist: !!vehicleId,
      });
      if (intervalRef.current) clearInterval(intervalRef.current);
      setResultado(data.resultado);
      setDiagnosticId(data.diagnosticId || null);
      setStatus('results');
      if (data.diagnosticId) toast.success('Diagnóstico salvo no histórico do veículo.');
    } catch (e: any) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setErro(e?.response?.data?.message || 'Erro ao processar o diagnóstico.');
      setStatus('error');
    }
  }

  async function gerarOS() {
    if (!diagnosticId) return;
    try {
      await api.post('/service-orders', { diagnosticId, status: 'OPEN' });
      toast.success('Ordem de Serviço criada a partir do diagnóstico!');
    } catch {
      toast.error('Erro ao gerar a Ordem de Serviço.');
    }
  }

  function novaAnalise() {
    setStatus('form'); setResultado(null); setDiagnosticId(null); setErro('');
  }

  // ── Dropdowns em cascata ───────────────────────────────────────────────────
  const modelos  = veiculo.marca ? Object.keys(VEHICLE_DATA[veiculo.marca] || {}) : [];
  const subs     = veiculo.modelo ? (SUB_MODELS[veiculo.modelo] || []) : [];
  const versoes  = veiculo.marca && veiculo.modelo ? Object.keys(VEHICLE_DATA[veiculo.marca]?.[veiculo.modelo] || {}) : [];
  const motores  = veiculo.marca && veiculo.modelo && veiculo.versao
    ? (VEHICLE_DATA[veiculo.marca]?.[veiculo.modelo]?.[veiculo.versao] || []) : [];
  const sortBR = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-t1 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-brand" /> Diagnóstico IA
          </h1>
          <p className="text-[13px] text-t3 mt-0.5">
            Diagnóstico assistido por IA com pesquisa web e cotação de peças em tempo real.
          </p>
        </div>
        {status === 'results' && (
          <Button variant="secondary" size="sm" onClick={novaAnalise}>Nova análise</Button>
        )}
      </div>

      {aiReady === false && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-caution shrink-0 mt-0.5" />
              <div className="text-[13px] text-t2">
                <b>IA não configurada.</b> Defina a variável <code className="text-brand">GEMINI_API_KEY</code> no
                arquivo <code className="text-sky">server/.env</code> e reinicie o backend. A chave é obtida no Google AI Studio.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── FORMULÁRIO ── */}
      {(status === 'form' || status === 'error') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Identificação por VIN + veículo cadastrado */}
          <Card>
            <CardHeader><CardTitle><Fingerprint className="w-4 h-4 inline mr-1.5" />Identificação do Veículo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Veículo cadastrado (vincula ao histórico)</Label>
                  <Select value={vehicleId} onValueChange={pickVehicle}>
                    <SelectTrigger><SelectValue placeholder="Selecione um veículo do Prost…" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.length === 0 && <div className="px-3 py-2 text-[12px] text-t4">Nenhum veículo cadastrado</div>}
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model} ({v.client?.name})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Ou identifique por chassis (VIN)</Label>
                  <div className="flex gap-2">
                    <Input
                      className="font-mono uppercase tracking-wider" placeholder="9BW ZZZ 37Z…" maxLength={17}
                      value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())}
                    />
                    <Button onClick={buscarChassis} disabled={searchingVin || vin.length < 10} variant="secondary">
                      {searchingVin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do veículo (cascata) */}
          <Card>
            <CardHeader><CardTitle><Car className="w-4 h-4 inline mr-1.5" />Dados do Veículo</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Marca" icon={<Car className="w-3 h-3" />}>
                  <Select value={veiculo.marca} onValueChange={(v) => setVeiculo((p) => ({ ...p, marca: v, modelo: '', sub_modelo: '', versao: '', motor: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(VEHICLE_DATA).sort(sortBR).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Modelo" icon={<Car className="w-3 h-3" />}>
                  <Select value={veiculo.modelo} onValueChange={(v) => setVeiculo((p) => ({ ...p, modelo: v, sub_modelo: '', versao: '', motor: '' }))} disabled={!veiculo.marca}>
                    <SelectTrigger><SelectValue placeholder={veiculo.marca ? 'Selecione' : 'Marca primeiro'} /></SelectTrigger>
                    <SelectContent>
                      {modelos.sort(sortBR).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Sub-modelo / Geração" icon={<Settings2 className="w-3 h-3" />}>
                  {subs.length > 0 ? (
                    <Select value={veiculo.sub_modelo} onValueChange={(v) => set('sub_modelo', v)} disabled={!veiculo.modelo}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{subs.sort(sortBR).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input value={veiculo.sub_modelo} onChange={(e) => set('sub_modelo', e.target.value)} placeholder="Opcional" disabled={!veiculo.modelo} />
                  )}
                </Field>
                <Field label="Versão" icon={<Settings2 className="w-3 h-3" />}>
                  <Select value={veiculo.versao} onValueChange={(v) => setVeiculo((p) => ({ ...p, versao: v, motor: '' }))} disabled={!veiculo.modelo}>
                    <SelectTrigger><SelectValue placeholder={veiculo.modelo ? 'Selecione' : 'Modelo primeiro'} /></SelectTrigger>
                    <SelectContent>{versoes.sort(sortBR).map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Motor" icon={<Gauge className="w-3 h-3" />}>
                  <Select value={veiculo.motor} onValueChange={(v) => set('motor', v)} disabled={!veiculo.versao}>
                    <SelectTrigger><SelectValue placeholder={veiculo.versao ? 'Selecione' : 'Versão primeiro'} /></SelectTrigger>
                    <SelectContent>{motores.sort(sortBR).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Ano fab." icon={<History className="w-3 h-3" />}>
                  <Select value={veiculo.ano_fabricacao} onValueChange={(v) => set('ano_fabricacao', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">{[...anos].reverse().map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Ano modelo" icon={<History className="w-3 h-3" />}>
                  <Select value={veiculo.ano_modelo} onValueChange={(v) => set('ano_modelo', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">{[...anos].reverse().map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Combustível" icon={<Zap className="w-3 h-3" />}>
                  <Select value={veiculo.combustivel} onValueChange={(v) => set('combustivel', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{combustiveis.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Câmbio" icon={<Settings2 className="w-3 h-3" />}>
                  <Select value={veiculo.cambio} onValueChange={(v) => set('cambio', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{cambios.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Quilometragem" icon={<Gauge className="w-3 h-3" />}>
                  <Input value={veiculo.quilometragem} onChange={(e) => set('quilometragem', e.target.value)} placeholder="85.000 km" />
                </Field>
                <Field label="Chassis (VIN)" icon={<Fingerprint className="w-3 h-3" />}>
                  <Input className="font-mono uppercase" value={veiculo.chassis} onChange={(e) => set('chassis', e.target.value.toUpperCase())} placeholder="Opcional" />
                </Field>
                <Field label="Histórico recente" icon={<History className="w-3 h-3" />}>
                  <Input value={veiculo.historico_manutencao} onChange={(e) => set('historico_manutencao', e.target.value)} placeholder="Última revisão, trocas…" />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Queixa + OBD + scanner */}
          <Card>
            <CardHeader><CardTitle><Search className="w-4 h-4 inline mr-1.5" />Queixa e Sintomas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label>Queixa do cliente <span className="text-brand">*</span></Label>
                <Textarea rows={4} value={queixa} onChange={(e) => setQueixa(e.target.value)}
                  placeholder="Ex: Barulho metálico ao frear, vibração no volante acima de 80 km/h, luz da injeção acesa…" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Código OBD (opcional)</Label>
                  <Input list="obd-codes" value={obd} onChange={(e) => setObd(e.target.value.toUpperCase())} placeholder="Ex: P0300" className="font-mono uppercase" />
                  <datalist id="obd-codes">
                    {COMMON_OBD_CODES.map((c) => <option key={c.code} value={c.code}>{c.desc}</option>)}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Relatório do scanner (PDF, opcional)</Label>
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => setScannerPdf(e.target.files?.[0] || null)} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()} className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    {scannerPdf ? scannerPdf.name : 'Anexar PDF do scanner'}
                  </Button>
                </div>
              </div>

              {erro && (
                <div className="bg-brand/[.08] border border-brand/20 rounded-sm p-3 flex items-start gap-2.5">
                  <AlertTriangle className="text-brand w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-t2">{erro}</p>
                </div>
              )}

              <Button onClick={analisar} disabled={aiReady === false} className="w-full h-11 text-[14px]">
                <Zap className="w-4 h-4 mr-2" /> Executar Diagnóstico
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── LOADING ── */}
      {status === 'loading' && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
            <AnimatePresence mode="wait">
              <motion.p key={loadMsg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-[14px] text-t2 font-medium max-w-md">{loadMsg}</motion.p>
            </AnimatePresence>
            <p className="text-[11.5px] text-t4">A IA está pesquisando na web — isso pode levar até 1 minuto.</p>
          </CardContent>
        </Card>
      )}

      {/* ── RESULTADOS ── */}
      {status === 'results' && resultado && (
        <ResultadoView
          resultado={resultado} veiculo={veiculo} queixa={queixa}
          diagnosticId={diagnosticId} onGerarOS={gerarOS}
          whatsapp={whatsapp} setWhatsapp={setWhatsapp} email={email} setEmail={setEmail}
        />
      )}
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1.5">{icon}{label}</Label>
      {children}
    </div>
  );
}

function ResultadoView({
  resultado, veiculo, queixa, diagnosticId, onGerarOS,
  whatsapp, setWhatsapp, email, setEmail,
}: {
  resultado: DiagnosticoResultado; veiculo: Veiculo; queixa: string;
  diagnosticId: string | null; onGerarOS: () => void;
  whatsapp: string; setWhatsapp: (v: string) => void; email: string; setEmail: (v: string) => void;
}) {
  const [openPeca, setOpenPeca] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
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
    </motion.div>
  );
}
