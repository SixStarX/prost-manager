/** Tipos que espelham o contrato JSON da API Oficina Inteligente v2 */

export interface OiOrdemDeServico {
  EmpresaID: number;
  /** .NET Date serializado: "\/Date(timestamp)\/" */
  Data: string;
  OrdemDeServicoID: number;
  CPFCNPJ?: string;
  NomeDoCliente?: string;
  Celular?: string;
  DataDeNascimento?: string | null;
  PlacaDoVeiculo?: string;
  ModeloDoVeiculo?: string;
  AnoDoVeiculo?: number | null;
  KMDoVeiculo?: number | null;
  ValorDaOrdemDeServico: number;
  /** "Aberta" | "Fechada" */
  SituacaoDaOrdemDeServico: string;
  Itens: OiItem[];
}

export interface OiItem {
  CodigoDoItem: string;
  DescricaoDoItem: string;
  QuantidadeDoItem: number;
  ValorUnitarioDoItem: number;
  ValorTotalDoItem: number;
}

export interface OiProduto {
  ProdutoID: string;
  DescricaoDoProduto: string;
  GrupoDeProdutoID: number;
  DescricaoDoGrupo: string;
  AreaDeProdutoID: number;
  DescricaoDaArea: string;
  Unidade: string;
  Estoque: number;
  Ideal: number;
  PrecoDeVenda: number;
  PrecoDeCusto: number;
  PrecoDeCompra: number;
  Aplicacao?: string;
  Referencia?: string;
  CodigoDeBarra?: string;
  NCM: string;
  Ativo: boolean;
}

export interface SyncResult {
  date: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}
