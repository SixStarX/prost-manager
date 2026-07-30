import { useState } from 'react';
import {
  ClipboardCheck,
  Hash,
  User,
  Car,
  Fuel,
  Puzzle,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Stethoscope,
  PenLine,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/forms/Field';
import { ChecklistSection } from './ChecklistSection';
import { UnitSelector } from './UnitSelector';
import { FuelGaugeInput } from './FuelGaugeInput';
import { ConditionGrid } from './ConditionGrid';
import { DamageMap } from './DamageMap';
import { SignaturePad } from './SignaturePad';
import { cn } from '@/lib/utils';
import {
  CHECKLIST_STATUSES,
  CHECKLIST_STATUS_LABEL,
  EXTERNAL_ACCESSORIES,
  SAFETY_EQUIPMENT,
  INTERIOR_TECH,
  type Checklist,
  type DamageType,
} from '@/lib/checklist';
import {
  emptyState,
  fromChecklist,
  fromPrefill,
  buildPayload,
  type FormState,
  type ChecklistPrefill,
} from './checklist-form-state';

/**
 * Formulário rico de checklist (criar/editar), usado inline no Perfil do Cliente.
 * Puro: mantém estado e devolve o payload via `onSubmit`; o pai injeta `vehicleId`
 * (create) e chama a API. Reúne unidade/protocolo, cliente/endereço, veículo,
 * combustível, seções de condição (✓/✗), mapa de avarias e assinaturas.
 */
export function ChecklistForm({
  mode,
  initial,
  prefill,
  saving,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initial?: Checklist;
  prefill?: ChecklistPrefill;
  saving: boolean;
  onSubmit: (payload: ReturnType<typeof buildPayload>) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState<FormState>(() =>
    initial ? fromChecklist(initial) : prefill ? fromPrefill(prefill) : emptyState(),
  );
  const [activeDamage, setActiveDamage] = useState<DamageType>('RISCO');

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));
  const setInput =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      upd(k, e.target.value as FormState[typeof k]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(buildPayload(s, mode));
  }

  const submitLabel = saving
    ? 'Salvando…'
    : mode === 'create'
      ? 'Criar Checklist'
      : 'Salvar Alterações';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Protocolo + Unidade (create) / Status (edit) */}
      {mode === 'create' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col justify-center rounded-md border border-white/[.08] bg-surface p-4">
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[.08em] text-t4">
              <Hash className="h-3.5 w-3.5" /> Protocolo
            </span>
            <span className="mt-1 font-mono text-[15px] font-bold text-t3">- - -</span>
          </div>
          <ChecklistSection icon={ClipboardCheck} title="Unidade de Atendimento">
            <UnitSelector value={s.unit} onChange={(u) => upd('unit', u)} />
          </ChecklistSection>
        </div>
      ) : (
        <>
        <ChecklistSection
          icon={ClipboardCheck}
          title="Status do Veículo"
          aside={
            initial?.protocol ? (
              <span className="font-mono text-[12px] font-semibold text-t2">{initial.protocol}</span>
            ) : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            {CHECKLIST_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => upd('status', st)}
                className={cn(
                  'rounded-sm border px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-150',
                  s.status === st
                    ? 'border-brand/50 bg-brand/[.15] text-[#b3a8ff]'
                    : 'border-white/[.08] bg-raised text-t2 hover:text-t1 hover:border-white/20',
                )}
              >
                {CHECKLIST_STATUS_LABEL[st]}
              </button>
            ))}
          </div>
        </ChecklistSection>

        {/* Unidade também é editável na atualização — um veículo pode ser
            transferido entre Mecânica, Funilaria e Blindados durante o serviço.
            Ao salvar, o backend troca a sigla do protocolo mantendo sequência
            e ano (CL-MEC-0054/26 → CL-FUN-0054/26). Ver `update` no service. */}
        <ChecklistSection icon={ClipboardCheck} title="Unidade de Atendimento">
          <UnitSelector value={s.unit} onChange={(u) => upd('unit', u)} />
        </ChecklistSection>
        </>
      )}

      {/* Dados do Cliente */}
      <ChecklistSection icon={User} title="Dados do Cliente">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
          <Field label="Nome Completo" className="sm:col-span-2">
            <Input value={s.clientName} onChange={setInput('clientName')} placeholder="Nome do cliente" />
          </Field>
          <Field label="CPF / CNPJ">
            <Input value={s.clientCpfCnpj} onChange={setInput('clientCpfCnpj')} placeholder="000.000.000-00" />
          </Field>
          <Field label="RG / I.E.">
            <Input value={s.clientRg} onChange={setInput('clientRg')} placeholder="RG ou Inscrição Estadual" />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
          <Field label="Endereço" className="sm:col-span-2">
            <Input value={s.clientAddress} onChange={setInput('clientAddress')} placeholder="Endereço completo" />
          </Field>
          <Field label="Bairro">
            <Input value={s.clientNeighborhood} onChange={setInput('clientNeighborhood')} />
          </Field>
          <Field label="Cidade">
            <Input value={s.clientCity} onChange={setInput('clientCity')} />
          </Field>
          <Field label="Estado">
            <Input value={s.clientState} onChange={setInput('clientState')} />
          </Field>
          <Field label="CEP">
            <Input value={s.clientZip} onChange={setInput('clientZip')} />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
          <Field label="Telefone">
            <Input value={s.clientPhone} onChange={setInput('clientPhone')} />
          </Field>
          <Field label="Celular / WhatsApp">
            <Input value={s.clientMobile} onChange={setInput('clientMobile')} />
          </Field>
          <Field label="Telefone 2">
            <Input value={s.clientPhone2} onChange={setInput('clientPhone2')} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={s.clientEmail} onChange={setInput('clientEmail')} />
          </Field>
          <Field label="Outros / Observações" className="sm:col-span-2">
            <Input value={s.clientNotes} onChange={setInput('clientNotes')} />
          </Field>
        </div>
      </ChecklistSection>

      {/* Dados do Veículo */}
      <ChecklistSection icon={Car} title="Dados do Veículo">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[14px]">
          <Field label="Marca">
            <Input value={s.vBrand} onChange={setInput('vBrand')} />
          </Field>
          <Field label="Modelo">
            <Input value={s.vModel} onChange={setInput('vModel')} />
          </Field>
          <Field label="Ano">
            <Input type="number" min={1900} max={2100} value={s.vYear} onChange={setInput('vYear')} />
          </Field>
          <Field label="Chassis">
            <Input value={s.vChassis} onChange={setInput('vChassis')} className="font-mono uppercase" />
          </Field>
          <Field label="Placas">
            <Input value={s.vPlate} onChange={setInput('vPlate')} className="font-mono uppercase tracking-[.05em]" />
          </Field>
          <Field label="Cor">
            <Input value={s.vColor} onChange={setInput('vColor')} />
          </Field>
          <Field label="KM Entrada">
            <Input type="number" min={0} value={s.kmIn} onChange={setInput('kmIn')} placeholder="0" />
          </Field>
          <Field label="KM Saída">
            <Input type="number" min={0} value={s.kmOut} onChange={setInput('kmOut')} placeholder="0" />
          </Field>
        </div>
      </ChecklistSection>

      {/* Combustível */}
      <ChecklistSection icon={Fuel} title="Combustível">
        <FuelGaugeInput
          fuelType={s.fuelType}
          onFuelType={(t) => upd('fuelType', t)}
          level={s.fuelLevel}
          onLevel={(n) => upd('fuelLevel', n)}
        />
      </ChecklistSection>

      {/* Seções de condição (2 estados) */}
      <ChecklistSection icon={Puzzle} title="Acessórios Externos">
        <ConditionGrid
          items={EXTERNAL_ACCESSORIES}
          values={s.externalAccessories}
          onChange={(next) => upd('externalAccessories', next)}
        />
      </ChecklistSection>
      <ChecklistSection icon={ShieldCheck} title="Equipamentos de Segurança">
        <ConditionGrid
          items={SAFETY_EQUIPMENT}
          values={s.safetyEquipment}
          onChange={(next) => upd('safetyEquipment', next)}
        />
      </ChecklistSection>
      <ChecklistSection icon={Cpu} title="Interior e Tecnologia">
        <ConditionGrid
          items={INTERIOR_TECH}
          values={s.interiorTech}
          onChange={(next) => upd('interiorTech', next)}
        />
      </ChecklistSection>

      {/* Mapeamento de Avarias */}
      <ChecklistSection icon={AlertTriangle} title="Mapeamento de Avarias">
        <DamageMap
          marks={s.damageMarks}
          onChange={(next) => upd('damageMarks', next)}
          activeType={activeDamage}
          onActiveType={setActiveDamage}
        />
      </ChecklistSection>

      {/* Diagnóstico e Prazos */}
      <ChecklistSection icon={Stethoscope} title="Diagnóstico e Prazos">
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <Field label="Data de Entrada">
            <Input type="date" value={s.entryDate} onChange={setInput('entryDate')} />
          </Field>
          <Field label="Previsão de Entrega">
            <Input type="date" value={s.expectedDate} onChange={setInput('expectedDate')} />
          </Field>
        </div>
        <div className="mt-4 flex flex-col gap-[14px]">
          <Field label="Diagnóstico / Prévia de Orçamento">
            <Textarea rows={3} value={s.diagnosis} onChange={setInput('diagnosis')} />
          </Field>
          <Field label="Observações Gerais">
            <Textarea rows={3} value={s.observations} onChange={setInput('observations')} />
          </Field>
        </div>
        <p className="mt-4 rounded-sm border border-white/[.06] bg-raised px-3 py-2.5 text-[11.5px] leading-relaxed text-t3">
          Obs.: Recomendamos aos Srs. Clientes a retirada de pertences pessoais e objetos de valor
          durante o período em que o veículo permanecer em atendimento.
        </p>
      </ChecklistSection>

      {/* Assinaturas */}
      <ChecklistSection icon={PenLine} title="Assinaturas">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SignaturePad
            role="Prost Blindados"
            name={s.signCompanyName}
            onName={(v) => upd('signCompanyName', v)}
            image={s.signCompanyImage}
            onImage={(img) => upd('signCompanyImage', img)}
          />
          <SignaturePad
            role="Cliente"
            name={s.signClientName}
            onName={(v) => upd('signClientName', v)}
            image={s.signClientImage}
            onImage={(img) => upd('signClientImage', img)}
          />
        </div>
      </ChecklistSection>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="submit" disabled={saving}>
          <Save /> {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          <X /> Cancelar
        </Button>
      </div>
    </form>
  );
}
