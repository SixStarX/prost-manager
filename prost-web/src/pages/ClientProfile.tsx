import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Car,
  Plus,
  History,
  ClipboardList,
  Phone,
  Mail,
  IdCard,
  CalendarClock,
} from 'lucide-react';
import api from '../api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardTitleIcon,
  CardCount,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/format';
import {
  type Checklist,
  type ChecklistListItem,
  type ClientProfileData,
  type VehicleSummary,
} from '@/lib/checklist';
import { ChecklistTimeline } from '@/components/checklist/ChecklistTimeline';
import { ChecklistDetail } from '@/components/checklist/ChecklistDetail';
import { ChecklistForm } from '@/components/checklist/ChecklistForm';
import { InfoItem } from '@/components/checklist/ChecklistSection';
import { PageHeader, StatChip, VehicleCard } from './client-profile/parts';

type FormMode = { mode: 'create'; vehicle: VehicleSummary } | { mode: 'edit'; checklist: Checklist };

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkApplied = useRef(false);

  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [error, setError] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [history, setHistory] = useState<ChecklistListItem[] | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [detail, setDetail] = useState<Checklist | null>(null);
  const [form, setForm] = useState<FormMode | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(() => {
    if (!id) return;
    setError(false);
    api
      .get(`/clients/${id}/profile`)
      .then((r) => setProfile(r.data))
      .catch(() => setError(true));
  }, [id]);

  // Carga inicial e recarga ao trocar de cliente. A guarda de montagem descarta
  // respostas tardias; as recargas pós-ação reutilizam loadProfile().
  useEffect(() => {
    if (!id) return;
    let active = true;
    api
      .get(`/clients/${id}/profile`)
      .then((r) => {
        if (active) {
          setProfile(r.data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const loadHistory = useCallback((vehicleId: string, preferChecklistId?: string) => {
    setHistory(null);
    setSelectedChecklist(null);
    setDetail(null);
    api
      .get(`/vehicles/${vehicleId}/checklists`)
      .then((r) => {
        const items: ChecklistListItem[] = r.data.items ?? [];
        setHistory(items);
        // Abre o checklist do deep-link (se existir no histórico); senão, o mais recente.
        const target =
          (preferChecklistId && items.find((i) => i.id === preferChecklistId)?.id) ||
          items[0]?.id;
        if (target) loadChecklist(target);
      })
      .catch(() => {
        setHistory([]);
        toast.error('Erro ao carregar histórico.');
      });
  }, []);

  // Deep-link do Dashboard: ?vehicle=<id>&checklist=<id> abre o checklist inline.
  useEffect(() => {
    if (deepLinkApplied.current || !profile) return;
    const vehicleId = searchParams.get('vehicle');
    const checklistId = searchParams.get('checklist');
    if (!vehicleId) return;
    const vehicle = profile.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;
    deepLinkApplied.current = true;
    // Aplicação imperativa do deep-link, uma única vez (guardada por ref):
    // uma ação disparada pela navegação, não sincronização de estado de render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVehicle(vehicle.id);
    loadHistory(vehicle.id, checklistId ?? undefined);
    setSearchParams({}, { replace: true }); // limpa a URL após aplicar
  }, [profile, searchParams, loadHistory, setSearchParams]);

  function loadChecklist(checklistId: string) {
    setSelectedChecklist(checklistId);
    setDetail(null);
    api
      .get(`/checklists/${checklistId}`)
      .then((r) => setDetail(r.data))
      .catch(() => toast.error('Erro ao carregar checklist.'));
  }

  function selectVehicle(v: VehicleSummary) {
    setSelectedVehicle(v.id);
    loadHistory(v.id);
  }

  async function handleSubmit(payload: Record<string, unknown>) {
    setSaving(true);
    try {
      if (form?.mode === 'create') {
        const r = await api.post('/checklists', { vehicleId: form.vehicle.id, ...payload });
        toast.success('Checklist criado com sucesso!');
        setForm(null);
        setSelectedVehicle(form.vehicle.id);
        loadProfile();
        loadHistory(form.vehicle.id);
        // seleciona o recém-criado
        if (r.data?.id) loadChecklist(r.data.id);
      } else if (form?.mode === 'edit') {
        const r = await api.patch(`/checklists/${form.checklist.id}`, payload);
        toast.success('Checklist atualizado!');
        setForm(null);
        setDetail(r.data);
        setSelectedChecklist(r.data.id);
        if (selectedVehicle) loadHistory(selectedVehicle);
        loadProfile();
      }
    } catch {
      toast.error('Erro ao salvar checklist.');
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    if (!detail) return;
    // Abre a versão A4 profissional numa aba própria (dispara window.print()).
    window.open(`/print/checklist/${detail.id}`, '_blank');
  }

  /* ── Erro / não encontrado ── */
  if (error) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={User}
            text="Cliente não encontrado"
            sub="O cliente pode ter sido removido ou o endereço está incorreto."
            action={
              <Button variant="secondary" onClick={() => navigate('/clients')}>
                <ArrowLeft /> Voltar para Clientes
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  /* ── Formulário (criar / editar) ── */
  if (form) {
    const vehicleLabel =
      form.mode === 'create'
        ? `${form.vehicle.brand} ${form.vehicle.model} · ${form.vehicle.plate}`
        : `${form.checklist.vBrand ?? ''} ${form.checklist.vModel ?? ''} · ${form.checklist.vPlate ?? ''}`;
    return (
      <>
        <PageHeader
          title={form.mode === 'create' ? 'Novo Checklist' : 'Atualizar Checklist'}
          subtitle={vehicleLabel}
          onBack={() => setForm(null)}
          backLabel="Cancelar"
        />
        <ChecklistForm
          mode={form.mode}
          initial={form.mode === 'edit' ? form.checklist : undefined}
          prefill={
            form.mode === 'create' && profile
              ? {
                  vehicle: {
                    brand: form.vehicle.brand,
                    model: form.vehicle.model,
                    year: form.vehicle.year,
                    plate: form.vehicle.plate,
                  },
                  client: {
                    name: profile.name,
                    phone: profile.phone,
                    email: profile.email,
                    cpfcnpj: profile.cpfcnpj,
                  },
                }
              : undefined
          }
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={() => setForm(null)}
        />
      </>
    );
  }

  /* ── Loading do perfil ── */
  if (!profile) {
    return (
      <>
        <PageHeader title="Perfil do Cliente" onBack={() => navigate('/clients')} />
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-full max-w-xl" />
            <Skeleton className="h-3.5 w-2/3" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </>
    );
  }

  const selected = profile.vehicles.find((v) => v.id === selectedVehicle) ?? null;

  return (
    <>
      <PageHeader title={profile.name} subtitle="Perfil do Cliente" onBack={() => navigate('/clients')} />

      {/* Cabeçalho — dados do cliente + estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={User} />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-5 gap-y-4">
            <InfoItem label="Nome" value={profile.name} />
            <InfoItem
              label="Telefone"
              value={
                profile.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-t3" /> {profile.phone}
                  </span>
                )
              }
            />
            <InfoItem
              label="E-mail"
              value={
                profile.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-t3" /> {profile.email}
                  </span>
                )
              }
            />
            <InfoItem
              label="CPF / CNPJ"
              mono
              value={
                profile.cpfcnpj && (
                  <span className="inline-flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-t3" /> {profile.cpfcnpj}
                  </span>
                )
              }
            />
            <InfoItem label="Cadastrado em" value={formatDate(profile.createdAt)} />
            <InfoItem
              label="Última visita"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-t3" /> {formatDate(profile.lastVisit)}
                </span>
              }
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-white/[.05]">
            <StatChip icon={ClipboardList} label="Checklists" value={profile.totalChecklists} />
            <StatChip icon={Car} label="Veículos" value={profile.vehicleCount} />
          </div>
        </CardContent>
      </Card>

      {/* Veículos */}
      <Card>
        <CardHeader>
          <CardTitle>
            <CardTitleIcon icon={Car} />
            Veículos
          </CardTitle>
          <CardCount>{profile.vehicles.length} total</CardCount>
        </CardHeader>
        <CardContent>
          {profile.vehicles.length === 0 ? (
            <EmptyState icon={Car} text="Nenhum veículo vinculado" sub="Cadastre um veículo para este cliente na aba Veículos." />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
              {profile.vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  active={v.id === selectedVehicle}
                  onSelect={() => selectVehicle(v)}
                  onNew={() => setForm({ mode: 'create', vehicle: v })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico + detalhe */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>
                <CardTitleIcon icon={History} />
                Histórico
              </CardTitle>
              {history && <CardCount>{history.length}</CardCount>}
            </CardHeader>
            <CardContent>
              {!history ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  text="Sem checklists"
                  sub="Este veículo ainda não possui vistorias registradas."
                  action={
                    <Button size="sm" onClick={() => setForm({ mode: 'create', vehicle: selected })}>
                      <Plus /> Novo Checklist
                    </Button>
                  }
                />
              ) : (
                <ChecklistTimeline
                  items={history}
                  selectedId={selectedChecklist}
                  onSelect={loadChecklist}
                />
              )}
            </CardContent>
          </Card>

          <div>
            {!selectedChecklist ? (
              <Card>
                <CardContent>
                  <EmptyState icon={ClipboardList} text="Selecione um checklist" sub="Escolha um item do histórico para ver os detalhes." />
                </CardContent>
              </Card>
            ) : !detail ? (
              <Card>
                <CardContent className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <ChecklistDetail
                checklist={detail}
                onEdit={() => setForm({ mode: 'edit', checklist: detail })}
                onPrint={handlePrint}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
