/**
 * Payload de webhook da Oficina Inteligente.
 *
 * Os campos chegam em pt-BR ou en conforme o evento e a origem; são todos
 * opcionais e validados (presença/normalização) antes de qualquer escrita.
 * Substitui o uso de `any` na fronteira de ingestão por um contrato explícito.
 */
export interface OiWebhookPayload {
  // Metadados de evento (fallback quando não vêm no header).
  event?: string;
  tipo?: string;
  type?: string;

  // Cliente.
  nome?: string;
  name?: string;
  razao_social?: string;
  telefone?: string;
  phone?: string;
  celular?: string;
  email?: string | null;

  // Veículo.
  placa?: string;
  plate?: string;
  marca?: string;
  brand?: string;
  modelo?: string;
  model?: string;
  ano?: string | number;
  year?: string | number;
  cliente?: string;
  proprietario?: string;
  owner?: string;
}
