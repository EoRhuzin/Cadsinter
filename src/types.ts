export interface DadosGeraisImovel {
  inscricaoImobiliaria: string;
  temBairro: boolean;
  tipoImovel: number;
  tpArquitetonico: number;
  destinacaoImovel: number;
  areaTerreno: number;
  areaConstruida: number;
  anoConstrutivo: number;
  idParcela?: string;
  bice?: number;
  valorVenal?: number;
  dtUltimoValorVenal?: string;
  padraoConstrutivo?: number;
  qtdGaragem?: number;
  temPiscina?: boolean;
  valorRefMercado?: number;
  dataUltValorMercado?: string;
}

export interface EnderecoImovel {
  tipoLogradouro: number;
  nomeLogradouro: string;
  bairro: string;
  numeroImovel: string;
  complNroImovel?: string;
  complEndereco?: string;
  cep: string;
}

export interface TitularItem {
  niTitular?: string;
  nomeTitular?: string;
  percTitular?: number;
  percTitularidade?: number; // legacy alias
  dtAquisicaoTitular?: string;
  tipoTitularidade?: number;
  docTitularidade?: number;
}

export interface AreaConstruidaCompl {
  areaPrivativa?: number;
  areaComum?: number;
  fraIdeal?: number;
}

export interface ServicoRegistroImovel {
  nomeServentiaRI?: string;
  cnsRI?: number;
  cnmRI?: string;
  numMatriculaRI?: string;
  numUltimoAtoRI?: string;
  lvCartRI?: string;
  flCartRI?: string;
  dtUltAtualizacao?: string;
}

export interface CartorioNotas {
  nomeServentiaNotas?: string;
  cnsNotas?: number;
  lvCartNotas?: string;
  flCartNotas?: string;
}

export interface TransmitenteITBIItem {
  idTransmitenteITBI?: string;
  niTransmitenteITBI?: string;
  nomeTransmitenteITBI?: string;
}

export interface AdquirenteITBIItem {
  idAdquirenteITBI?: string;
  niAdquirenteITBI?: string;
  nomeAdquirenteITBI?: string;
  percTransacAdquirenteITBI?: number;
}

export interface ITBI {
  baseCalculITBI?: number;
  valorRefITBI?: number;
  dtTransacaoITBI?: string;
  tpTransacaoITBI?: number;
  percTransacionadoITBI?: number;
  TransmitenteITBI?: TransmitenteITBIItem[];
  AdquirenteITBI?: AdquirenteITBIItem[];
}

export interface NDJsonRecord {
  id: string; // Internal unique identifier for key tracking & reordering
  cib?: string; // CIB (Código Imobiliário Brasileiro - 8 caracteres Alfanuméricos ex: MFA64C2P)
  dadosGerais: DadosGeraisImovel;
  endereco: EnderecoImovel;
  operacao?: string; // Optional internal/legacy field ("I", "A", "E")
  areaConstruidaCompl?: AreaConstruidaCompl;
  titulares?: TitularItem[];
  servicoRegistroImovel?: ServicoRegistroImovel;
  cartorioNotas?: CartorioNotas;
  itbi?: ITBI;
  // Campos de desativação de UI (SINTER PUT desativacao)
  codigoIbgeMunicipio?: number;
  tipoDesativacao?: number;
  motivoDesativacao?: number;
  complemento?: string;
  // Metadata de Origem e Opções de Lote
  isBatch?: boolean;
  batchMode?: 'simples' | 'lote';
  alteredOptions?: string[];
  rawSinterData?: Record<string, any>;
}

export interface OptionItem {
  value: number | string;
  label: string;
  description?: string;
}
