import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SYSTEM_PROMPT } from './system-prompt';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

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
  vehicleId?: string;          // veículo já cadastrado no Prost (integração profunda)
  veiculo: VeiculoInput;
  queixa: string;
  obd?: string;
  scannerPdfBase64?: string;   // PDF do scanner em base64 (sem o prefixo data:)
  persist?: boolean;           // se true, salva o Diagnostic no banco
}

@Injectable()
export class DiagnosticsAiService {
  private readonly logger = new Logger(DiagnosticsAiService.name);

  constructor(private prisma: PrismaService) {}

  get isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  // @google/genai é ESM-only; carregamos via import dinâmico (projeto é CommonJS).
  private async client(): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY não configurada no servidor. Defina-a no arquivo server/.env.',
      );
    }
    const { GoogleGenAI } = await import('@google/genai');
    return new GoogleGenAI({ apiKey });
  }

  /** Sanitiza e parseia JSON que pode vir com cercas markdown ou texto extra. */
  private parseJson(text: string): any {
    let t = (text || '').replace(/```json\n?|```/g, '').trim();
    try {
      return JSON.parse(t);
    } catch {
      const match = t.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new BadRequestException('A IA retornou uma resposta que não pôde ser interpretada.');
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
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const data = this.parseJson(response.text || '{}');
    return { ...data, chassis: vin };
  }

  // ── Diagnóstico completo ────────────────────────────────────────────────────

  async analyze(input: AnalyzeInput) {
    const { veiculo, queixa, obd, scannerPdfBase64 } = input;
    if (!veiculo?.marca || !veiculo?.modelo || !queixa?.trim()) {
      throw new BadRequestException('Marca, modelo e queixa são obrigatórios.');
    }

    const prompt = `Veículo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.sub_modelo ? `${veiculo.sub_modelo} ` : ''}${veiculo.versao || ''} | Chassis: ${veiculo.chassis || ''} | Fabricação: ${veiculo.ano_fabricacao || ''} | Modelo: ${veiculo.ano_modelo || ''} | Motor: ${veiculo.motor || ''} | Combustível: ${veiculo.combustivel || ''} | Câmbio: ${veiculo.cambio || ''} | KM: ${veiculo.quilometragem || ''}${veiculo.historico_manutencao ? ` | Histórico: ${veiculo.historico_manutencao}` : ''}${veiculo.modificacoes ? ` | Modificações: ${veiculo.modificacoes}` : ''}

Queixa do cliente: ${queixa}${obd ? `\nCódigo OBD: ${obd}` : ''}

Execute diagnóstico completo com pesquisa web e retorne o JSON conforme as regras do sistema.${scannerPdfBase64 ? '\n\nAnalise também o relatório do scanner em anexo para um diagnóstico mais preciso.' : ''}`;

    let contents: any = prompt;
    if (scannerPdfBase64) {
      contents = {
        parts: [
          { text: prompt },
          { inlineData: { data: scannerPdfBase64, mimeType: 'application/pdf' } },
        ],
      };
    }

    const ai = await this.client();
    let response;
    try {
      response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        },
      });
    } catch (err: any) {
      this.logger.error(`Falha na chamada Gemini: ${err.message}`);
      throw new ServiceUnavailableException(`Erro ao consultar a IA: ${err.message}`);
    }

    const text = response.text;
    if (!text) throw new BadRequestException('A IA retornou uma resposta vazia.');
    const resultado = this.parseJson(text);

    // ── Persistência (integração profunda) ──
    let savedId: string | null = null;
    if (input.persist && input.vehicleId) {
      const saved = await this.prisma.diagnostic.create({
        data: {
          vehicleId:   input.vehicleId,
          description: resultado.diagnostico_resumo || 'Diagnóstico por IA',
          status:      'PENDING',
          source:      'ai',
          complaint:   queixa,
          obdCode:     obd || null,
          system:      resultado.sistema_afetado || null,
          confidence:  resultado.confianca || null,
          aiResult:    JSON.stringify(resultado),
        },
      });
      savedId = saved.id;
      this.logger.log(`Diagnóstico IA salvo: ${savedId} (veículo ${input.vehicleId})`);
    }

    return { resultado, diagnosticId: savedId };
  }

  getStatus() {
    return { configured: this.isConfigured, model: MODEL };
  }
}
