import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  MapPin,
  Car,
  StickyNote,
  PenLine,
  Save,
  X,
  Eraser,
} from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from '@/components/forms/Field';
import { ChecklistSection } from '@/components/checklist/ChecklistSection';
import { SignaturePad } from '@/components/checklist/SignaturePad';
import { toIsoOrNull } from '@/lib/format';

/** UFs brasileiras para o select de Estado. */
const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface FormState {
  // Cliente
  name: string;
  cpfcnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  // Endereço
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  // Veículo
  vBrand: string;
  vModel: string;
  vYear: string;
  vColor: string;
  vPlate: string;
  vMileage: string;
  vChassis: string;
  vRenavam: string;
  // Informações adicionais
  notes: string;
  preferences: string;
  initialHistory: string;
  responsible: string;
  // Assinaturas
  clientSignature: string | null;
  responsibleSignature: string | null;
}

const EMPTY: FormState = {
  name: '',
  cpfcnpj: '',
  phone: '',
  whatsapp: '',
  email: '',
  birthDate: '',
  zip: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  vBrand: '',
  vModel: '',
  vYear: '',
  vColor: '',
  vPlate: '',
  vMileage: '',
  vChassis: '',
  vRenavam: '',
  notes: '',
  preferences: '',
  initialHistory: '',
  responsible: '',
  clientSignature: null,
  responsibleSignature: null,
};

/** String → valor ou undefined (omite chaves vazias no payload). */
const txt = (v: string) => (v.trim() ? v.trim() : undefined);

export default function AddClient() {
  const navigate = useNavigate();
  const [s, setS] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));
  const setInput =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      upd(k, e.target.value as FormState[typeof k]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!s.name.trim() || !s.phone.trim()) {
      toast.error('Informe ao menos Nome e Telefone.');
      return;
    }
    setSaving(true);
    try {
      const clientPayload = {
        name: s.name.trim(),
        phone: s.phone.trim(),
        email: txt(s.email),
        cpfcnpj: txt(s.cpfcnpj),
        whatsapp: txt(s.whatsapp),
        birthDate: s.birthDate ? toIsoOrNull(s.birthDate) : undefined,
        zip: txt(s.zip),
        street: txt(s.street),
        number: txt(s.number),
        complement: txt(s.complement),
        neighborhood: txt(s.neighborhood),
        city: txt(s.city),
        state: txt(s.state),
        notes: txt(s.notes),
        preferences: txt(s.preferences),
        initialHistory: txt(s.initialHistory),
        responsible: txt(s.responsible),
        clientSignature: s.clientSignature ?? undefined,
        responsibleSignature: s.responsibleSignature ?? undefined,
      };
      const r = await api.post('/clients', clientPayload);
      const clientId: string = r.data.id;

      // Veículo é opcional: só cria se os campos essenciais estiverem preenchidos.
      const hasVehicle =
        s.vPlate.trim() && s.vBrand.trim() && s.vModel.trim() && s.vYear.trim();
      if (hasVehicle) {
        await api.post('/vehicles', {
          clientId,
          plate: s.vPlate.trim(),
          brand: s.vBrand.trim(),
          model: s.vModel.trim(),
          year: Number(s.vYear),
          color: txt(s.vColor),
          mileage: s.vMileage.trim() ? Number(s.vMileage) : undefined,
          chassis: txt(s.vChassis),
          renavam: txt(s.vRenavam),
        });
      }

      toast.success('Cliente cadastrado com sucesso!');
      navigate(`/clients/${clientId}`);
    } catch {
      toast.error('Erro ao cadastrar cliente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-[720px] flex-col gap-4">
      {/* Cabeçalho da página */}
      <div className="mb-1 flex items-center gap-3">
        <Button variant="secondary" size="icon" type="button" onClick={() => navigate('/clients')} title="Voltar">
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-[17px] font-bold leading-tight text-t1">Adicionar Novo Cliente</h1>
          <p className="mt-0.5 text-[12px] text-t3">Cadastro completo de cliente e veículo</p>
        </div>
      </div>

      {/* Dados do Cliente */}
      <ChecklistSection icon={User} title="Dados do Cliente">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
          <Field label="Nome" req className="sm:col-span-2">
            <Input value={s.name} onChange={setInput('name')} placeholder="Nome completo" />
          </Field>
          <Field label="CPF / CNPJ">
            <Input value={s.cpfcnpj} onChange={setInput('cpfcnpj')} placeholder="000.000.000-00" />
          </Field>
          <Field label="Telefone" req>
            <Input value={s.phone} onChange={setInput('phone')} placeholder="(11) 99999-0000" />
          </Field>
          <Field label="WhatsApp">
            <Input value={s.whatsapp} onChange={setInput('whatsapp')} placeholder="(11) 99999-0000" />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={s.email} onChange={setInput('email')} placeholder="opcional" />
          </Field>
          <Field label="Data de nascimento">
            <Input type="date" value={s.birthDate} onChange={setInput('birthDate')} />
          </Field>
        </div>
      </ChecklistSection>

      {/* Endereço */}
      <ChecklistSection icon={MapPin} title="Endereço">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[14px]">
          <Field label="CEP">
            <Input value={s.zip} onChange={setInput('zip')} placeholder="00000-000" />
          </Field>
          <Field label="Rua" className="sm:col-span-2">
            <Input value={s.street} onChange={setInput('street')} />
          </Field>
          <Field label="Número">
            <Input value={s.number} onChange={setInput('number')} />
          </Field>
          <Field label="Complemento">
            <Input value={s.complement} onChange={setInput('complement')} />
          </Field>
          <Field label="Bairro">
            <Input value={s.neighborhood} onChange={setInput('neighborhood')} />
          </Field>
          <Field label="Cidade">
            <Input value={s.city} onChange={setInput('city')} />
          </Field>
          <Field label="Estado">
            <Select value={s.state} onValueChange={(v) => upd('state', v)}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {UFS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Field label="Cor">
            <Input value={s.vColor} onChange={setInput('vColor')} />
          </Field>
          <Field label="Placa">
            <Input value={s.vPlate} onChange={setInput('vPlate')} className="font-mono uppercase tracking-[.05em]" />
          </Field>
          <Field label="Quilometragem">
            <Input type="number" min={0} value={s.vMileage} onChange={setInput('vMileage')} placeholder="0" />
          </Field>
          <Field label="Chassi">
            <Input value={s.vChassis} onChange={setInput('vChassis')} className="font-mono uppercase" />
          </Field>
          <Field label="Renavam">
            <Input value={s.vRenavam} onChange={setInput('vRenavam')} className="font-mono" />
          </Field>
        </div>
        <p className="mt-3 text-[11.5px] text-t3">
          Preencha ao menos Marca, Modelo, Ano e Placa para cadastrar um veículo junto ao cliente.
        </p>
      </ChecklistSection>

      {/* Informações Adicionais */}
      <ChecklistSection icon={StickyNote} title="Informações Adicionais">
        <div className="flex flex-col gap-[14px]">
          <Field label="Observações">
            <Textarea rows={3} value={s.notes} onChange={setInput('notes')} />
          </Field>
          <Field label="Preferências">
            <Textarea rows={2} value={s.preferences} onChange={setInput('preferences')} />
          </Field>
          <Field label="Histórico inicial">
            <Textarea rows={2} value={s.initialHistory} onChange={setInput('initialHistory')} />
          </Field>
          <Field label="Responsável pelo cadastro">
            <Input value={s.responsible} onChange={setInput('responsible')} placeholder="Nome do responsável" />
          </Field>
        </div>
      </ChecklistSection>

      {/* Assinaturas */}
      <ChecklistSection icon={PenLine} title="Assinaturas">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SignaturePad
            role="Cliente"
            name={s.name}
            onName={(v) => upd('name', v)}
            image={s.clientSignature}
            onImage={(img) => upd('clientSignature', img)}
          />
          <SignaturePad
            role="Responsável pelo Cadastro"
            name={s.responsible}
            onName={(v) => upd('responsible', v)}
            image={s.responsibleSignature}
            onImage={(img) => upd('responsibleSignature', img)}
          />
        </div>
      </ChecklistSection>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="submit" disabled={saving}>
          <Save /> {saving ? 'Salvando…' : 'Salvar Cliente'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/clients')} disabled={saving}>
          <X /> Cancelar
        </Button>
        <Button type="button" variant="outline" onClick={() => setS(EMPTY)} disabled={saving}>
          <Eraser /> Limpar Campos
        </Button>
      </div>
      </form>
    </div>
  );
}
