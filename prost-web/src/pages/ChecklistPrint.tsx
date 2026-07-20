import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { formatDate } from '@/lib/format';
import {
  checklistStatusLabel,
  formatTime,
  unitLabel,
  damageColor,
  DAMAGE_TYPES,
  CONDITION_LABEL,
  EXTERNAL_ACCESSORIES,
  SAFETY_EQUIPMENT,
  INTERIOR_TECH,
  type Checklist,
  type Condition,
  type ConditionMap,
  type DamageMark,
} from '@/lib/checklist';
import { CarDiagram } from '@/components/checklist/CarDiagram';

/**
 * Página de impressão profissional (A4) de um checklist.
 * Layout claro e autossuficiente — renderizada fora do Layout escuro da app,
 * numa aba própria, disparando `window.print()` ao carregar. O navegador exporta
 * PDF a partir do mesmo layout.
 */
export default function ChecklistPrint() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Checklist | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/checklists/${id}`)
      .then((r) => setC(r.data))
      .catch(() => setError(true));
  }, [id]);

  useEffect(() => {
    if (c) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [c]);

  if (error) return <div className="cp-msg">Checklist não encontrado.</div>;
  if (!c) return <div className="cp-msg">Carregando checklist…</div>;

  return (
    <div className="cp-root">
      <style>{PRINT_CSS}</style>

      {/* Barra de ações — não sai na impressão */}
      <div className="cp-toolbar">
        <button onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        <button className="ghost" onClick={() => window.close()}>Fechar</button>
      </div>

      <div className="cp-page">
        {/* Cabeçalho */}
        <header className="cp-head">
          <div className="cp-brand">
            <span className="cp-mark">P</span>
            <div>
              <div className="cp-word">PROST</div>
              <div className="cp-tag">Blindados · Checklist de Vistoria</div>
            </div>
          </div>
          <div className="cp-meta">
            <div>Protocolo: <b>{c.protocol ?? '—'}</b></div>
            <div>Unidade: {unitLabel(c.unit)}</div>
            <div>Data: {formatDate(c.createdAt)} {formatTime(c.createdAt)}</div>
            <div>Status: <b>{checklistStatusLabel(c.status)}</b></div>
          </div>
        </header>

        {/* Status / prazos */}
        <Section title="Status do Veículo">
          <Grid
            rows={[
              ['Status atual', checklistStatusLabel(c.status)],
              ['Responsável', c.responsible],
              ['Data de entrada', formatDate(c.entryDate)],
              ['Previsão de entrega', formatDate(c.expectedDate)],
              ['Data de saída', formatDate(c.exitDate)],
            ]}
          />
        </Section>

        {/* Cliente + Veículo lado a lado */}
        <div className="cp-cols">
          <Section title="Dados do Cliente">
            <Grid
              cols={1}
              rows={[
                ['Nome', c.clientName],
                ['CPF / CNPJ', c.clientCpfCnpj],
                ['RG / I.E.', c.clientRg],
                ['Telefone', c.clientPhone],
                ['Celular / WhatsApp', c.clientMobile],
                ['Telefone 2', c.clientPhone2],
                ['E-mail', c.clientEmail],
                ['Endereço', [c.clientAddress, c.clientNeighborhood, c.clientCity, c.clientState, c.clientZip]
                  .filter(Boolean).join(', ') || null],
                ['Observações', c.clientNotes],
              ]}
            />
          </Section>
          <Section title="Dados do Veículo">
            <Grid
              cols={1}
              rows={[
                ['Marca / Modelo', [c.vBrand, c.vModel].filter(Boolean).join(' ') || null],
                ['Ano', c.vYear],
                ['Placa', c.vPlate],
                ['Cor', c.vColor],
                ['Chassi', c.vChassis],
                ['KM entrada / saída', [c.kmIn, c.kmOut].some((v) => v != null)
                  ? `${c.kmIn ?? '—'} / ${c.kmOut ?? '—'}`
                  : null],
              ]}
            />
          </Section>
        </div>

        {/* Combustível */}
        <Section title="Combustível">
          <Grid
            rows={[
              ['Tipo', c.fuelType],
              ['Nível do tanque', c.fuelLevel != null ? `${c.fuelLevel}%` : null],
            ]}
          />
        </Section>

        {/* Seções de itens */}
        <div className="cp-cols3">
          <ItemSection title="Acessórios Externos" items={EXTERNAL_ACCESSORIES} values={c.externalAccessories} />
          <ItemSection title="Equip. de Segurança" items={SAFETY_EQUIPMENT} values={c.safetyEquipment} />
          <ItemSection title="Interior e Tecnologia" items={INTERIOR_TECH} values={c.interiorTech} />
        </div>

        {/* Mapeamento de avarias */}
        <Section title="Mapeamento de Avarias">
          <DamageDiagram marks={c.damageMarks} />
        </Section>

        {/* Diagnóstico */}
        <Section title="Diagnóstico e Prazos">
          <TextRow label="Diagnóstico / Prévia de Orçamento" value={c.diagnosis} />
          <TextRow label="Observações gerais" value={c.observations} />
        </Section>

        {/* Assinaturas */}
        <Section title="Assinaturas">
          <div className="cp-signs">
            <Signature role="Prost Blindados" name={c.signCompanyName} image={c.signCompanyImage} />
            <Signature role="Cliente" name={c.signClientName} image={c.signClientImage} />
          </div>
          <div className="cp-signdate">
            Data da assinatura: {formatDate(c.signedAt)}{c.signedAt ? ` às ${formatTime(c.signedAt)}` : ''}
          </div>
        </Section>

        <footer className="cp-foot">
          Documento gerado por PROST Manager · {formatDate(new Date().toISOString())}
        </footer>
      </div>
    </div>
  );
}

/* ── Blocos ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cp-section">
      <h2 className="cp-h2">{title}</h2>
      {children}
    </section>
  );
}

function val(v: unknown): string {
  return v === null || v === undefined || v === '' ? '—' : String(v);
}

function Grid({ rows, cols = 2 }: { rows: [string, unknown][]; cols?: number }) {
  return (
    <dl className="cp-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {rows.map(([label, v]) => (
        <div key={label} className="cp-cell">
          <dt>{label}</dt>
          <dd>{val(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

function TextRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="cp-text">
      <div className="cp-textlabel">{label}</div>
      <div className="cp-textval">{value || '—'}</div>
    </div>
  );
}

function ItemSection({
  title,
  items,
  values,
}: {
  title: string;
  items: readonly string[];
  values: ConditionMap | null;
}) {
  return (
    <div className="cp-items">
      <h3 className="cp-h3">{title}</h3>
      <table>
        <tbody>
          {items.map((item) => {
            const cond = values?.[item] as Condition | undefined;
            return (
              <tr key={item}>
                <td className="cp-itemname">{item}</td>
                <td className={'cp-cond ' + (cond ? `c-${cond}` : '')}>
                  {cond ? CONDITION_LABEL[cond] : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DamageDiagram({ marks }: { marks: DamageMark[] | null }) {
  const list = marks ?? [];
  return (
    <div className="cp-damage">
      <div className="cp-damagemap">
        <CarDiagram />
        {list.map((m, i) => (
          <span
            key={i}
            className="cp-damagemark"
            style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, background: damageColor(m.type) }}
          />
        ))}
      </div>
      <div className="cp-damagelegend">
        {DAMAGE_TYPES.map((d) => (
          <span key={d.type}>
            <i style={{ background: d.color }} /> {d.label}:{' '}
            <b>{list.filter((m) => m.type === d.type).length}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function Signature({ role, name, image }: { role: string; name?: string | null; image?: string | null }) {
  return (
    <div className="cp-sign">
      {image ? (
        <img src={image} alt={`Assinatura ${role}`} className="cp-signimg" />
      ) : (
        <div className="cp-signline" />
      )}
      <div className="cp-signname">{name || ' '}</div>
      <div className="cp-signrole">{role}</div>
    </div>
  );
}

/* ── Estilos (claro, A4) ── */
const PRINT_CSS = `
.cp-root { background:#f1f5f9; min-height:100vh; color:#0f172a;
  font-family:'Inter',-apple-system,'Segoe UI',sans-serif; }
.cp-msg { padding:40px; text-align:center; color:#334155; font-family:sans-serif; }
.cp-toolbar { position:sticky; top:0; display:flex; gap:8px; justify-content:center;
  padding:12px; background:#0f172a; }
.cp-toolbar button { padding:8px 16px; border-radius:6px; border:0; font-weight:600;
  font-size:13px; cursor:pointer; background:#7c6cff; color:#fff; }
.cp-toolbar button.ghost { background:transparent; color:#cbd5e1; border:1px solid #334155; }

.cp-page { width:210mm; min-height:297mm; margin:16px auto; background:#fff; padding:14mm;
  box-shadow:0 4px 24px rgba(0,0,0,.15); box-sizing:border-box; }

.cp-head { display:flex; justify-content:space-between; align-items:flex-start;
  border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:14px; }
.cp-brand { display:flex; gap:10px; align-items:center; }
.cp-mark { width:34px; height:34px; border-radius:9px; background:#6a5af2; color:#fff;
  font-weight:900; font-size:20px; display:flex; align-items:center; justify-content:center; }
.cp-word { font-size:20px; font-weight:900; letter-spacing:-.02em; line-height:1; }
.cp-tag { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:.12em; margin-top:3px; }
.cp-meta { font-size:11px; color:#334155; text-align:right; line-height:1.6; }
.cp-id { color:#94a3b8; font-family:monospace; }

.cp-section { margin-bottom:12px; break-inside:avoid; }
.cp-h2 { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.08em;
  color:#475569; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px; }
.cp-cols { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.cp-cols3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px; }

.cp-grid { display:grid; gap:6px 14px; }
.cp-cell dt { font-size:9px; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; }
.cp-cell dd { font-size:12.5px; color:#0f172a; font-weight:500; }

.cp-text { margin-bottom:7px; }
.cp-textlabel { font-size:9px; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; }
.cp-textval { font-size:12px; white-space:pre-wrap; line-height:1.45; }

.cp-items { break-inside:avoid; }
.cp-h3 { font-size:10.5px; font-weight:700; color:#334155; margin-bottom:5px; }
.cp-items table { width:100%; border-collapse:collapse; }
.cp-items td { font-size:10.5px; padding:2.5px 4px; border-bottom:1px solid #f1f5f9; }
.cp-itemname { color:#334155; }
.cp-cond { text-align:right; font-weight:700; color:#94a3b8; white-space:nowrap; }
.cp-cond.c-OK { color:#059669; }
.cp-cond.c-DAMAGED { color:#d97706; }
.cp-cond.c-ABSENT { color:#dc2626; }

.cp-damage { break-inside:avoid; }
.cp-damagemap { position:relative; width:70mm; margin:0 auto; color:#0f172a; aspect-ratio:2/1; }
.cp-damagemark { position:absolute; width:9px; height:9px; border-radius:50%;
  border:1.5px solid #fff; transform:translate(-50%,-50%); box-shadow:0 0 2px rgba(0,0,0,.5); }
.cp-damagelegend { display:flex; justify-content:center; gap:16px; margin-top:6px;
  font-size:10px; color:#334155; }
.cp-damagelegend i { display:inline-block; width:8px; height:8px; border-radius:50%; vertical-align:middle; }

.cp-signs { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:14px; }
.cp-sign { text-align:center; }
.cp-signimg { max-height:60px; max-width:100%; object-fit:contain; }
.cp-signline { border-bottom:1px solid #0f172a; height:44px; }
.cp-signname { font-size:12px; font-weight:600; margin-top:4px; }
.cp-signrole { font-size:9px; text-transform:uppercase; letter-spacing:.08em; color:#94a3b8; }
.cp-signdate { font-size:10px; color:#64748b; margin-top:10px; }
.cp-foot { margin-top:16px; padding-top:8px; border-top:1px solid #e2e8f0;
  font-size:9px; color:#94a3b8; text-align:center; }

@page { size:A4; margin:0; }
@media print {
  .cp-root { background:#fff; }
  .cp-toolbar { display:none; }
  .cp-page { width:auto; min-height:auto; margin:0; padding:12mm; box-shadow:none; }
}
`;
