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
/**
 * Serializes a single record to an exact SINTER JSON string line for POST /api/v1/{codigoIbge}/uis
 * Wraps payload in 'ui' object with 'operacao' string ('I', 'A', 'E').
 */
export function recordToNDJsonLine(record: NDJsonRecord): string {
  // If record carries rawSinterData from import, use or wrap it
  if (record.rawSinterData && Object.keys(record.rawSinterData).length > 0) {
    if (record.rawSinterData.ui && record.rawSinterData.operacao) {
      return JSON.stringify(record.rawSinterData);
    }
    return JSON.stringify({
      ui: record.rawSinterData.ui || record.rawSinterData,
      operacao: record.rawSinterData.operacao || record.operacao || 'I',
    });
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

  const finalObject: Record<string, any> = {
    ...(record.cib ? { cib: String(record.cib).trim() } : {}),
    ui: uiObj,
    operacao: record.operacao || 'I',
  };

  return JSON.stringify(finalObject);
}

/**
 * Converts array of records into a full NDJSON string format (one line per JSON object).
 */
export function recordsToNDJsonContent(records: NDJsonRecord[]): string {
  if (!records || records.length === 0) return '';
  return records.map(recordToNDJsonLine).join('\n');
}

/**
 * Parses raw NDJSON text into NDJsonRecord array.
 * Supports flexible key detection and fixes accented/misspelled keys automatically.
 */
export function parseNDJsonContent(content: string): { records: NDJsonRecord[]; errors: string[] } {
  const lines = content.split(/\r?\n/);
  const records: NDJsonRecord[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return; // ignore empty lines

    try {
      // Clean up common bad json copy-pastes like "verdadeiro", "falso"
      const san = trimmed
        .replace(/:\s*verdadeiro\b/gi, ': true')
        .replace(/:\s*falso\b/gi, ': false');

      const parsed = JSON.parse(san);
      const uiObj = parsed.ui || parsed;
      
      const dg = uiObj.DadosGeraisImovel || uiObj.dadosGeraisImovel || uiObj.dadosGerais || {};
      const end = uiObj.EnderecoImovel || uiObj.enderecoImovel || uiObj.endereco || {};
      const oper = parsed.operacao || uiObj.operacao || 'I';

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
      const rec: NDJsonRecord = {
        id: `imported-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        ...(cibVal ? { cib: String(cibVal).trim() } : {}),
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

      records.push(rec);
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
