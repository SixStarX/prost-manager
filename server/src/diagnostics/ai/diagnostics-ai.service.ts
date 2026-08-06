import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
// @google/genai é ESM-only; num módulo CommonJS o import de tipos exige o
// atributo de resolução (evita erro TS1541 sem tornar o projeto inteiro ESM).
import type { GoogleGenAI, GenerateContentResponse } from '@google/genai' with {
  'resolution-mode': 'import',
};
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SYSTEM_PROMPT } from './system-prompt';
import { errorMessage } from '../../common/errors';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
// Limites de robustez/custo da chamada à IA (P6).
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 45_000;
const MAX_COMPLAINT_LEN = 4000; // caracteres da queixa
const MAX_PDF_B64_LEN = 10 * 1024 * 1024; // ~7,5 MB de PDF em base64
// Cache em memória dos laudos (P6): evita reprocessar a mesma queixa/veículo.
const CACHE_TTL_MS = Number(process.env.GEMINI_CACHE_TTL_MS) || 60 * 60 * 1000;
const CACHE_MAX = 100;

interface CacheEntry {
  resultado: DiagnosticoResultado;
  expiresAt: number;
}

/** Subconjunto (consumido pelo backend) do laudo estruturado devolvido pela IA. */
export interface DiagnosticoResultado {
  diagnostico_resumo?: string;
  sistema_afetado?: string;
  confianca?: string;
  [key: string]: unknown;
}

export interface VeiculoInput {
  marca?: string;
  modelo?: string;
  sub_modelo?: string;
  versao?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  motor?: string;
  combustivel?: string;
  cambio?: string;
  quilometragem?: string;
  historico_manutencao?: string;
  modificacoes?: string;
  chassis?: string;
}

export interface AnalyzeInput {
  vehicleId?: string; // veículo já cadastrado no Prost (integração profunda)
  veiculo: VeiculoInput;
  queixa: string;
  obd?: string;
  scannerPdfBase64?: string; // PDF do scanner em base64 (sem o prefixo data:)
  persist?: boolean; // se true, salva o Diagnostic no banco
}

@Injectable()
export class DiagnosticsAiService {
  private readonly logger = new Logger(DiagnosticsAiService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private prisma: PrismaService) {}

  get isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  // @google/genai é ESM-only; carregamos via import dinâmico (projeto é CommonJS).
  private async client(): Promise<GoogleGenAI> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY não configurada no servidor. Defina-a no arquivo server/.env.',
      );
    }
    const { GoogleGenAI } = await import('@google/genai');
    return new GoogleGenAI({ apiKey });
  }

  /** Corta a chamada à IA se passar de TIMEOUT_MS — evita requisição pendurada. */
  private async withTimeout<T>(op: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new ServiceUnavailableException(
              'A IA demorou demais para responder. Tente novamente.',
            ),
          ),
        TIMEOUT_MS,
      );
    });
    try {
      return await Promise.race([op, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Sanitiza e parseia JSON que pode vir com cercas markdown ou texto extra. */
  private parseJson<T>(text: string): T {
    const t = (text || '').replace(/```json\n?|```/g, '').trim();
    try {
      return JSON.parse(t) as T;
    } catch {
      const match = t.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as T;
      throw new BadRequestException(
        'A IA retornou uma resposta que não pôde ser interpretada.',
      );
    }
  }

  // ── Decodificação de VIN ────────────────────────────────────────────────────

  async decodeVin(vin: string): Promise<VeiculoInput> {
    if (!vin || vin.length < 10) {
      throw new BadRequestException('Informe um chassis (VIN) válido.');
    }

    const prompt = `Identifique detalhadamente o veículo com o chassis (VIN): ${vin}.
      Você DEVE usar a ferramenta de busca do Google para encontrar informações reais sobre este VIN específico ou sobre o padrão de decodificação deste fabricante.

      Retorne APENAS um JSON com os seguintes campos (se encontrar):
      {
        "marca": string,
        "modelo": string,
        "sub_modelo": string,
        "versao": string,
        "ano_fabricacao": string,
        "ano_modelo": string,
        "motor": string,
        "combustivel": string (Flex, Gasolina, Etanol, Diesel, GNV, Elétrico, Híbrido),
        "cambio": string (Automático, Manual, CVT, DCT, Automatizado)
      }

      Importante:
      1. Se não tiver certeza absoluta de um campo, deixe-o como string vazia.
      2. O campo "combustivel" deve ser um dos valores sugeridos.
      3. O campo "cambio" deve ser um dos valores sugeridos.
      4. Não inclua markdown ou explicações, apenas o objeto JSON.`;

    const ai = await this.client();
    const response = await this.withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        },
      }),
    );

    const data = this.parseJson<VeiculoInput>(response.text || '{}');
    return { ...data, chassis: vin };
  }

  // ── Diagnóstico completo ────────────────────────────────────────────────────

  async analyze(input: AnalyzeInput) {
    const { veiculo, queixa, obd, scannerPdfBase64 } = input;
    if (!veiculo?.marca || !veiculo?.modelo || !queixa?.trim()) {
      throw new BadRequestException('Marca, modelo e queixa são obrigatórios.');
    }
    if (queixa.length > MAX_COMPLAINT_LEN) {
      throw new BadRequestException(
        `A queixa é muito longa (máx. ${MAX_COMPLAINT_LEN} caracteres).`,
      );
    }
    if (scannerPdfBase64 && scannerPdfBase64.length > MAX_PDF_B64_LEN) {
      throw new BadRequestException(
        'O PDF do scanner é muito grande (máx. ~7,5 MB).',
      );
    }

    // Cache (P6): mesma queixa/veículo não reprocessa. PDF de scanner nunca
    // entra em cache (cada relatório é único).
    const cacheable = !scannerPdfBase64;
    const key = cacheable ? this.cacheKey(input) : '';
    const cached = cacheable ? this.readCache(key) : null;

    let resultado: DiagnosticoResultado;
    if (cached) {
      this.logger.log('Diagnóstico IA servido do cache.');
      resultado = cached;
    } else {
      resultado = await this.callGemini(input);
      if (cacheable) this.writeCache(key, resultado);
    }

    // ── Persistência (integração profunda) ──
    let savedId: string | null = null;
    if (input.persist && input.vehicleId) {
      const saved = await this.prisma.diagnostic.create({
        data: {
          vehicleId: input.vehicleId,
          description: resultado.diagnostico_resumo || 'Diagnóstico por IA',
          status: 'PENDING',
          source: 'ai',
          complaint: queixa,
          obdCode: obd || null,
          system: resultado.sistema_afetado || null,
          confidence: resultado.confianca || null,
          aiResult: JSON.stringify(resultado),
        },
      });
      savedId = saved.id;
      this.logger.log(
        `Diagnóstico IA salvo: ${savedId} (veículo ${input.vehicleId})`,
      );
    }

    return { resultado, diagnosticId: savedId };
  }

  /** Monta o prompt, chama o Gemini (com timeout) e devolve o laudo parseado. */
  private async callGemini(input: AnalyzeInput): Promise<DiagnosticoResultado> {
    const { veiculo, queixa, obd, scannerPdfBase64 } = input;

    const prompt = `Veículo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.sub_modelo ? `${veiculo.sub_modelo} ` : ''}${veiculo.versao || ''} | Chassis: ${veiculo.chassis || ''} | Fabricação: ${veiculo.ano_fabricacao || ''} | Modelo: ${veiculo.ano_modelo || ''} | Motor: ${veiculo.motor || ''} | Combustível: ${veiculo.combustivel || ''} | Câmbio: ${veiculo.cambio || ''} | KM: ${veiculo.quilometragem || ''}${veiculo.historico_manutencao ? ` | Histórico: ${veiculo.historico_manutencao}` : ''}${veiculo.modificacoes ? ` | Modificações: ${veiculo.modificacoes}` : ''}

Queixa do cliente: ${queixa}${obd ? `\nCódigo OBD: ${obd}` : ''}

Execute diagnóstico completo com pesquisa web e retorne o JSON conforme as regras do sistema.${scannerPdfBase64 ? '\n\nAnalise também o relatório do scanner em anexo para um diagnóstico mais preciso.' : ''}`;

    const contents = scannerPdfBase64
      ? {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: scannerPdfBase64,
                mimeType: 'application/pdf',
              },
            },
          ],
        }
      : prompt;

    const ai = await this.client();
    let response: GenerateContentResponse;
    try {
      response = await this.withTimeout(
        ai.models.generateContent({
          model: MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
          },
        }),
      );
    } catch (err) {
      this.logger.error(`Falha na chamada Gemini: ${errorMessage(err)}`);
      throw new ServiceUnavailableException(
        `Erro ao consultar a IA: ${errorMessage(err)}`,
      );
    }

    const text = response.text;
    if (!text)
      throw new BadRequestException('A IA retornou uma resposta vazia.');
    return this.parseJson<DiagnosticoResultado>(text);
  }

  /** Chave do cache: identidade do veículo + queixa + OBD (ignora o PDF). */
  private cacheKey(input: AnalyzeInput): string {
    const v = input.veiculo;
    return createHash('sha256')
      .update(
        JSON.stringify({
          marca: v.marca,
          modelo: v.modelo,
          sub: v.sub_modelo,
          versao: v.versao,
          motor: v.motor,
          cambio: v.cambio,
          combustivel: v.combustivel,
          ano: v.ano_modelo,
          km: v.quilometragem,
          queixa: input.queixa.trim().toLowerCase(),
          obd: (input.obd ?? '').trim().toUpperCase(),
        }),
      )
      .digest('hex');
  }

  private readCache(key: string): DiagnosticoResultado | null {
    const hit = this.cache.get(key);
    if (!hit) return null;
    if (hit.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return hit.resultado;
  }

  private writeCache(key: string, resultado: DiagnosticoResultado) {
    // Cap simples: cheio → remove a entrada mais antiga (primeira do Map).
    if (this.cache.size >= CACHE_MAX) {
      const first = this.cache.keys().next();
      if (!first.done) this.cache.delete(first.value);
    }
    this.cache.set(key, { resultado, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  getStatus() {
    return { configured: this.isConfigured, model: MODEL };
  }
}
