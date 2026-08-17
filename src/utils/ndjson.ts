import { NDJsonRecord } from '../types';

/**
 * Helper to safely parse numbers with potential comma or dot decimals.
 */
function parseFlexibleNumber(val: any, fallback: number = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).replace(',', '.').trim();
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

/**
 * Helper to safely parse boolean values.
 */
function parseFlexibleBoolean(val: any, fallback: boolean = true): boolean {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'boolean') return val;
  const str = String(val).toLowerCase().trim();
  if (str === 'true' || str === 'verdadeiro' || str === '1' || str === 'sim') return true;
  if (str === 'false' || str === 'falso' || str === '0' || str === 'nao' || str === 'não') return false;
  return fallback;
}
export interface NDJsonExportOptions {
  /**
   * If true, generates internal control metadata (_statusCor, _statusNota) for management and internal re-import.
   * If false, omits internal metadata.
   */
  includeInternalStatus?: boolean;
  /**
   * If true, forces strict SINTER / CADURB format without any internal metadata.
   */
  forSinter?: boolean;
}

/**
 * Extracts and normalizes statusCor from various possible locations and casings in JSON
 */
export function extractAndNormalizeStatusCor(
  rawObj: any,
  uiObj: any = {},
  dg: any = {}
): 'verde' | 'amarelo' | 'vermelho' | undefined {
  if (!rawObj && !uiObj && !dg) return undefined;

  const candidates: any[] = [
    rawObj?._statusCor,
    rawObj?.statusCor,
    rawObj?.status_cor,
    rawObj?._status_cor,
    rawObj?._status,
    rawObj?.status,
    rawObj?._cor,
    rawObj?.cor,
    rawObj?._statusControle,
    rawObj?.statusControle,
    rawObj?.situacaoCor,
    rawObj?._situacaoCor,
    uiObj?._statusCor,
    uiObj?.statusCor,
    uiObj?.status_cor,
    uiObj?._status_cor,
    uiObj?._status,
    uiObj?.status,
    uiObj?._cor,
    uiObj?.cor,
    uiObj?._statusControle,
    uiObj?.statusControle,
    dg?._statusCor,
    dg?.statusCor,
    dg?.status_cor,
    dg?._status_cor,
    dg?.status,
    dg?.cor,
    dg?._cor,
    dg?._statusControle,
    dg?.statusControle,
  ];

  // Also check if any key in rawObj or uiObj ends with statusCor / status / cor
  if (typeof rawObj === 'object' && rawObj !== null) {
    for (const [k, v] of Object.entries(rawObj)) {
      if (/status|cor|situacao|color/i.test(k) && typeof v === 'string') {
        candidates.push(v);
      }
    }
  }
  if (typeof uiObj === 'object' && uiObj !== null) {
    for (const [k, v] of Object.entries(uiObj)) {
      if (/status|cor|situacao|color/i.test(k) && typeof v === 'string') {
        candidates.push(v);
      }
    }
  }

  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') {
      const s = String(c).toLowerCase().trim();
      if (
        s === 'verde' ||
        s === 'green' ||
        s === 'ok' ||
        s === 'aprovado' ||
        s === 'valido' ||
        s === 'válido' ||
        s === 'sucesso' ||
        s === 'success' ||
        s === 'v' ||
        s === '1'
      ) {
        return 'verde';
      }
      if (
        s === 'amarelo' ||
        s === 'yellow' ||
        s === 'atencao' ||
        s === 'atenção' ||
        s === 'pendente' ||
        s === 'warning' ||
        s === 'alerta' ||
        s === 'a' ||
        s === '2'
      ) {
        return 'amarelo';
      }
      if (
        s === 'vermelho' ||
        s === 'red' ||
        s === 'erro' ||
        s === 'error' ||
        s === 'invalido' ||
        s === 'inválido' ||
        s === 'incorreto' ||
        s === 'danger' ||
        s === 'rejeitado' ||
        s === 'e' ||
        s === '3'
      ) {
        return 'vermelho';
      }
    }
  }
  return undefined;
}

/**
 * Extracts statusNota from various possible locations in JSON
 */
export function extractStatusNota(rawObj: any, uiObj: any = {}, dg: any = {}): string | undefined {
  const candidates = [
    rawObj?._statusNota,
    rawObj?.statusNota,
    rawObj?.status_nota,
    rawObj?._nota,
    rawObj?.nota,
    rawObj?.observacao,
    rawObj?._observacao,
    rawObj?.obs,
    rawObj?._obs,
    uiObj?._statusNota,
    uiObj?.statusNota,
    uiObj?.status_nota,
    uiObj?.nota,
    uiObj?.observacao,
    uiObj?._observacao,
    uiObj?.obs,
    dg?._statusNota,
    dg?.statusNota,
    dg?.status_nota,
    dg?.nota,
    dg?.observacao,
    dg?.obs,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== '') {
      return String(c).trim();
    }
  }
  return undefined;
}

/**
 * Serializes a single record to an exact SINTER JSON string line for POST /api/v1/{codigoIbge}/uis
 * Wraps payload in 'ui' object with 'operacao' string ('I', 'A', 'E').
 */
export function recordToNDJsonLine(record: NDJsonRecord, options?: NDJsonExportOptions): string {
  // If explicitly requested for strict SINTER / CADURB official export, omit internal metadata
  const isStrictSinter = options?.forSinter === true;
  const includeStatus = !isStrictSinter && options?.includeInternalStatus !== false;

  // If record carries rawSinterData from import, use or wrap it
  if (record.rawSinterData && Object.keys(record.rawSinterData).length > 0) {
    const rawCopy = JSON.parse(JSON.stringify(record.rawSinterData));
    if (includeStatus && record.statusCor && record.statusCor !== 'nenhum') {
      rawCopy._statusCor = record.statusCor;
      rawCopy.statusCor = record.statusCor;
      if (rawCopy.ui) {
        rawCopy.ui._statusCor = record.statusCor;
        rawCopy.ui.statusCor = record.statusCor;
      }
      if (record.statusNota) {
        rawCopy._statusNota = record.statusNota;
        rawCopy.statusNota = record.statusNota;
        if (rawCopy.ui) {
          rawCopy.ui._statusNota = record.statusNota;
          rawCopy.ui.statusNota = record.statusNota;
        }
      }
    } else if (isStrictSinter) {
      delete rawCopy._statusCor;
      delete rawCopy._statusNota;
      delete rawCopy.statusCor;
      delete rawCopy.statusNota;
      if (rawCopy.ui) {
        delete rawCopy.ui._statusCor;
        delete rawCopy.ui._statusNota;
        delete rawCopy.ui.statusCor;
        delete rawCopy.ui.statusNota;
      }
    }
    if (rawCopy.ui && rawCopy.operacao) {
      return JSON.stringify(rawCopy);
    }
    const wrappedObj: Record<string, any> = {
      ui: rawCopy.ui || rawCopy,
      operacao: rawCopy.operacao || record.operacao || 'I',
    };
    if (includeStatus && record.statusCor && record.statusCor !== 'nenhum') {
      wrappedObj._statusCor = record.statusCor;
      wrappedObj.statusCor = record.statusCor;
      if (record.statusNota) {
        wrappedObj._statusNota = record.statusNota;
        wrappedObj.statusNota = record.statusNota;
      }
    }
    return JSON.stringify(wrappedObj);
  }

  // Exact SINTER schema object inside 'ui'
  const uiObj: Record<string, any> = {
    DadosGeraisImovel: {
      inscricaoImobiliaria: String(record.dadosGerais.inscricaoImobiliaria ?? '').trim(),
      temBairro: parseFlexibleBoolean(record.dadosGerais.temBairro, true),
      tipoImovel: parseFlexibleNumber(record.dadosGerais.tipoImovel, 2),
      tpArquitetonico: parseFlexibleNumber(record.dadosGerais.tpArquitetonico, 2),
      destinacaoImovel: parseFlexibleNumber(record.dadosGerais.destinacaoImovel, 1),
      ...(record.dadosGerais.idParcela ? { idParcela: String(record.dadosGerais.idParcela).trim() } : {}),
      areaTerreno: parseFlexibleNumber(record.dadosGerais.areaTerreno, 0),
      areaConstruida: parseFlexibleNumber(record.dadosGerais.areaConstruida, 0),
      ...(Number(record.dadosGerais.tipoImovel) === 3 && record.dadosGerais.bice && Number(record.dadosGerais.bice) > 0 ? { bice: parseFlexibleNumber(record.dadosGerais.bice, 1) } : {}),
      anoConstrutivo: parseFlexibleNumber(record.dadosGerais.anoConstrutivo, 1900),
      ...(record.dadosGerais.valorVenal !== undefined ? { valorVenal: parseFlexibleNumber(record.dadosGerais.valorVenal, 0) } : {}),
      ...(record.dadosGerais.dtUltimoValorVenal ? { dtUltimoValorVenal: record.dadosGerais.dtUltimoValorVenal } : {}),
      ...(record.dadosGerais.padraoConstrutivo !== undefined ? { padraoConstrutivo: parseFlexibleNumber(record.dadosGerais.padraoConstrutivo, 1) } : {}),
      ...(record.dadosGerais.qtdGaragem !== undefined ? { qtdGaragem: parseFlexibleNumber(record.dadosGerais.qtdGaragem, 0) } : {}),
      ...(record.dadosGerais.temPiscina !== undefined ? { temPiscina: parseFlexibleBoolean(record.dadosGerais.temPiscina, false) } : {}),
      ...(record.dadosGerais.valorRefMercado !== undefined ? { valorRefMercado: parseFlexibleNumber(record.dadosGerais.valorRefMercado, 0) } : {}),
      ...(record.dadosGerais.dataUltValorMercado ? { dataUltValorMercado: record.dadosGerais.dataUltValorMercado, dataUltVlrMercado: record.dadosGerais.dataUltValorMercado } : {}),
    },
    ...(record.areaConstruidaCompl &&
    (record.areaConstruidaCompl.areaPrivativa !== undefined ||
      record.areaConstruidaCompl.areaComum !== undefined ||
      record.areaConstruidaCompl.fraIdeal !== undefined)
      ? {
          AreaConstruidaCompl: {
            ...(record.areaConstruidaCompl.areaPrivativa !== undefined
              ? { areaPrivativa: parseFlexibleNumber(record.areaConstruidaCompl.areaPrivativa, 0) }
              : {}),
            ...(record.areaConstruidaCompl.areaComum !== undefined
              ? { areaComum: parseFlexibleNumber(record.areaConstruidaCompl.areaComum, 0) }
              : {}),
            ...(record.areaConstruidaCompl.fraIdeal !== undefined
              ? { fraIdeal: parseFlexibleNumber(record.areaConstruidaCompl.fraIdeal, 0) }
              : {}),
          },
        }
      : {}),
    EnderecoImovel: {
      tipoLogradouro: parseFlexibleNumber(record.endereco.tipoLogradouro, 250),
      nomeLogradouro: String(record.endereco.nomeLogradouro ?? '').trim(),
      temBairro: parseFlexibleBoolean(record.dadosGerais.temBairro, true),
      bairro: String(record.endereco.bairro ?? '').trim(),
      cep: String(record.endereco.cep ?? '').replace(/\D/g, '').trim(),
      numeroImovel: String(record.endereco.numeroImovel ?? '').trim(),
      ...(record.endereco.complNroImovel ? { complNroImovel: String(record.endereco.complNroImovel).trim() } : {}),
      ...(record.endereco.complEndereco ? { complEndereco: String(record.endereco.complEndereco).trim() } : {}),
    },
    ...(record.titulares && record.titulares.length > 0
      ? {
          Titular: record.titulares
            .filter(t => t && (t.niTitular || t.nomeTitular || t.percTitular !== undefined || t.percTitularidade !== undefined))
            .map(t => {
              const perc = t.percTitular !== undefined ? t.percTitular : t.percTitularidade;
              return {
                ...(t.niTitular ? { niTitular: String(t.niTitular).replace(/\D/g, '').trim() } : {}),
                ...(t.nomeTitular ? { nomeTitular: String(t.nomeTitular).trim() } : {}),
                ...(perc !== undefined && perc !== null && String(perc).trim() !== ''
                  ? { percTitular: parseFlexibleNumber(perc, 0), percTitularidade: parseFlexibleNumber(perc, 0) }
                  : {}),
                ...(t.dtAquisicaoTitular ? { dtAquisicaoTitular: String(t.dtAquisicaoTitular).trim() } : {}),
                ...(t.tipoTitularidade !== undefined && t.tipoTitularidade !== null && Number(t.tipoTitularidade) > 0
                  ? { tipoTitularidade: parseFlexibleNumber(t.tipoTitularidade, 1) }
                  : {}),
                ...(t.docTitularidade !== undefined && t.docTitularidade !== null && Number(t.docTitularidade) > 0
                  ? { docTitularidade: parseFlexibleNumber(t.docTitularidade, 1) }
                  : {}),
              };
            }),
        }
      : {}),
    ...(record.servicoRegistroImovel && Object.values(record.servicoRegistroImovel).some(v => v !== undefined && v !== null && String(v).trim() !== '')
      ? {
          ServicoRegistroImovel: {
            ...(record.servicoRegistroImovel.nomeServentiaRI ? { nomeServentiaRI: String(record.servicoRegistroImovel.nomeServentiaRI).trim() } : {}),
            ...(record.servicoRegistroImovel.cnsRI !== undefined && record.servicoRegistroImovel.cnsRI !== null && String(record.servicoRegistroImovel.cnsRI).trim() !== ''
              ? { cnsRI: parseFlexibleNumber(record.servicoRegistroImovel.cnsRI, 0) }
              : {}),
            ...(record.servicoRegistroImovel.cnmRI ? { cnmRI: String(record.servicoRegistroImovel.cnmRI).trim() } : {}),
            ...(record.servicoRegistroImovel.numMatriculaRI ? { numMatriculaRI: String(record.servicoRegistroImovel.numMatriculaRI).trim() } : {}),
            ...(record.servicoRegistroImovel.numUltimoAtoRI ? { numUltimoAtoRI: String(record.servicoRegistroImovel.numUltimoAtoRI).trim() } : {}),
            ...(record.servicoRegistroImovel.lvCartRI ? { lvCartRI: String(record.servicoRegistroImovel.lvCartRI).trim() } : {}),
            ...(record.servicoRegistroImovel.flCartRI ? { flCartRI: String(record.servicoRegistroImovel.flCartRI).trim() } : {}),
            ...(record.servicoRegistroImovel.dtUltAtualizacao ? { dtUltAtualizacao: String(record.servicoRegistroImovel.dtUltAtualizacao).trim() } : {}),
          },
        }
      : {}),
    ...(record.cartorioNotas && Object.values(record.cartorioNotas).some(v => v !== undefined && v !== null && String(v).trim() !== '')
      ? {
          CartorioNotas: {
            ...(record.cartorioNotas.nomeServentiaNotas ? { nomeServentiaNotas: String(record.cartorioNotas.nomeServentiaNotas).trim() } : {}),
            ...(record.cartorioNotas.cnsNotas !== undefined && record.cartorioNotas.cnsNotas !== null && String(record.cartorioNotas.cnsNotas).trim() !== ''
              ? { cnsNotas: parseFlexibleNumber(record.cartorioNotas.cnsNotas, 0) }
              : {}),
            ...(record.cartorioNotas.lvCartNotas ? { lvCartNotas: String(record.cartorioNotas.lvCartNotas).trim() } : {}),
            ...(record.cartorioNotas.flCartNotas ? { flCartNotas: String(record.cartorioNotas.flCartNotas).trim() } : {}),
          },
        }
      : {}),
    ...(record.itbi && Object.values(record.itbi).some(v => v !== undefined && v !== null && String(v).trim() !== '')
      ? {
          ITBI: {
            ...(record.itbi.baseCalculITBI !== undefined && record.itbi.baseCalculITBI !== null && String(record.itbi.baseCalculITBI).trim() !== ''
              ? { baseCalculITBI: parseFlexibleNumber(record.itbi.baseCalculITBI, 0) }
              : {}),
            ...(record.itbi.valorRefITBI !== undefined && record.itbi.valorRefITBI !== null && String(record.itbi.valorRefITBI).trim() !== ''
              ? { valorRefITBI: parseFlexibleNumber(record.itbi.valorRefITBI, 0) }
              : {}),
            ...(record.itbi.dtTransacaoITBI ? { dtTransacaoITBI: String(record.itbi.dtTransacaoITBI).trim() } : {}),
            ...(record.itbi.tpTransacaoITBI !== undefined && record.itbi.tpTransacaoITBI !== null && String(record.itbi.tpTransacaoITBI).trim() !== ''
              ? { tpTransacaoITBI: parseFlexibleNumber(record.itbi.tpTransacaoITBI, 1) }
              : {}),
            ...(record.itbi.percTransacionadoITBI !== undefined && record.itbi.percTransacionadoITBI !== null && String(record.itbi.percTransacionadoITBI).trim() !== ''
              ? { percTransacionadoITBI: parseFlexibleNumber(record.itbi.percTransacionadoITBI, 0) }
              : {}),
            ...(record.itbi.TransmitenteITBI && record.itbi.TransmitenteITBI.length > 0
              ? {
                  TransmitenteITBI: record.itbi.TransmitenteITBI
                    .filter(t => t && (t.nomeTransmitenteITBI || t.niTransmitenteITBI || t.idTransmitenteITBI))
                    .map(t => {
                      const ni = String(t.niTransmitenteITBI || t.idTransmitenteITBI || '').replace(/\D/g, '').trim();
                      return {
                        ...(t.nomeTransmitenteITBI ? { nomeTransmitenteITBI: String(t.nomeTransmitenteITBI).trim() } : {}),
                        ...(ni ? { idTransmitenteITBI: ni, niTransmitenteITBI: ni } : {}),
                      };
                    }),
                }
              : {}),
            ...(record.itbi.AdquirenteITBI && record.itbi.AdquirenteITBI.length > 0
              ? {
                  AdquirenteITBI: record.itbi.AdquirenteITBI
                    .filter(a => a && (a.nomeAdquirenteITBI || a.niAdquirenteITBI || a.idAdquirenteITBI || a.percTransacAdquirenteITBI !== undefined))
                    .map(a => {
                      const ni = String(a.niAdquirenteITBI || a.idAdquirenteITBI || '').replace(/\D/g, '').trim();
                      return {
                        ...(a.nomeAdquirenteITBI ? { nomeAdquirenteITBI: String(a.nomeAdquirenteITBI).trim() } : {}),
                        ...(ni ? { idAdquirenteITBI: ni, niAdquirenteITBI: ni } : {}),
                        ...(a.percTransacAdquirenteITBI !== undefined && a.percTransacAdquirenteITBI !== null && String(a.percTransacAdquirenteITBI).trim() !== ''
                          ? { percTransacAdquirenteITBI: parseFlexibleNumber(a.percTransacAdquirenteITBI, 0) }
                          : {}),
                      };
                    }),
                }
              : {}),
          },
        }
      : {}),
  };

  if (record.cib && record.cib.trim() !== '') {
    const cibClean = record.cib.trim();
    uiObj.cib = cibClean;
  }

  // Handle Desativação payload if operacao is E/D and desativacao fields are present
  if ((record.operacao === 'E' || record.operacao === 'D') && (record.tipoDesativacao || record.motivoDesativacao)) {
    const desatObj: Record<string, any> = {
      ...(record.codigoIbgeMunicipio ? { codigoIbgeMunicipio: parseFlexibleNumber(record.codigoIbgeMunicipio, 0) } : {}),
      inscricaoImobiliaria: String(record.dadosGerais.inscricaoImobiliaria || '').trim(),
      ...(record.cib ? { cib: String(record.cib).trim() } : {}),
      tipoDesativacao: parseFlexibleNumber(record.tipoDesativacao, 2),
      motivoDesativacao: parseFlexibleNumber(record.motivoDesativacao, 10),
      ...(record.complemento ? { complemento: String(record.complemento).trim() } : {}),
    };
    return JSON.stringify(desatObj);
  }

  // Embed internal status flags when not strict SINTER
  if (includeStatus && record.statusCor && record.statusCor !== 'nenhum') {
    uiObj._statusCor = record.statusCor;
    uiObj.statusCor = record.statusCor;
  }
  if (includeStatus && record.statusNota) {
    uiObj._statusNota = record.statusNota;
    uiObj.statusNota = record.statusNota;
  }

  const finalObject: Record<string, any> = {
    ...(record.cib ? { cib: String(record.cib).trim() } : {}),
    ui: uiObj,
    operacao: record.operacao || 'I',
    ...(includeStatus && record.statusCor && record.statusCor !== 'nenhum'
      ? { _statusCor: record.statusCor, statusCor: record.statusCor }
      : {}),
    ...(includeStatus && record.statusNota
      ? { _statusNota: record.statusNota, statusNota: record.statusNota }
      : {}),
  };

  return JSON.stringify(finalObject);
}

/**
 * Converts array of records into a full NDJSON string format (one line per JSON object).
 */
export function recordsToNDJsonContent(records: NDJsonRecord[], options?: NDJsonExportOptions): string {
  if (!records || records.length === 0) return '';
  return records.map((r) => recordToNDJsonLine(r, options)).join('\n');
}

/**
 * Helper to process a single parsed object from any NDJSON or JSON payload
 */
function processSingleParsedObject(parsed: any, index: number): NDJsonRecord {
  const uiObj = parsed.ui || parsed;
  
  const dg = uiObj.DadosGeraisImovel || uiObj.dadosGeraisImovel || uiObj.dadosGerais || {};
  const end = uiObj.EnderecoImovel || uiObj.enderecoImovel || uiObj.endereco || {};
  const oper = parsed.operacao || uiObj.operacao || 'I';

  // Detect internal status if present in imported file
  const importedStatus = extractAndNormalizeStatusCor(parsed, uiObj, dg);
  const importedNota = extractStatusNota(parsed, uiObj, dg);

  const inscricao = String(dg.inscricaoImobiliaria ?? dg.inscricao ?? '').trim();
  const temBairro = parseFlexibleBoolean(dg.temBairro !== undefined ? dg.temBairro : end.temBairro, true);
  const tipoImovel = parseFlexibleNumber(dg.tipoImovel, 2);
  const tpArquitetonico = parseFlexibleNumber(dg.tpArquitetonico ?? dg['tpArquitetônico'], 2);
  const destinacaoImovel = parseFlexibleNumber(dg.destinacaoImovel, 1);
  const areaTerreno = parseFlexibleNumber(dg.areaTerreno ?? dg['áreaTerreno'], 0);
  const areaConstruida = parseFlexibleNumber(dg.areaConstruida ?? dg['áreaConstruída'], 0);
  const anoConstrutivo = parseFlexibleNumber(dg.anoConstrutivo, 1900);

  const tipoLogradouro = parseFlexibleNumber(end.tipoLogradouro ?? end['tipoLogogradouro'], 250);
  const nomeLogradouro = String(end.nomeLogradouro ?? '').trim();
  const bairro = String(end.bairro ?? '').trim();
  const numeroImovel = String(end.numeroImovel ?? '').trim();
  const complNroImovel = String(end.complNroImovel ?? '').trim();
  const complEndereco = String(end.complEndereco ?? '').trim();
  const cep = String(end.cep ?? '').replace(/\D/g, '').trim();

  const cibVal = parsed.cib || uiObj.cib;
  return {
    id: `imported-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    ...(cibVal ? { cib: String(cibVal).trim() } : {}),
    statusCor: importedStatus,
    statusNota: importedNota,
    dadosGerais: {
      inscricaoImobiliaria: inscricao,
      temBairro,
      tipoImovel,
      tpArquitetonico,
      destinacaoImovel,
      areaTerreno,
      areaConstruida,
      anoConstrutivo,
      ...(dg.idParcela ? { idParcela: String(dg.idParcela) } : {}),
      ...(tipoImovel === 3 && dg.bice !== undefined ? { bice: parseFlexibleNumber(dg.bice, 1) } : {}),
      ...(dg.valorVenal !== undefined ? { valorVenal: parseFlexibleNumber(dg.valorVenal, 0) } : {}),
      ...(dg.dtUltimoValorVenal ? { dtUltimoValorVenal: String(dg.dtUltimoValorVenal) } : {}),
      ...(dg.padraoConstrutivo !== undefined ? { padraoConstrutivo: parseFlexibleNumber(dg.padraoConstrutivo, 1) } : {}),
      ...(dg.qtdGaragem !== undefined ? { qtdGaragem: parseFlexibleNumber(dg.qtdGaragem, 0) } : {}),
      ...(dg.temPiscina !== undefined ? { temPiscina: parseFlexibleBoolean(dg.temPiscina, false) } : {}),
      ...(dg.valorRefMercado !== undefined ? { valorRefMercado: parseFlexibleNumber(dg.valorRefMercado, 0) } : {}),
      ...(dg.dataUltValorMercado || dg.dataUltVlrMercado ? { dataUltValorMercado: String(dg.dataUltValorMercado || dg.dataUltVlrMercado) } : {}),
    },
    endereco: {
      tipoLogradouro,
      nomeLogradouro,
      bairro,
      numeroImovel,
      complNroImovel,
      complEndereco,
      cep,
    },
    operacao: String(oper),
    ...(parsed.codigoIbgeMunicipio !== undefined ? { codigoIbgeMunicipio: parseFlexibleNumber(parsed.codigoIbgeMunicipio, 0) } : {}),
    ...(parsed.tipoDesativacao !== undefined ? { tipoDesativacao: parseFlexibleNumber(parsed.tipoDesativacao, 1) } : {}),
    ...(parsed.motivoDesativacao !== undefined ? { motivoDesativacao: parseFlexibleNumber(parsed.motivoDesativacao, 1) } : {}),
    ...(parsed.complemento !== undefined ? { complemento: String(parsed.complemento) } : {}),
    ...(uiObj.AreaConstruidaCompl || uiObj.areaConstruidaCompl ? { areaConstruidaCompl: uiObj.AreaConstruidaCompl || uiObj.areaConstruidaCompl } : {}),
    ...(uiObj.Titular || uiObj.titular || uiObj.titulares ? { titulares: uiObj.Titular || uiObj.titular || uiObj.titulares } : {}),
    ...(uiObj.ServicoRegistroImovel || uiObj.servicoRegistroImovel ? { servicoRegistroImovel: uiObj.ServicoRegistroImovel || uiObj.servicoRegistroImovel } : {}),
    ...(uiObj.CartorioNotas || uiObj.cartorioNotas ? { cartorioNotas: uiObj.CartorioNotas || uiObj.cartorioNotas } : {}),
    ...(uiObj.ITBI || uiObj.itbi ? { itbi: uiObj.ITBI || uiObj.itbi } : {}),
  };
}

/**
 * Parses raw NDJSON text into NDJsonRecord array.
 * Supports flexible key detection and fixes accented/misspelled keys automatically.
 */
export function parseNDJsonContent(content: string): { records: NDJsonRecord[]; errors: string[] } {
  const records: NDJsonRecord[] = [];
  const errors: string[] = [];

  const rawTrimmed = content.trim();
  if (!rawTrimmed) return { records, errors };

  // Check if user pasted/uploaded a JSON array [ {...}, {...} ]
  if (rawTrimmed.startsWith('[') && rawTrimmed.endsWith(']')) {
    try {
      const san = rawTrimmed
        .replace(/:\s*verdadeiro\b/gi, ': true')
        .replace(/:\s*falso\b/gi, ': false');
      const arr = JSON.parse(san);
      if (Array.isArray(arr)) {
        arr.forEach((item, idx) => {
          if (item && typeof item === 'object') {
            records.push(processSingleParsedObject(item, idx));
          }
        });
        return { records, errors };
      }
    } catch {
      // Fallback to line-by-line parsing below
    }
  }

  // Check if user pasted/uploaded a SINTER response object { registros: [...] }
  if (rawTrimmed.startsWith('{') && rawTrimmed.endsWith('}') && (rawTrimmed.includes('"registros"') || rawTrimmed.includes('"uis"'))) {
    try {
      const san = rawTrimmed
        .replace(/:\s*verdadeiro\b/gi, ': true')
        .replace(/:\s*falso\b/gi, ': false');
      const obj = JSON.parse(san);
      const list = obj.registros || obj.uis;
      if (Array.isArray(list)) {
        list.forEach((item, idx) => {
          if (item && typeof item === 'object') {
            records.push(processSingleParsedObject(item, idx));
          }
        });
        return { records, errors };
      }
    } catch {
      // Fallback to line-by-line
    }
  }

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return; // ignore empty lines

    try {
      // Clean up common bad json copy-pastes like "verdadeiro", "falso"
      const san = trimmed
        .replace(/:\s*verdadeiro\b/gi, ': true')
        .replace(/:\s*falso\b/gi, ': false');

      const parsed = JSON.parse(san);
      records.push(processSingleParsedObject(parsed, index));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Linha ${index + 1}: Formato JSON inválido (${errorMsg})`);
    }
  });

  return { records, errors };
}

/**
 * Downloads a string content as a file in the browser.
 */
export function downloadFile(content: string, filename: string = 'imoveis.ndjson') {
  const blob = new Blob([content], { type: 'application/x-ndjson;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ndjson') ? filename : `${filename}.ndjson`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats CEP string cleanly (eg. "45653758" -> "45653-758")
 */
export function formatCepDisplay(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
}
