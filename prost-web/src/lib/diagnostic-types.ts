/** Estrutura do resultado de diagnóstico retornado pela IA (Gemini). */

export interface Peca {
  nome: string;
  nome_tecnico: string;
  funcao: string;
  probabilidade: number;
  razao: string;
}

export interface CotacaoResultado {
  canal: string;
  produto: string;
  marca: string;
  tipo: string;            // OEM | Paralela
  preco: string;
  frete: string;
  prazo: string;
  disponibilidade: string;
  link: string;
  recomendado: boolean;
}

export interface Cotacao {
  peca: string;
  resultados: CotacaoResultado[];
}

export interface ResumoModelo {
  lancamento: string;
  encerramento: string;
  recalls: string[];
  defeitos_cronicos: string;
}

export interface DiagnosticoResultado {
  resumo_modelo: ResumoModelo;
  sintomas_identificados: string[];
  diagnostico_resumo: string;
  sistema_afetado: string;
  correlacao_tecnica: string;
  confianca: string;       // Alta | Média | Baixa
  checklist_sugerido: string[];
  pecas: Peca[];
  cotacoes: Cotacao[];
  custo_min: string;
  custo_max: string;
  peca_prioritaria: string;
  acao_comprador: string;
}

export interface Veiculo {
  marca: string;
  modelo: string;
  sub_modelo: string;
  versao: string;
  ano_fabricacao: string;
  ano_modelo: string;
  combustivel: string;
  cambio: string;
  motor: string;
  quilometragem: string;
  historico_manutencao: string;
  modificacoes: string;
  chassis: string;
}

export const EMPTY_VEICULO: Veiculo = {
  marca: '', modelo: '', sub_modelo: '', versao: '',
  ano_fabricacao: '2024', ano_modelo: '2024',
  combustivel: 'Flex', cambio: 'Automático', motor: '',
  quilometragem: '', historico_manutencao: '', modificacoes: '', chassis: '',
};
