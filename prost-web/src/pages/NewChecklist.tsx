import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/api';
import { ChecklistForm } from '@/components/checklist/ChecklistForm';

/**
 * Novo Check-list — fluxo autônomo do app antigo (`/checklist/new`).
 * Sem veículo pré-selecionado: o backend aceita `vehicleId` ausente e grava os
 * dados de cliente/veículo informados na própria vistoria.
 */
export default function NewChecklist() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const submit = async (payload: unknown) => {
    setSaving(true);
    try {
      await api.post('/checklists', payload);
      toast.success('Check-list criado com sucesso');
      navigate('/');
    } catch {
      toast.error('Não foi possível salvar o check-list');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl space-y-6">
        <ChecklistForm
          mode="create"
          saving={saving}
          onSubmit={submit}
          onCancel={() => navigate('/')}
        />
      </div>
    </main>
  );
}
