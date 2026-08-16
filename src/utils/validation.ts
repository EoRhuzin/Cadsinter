import { DadosGeraisImovel, EnderecoImovel, NDJsonRecord } from '../types';
import { sanitizeTextInput } from './fieldHelp';

export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  warnings: string[];
}

export interface MandatoryFieldRule {
  key: string;
  label: string;
  type: string;
  formatDescription: string;
  maxLength?: number;
  regex?: RegExp;
}

/**
 * Checks if a string has invisible/control characters
 */
export function hasInvisibleChars(str: string): boolean {
  return /[\u200B-\u200D\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(str);
}

export const TIPO_1_MANDATORY_FIELDS: MandatoryFieldRule[] = [
  {
    key: 'inscricaoImobiliaria',
    label: 'Inscrição Imobiliária',
    type: 'string',
    formatDescription: 'String (até 45 caracteres)',
    maxLength: 45,
  },
  {
    key: 'tipoImovel',
    label: 'Tipo do Imóvel (tipoImovel)',
    type: 'inteiro',
    formatDescription: 'Inteiro = 1 (Territorial)',
  },
  {
    key: 'areaTerreno',
    label: 'Área Terreno (m²)',
    type: 'numérico',
    formatDescription: 'Numérico (até 12 inteiros + 4 decimais, > 0)',
  },
  {
    key: 'temBairro',
    label: 'Tem Bairro? (temBairro)',
    type: 'boolean',
    formatDescription: 'Boolean (true / false)',
  },
  {
    key: 'tipoLogradouro',
    label: 'Tipo Logradouro (tipoLogradouro)',
    type: 'inteiro',
    formatDescription: 'Inteiro (Código da tabela SINTER)',
  },
  {
    key: 'nomeLogradouro',
    label: 'Nome Logradouro (nomeLogradouro)',
    type: 'string',
    formatDescription: 'String (até 300 caracteres)',
    maxLength: 300,
  },
  {
    key: 'bairro',
    label: 'Bairro (bairro)',
    type: 'string',
    formatDescription: 'String (até 30 caracteres)',
    maxLength: 30,
  },
  {
    key: 'cep',
    label: 'CEP (cep)',
    type: 'string',
    formatDescription: 'String (exatamente 8 dígitos numéricos)',
    maxLength: 8,
    regex: /^\d{8}$/,
  },
];

export const TIPO_2_MANDATORY_FIELDS: MandatoryFieldRule[] = [
  {
    key: 'inscricaoImobiliaria',
    label: 'Inscrição Imobiliária',
    type: 'string',
    formatDescription: 'String (até 45 caracteres)',
    maxLength: 45,
  },
  {
    key: 'tipoImovel',
    label: 'Tipo do Imóvel (tipoImovel)',
    type: 'inteiro',
    formatDescription: 'Inteiro = 2 (Predial)',
  },
  {
    key: 'tpArquitetonico',
    label: 'Tipo Arquitetônico (tpArquitetonico)',
    type: 'inteiro',
    formatDescription: 'Inteiro (Código da tabela SINTER)',
  },
  {
    key: 'destinacaoImovel',
    label: 'Destinação do Imóvel (destinacaoImovel)',
    type: 'inteiro',
    formatDescription: 'Inteiro (Código da tabela SINTER)',
  },
  {
    key: 'areaTerreno',
    label: 'Área Terreno (m²)',
    type: 'numérico',
    formatDescription: 'Numérico (até 12 inteiros + 4 decimais, > 0)',
  },
  {
    key: 'areaConstruida',
    label: 'Área Construída (m²)',
    type: 'numérico',
    formatDescription: 'Numérico (até 12 inteiros + 4 decimais, > 0)',
  },
  {
    key: 'anoConstrutivo',
    label: 'Ano Construtivo (anoConstrutivo)',
    type: 'inteiro',
    formatDescription: 'Inteiro de 4 dígitos (Ex: 1990, 2020)',
  },
  {
    key: 'temBairro',
    label: 'Tem Bairro? (temBairro)',
    type: 'boolean',
    formatDescription: 'Boolean (true / false)',
  },
  {
    key: 'tipoLogradouro',
    label: 'Tipo Logradouro (tipoLogradouro)',
    type: 'inteiro',
    formatDescription: 'Inteiro (Código da tabela SINTER)',
  },
  {
    key: 'nomeLogradouro',
    label: 'Nome Logradouro (nomeLogradouro)',
    type: 'string',
    formatDescription: 'String (até 300 caracteres)',
    maxLength: 300,
  },
  {
    key: 'bairro',
    label: 'Bairro (bairro)',
    type: 'string',
    formatDescription: 'String (até 30 caracteres)',
    maxLength: 30,
  },
  {
    key: 'cep',
    label: 'CEP (cep)',
    type: 'string',
    formatDescription: 'String (exatamente 8 dígitos numéricos)',
    maxLength: 8,
    regex: /^\d{8}$/,
  },
];

export const TIPO_3_MANDATORY_FIELDS: MandatoryFieldRule[] = [
  {
    key: 'inscricaoImobiliaria',
    label: 'Inscrição Imobiliária',
    type: 'string',
    formatDescription: 'String (até 45 caracteres)',
    maxLength: 45,
  },
  {
    key: 'tipoImovel',
    label: 'Tipo do Imóvel (tipoImovel)',
    type: 'inteiro',
    formatDescription: 'Inteiro = 3 (Bem imóvel de características especiais)',
  },
  {
    key: 'areaTerreno',
    label: 'Área Terreno (m²)',
    type: 'numérico',
    formatDescription: 'Numérico (até 12 inteiros + 4 decimais, > 0)',
  },
  {
    key: 'bice',
    label: 'Código BICE (bice)',
    type: 'inteiro',
    formatDescription: 'Inteiro de 1 a 12 (Código BICE)',
  },
  {
    key: 'temBairro',
    label: 'Tem Bairro? (temBairro)',
    type: 'boolean',
    formatDescription: 'Boolean (true / false)',
  },
  {
    key: 'tipoLogradouro',
    label: 'Tipo Logradouro (tipoLogradouro)',
    type: 'inteiro',
    formatDescription: 'Inteiro (Código da tabela SINTER)',
  },
  {
    key: 'nomeLogradouro',
    label: 'Nome Logradouro (nomeLogradouro)',
    type: 'string',
    formatDescription: 'String (até 300 caracteres)',
    maxLength: 300,
  },
  {
    key: 'bairro',
    label: 'Bairro (bairro)',
    type: 'string',
    formatDescription: 'String (até 30 caracteres)',
    maxLength: 30,
  },
  {
    key: 'cep',
    label: 'CEP (cep)',
    type: 'string',
    formatDescription: 'String (exatamente 8 dígitos numéricos)',
    maxLength: 8,
    regex: /^\d{8}$/,
  },
];

/**
 * Validates a property record according to SINTER rules, specifically strict rules for Tipo 1 (Territorial), Tipo 2 (Predial), and Tipo 3 (BICE).
 */
export function validateRecordData(
  dadosGerais: DadosGeraisImovel,
  endereco: EnderecoImovel,
  operacao?: string,
  areaConstruidaCompl?: import('../types').AreaConstruidaCompl,
  titulares?: import('../types').TitularItem[],
  servicoRegistroImovel?: import('../types').ServicoRegistroImovel,
  cartorioNotas?: import('../types').CartorioNotas,
  itbi?: import('../types').ITBI,
  tipoDesativacao?: number,
  motivoDesativacao?: number
): FieldValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  const warnings: string[] = [];

  // Validate Desativação UI rules if operacao is 'D' / 'E' or desativacao fields are present
  if (operacao === 'D' || operacao === 'E' || tipoDesativacao || motivoDesativacao) {
    if (tipoDesativacao !== undefined && tipoDesativacao !== null && Number(tipoDesativacao) > 0) {
      const tDesat = Number(tipoDesativacao);
      if (tDesat !== 1 && tDesat !== 2) {
        const msg = 'Tipo de desativação inválido (deve ser 01 - Extinção ou 02 - Nulidade). [Falha 0004/0104]';
        errors.push(msg);
        fieldErrors['tipoDesativacao'] = msg;
      }
    }

    if (motivoDesativacao !== undefined && motivoDesativacao !== null && Number(motivoDesativacao) > 0) {
      const mDesat = Number(motivoDesativacao);
      if (mDesat < 1 || mDesat > 10) {
        const msg = 'Motivo de desativação inválido (código deve ser de 01 a 10). [Falha 0004/0104]';
        errors.push(msg);
        fieldErrors['motivoDesativacao'] = msg;
      }
    }

    // Check compatibility between tipoDesativacao and motivoDesativacao
    if (tipoDesativacao && motivoDesativacao) {
      const tDesat = Number(tipoDesativacao);
      const mDesat = Number(motivoDesativacao);

      const extincaoMotivos = [1, 2, 3, 4, 5, 6, 7];
      const nulidadeMotivos = [6, 7, 8, 9, 10];

      if (tDesat === 1 && !extincaoMotivos.includes(mDesat)) {
        const msg = `Motivo de desativação (${mDesat}) é incompatível com Tipo de Desativação 01 - Extinção (motivos aceitos: 01 a 07). [Falha 0101]`;
        errors.push(msg);
        fieldErrors['motivoDesativacao'] = msg;
      } else if (tDesat === 2 && !nulidadeMotivos.includes(mDesat)) {
        const msg = `Motivo de desativação (${mDesat}) é incompatível com Tipo de Desativação 02 - Nulidade (motivos aceitos: 06 a 10). [Falha 0101]`;
        errors.push(msg);
        fieldErrors['motivoDesativacao'] = msg;
      }
    }
  }

  const tipoImovelNum = Number(dadosGerais.tipoImovel);
  const isTipo1 = tipoImovelNum === 1;
  const isTipo2 = tipoImovelNum === 2;
  const isTipo3 = tipoImovelNum === 3;

  // 1. Inscrição Imobiliária (string, max 45)
  const rawInscricao = String(dadosGerais.inscricaoImobiliaria || '');
  const inscricao = rawInscricao.trim();
  if (!inscricao) {
    const msg = 'Inscrição Imobiliária é obrigatória.';
    errors.push(msg);
    fieldErrors['inscricaoImobiliaria'] = msg;
  } else if (hasInvisibleChars(rawInscricao)) {
    const msg = 'Inscrição Imobiliária contém caracteres inválidos ou invisíveis.';
    errors.push(msg);
    fieldErrors['inscricaoImobiliaria'] = msg;
  } else if (inscricao.length > 45) {
    const msg = `Inscrição Imobiliária excede o limite de 45 caracteres (${inscricao.length}/45).`;
    errors.push(msg);
    fieldErrors['inscricaoImobiliaria'] = msg;
  }

  // 2. Tipo do Imóvel
  if (isNaN(tipoImovelNum) || tipoImovelNum <= 0) {
    const msg = 'Tipo do Imóvel inválido ou não selecionado.';
    errors.push(msg);
    fieldErrors['tipoImovel'] = msg;
  }

  // 3. Tipo Arquitetônico (tpArquitetonico) - Obrigatório para Tipo 2, Proibido para Tipo 1
  const tpArquitetonico = Number(dadosGerais.tpArquitetonico);
  if (isTipo1 && tpArquitetonico > 0) {
    warnings.push('Quando tipoImovel = 1 e tpArquitetonico preenchido, o imóvel não recebe CIB no SINTER.');
  }
  if (isTipo2) {
    if (isNaN(tpArquitetonico) || tpArquitetonico <= 0) {
      const msg = 'Tipo Arquitetônico (tpArquitetonico) é obrigatório para Imóvel Tipo 2 (Predial).';
      errors.push(msg);
      fieldErrors['tpArquitetonico'] = msg;
    }
  }

  // 4. Destinação do Imóvel (destinacaoImovel) - Obrigatória para Tipo 2
  const destinacaoImovel = Number(dadosGerais.destinacaoImovel);
  if (isTipo2) {
    if (isNaN(destinacaoImovel) || destinacaoImovel <= 0) {
      const msg = 'Destinação do Imóvel (destinacaoImovel) é obrigatória para Imóvel Tipo 2 (Predial).';
      errors.push(msg);
      fieldErrors['destinacaoImovel'] = msg;
    }
  }

  // 5. Código BICE (bice) - Obrigatório para Tipo 3
  const bice = Number(dadosGerais.bice);
  if (isTipo3) {
    if (isNaN(bice) || bice <= 0) {
      const msg = 'Código BICE (bice) é obrigatório para Imóvel Tipo 3 (BICE).';
      errors.push(msg);
      fieldErrors['bice'] = msg;
    } else if (bice < 1 || bice > 12) {
      const msg = 'Código BICE inválido. Selecione uma opção válida de 01 a 12.';
      errors.push(msg);
      fieldErrors['bice'] = msg;
    }
  }

  // 6. Área Terreno (numeric: 12 integers + 4 decimals)
  const areaTerreno = Number(dadosGerais.areaTerreno);
  if (isNaN(areaTerreno) || areaTerreno === undefined || areaTerreno === null) {
    const msg = 'Área do Terreno deve ser um número válido.';
    errors.push(msg);
    fieldErrors['areaTerreno'] = msg;
  } else if ((isTipo1 || isTipo2 || isTipo3) && areaTerreno <= 0) {
    const tipoNome = isTipo1 ? 'Tipo 1 (Territorial)' : isTipo2 ? 'Tipo 2 (Predial)' : 'Tipo 3 (BICE)';
    const msg = `Para Imóvel ${tipoNome}, Área do Terreno deve ser maior que 0 m².`;
    errors.push(msg);
    fieldErrors['areaTerreno'] = msg;
  } else {
    // Check format: 12 integers + 4 decimals
    const strVal = String(dadosGerais.areaTerreno).replace(',', '.');
    const parts = strVal.split('.');
    const integerPart = parts[0].replace('-', '');
    const decimalPart = parts[1] || '';

    if (integerPart.length > 12) {
      const msg = `Área do Terreno excede o limite de 12 dígitos inteiros (${integerPart.length} dígitos).`;
      errors.push(msg);
      fieldErrors['areaTerreno'] = msg;
    }
    if (decimalPart.length > 4) {
      const msg = `Área do Terreno excede o limite de 4 casas decimais (${decimalPart.length} casas).`;
      errors.push(msg);
      fieldErrors['areaTerreno'] = msg;
    }
  }

  // 7. Área Construída - Obrigatória para Tipo 2 (> 0)
  const areaConstruida = Number(dadosGerais.areaConstruida);
  if (isTipo1 && areaConstruida > 0) {
    warnings.push('Quando tipoImovel = 1 e areaConstruida preenchida, não recebe CIB no SINTER.');
  }
  if (isTipo2) {
    if (isNaN(areaConstruida) || areaConstruida <= 0) {
      const msg = 'Para Imóvel Tipo 2 (Predial), Área Construída é obrigatória e deve ser maior que 0 m².';
      errors.push(msg);
      fieldErrors['areaConstruida'] = msg;
    } else {
      const strVal = String(dadosGerais.areaConstruida).replace(',', '.');
      const parts = strVal.split('.');
      const integerPart = parts[0].replace('-', '');
      const decimalPart = parts[1] || '';

      if (integerPart.length > 12) {
        const msg = `Área Construída excede o limite de 12 dígitos inteiros (${integerPart.length} dígitos).`;
        errors.push(msg);
        fieldErrors['areaConstruida'] = msg;
      }
      if (decimalPart.length > 4) {
        const msg = `Área Construída excede o limite de 4 casas decimais (${decimalPart.length} casas).`;
        errors.push(msg);
        fieldErrors['areaConstruida'] = msg;
      }
    }
  }

  // 8. Ano Construtivo (anoConstrutivo) - Obrigatório para Tipo 2 (> 0)
  const anoConstrutivo = Number(dadosGerais.anoConstrutivo);
  if (isTipo1 && anoConstrutivo > 0 && anoConstrutivo !== 1900) {
    warnings.push('Quando tipoImovel = 1 e anoConstrutivo preenchido, gera uma mensagem de Falha no SINTER.');
  }
  if (isTipo2) {
    if (isNaN(anoConstrutivo) || anoConstrutivo <= 0) {
      const msg = 'Ano Construtivo (anoConstrutivo) é obrigatório para Imóvel Tipo 2 (Predial).';
      errors.push(msg);
      fieldErrors['anoConstrutivo'] = msg;
    } else if (anoConstrutivo < 1500 || anoConstrutivo > new Date().getFullYear() + 10) {
      const msg = `Ano Construtivo inválido (${anoConstrutivo}). Informe um ano de 4 dígitos válido.`;
      errors.push(msg);
      fieldErrors['anoConstrutivo'] = msg;
    }
  }

  // 9. temBairro (boolean)
  if (typeof dadosGerais.temBairro !== 'boolean') {
    const msg = 'Campo "Tem Bairro?" deve ser boolean (true/false).';
    errors.push(msg);
    fieldErrors['temBairro'] = msg;
  }

  // 10. Tipo Logradouro (integer)
  const tipoLogradouro = Number(endereco.tipoLogradouro);
  if (isNaN(tipoLogradouro) || tipoLogradouro <= 0) {
    const msg = 'Tipo de Logradouro é obrigatório (código inteiro SINTER).';
    errors.push(msg);
    fieldErrors['tipoLogradouro'] = msg;
  }

  // 11. Nome Logradouro (string, max 300)
  const rawNomeLogradouro = String(endereco.nomeLogradouro || '');
  const nomeLogradouro = rawNomeLogradouro.trim();
  if (!nomeLogradouro) {
    const msg = 'Nome do Logradouro é obrigatório.';
    errors.push(msg);
    fieldErrors['nomeLogradouro'] = msg;
  } else if (hasInvisibleChars(rawNomeLogradouro)) {
    const msg = 'Nome do Logradouro contém caracteres invisíveis ou de controle.';
    errors.push(msg);
    fieldErrors['nomeLogradouro'] = msg;
  } else if (nomeLogradouro.length > 300) {
    const msg = `Nome do Logradouro excede o limite de 300 caracteres (${nomeLogradouro.length}/300).`;
    errors.push(msg);
    fieldErrors['nomeLogradouro'] = msg;
  }

  // 12. Bairro (string, max 30)
  const rawBairro = String(endereco.bairro || '');
  const bairro = rawBairro.trim();
  if (hasInvisibleChars(rawBairro)) {
    const msg = 'Bairro contém caracteres invisíveis ou de controle.';
    errors.push(msg);
    fieldErrors['bairro'] = msg;
  } else if (isTipo2 || isTipo3 || dadosGerais.temBairro) {
    if (!bairro) {
      const msg = isTipo2
        ? 'Bairro é obrigatório para Imóvel Tipo 2.'
        : isTipo3
        ? 'Bairro é obrigatório para Imóvel Tipo 3.'
        : 'Bairro é obrigatório quando "Tem Bairro" está marcado.';
      errors.push(msg);
      fieldErrors['bairro'] = msg;
    } else if (bairro.length > 30) {
      const msg = `Bairro excede o limite de 30 caracteres (${bairro.length}/30).`;
      errors.push(msg);
      fieldErrors['bairro'] = msg;
    }
  } else if (bairro.length > 30) {
    const msg = `Bairro excede o limite de 30 caracteres (${bairro.length}/30).`;
    errors.push(msg);
    fieldErrors['bairro'] = msg;
  }

  // 13. CEP (string, 8 digits)
  const rawCep = String(endereco.cep || '').replace(/\D/g, '');
  if (!rawCep) {
    const msg = 'CEP é obrigatório (8 dígitos numéricos).';
    errors.push(msg);
    fieldErrors['cep'] = msg;
  } else if (rawCep.length !== 8) {
    const msg = `CEP deve conter exatamente 8 dígitos numéricos (informado: ${rawCep.length}).`;
    errors.push(msg);
    fieldErrors['cep'] = msg;
  }

  // 13.1 numeroImovel (string até 8 caracteres - opcional)
  if (endereco.numeroImovel !== undefined && endereco.numeroImovel !== null && String(endereco.numeroImovel).trim() !== '') {
    const rawNumero = String(endereco.numeroImovel);
    const numeroStr = rawNumero.trim();
    if (hasInvisibleChars(rawNumero)) {
      const msg = 'Número do Imóvel contém caracteres invisíveis ou de controle.';
      errors.push(msg);
      fieldErrors['numeroImovel'] = msg;
    } else if (numeroStr.length > 8) {
      const msg = `Número do Imóvel excede o limite de 8 caracteres (${numeroStr.length}/8).`;
      errors.push(msg);
      fieldErrors['numeroImovel'] = msg;
    }
  }

  // 13.2 complNroImovel (string até 30 caracteres - opcional)
  if (endereco.complNroImovel !== undefined && endereco.complNroImovel !== null && String(endereco.complNroImovel).trim() !== '') {
    const rawComplNro = String(endereco.complNroImovel);
    const complNroStr = rawComplNro.trim();
    if (hasInvisibleChars(rawComplNro)) {
      const msg = 'Complemento do Número contém caracteres invisíveis ou de controle.';
      errors.push(msg);
      fieldErrors['complNroImovel'] = msg;
    } else if (complNroStr.length > 30) {
      const msg = `Complemento do Número excede o limite de 30 caracteres (${complNroStr.length}/30).`;
      errors.push(msg);
      fieldErrors['complNroImovel'] = msg;
    }
  }

  // 13.3 complEndereco (string até 30 caracteres - opcional)
  if (endereco.complEndereco !== undefined && endereco.complEndereco !== null && String(endereco.complEndereco).trim() !== '') {
    const rawComplEnd = String(endereco.complEndereco);
    const complEndStr = rawComplEnd.trim();
    if (hasInvisibleChars(rawComplEnd)) {
      const msg = 'Complemento do Endereço contém caracteres invisíveis ou de controle.';
      errors.push(msg);
      fieldErrors['complEndereco'] = msg;
    } else if (complEndStr.length > 30) {
      const msg = `Complemento do Endereço excede o limite de 30 caracteres (${complEndStr.length}/30).`;
      errors.push(msg);
      fieldErrors['complEndereco'] = msg;
    }
  }

  // 14. idParcela (string até 35 caracteres) - Se tipoImovel = 1 e informado -> Falha
  if (dadosGerais.idParcela !== undefined && String(dadosGerais.idParcela).trim() !== '') {
    const rawIdParcela = String(dadosGerais.idParcela);
    const idParcelaStr = rawIdParcela.trim();
    if (isTipo1) {
      const msg = 'Quando tipoImovel = 1 (Territorial), idParcela não deve ser informado (gera falha no SINTER).';
      errors.push(msg);
      fieldErrors['idParcela'] = msg;
    } else if (hasInvisibleChars(rawIdParcela)) {
      const msg = 'idParcela contém caracteres invisíveis ou de controle.';
      errors.push(msg);
      fieldErrors['idParcela'] = msg;
    } else if (idParcelaStr.length > 35) {
      const msg = `idParcela excede o limite de 35 caracteres (${idParcelaStr.length}/35).`;
      errors.push(msg);
      fieldErrors['idParcela'] = msg;
    }
  }

  // 15. valorVenal (numérico 18 inteiros + 2 decimais)
  if (dadosGerais.valorVenal !== undefined && dadosGerais.valorVenal !== null && String(dadosGerais.valorVenal).trim() !== '') {
    const vVenalNum = Number(dadosGerais.valorVenal);
    if (isNaN(vVenalNum) || vVenalNum < 0) {
      const msg = 'Valor Venal deve ser numérico maior ou igual a 0.';
      errors.push(msg);
      fieldErrors['valorVenal'] = msg;
    } else {
      const strVal = String(dadosGerais.valorVenal).replace(',', '.');
      const parts = strVal.split('.');
      const integerPart = parts[0].replace('-', '');
      const decimalPart = parts[1] || '';
      if (integerPart.length > 18) {
        const msg = `Valor Venal excede o limite de 18 dígitos inteiros (${integerPart.length}/18).`;
        errors.push(msg);
        fieldErrors['valorVenal'] = msg;
      }
      if (decimalPart.length > 2) {
        const msg = `Valor Venal excede o limite de 2 casas decimais (${decimalPart.length}/2).`;
        errors.push(msg);
        fieldErrors['valorVenal'] = msg;
      }
    }
  }

  // 16. dtUltimoValorVenal (YYYY-MM-DD)
  if (dadosGerais.dtUltimoValorVenal && String(dadosGerais.dtUltimoValorVenal).trim() !== '') {
    const dtStr = String(dadosGerais.dtUltimoValorVenal).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dtStr)) {
      const msg = 'Data do Último Valor Venal deve estar no formato AAAA-MM-DD (YYYY-MM-DD).';
      errors.push(msg);
      fieldErrors['dtUltimoValorVenal'] = msg;
    }
  }

  // 17. valorRefMercado (numérico 18 inteiros + 2 decimais)
  if (dadosGerais.valorRefMercado !== undefined && dadosGerais.valorRefMercado !== null && String(dadosGerais.valorRefMercado).trim() !== '') {
    const vMercNum = Number(dadosGerais.valorRefMercado);
    if (isNaN(vMercNum) || vMercNum < 0) {
      const msg = 'Valor de Referência de Mercado deve ser numérico maior ou igual a 0.';
      errors.push(msg);
      fieldErrors['valorRefMercado'] = msg;
    } else {
      const strVal = String(dadosGerais.valorRefMercado).replace(',', '.');
      const parts = strVal.split('.');
      const integerPart = parts[0].replace('-', '');
      const decimalPart = parts[1] || '';
      if (integerPart.length > 18) {
        const msg = `Valor de Referência de Mercado excede o limite de 18 dígitos inteiros (${integerPart.length}/18).`;
        errors.push(msg);
        fieldErrors['valorRefMercado'] = msg;
      }
      if (decimalPart.length > 2) {
        const msg = `Valor de Referência de Mercado excede o limite de 2 casas decimais (${decimalPart.length}/2).`;
        errors.push(msg);
        fieldErrors['valorRefMercado'] = msg;
      }
    }
  }

  // 18. dataUltValorMercado (YYYY-MM-DD)
  if (dadosGerais.dataUltValorMercado && String(dadosGerais.dataUltValorMercado).trim() !== '') {
    const dtStr = String(dadosGerais.dataUltValorMercado).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dtStr)) {
      const msg = 'Data da Última Atualização de Mercado deve estar no formato AAAA-MM-DD (YYYY-MM-DD).';
      errors.push(msg);
      fieldErrors['dataUltValorMercado'] = msg;
    }
  }

  // 19. qtdGaragem (inteiro até 3 dígitos)
  if (dadosGerais.qtdGaragem !== undefined && dadosGerais.qtdGaragem !== null && String(dadosGerais.qtdGaragem).trim() !== '') {
    const gNum = Number(dadosGerais.qtdGaragem);
    if (isNaN(gNum) || gNum < 0 || gNum > 999) {
      const msg = 'Quantidade de garagens deve ser um número inteiro de 0 a 999 (até 3 dígitos).';
      errors.push(msg);
      fieldErrors['qtdGaragem'] = msg;
    }
  }

  // 20. padraoConstrutivo (inteiro 1 a 4)
  if (dadosGerais.padraoConstrutivo !== undefined && dadosGerais.padraoConstrutivo !== null && Number(dadosGerais.padraoConstrutivo) > 0) {
    const pNum = Number(dadosGerais.padraoConstrutivo);
    if (pNum < 1 || pNum > 4) {
      const msg = 'Padrão construtivo inválido. Selecione 1 (Baixo/Popular), 2 (Normal), 3 (Alto) ou 4 (Luxo).';
      errors.push(msg);
      fieldErrors['padraoConstrutivo'] = msg;
    }
  }

  // 21. AreaConstruidaCompl validations
  if (areaConstruidaCompl) {
    const { areaPrivativa, areaComum, fraIdeal } = areaConstruidaCompl;
    const hasAnyComplField = (areaPrivativa !== undefined && areaPrivativa !== null && String(areaPrivativa).trim() !== '') ||
      (areaComum !== undefined && areaComum !== null && String(areaComum).trim() !== '') ||
      (fraIdeal !== undefined && fraIdeal !== null && String(fraIdeal).trim() !== '');

    if (hasAnyComplField && isTipo1) {
      const msg = 'AreaConstruidaCompl não deve ser preenchida para Imóvel Tipo 1 (Territorial), sendo opcional apenas para Tipo 2 ou 3.';
      errors.push(msg);
      fieldErrors['areaConstruidaCompl'] = msg;
    }

    // areaPrivativa (12 inteiros + 4 decimais)
    if (areaPrivativa !== undefined && areaPrivativa !== null && String(areaPrivativa).trim() !== '') {
      const num = Number(areaPrivativa);
      if (isNaN(num) || num < 0) {
        const msg = 'Área Privativa deve ser um número maior ou igual a 0.';
        errors.push(msg);
        fieldErrors['areaPrivativa'] = msg;
      } else {
        const strVal = String(areaPrivativa).replace(',', '.');
        const parts = strVal.split('.');
        const integerPart = parts[0].replace('-', '');
        const decimalPart = parts[1] || '';
        if (integerPart.length > 12) {
          const msg = `Área Privativa excede o limite de 12 dígitos inteiros (${integerPart.length}/12).`;
          errors.push(msg);
          fieldErrors['areaPrivativa'] = msg;
        }
        if (decimalPart.length > 4) {
          const msg = `Área Privativa excede o limite de 4 casas decimais (${decimalPart.length}/4).`;
          errors.push(msg);
          fieldErrors['areaPrivativa'] = msg;
        }
      }
    }

    // areaComum (12 inteiros + 4 decimais)
    if (areaComum !== undefined && areaComum !== null && String(areaComum).trim() !== '') {
      const num = Number(areaComum);
      if (isNaN(num) || num < 0) {
        const msg = 'Área Comum deve ser um número maior ou igual a 0.';
        errors.push(msg);
        fieldErrors['areaComum'] = msg;
      } else {
        const strVal = String(areaComum).replace(',', '.');
        const parts = strVal.split('.');
        const integerPart = parts[0].replace('-', '');
        const decimalPart = parts[1] || '';
        if (integerPart.length > 12) {
          const msg = `Área Comum excede o limite de 12 dígitos inteiros (${integerPart.length}/12).`;
          errors.push(msg);
          fieldErrors['areaComum'] = msg;
        }
        if (decimalPart.length > 4) {
          const msg = `Área Comum excede o limite de 4 casas decimais (${decimalPart.length}/4).`;
          errors.push(msg);
          fieldErrors['areaComum'] = msg;
        }
      }
    }

    // fraIdeal (1 inteiro + 4 decimais)
    if (fraIdeal !== undefined && fraIdeal !== null && String(fraIdeal).trim() !== '') {
      const num = Number(fraIdeal);
      if (isNaN(num) || num < 0) {
        const msg = 'Fração Ideal deve ser um número maior ou igual a 0.';
        errors.push(msg);
        fieldErrors['fraIdeal'] = msg;
      } else {
        const strVal = String(fraIdeal).replace(',', '.');
        const parts = strVal.split('.');
        const integerPart = parts[0].replace('-', '');
        const decimalPart = parts[1] || '';
        if (integerPart.length > 1) {
          const msg = `Fração Ideal excede o limite de 1 dígito inteiro (${integerPart.length}/1). Formato: 1 inteiro + 4 decimais (ex: 0.0425).`;
          errors.push(msg);
          fieldErrors['fraIdeal'] = msg;
        }
        if (decimalPart.length > 4) {
          const msg = `Fração Ideal excede o limite de 4 casas decimais (${decimalPart.length}/4).`;
          errors.push(msg);
          fieldErrors['fraIdeal'] = msg;
        }
      }
    }
  }

  // 22. Titulares validations
  if (titulares && Array.isArray(titulares) && titulares.length > 0) {
    titulares.forEach((titular, idx) => {
      const prefix = titulares.length > 1 ? `Titular #${idx + 1}: ` : '';
      const ni = String(titular.niTitular || '').replace(/\D/g, '');
      const nome = String(titular.nomeTitular || '').trim();
      const perc = titular.percTitular !== undefined ? titular.percTitular : titular.percTitularidade;
      const dtAquisicao = String(titular.dtAquisicaoTitular || '').trim();
      const tipoTit = titular.tipoTitularidade;
      const docTit = titular.docTitularidade;

      const hasNiOrNome = ni !== '' || nome !== '';
      const hasAnyField = hasNiOrNome || perc !== undefined || dtAquisicao !== '' || tipoTit !== undefined || docTit !== undefined;

      if (hasAnyField) {
        // Check niTitular format (11 for CPF or 14 for CNPJ)
        if (ni !== '') {
          if (ni.length !== 11 && ni.length !== 14) {
            const msg = `${prefix}NI do Titular (CPF/CNPJ) deve ter exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ). Tamanho atual: ${ni.length}.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_niTitular`] = msg;
          }
        }

        // Check nomeTitular max 300 chars
        if (nome.length > 300) {
          const msg = `${prefix}Nome do Titular excede o limite de 300 caracteres (${nome.length}/300).`;
          errors.push(msg);
          fieldErrors[`titular_${idx}_nomeTitular`] = msg;
        }

        // Mandatory fields if niTitular or nomeTitular is filled
        if (hasNiOrNome) {
          // percTitular
          if (perc === undefined || perc === null || String(perc).trim() === '') {
            const msg = `${prefix}Percentual de participação (percTitular) é obrigatório quando niTitular ou nomeTitular é informado.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_percTitular`] = msg;
          } else {
            const numPerc = Number(perc);
            if (isNaN(numPerc) || numPerc <= 0) {
              const msg = `${prefix}Percentual de participação deve ser um número maior que 0.`;
              errors.push(msg);
              fieldErrors[`titular_${idx}_percTitular`] = msg;
            } else {
              const strVal = String(perc).replace(',', '.');
              const parts = strVal.split('.');
              const integerPart = parts[0].replace('-', '');
              const decimalPart = parts[1] || '';
              if (integerPart.length > 3) {
                const msg = `${prefix}Percentual de participação excede 3 dígitos inteiros.`;
                errors.push(msg);
                fieldErrors[`titular_${idx}_percTitular`] = msg;
              }
              if (decimalPart.length > 4) {
                const msg = `${prefix}Percentual de participação excede o limite de 4 casas decimais (${decimalPart.length}/4).`;
                errors.push(msg);
                fieldErrors[`titular_${idx}_percTitular`] = msg;
              }
            }
          }

          // dtAquisicaoTitular
          if (!dtAquisicao) {
            const msg = `${prefix}Data de aquisição (dtAquisicaoTitular) é obrigatória quando niTitular ou nomeTitular é informado.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_dtAquisicaoTitular`] = msg;
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dtAquisicao)) {
            const msg = `${prefix}Data de aquisição deve estar no formato AAAA-MM-DD.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_dtAquisicaoTitular`] = msg;
          }

          // tipoTitularidade
          if (tipoTit === undefined || tipoTit === null || String(tipoTit).trim() === '' || Number(tipoTit) <= 0) {
            const msg = `${prefix}Tipo de titularidade (tipoTitularidade) é obrigatório quando niTitular ou nomeTitular é informado.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_tipoTitularidade`] = msg;
          }

          // docTitularidade
          if (docTit === undefined || docTit === null || String(docTit).trim() === '' || Number(docTit) <= 0) {
            const msg = `${prefix}Documento de titularidade (docTitularidade) é obrigatório quando niTitular ou nomeTitular é informado.`;
            errors.push(msg);
            fieldErrors[`titular_${idx}_docTitularidade`] = msg;
          }
        }
      }
    });
  }

  // 23. ServicoRegistroImovel validations
  if (servicoRegistroImovel) {
    const {
      nomeServentiaRI,
      cnsRI,
      cnmRI,
      numMatriculaRI,
      numUltimoAtoRI,
      lvCartRI,
      flCartRI,
      dtUltAtualizacao,
    } = servicoRegistroImovel;

    if (nomeServentiaRI && nomeServentiaRI.length > 300) {
      const msg = `Nome da Serventia RI excede o limite de 300 caracteres (${nomeServentiaRI.length}/300).`;
      errors.push(msg);
      fieldErrors['nomeServentiaRI'] = msg;
    }

    if (cnsRI !== undefined && cnsRI !== null && String(cnsRI).trim() !== '') {
      const cnsStr = String(cnsRI).replace(/\D/g, '');
      if (cnsStr.length > 6) {
        const msg = `CNS RI excede o limite de 6 dígitos (${cnsStr.length}/6).`;
        errors.push(msg);
        fieldErrors['cnsRI'] = msg;
      }
    }

    if (cnmRI && cnmRI.trim() !== '') {
      const cnmStr = cnmRI.trim();
      if (cnmStr.length > 25) {
        const msg = `CNM RI excede o tamanho limite (${cnmStr.length} car.). Formato esperado: CCCCCC.L.NNNNNNN-DD.`;
        errors.push(msg);
        fieldErrors['cnmRI'] = msg;
      }
    }

    if (numMatriculaRI && numMatriculaRI.length > 15) {
      const msg = `Número da Matrícula RI excede o limite de 15 caracteres (${numMatriculaRI.length}/15).`;
      errors.push(msg);
      fieldErrors['numMatriculaRI'] = msg;
    }

    if (numUltimoAtoRI && numUltimoAtoRI.length > 7) {
      const msg = `Número do Último Ato RI excede o limite de 7 caracteres (${numUltimoAtoRI.length}/7).`;
      errors.push(msg);
      fieldErrors['numUltimoAtoRI'] = msg;
    }

    if (lvCartRI && lvCartRI.length > 4) {
      const msg = `Livro Cartorial RI excede o limite de 4 caracteres (${lvCartRI.length}/4).`;
      errors.push(msg);
      fieldErrors['lvCartRI'] = msg;
    }

    if (flCartRI && flCartRI.length > 4) {
      const msg = `Folha do Livro RI excede o limite de 4 caracteres (${flCartRI.length}/4).`;
      errors.push(msg);
      fieldErrors['flCartRI'] = msg;
    }

    if (dtUltAtualizacao && dtUltAtualizacao.trim() !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dtUltAtualizacao.trim())) {
        const msg = 'Data da última atualização RI deve estar no formato AAAA-MM-DD (YYYY-MM-DD).';
        errors.push(msg);
        fieldErrors['dtUltAtualizacao'] = msg;
      }
    }
  }

  // 24. CartorioNotas validations
  if (cartorioNotas && Object.values(cartorioNotas).some(v => v !== undefined && v !== null && String(v).trim() !== '')) {
    const { nomeServentiaNotas, cnsNotas, lvCartNotas, flCartNotas } = cartorioNotas;

    if (nomeServentiaNotas && nomeServentiaNotas.length > 300) {
      const msg = `Nome da Serventia (Notas) excede o limite de 300 caracteres (${nomeServentiaNotas.length}/300).`;
      errors.push(msg);
      fieldErrors['nomeServentiaNotas'] = msg;
    }

    if (cnsNotas !== undefined && cnsNotas !== null && String(cnsNotas).trim() !== '') {
      const cnsStr = String(cnsNotas).replace(/\D/g, '');
      if (cnsStr.length > 6) {
        const msg = `CNS (Notas) excede o limite de 6 dígitos (${cnsStr.length}/6).`;
        errors.push(msg);
        fieldErrors['cnsNotas'] = msg;
      }
    }

    if (lvCartNotas && lvCartNotas.length > 4) {
      const msg = `Livro do Cartório (Notas) excede o limite de 4 caracteres (${lvCartNotas.length}/4).`;
      errors.push(msg);
      fieldErrors['lvCartNotas'] = msg;
    }

    if (flCartNotas && flCartNotas.length > 4) {
      const msg = `Folha do Cartório (Notas) excede o limite de 4 caracteres (${flCartNotas.length}/4).`;
      errors.push(msg);
      fieldErrors['flCartNotas'] = msg;
    }

    // Rule check: "Para caracterizar as informações de Cartório de Notas é necessário informar cnsNotas (preferencialmente) ou nomeServentiaNotas e os dois outros campos: lvCartNotas e flCartNotas."
    const hasCartorioIdent = (cnsNotas !== undefined && cnsNotas !== null && String(cnsNotas).trim() !== '') || (nomeServentiaNotas && nomeServentiaNotas.trim() !== '');
    const hasLivro = lvCartNotas && lvCartNotas.trim() !== '';
    const hasFolha = flCartNotas && flCartNotas.trim() !== '';

    if (!hasCartorioIdent) {
      warnings.push('Para caracterizar o Cartório de Notas, informe preferencialmente cnsNotas ou nomeServentiaNotas.');
    }
    if (!hasLivro || !hasFolha) {
      warnings.push('Para caracterizar o Cartório de Notas, informe também os dois campos: lvCartNotas e flCartNotas.');
    }
  }

  // 25. ITBI validations (Opcional, mas se algum campo informado, todos passam a ser obrigatórios, inclusive Transmitente e Adquirente)
  const hasBaseCalcul = itbi?.baseCalculITBI !== undefined && itbi?.baseCalculITBI !== null && String(itbi.baseCalculITBI).trim() !== '';
  const hasValorRef = itbi?.valorRefITBI !== undefined && itbi?.valorRefITBI !== null && String(itbi.valorRefITBI).trim() !== '';
  const hasDtTransacao = itbi?.dtTransacaoITBI !== undefined && itbi?.dtTransacaoITBI !== null && String(itbi.dtTransacaoITBI).trim() !== '';
  const hasTpTransacao = itbi?.tpTransacaoITBI !== undefined && itbi?.tpTransacaoITBI !== null && String(itbi.tpTransacaoITBI).trim() !== '' && Number(itbi.tpTransacaoITBI) > 0;
  const hasPercTransac = itbi?.percTransacionadoITBI !== undefined && itbi?.percTransacionadoITBI !== null && String(itbi.percTransacionadoITBI).trim() !== '';
  const transmitentes = itbi?.TransmitenteITBI || [];
  const adquirentes = itbi?.AdquirenteITBI || [];
  const hasTransmitentes = transmitentes.length > 0 && transmitentes.some(t => t && (t.nomeTransmitenteITBI || t.niTransmitenteITBI || t.idTransmitenteITBI));
  const hasAdquirentes = adquirentes.length > 0 && adquirentes.some(a => a && (a.nomeAdquirenteITBI || a.niAdquirenteITBI || a.idAdquirenteITBI || a.percTransacAdquirenteITBI !== undefined));

  const isItbiActive = hasBaseCalcul || hasValorRef || hasDtTransacao || hasTpTransacao || hasPercTransac || hasTransmitentes || hasAdquirentes;

  if (isItbiActive) {
    // a) baseCalculITBI
    if (!hasBaseCalcul) {
      const msg = 'Base de cálculo do ITBI (baseCalculITBI) é obrigatória quando dados de ITBI são informados.';
      errors.push(msg);
      fieldErrors['baseCalculITBI'] = msg;
    } else {
      const valNum = Number(itbi!.baseCalculITBI);
      if (isNaN(valNum) || valNum < 0) {
        const msg = 'Base de cálculo do ITBI deve ser um número válido (>= 0).';
        errors.push(msg);
        fieldErrors['baseCalculITBI'] = msg;
      } else {
        const strVal = String(itbi!.baseCalculITBI).replace(',', '.');
        const parts = strVal.split('.');
        const intPart = parts[0].replace('-', '');
        const decPart = parts[1] || '';
        if (intPart.length > 18) {
          const msg = `Base de cálculo do ITBI excede 18 dígitos inteiros (${intPart.length}/18).`;
          errors.push(msg);
          fieldErrors['baseCalculITBI'] = msg;
        }
        if (decPart.length > 2) {
          const msg = `Base de cálculo do ITBI excede 2 casas decimais (${decPart.length}/2).`;
          errors.push(msg);
          fieldErrors['baseCalculITBI'] = msg;
        }
      }
    }

    // b) valorRefITBI
    if (!hasValorRef) {
      const msg = 'Valor de referência do ITBI (valorRefITBI) é obrigatório quando dados de ITBI são informados.';
      errors.push(msg);
      fieldErrors['valorRefITBI'] = msg;
    } else {
      const valNum = Number(itbi!.valorRefITBI);
      if (isNaN(valNum) || valNum < 0) {
        const msg = 'Valor de referência do ITBI deve ser um número válido (>= 0).';
        errors.push(msg);
        fieldErrors['valorRefITBI'] = msg;
      } else {
        const strVal = String(itbi!.valorRefITBI).replace(',', '.');
        const parts = strVal.split('.');
        const intPart = parts[0].replace('-', '');
        const decPart = parts[1] || '';
        if (intPart.length > 18) {
          const msg = `Valor de referência do ITBI excede 18 dígitos inteiros (${intPart.length}/18).`;
          errors.push(msg);
          fieldErrors['valorRefITBI'] = msg;
        }
        if (decPart.length > 2) {
          const msg = `Valor de referência do ITBI excede 2 casas decimais (${decPart.length}/2).`;
          errors.push(msg);
          fieldErrors['valorRefITBI'] = msg;
        }
      }
    }

    // c) dtTransacaoITBI
    if (!hasDtTransacao) {
      const msg = 'Data da transação do ITBI (dtTransacaoITBI) é obrigatória quando dados de ITBI são informados.';
      errors.push(msg);
      fieldErrors['dtTransacaoITBI'] = msg;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(itbi!.dtTransacaoITBI).trim())) {
      const msg = 'Data da transação do ITBI deve estar no formato AAAA-MM-DD (YYYY-MM-DD).';
      errors.push(msg);
      fieldErrors['dtTransacaoITBI'] = msg;
    }

    // d) tpTransacaoITBI
    if (!hasTpTransacao) {
      const msg = 'Tipo da transação do ITBI (tpTransacaoITBI) é obrigatório quando dados de ITBI são informados.';
      errors.push(msg);
      fieldErrors['tpTransacaoITBI'] = msg;
    } else {
      const tpNum = Number(itbi!.tpTransacaoITBI);
      if (isNaN(tpNum) || tpNum <= 0 || tpNum > 99) {
        const msg = 'Tipo da transação do ITBI deve ser um número inteiro de até 2 dígitos (1 a 99).';
        errors.push(msg);
        fieldErrors['tpTransacaoITBI'] = msg;
      }
    }

    // e) percTransacionadoITBI
    if (!hasPercTransac) {
      const msg = 'Percentual transacionado do ITBI (percTransacionadoITBI) é obrigatório quando dados de ITBI são informados.';
      errors.push(msg);
      fieldErrors['percTransacionadoITBI'] = msg;
    } else {
      const percNum = Number(itbi!.percTransacionadoITBI);
      if (isNaN(percNum) || percNum <= 0) {
        const msg = 'Percentual transacionado do ITBI deve ser um número maior que 0.';
        errors.push(msg);
        fieldErrors['percTransacionadoITBI'] = msg;
      } else {
        const strVal = String(itbi!.percTransacionadoITBI).replace(',', '.');
        const parts = strVal.split('.');
        const decPart = parts[1] || '';
        if (decPart.length > 6) {
          const msg = `Percentual transacionado do ITBI excede 6 casas decimais (${decPart.length}/6).`;
          errors.push(msg);
          fieldErrors['percTransacionadoITBI'] = msg;
        }
      }
    }

    // f) Transmitentes
    if (!hasTransmitentes) {
      const msg = 'A transação de ITBI deve conter ao menos um Transmitente.';
      errors.push(msg);
      fieldErrors['TransmitenteITBI'] = msg;
    } else {
      transmitentes.forEach((t, idx) => {
        const prefix = transmitentes.length > 1 ? `Transmitente ITBI #${idx + 1}: ` : 'Transmitente ITBI: ';
        const ni = String(t.niTransmitenteITBI || t.idTransmitenteITBI || '').replace(/\D/g, '');
        const nome = String(t.nomeTransmitenteITBI || '').trim();

        if (!nome) {
          const msg = `${prefix}Nome do transmitente é obrigatório.`;
          errors.push(msg);
          fieldErrors[`transmitente_${idx}_nome`] = msg;
        } else if (nome.length > 300) {
          const msg = `${prefix}Nome do transmitente excede 300 caracteres (${nome.length}/300).`;
          errors.push(msg);
          fieldErrors[`transmitente_${idx}_nome`] = msg;
        }

        if (ni) {
          if (ni.length !== 11 && ni.length !== 14) {
            const msg = `${prefix}CPF/CNPJ do transmitente deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ). Tamanho atual: ${ni.length}.`;
            errors.push(msg);
            fieldErrors[`transmitente_${idx}_ni`] = msg;
          }
        }
      });
    }

    // g) Adquirentes
    if (!hasAdquirentes) {
      const msg = 'A transação de ITBI deve conter ao menos um Adquirente.';
      errors.push(msg);
      fieldErrors['AdquirenteITBI'] = msg;
    } else {
      adquirentes.forEach((a, idx) => {
        const prefix = adquirentes.length > 1 ? `Adquirente ITBI #${idx + 1}: ` : 'Adquirente ITBI: ';
        const ni = String(a.niAdquirenteITBI || a.idAdquirenteITBI || '').replace(/\D/g, '');
        const nome = String(a.nomeAdquirenteITBI || '').trim();
        const perc = a.percTransacAdquirenteITBI;

        if (!nome) {
          const msg = `${prefix}Nome do adquirente é obrigatório.`;
          errors.push(msg);
          fieldErrors[`adquirente_${idx}_nome`] = msg;
        } else if (nome.length > 300) {
          const msg = `${prefix}Nome do adquirente excede 300 caracteres (${nome.length}/300).`;
          errors.push(msg);
          fieldErrors[`adquirente_${idx}_nome`] = msg;
        }

        if (ni) {
          if (ni.length !== 11 && ni.length !== 14) {
            const msg = `${prefix}CPF/CNPJ do adquirente deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ). Tamanho atual: ${ni.length}.`;
            errors.push(msg);
            fieldErrors[`adquirente_${idx}_ni`] = msg;
          }
        }

        if (perc === undefined || perc === null || String(perc).trim() === '') {
          const msg = `${prefix}Percentual transacionado do adquirente é obrigatório.`;
          errors.push(msg);
          fieldErrors[`adquirente_${idx}_perc`] = msg;
        } else {
          const pNum = Number(perc);
          if (isNaN(pNum) || pNum <= 0) {
            const msg = `${prefix}Percentual do adquirente deve ser maior que 0.`;
            errors.push(msg);
            fieldErrors[`adquirente_${idx}_perc`] = msg;
          } else {
            const strVal = String(perc).replace(',', '.');
            const parts = strVal.split('.');
            const decPart = parts[1] || '';
            if (decPart.length > 6) {
              const msg = `${prefix}Percentual do adquirente excede 6 casas decimais (${decPart.length}/6).`;
              errors.push(msg);
              fieldErrors[`adquirente_${idx}_perc`] = msg;
            }
          }
        }
      });
    }
  }

  // Additional warnings/checks for Tipo 1
  if (isTipo1) {
    if (dadosGerais.areaConstruida && dadosGerais.areaConstruida > 0) {
      warnings.push('Imóvel Tipo 1 (Territorial) não deve ter Área Construída.');
    }
    if (dadosGerais.anoConstrutivo && dadosGerais.anoConstrutivo > 0 && dadosGerais.anoConstrutivo !== 1900) {
      warnings.push('Quando tipoImovel = 1 e anoConstrutivo é informado, gera falha no SINTER.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors,
    warnings,
  };
}

/**
 * Validates a full NDJsonRecord
 */
export function validateNDJsonRecord(record: NDJsonRecord): FieldValidationResult {
  return validateRecordData(
    record.dadosGerais,
    record.endereco,
    record.operacao,
    record.areaConstruidaCompl,
    record.titulares,
    record.servicoRegistroImovel,
    record.cartorioNotas,
    record.itbi,
    record.tipoDesativacao,
    record.motivoDesativacao
  );
}

/**
 * Sanitizes numeric format for Area Terreno to conform to 12 integers + 4 decimals.
 */
export function sanitizeAreaTerreno(value: number | string): number {
  if (value === undefined || value === null || value === '') return 0;
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (isNaN(num)) return 0;
  // Round to max 4 decimal places
  return Math.round(num * 10000) / 10000;
}
