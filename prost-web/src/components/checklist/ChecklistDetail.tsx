import {
  ClipboardCheck,
  User,
  Car,
  Fuel,
  Puzzle,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Stethoscope,
  PenLine,
  Pencil,
  Printer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlateBadge } from '@/components/common/PlateBadge';
import { formatDate } from '@/lib/format';
import {
  checklistStatusLabel,
  checklistStatusVariant,
  unitLabel,
  formatTime,
  EXTERNAL_ACCESSORIES,
  SAFETY_EQUIPMENT,
  INTERIOR_TECH,
  type Checklist,
} from '@/lib/checklist';
import { ChecklistSection, InfoGrid, InfoItem } from './ChecklistSection';
import { FuelGauge } from './FuelGauge';
import { ConditionItems } from './ConditionItems';
import { DamageView } from './DamageView';

/** Bloco de texto multi-linha (diagnóstico, observações…). */
function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-t4">
        {label}
      </span>
      {value ? (
        <p className="text-[13.5px] text-t1 whitespace-pre-wrap leading-relaxed">{value}</p>
      ) : (
        <span className="text-t3 text-[13px]">—</span>
      )}
    </div>
  );
}

/** Cartão de assinatura (nome + imagem opcional). */
function SignatureCard({
  role,
  name,
  image,
}: {
  role: string;
  name?: string | null;
  image?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[.08em] text-t4">
        {role}
      </span>
      <div className="h-24 rounded-sm bg-raised border border-white/[.08] flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={`Assinatura ${role}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-t4 text-xs">Sem assinatura</span>
        )}
      </div>
      <span className="text-[13px] font-medium text-t1 text-center">
        {name || <span className="text-t3">—</span>}
      </span>
    </div>
  );
}

export function ChecklistDetail({
  checklist: c,
  onEdit,
  onPrint,
}: {
  checklist: Checklist;
  onEdit: () => void;
  onPrint: () => void;
}) {
  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onEdit}>
        <Pencil /> Atualizar Checklist
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer /> Imprimir
      </Button>
    </div>
  );

  return (
    <div>
      {/* Status do Veículo */}
      <ChecklistSection
        icon={ClipboardCheck}
        title="Status do Veículo"
        aside={actions}
      >
        <InfoGrid>
          <InfoItem label="Protocolo" value={c.protocol} mono />
          <InfoItem label="Unidade" value={unitLabel(c.unit)} />
          <InfoItem
            label="Status atual"
            value={
              <Badge variant={checklistStatusVariant(c.status)}>
                {checklistStatusLabel(c.status)}
              </Badge>
            }
          />
          <InfoItem label="Data de entrada" value={formatDate(c.entryDate)} />
          <InfoItem label="Previsão de entrega" value={formatDate(c.expectedDate)} />
          <InfoItem label="Data de saída" value={formatDate(c.exitDate)} />
          <InfoItem label="Responsável" value={c.responsible} />
        </InfoGrid>
      </ChecklistSection>

      {/* Dados do Cliente */}
      <ChecklistSection icon={User} title="Dados do Cliente">
        <InfoGrid>
          <InfoItem label="Nome" value={c.clientName} />
          <InfoItem label="CPF / CNPJ" value={c.clientCpfCnpj} mono />
          <InfoItem label="RG / I.E." value={c.clientRg} />
          <InfoItem label="Telefone" value={c.clientPhone} />
          <InfoItem label="Celular / WhatsApp" value={c.clientMobile} />
          <InfoItem label="Telefone 2" value={c.clientPhone2} />
          <InfoItem label="E-mail" value={c.clientEmail} />
          <InfoItem
            label="Endereço"
            value={
              [c.clientAddress, c.clientNeighborhood, c.clientCity, c.clientState, c.clientZip]
                .filter(Boolean)
                .join(', ') || null
            }
          />
          <InfoItem label="Observações" value={c.clientNotes} />
        </InfoGrid>
      </ChecklistSection>

      {/* Dados do Veículo */}
      <ChecklistSection icon={Car} title="Dados do Veículo">
        <InfoGrid>
          <InfoItem label="Marca" value={c.vBrand} />
          <InfoItem label="Modelo" value={c.vModel} />
          <InfoItem label="Ano" value={c.vYear} />
          <InfoItem
            label="Placa"
            value={c.vPlate ? <PlateBadge plate={c.vPlate} /> : null}
          />
          <InfoItem label="Cor" value={c.vColor} />
          <InfoItem label="Chassi" value={c.vChassis} mono />
          <InfoItem label="KM entrada" value={c.kmIn?.toLocaleString('pt-BR')} mono />
          <InfoItem label="KM saída" value={c.kmOut?.toLocaleString('pt-BR')} mono />
        </InfoGrid>
      </ChecklistSection>

      {/* Combustível */}
      <ChecklistSection icon={Fuel} title="Combustível">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 items-center">
          <InfoItem label="Tipo" value={c.fuelType} />
          <FuelGauge level={c.fuelLevel} />
        </div>
      </ChecklistSection>

      {/* Acessórios Externos */}
      <ChecklistSection icon={Puzzle} title="Acessórios Externos">
        <ConditionItems items={EXTERNAL_ACCESSORIES} values={c.externalAccessories} />
      </ChecklistSection>

      {/* Equipamentos de Segurança */}
      <ChecklistSection icon={ShieldCheck} title="Equipamentos de Segurança">
        <ConditionItems items={SAFETY_EQUIPMENT} values={c.safetyEquipment} />
      </ChecklistSection>

      {/* Interior e Tecnologia */}
      <ChecklistSection icon={Cpu} title="Interior e Tecnologia">
        <ConditionItems items={INTERIOR_TECH} values={c.interiorTech} />
      </ChecklistSection>

      {/* Mapeamento de Avarias */}
      <ChecklistSection icon={AlertTriangle} title="Mapeamento de Avarias">
        <DamageView marks={c.damageMarks} />
      </ChecklistSection>

      {/* Diagnóstico e Prazos */}
      <ChecklistSection icon={Stethoscope} title="Diagnóstico e Prazos">
        <div className="flex flex-col gap-4">
          <TextBlock label="Diagnóstico / Prévia" value={c.diagnosis} />
          <TextBlock label="Serviços solicitados" value={c.requestedServices} />
          <TextBlock label="Observações gerais" value={c.observations} />
          <InfoItem label="Prazo informado" value={formatDate(c.expectedDate)} />
        </div>
      </ChecklistSection>

      {/* Assinaturas */}
      <ChecklistSection icon={PenLine} title="Assinaturas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SignatureCard role="Prost Blindados" name={c.signCompanyName} image={c.signCompanyImage} />
          <SignatureCard role="Cliente" name={c.signClientName} image={c.signClientImage} />
        </div>
        <div className="mt-3 text-[11.5px] text-t3">
          Data da assinatura: {formatDate(c.signedAt)}
          {c.signedAt && ` às ${formatTime(c.signedAt)}`}
        </div>
      </ChecklistSection>

      {/* Ações (rodapé) */}
      <div className="flex flex-wrap items-center gap-2.5 mt-1">
        <Button onClick={onEdit}>
          <Pencil /> Atualizar Checklist
        </Button>
        <Button variant="secondary" onClick={onPrint}>
          <Printer /> Imprimir
        </Button>
      </div>
    </div>
  );
}
