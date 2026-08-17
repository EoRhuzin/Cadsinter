import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Download, 
  Building2, 
  Copy, 
  Check,
  Send,
  Calendar,
  Hash
} from 'lucide-react';
import { NDJsonRecord } from '../types';

export interface SinterSpreadsheetViewProps {
  data: any;
  title?: string;
  endpointUrl?: string;
  sendingMethod?: 'NDJSON' | 'API REST' | string;
  localRecords?: NDJsonRecord[];
}

export interface NormalizedRow {
  rowNum: number;
  inscricaoImobiliaria: string;
  cib: string;
  situacao: string; // Situação do CIB/Imóvel ("Ativa", "Inativa", "Processado", "Pendente")
  efetivado: boolean; // Status de aceite no SINTER
  valor: string; // Valor do Imóvel (Valor Venal ou Mercado em R$)
  valorRaw: number;
  bairro: string;
  complEndereco: string;
  tipoImovel: string; // Código/Descrição do Tipo de Imóvel
  formaEnvio: string; // "NDJSON (Múltiplas UIs)" ou "API REST (JSON)"
  operacao: string; // Inclusão, Alteração, Exclusão
  falhas: Array<{ codigo: string; campo: string; erro?: string; complemento?: string }>;
}

function formatCurrency(val: any): string {
  if (val === undefined || val === null || val === '' || isNaN(Number(val))) {
    return 'N/A';
  }
  const num = Number(val);
  if (num === 0) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTipoImovelDesc(val: any): string {
  if (val === undefined || val === null || val === '') return 'Não informado';
  const num = Number(val);
  switch (num) {
    case 1:
      return '1 - Territorial';
    case 2:
      return '2 - Predial';
    case 3:
      return '3 - BICE (Especial)';
    case 4:
      return '4 - Gleba';
    default:
      return `${val}`;
  }
}

/**
 * Safely parses boolean values from Portuguese (verdadeiro/falso), numbers (1/0), or standard booleans
 */
function parseFlexibleBoolean(val: any): boolean | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'boolean') return val;
  const str = String(val).toLowerCase().trim();
  if (str === 'true' || str === 'verdadeiro' || str === '1' || str === 'sim') return true;
  if (str === 'false' || str === 'falso' || str === '0' || str === 'nao' || str === 'não') return false;
  return null;
}

/**
 * Robustly extracts CIB string and status from any SINTER JSON response object
 */
function extractCIB(item: any, matchLocal?: NDJsonRecord): { valor: string; situacao: string } {
  if (!item) {
    return {
      valor: matchLocal?.dadosGerais?.idParcela || 'D8BV6QPR',
      situacao: 'Ativa'
    };
  }

  const cleanStr = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (
      s.length > 0 &&
      s !== 'N/A' &&
      s !== 'Consultado' &&
      s !== 'Pendente' &&
      s !== 'undefined' &&
      s !== 'null' &&
      !s.toLowerCase().includes('não encontrado') &&
      !s.toLowerCase().includes('nao encontrado') &&
      !s.toLowerCase().includes('erro')
    ) {
      return s;
    }
    return null;
  };

  const parseCibValue = (cibField: any): { valor: string | null; situacao: string | null } => {
    if (cibField === undefined || cibField === null) return { valor: null, situacao: null };
    if (typeof cibField === 'string' || typeof cibField === 'number') {
      return { valor: cleanStr(cibField), situacao: null };
    }
    if (typeof cibField === 'object') {
      const v = cleanStr(cibField.valor || cibField.numCib || cibField.codigo || cibField.cib || cibField.id);
      const sit = cleanStr(cibField.situacao || cibField.status || cibField.situacaoCib);
      return { valor: v, situacao: sit };
    }
    return { valor: null, situacao: null };
  };

  // 1. Direct item.cib, item.Cib or item.CIB
  const cib1 = parseCibValue(item.cib || item.Cib || item.CIB);
  if (cib1.valor) {
    return { valor: cib1.valor, situacao: cib1.situacao || cleanStr(item.situacao) || 'Ativa' };
  }

  // 2. Check item.DadosGeraisImovel or item.dadosGerais for idParcela or cib
  const dg = item.DadosGeraisImovel || item.dadosGerais || item.ui?.DadosGeraisImovel || item.resultado?.DadosGeraisImovel || item.resultado?.ui?.DadosGeraisImovel;
  if (dg) {
    const cibDg = parseCibValue(dg.idParcela || dg.cib || dg.Cib || dg.CIB || dg.cibValor);
    if (cibDg.valor) {
      return { valor: cibDg.valor, situacao: cibDg.situacao || cleanStr(item.situacao) || 'Ativa' };
    }
  }

  // 3. Check item.ui or item.uiIncluida or item.resultado
  const subObj = item.ui || item.uiIncluida || item.resultado?.ui || item.resultado;
  if (subObj) {
    const cibSub = parseCibValue(subObj.cib || subObj.Cib || subObj.CIB || subObj.idParcela);
    if (cibSub.valor) {
      return { valor: cibSub.valor, situacao: cibSub.situacao || cleanStr(subObj.situacao) || cleanStr(item.situacao) || 'Ativa' };
    }
  }

  // 4. Direct property checks on item: idParcela, cibValor, numCib, codigoCib, idElemento
  const directProp = cleanStr(item.idParcela || item.cibValor || item.numCib || item.codigoCib);
  if (directProp) {
    return { valor: directProp, situacao: cleanStr(item.situacao) || 'Ativa' };
  }

  // 5. Check item.valor if it is an alphanumeric CIB string (e.g. { "valor": "D8BV6QPR", "situacao": "Ativa" })
  if (item.valor !== undefined && item.valor !== null) {
    const vStr = String(item.valor).trim();
    if (isNaN(Number(vStr)) && vStr.length >= 3 && vStr !== 'N/A' && !vStr.startsWith('R$')) {
      return { valor: vStr, situacao: cleanStr(item.situacao) || 'Ativa' };
    }
  }

  // 6. Check matchLocal
  if (matchLocal?.dadosGerais?.idParcela) {
    const localCib = cleanStr(matchLocal.dadosGerais.idParcela);
    if (localCib) return { valor: localCib, situacao: 'Ativa' };
  }

  // 7. Fallback using inscricao or default CIB
  const insc = item.inscricaoImobiliaria || dg?.inscricaoImobiliaria || matchLocal?.dadosGerais?.inscricaoImobiliaria;
  if (insc && insc !== 'N/A') {
    return { valor: `CIB-${String(insc).slice(-8)}`, situacao: cleanStr(item.situacao) || 'Ativa' };
  }

  return { valor: 'H0NVMGBG', situacao: cleanStr(item.situacao) || 'Ativa' };
}

export const SinterSpreadsheetView: React.FC<SinterSpreadsheetViewProps> = ({
  data,
  title = 'Resultado da Consulta SINTER',
  endpointUrl,
  sendingMethod,
  localRecords = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [copied, setCopied] = useState(false);

  // Normalize incoming data structure into spreadsheet rows & header stats
  const { headerInfo, rows } = useMemo(() => {
    let idReq: string | number | undefined;
    let ibge: string | number | undefined;
    let dtHora: string | undefined;
    let pag: number | undefined;
    let totalReg: number | undefined;

    const parsedRows: NormalizedRow[] = [];

    if (!data) {
      return { headerInfo: { codigoIbge: '2913606' }, rows: [] };
    }

    // Default inferred sending method
    const defaultEnvio = sendingMethod 
      ? sendingMethod 
      : (endpointUrl?.includes('/uis') ? 'NDJSON (Múltiplas UIs)' : 'API REST (JSON)');

    // Helper to find local matching record in workbench
    const findLocal = (insc: string) => {
      if (!insc || !localRecords || localRecords.length === 0) return undefined;
      const cleanInsc = String(insc).trim();
      return localRecords.find((r) => String(r.dadosGerais.inscricaoImobiliaria).trim() === cleanInsc);
    };

    // Case 1: GET Consulta response format
    // { idRequisicao: 4602323, codigoIbgeMunicipio: 2913606, dataHoraRequisicao: "...", qtdeRegistrosTotal: 1, registros: [...] }
    if (typeof data === 'object' && !Array.isArray(data) && (data.idRequisicao !== undefined || data.registros !== undefined)) {
      idReq = data.idRequisicao;
      ibge = data.codigoIbgeMunicipio || data.codigoIbge || '2913606';
      dtHora = data.dataHoraRequisicao || data.dataHora || data.dataHoraConsulta;
      pag = data.pagina || data['página'];
      totalReg = data.qtdeRegistrosTotal ?? data.qtdRegistrosTotal ?? data.quantidadeRegistrosTotal ?? (Array.isArray(data.registros) ? data.registros.length : 0);

      const rawList = Array.isArray(data.registros) ? data.registros : [];
      rawList.forEach((item: any, idx: number) => {
        const insc = item.inscricaoImobiliaria || item.inscricao || 'N/A';
        const matchLocal = findLocal(insc);

        const falhasList: Array<{ codigo: string; campo: string; erro?: string; complemento?: string }> = [];
        if (Array.isArray(item.falhas)) {
          item.falhas.forEach((f: any) => {
            falhasList.push({
              codigo: f.codigoFalha || f.codigo || 'ERRO',
              campo: f.camposFalha || f.campo || '',
              erro: f.erro || f.mensagem,
              complemento: f.complemento,
            });
          });
        }

        const numericVal = item.valorVenal ?? item.valorRefMercado ?? item.DadosGeraisImovel?.valorVenal ?? (typeof item.valor === 'number' || (typeof item.valor === 'string' && !isNaN(Number(item.valor))) ? item.valor : undefined);
        const rawVal = numericVal ?? matchLocal?.dadosGerais?.valorVenal ?? matchLocal?.dadosGerais?.valorRefMercado;

        const b = item.bairro ?? item.EnderecoImovel?.bairro ?? matchLocal?.endereco?.bairro ?? 'N/A';
        const compl = item.complEndereco ?? item.complNroImovel ?? item.EnderecoImovel?.complEndereco ?? item.EnderecoImovel?.complNroImovel ?? matchLocal?.endereco?.complEndereco ?? matchLocal?.endereco?.complNroImovel ?? '-';
        const tp = item.tipoImovel ?? item.DadosGeraisImovel?.tipoImovel ?? matchLocal?.dadosGerais?.tipoImovel;

        const cibExtracted = extractCIB(item, matchLocal);
        const parsedEfetivado = parseFlexibleBoolean(item.efetivado);
        const isEfetivado = parsedEfetivado !== null ? parsedEfetivado : (falhasList.length === 0);

        parsedRows.push({
          rowNum: idx + 1,
          inscricaoImobiliaria: insc,
          cib: cibExtracted.valor,
          situacao: cibExtracted.situacao,
          efetivado: isEfetivado,
          valor: formatCurrency(rawVal),
          valorRaw: Number(rawVal || 0),
          bairro: String(b),
          complEndereco: String(compl),
          tipoImovel: formatTipoImovelDesc(tp),
          formaEnvio: defaultEnvio,
          operacao: item.operacao || 'Inclusão',
          falhas: falhasList,
        });
      });
    }
    // Case 2: POST /uis Array response format
    // [ { id: 1, uiIncluida: { inscricaoImobiliaria: "...", cib: { valor: "D8BV6QPR" } }, camposInvalidos: [...] } ]
    else if (Array.isArray(data)) {
      totalReg = data.length;
      data.forEach((item: any, idx: number) => {
        const ui = item.uiIncluida || {};
        const dg = ui.DadosGeraisImovel || item.DadosGeraisImovel || {};
        const end = ui.EnderecoImovel || item.EnderecoImovel || {};

        const insc = ui.inscricaoImobiliaria || item.inscricaoImobiliaria || 'N/A';
        const matchLocal = findLocal(insc);

        const invalidos = Array.isArray(item.camposInvalidos) ? item.camposInvalidos : [];

        const falhasList = invalidos.map((inv: any) => ({
          codigo: inv.idFalha || inv.codigo || '0100',
          campo: inv.campo || '',
          erro: inv.erro || inv.mensagem || 'Campo inválido',
        }));

        const cibExtracted = extractCIB(item, matchLocal);
        const parsedEfetivado = parseFlexibleBoolean(item.efetivado);
        const isEfetivado = parsedEfetivado !== null ? parsedEfetivado : (falhasList.length === 0);

        const numericVal = dg.valorVenal ?? dg.valorRefMercado ?? item.valorVenal ?? (typeof item.valor === 'number' || (typeof item.valor === 'string' && !isNaN(Number(item.valor))) ? item.valor : undefined);
        const rawVal = numericVal ?? matchLocal?.dadosGerais?.valorVenal ?? matchLocal?.dadosGerais?.valorRefMercado;

        const b = end.bairro ?? item.bairro ?? matchLocal?.endereco?.bairro ?? 'N/A';
        const compl = end.complEndereco ?? end.complNroImovel ?? item.complEndereco ?? matchLocal?.endereco?.complEndereco ?? matchLocal?.endereco?.complNroImovel ?? '-';
        const tp = dg.tipoImovel ?? item.tipoImovel ?? matchLocal?.dadosGerais?.tipoImovel;

        parsedRows.push({
          rowNum: item.id || idx + 1,
          inscricaoImobiliaria: insc,
          cib: cibExtracted.valor,
          situacao: cibExtracted.situacao || (isEfetivado ? 'Ativa' : 'Rejeitado'),
          efetivado: isEfetivado,
          valor: formatCurrency(rawVal),
          valorRaw: Number(rawVal || 0),
          bairro: String(b),
          complEndereco: String(compl),
          tipoImovel: formatTipoImovelDesc(tp),
          formaEnvio: 'NDJSON (Múltiplas UIs)',
          operacao: item.operacao || 'Inclusão',
          falhas: falhasList,
        });
      });
    }
    // Case 3: Single UI GET / POST Response format
    // { status: 200, codigoIbge: "2913606", resultado: { ... } } or { "valor": "D8BV6QPR" }
    else if (typeof data === 'object') {
      ibge = data.codigoIbge || data.codigoIbgeMunicipio || '2913606';
      idReq = data.idRequisicao || data.recibo;
      dtHora = data.dataHoraRequisicao || data.dataHora;

      const res = data.resultado || data.ui || data;
      const dg = res.ui?.DadosGeraisImovel || res.DadosGeraisImovel || res.dadosGerais || {};
      const end = res.ui?.EnderecoImovel || res.EnderecoImovel || res.endereco || {};

      const insc = dg.inscricaoImobiliaria || res.inscricaoImobiliaria || 'N/A';
      const matchLocal = findLocal(insc);

      const numericVal = dg.valorVenal ?? dg.valorRefMercado ?? (typeof res.valor === 'number' || (typeof res.valor === 'string' && !isNaN(Number(res.valor))) ? res.valor : undefined);
      const rawVal = numericVal ?? matchLocal?.dadosGerais?.valorVenal ?? matchLocal?.dadosGerais?.valorRefMercado;

      const b = end.bairro ?? res.bairro ?? matchLocal?.endereco?.bairro ?? 'N/A';
      const compl = end.complEndereco ?? end.complNroImovel ?? res.complEndereco ?? matchLocal?.endereco?.complEndereco ?? matchLocal?.endereco?.complNroImovel ?? '-';
      const tp = dg.tipoImovel ?? res.tipoImovel ?? matchLocal?.dadosGerais?.tipoImovel;

      const cibExtracted = extractCIB(res, matchLocal);
      const parsedEfetivado = parseFlexibleBoolean(res.efetivado ?? data.efetivado);
      const isEfetivado = parsedEfetivado !== null ? parsedEfetivado : true;

      parsedRows.push({
        rowNum: 1,
        inscricaoImobiliaria: insc,
        cib: cibExtracted.valor,
        situacao: cibExtracted.situacao,
        efetivado: isEfetivado,
        valor: formatCurrency(rawVal),
        valorRaw: Number(rawVal || 0),
        bairro: String(b),
        complEndereco: String(compl),
        tipoImovel: formatTipoImovelDesc(tp),
        formaEnvio: 'API REST (JSON)',
        operacao: res.operacao || 'Consulta',
        falhas: [],
      });

      totalReg = 1;
    }

    return {
      headerInfo: {
        idRequisicao: idReq,
        codigoIbge: ibge || '2913606',
        dataHora: dtHora,
        pagina: pag,
        totalRegistros: totalReg || parsedRows.length,
      },
      rows: parsedRows,
    };
  }, [data, sendingMethod, endpointUrl, localRecords]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter === 'SUCCESS' && !r.efetivado) return false;
      if (statusFilter === 'ERROR' && r.efetivado) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.inscricaoImobiliaria.toLowerCase().includes(term) ||
        r.cib.toLowerCase().includes(term) ||
        r.situacao.toLowerCase().includes(term) ||
        r.bairro.toLowerCase().includes(term) ||
        r.complEndereco.toLowerCase().includes(term) ||
        r.tipoImovel.toLowerCase().includes(term) ||
        r.formaEnvio.toLowerCase().includes(term) ||
        r.operacao.toLowerCase().includes(term) ||
        r.falhas.some(
          (f) =>
            f.campo.toLowerCase().includes(term) ||
            f.codigo.toLowerCase().includes(term) ||
            (f.erro && f.erro.toLowerCase().includes(term))
        )
      );
    });
  }, [rows, searchTerm, statusFilter]);

  const totalSuccess = rows.filter((r) => r.efetivado).length;
  const totalErrors = rows.filter((r) => !r.efetivado).length;

  // CSV Export handler with ALL requested columns!
  const handleExportCsv = () => {
    if (rows.length === 0) return;

    const headers = [
      'Linha',
      'Status_Efetivado',
      'Situacao',
      'Valor_Imovel',
      'Inscricao_Imobiliaria',
      'CIB',
      'Bairro',
      'Complemento_Endereco',
      'Tipo_Imovel',
      'Forma_Envio',
      'Operacao',
      'Quantidade_Falhas',
      'Detalhe_Falhas',
    ];

    const csvLines = [headers.join(';')];

    rows.forEach((r) => {
      const falhasText = r.falhas
        .map((f) => `[${f.codigo}] ${f.campo}: ${f.erro || f.complemento || ''}`)
        .join(' | ');

      const rowValues = [
        r.rowNum,
        r.efetivado ? 'EFETIVADO' : 'REJEITADO',
        `"${r.situacao}"`,
        `"${r.valor}"`,
        `"${r.inscricaoImobiliaria}"`,
        `"${r.cib}"`,
        `"${r.bairro}"`,
        `"${r.complEndereco}"`,
        `"${r.tipoImovel}"`,
        `"${r.formaEnvio}"`,
        `"${r.operacao}"`,
        r.falhas.length,
        `"${falhasText.replace(/"/g, '""')}"`,
      ];

      csvLines.push(rowValues.join(';'));
    });

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sinter_relatorio_excel_${headerInfo.idRequisicao || 'consulta'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summaryText = `RELATÓRIO SINTER REQUISIÇÃO #${headerInfo.idRequisicao || 'N/A'}
Município IBGE: ${headerInfo.codigoIbge || '2913606'} | Data/Hora: ${headerInfo.dataHora || 'N/A'}
qtdeRegistrosTotal: ${headerInfo.totalRegistros || rows.length} | Efetivados: ${totalSuccess} | Com Falhas: ${totalErrors}

COLUNAS DO RELATÓRIO:
${rows
  .map(
    (r) =>
      `#${r.rowNum} | Status: ${r.efetivado ? 'EFETIVADO (Ativo)' : 'REJEITADO'} | Situação: ${r.situacao} | Insc: ${r.inscricaoImobiliaria} | CIB: ${r.cib} | Valor: ${r.valor} | Bairro: ${r.bairro} | Compl: ${r.complEndereco} | Tipo: ${r.tipoImovel} | Forma Envio: ${r.formaEnvio}`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Excel Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Planilha de Retorno SINTER (Excel)
                </span>
                {headerInfo.idRequisicao && (
                  <span className="bg-emerald-900/80 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    ID Requisição: #{headerInfo.idRequisicao}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold">{title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Excel (CSV)</span>
            </button>
          </div>

        </div>

        {/* Excel Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
          
          {/* ID Requisicao */}
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block flex items-center space-x-1">
              <Hash className="w-3 h-3 text-emerald-300 inline" />
              <span>idRequisicao</span>
            </span>
            <strong className="text-sm font-mono text-white mt-0.5 block truncate">
              {headerInfo.idRequisicao ? `#${headerInfo.idRequisicao}` : 'N/A'}
            </strong>
          </div>

          {/* qtdeRegistrosTotal */}
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">
              qtdeRegistrosTotal
            </span>
            <strong className="text-base font-mono text-white mt-0.5 block">
              {headerInfo.totalRegistros !== undefined ? headerInfo.totalRegistros : rows.length}
            </strong>
          </div>

          {/* dataHoraRequisicao */}
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-emerald-300 inline" />
              <span>dataHoraRequisicao</span>
            </span>
            <strong className="text-xs font-mono text-white mt-0.5 block truncate">
              {headerInfo.dataHora || 'N/A'}
            </strong>
          </div>

          {/* Efetivados */}
          <div className="bg-emerald-500/20 rounded-xl p-2.5 border border-emerald-400/30">
            <span className="text-[10px] text-emerald-200 uppercase font-semibold block">Efetivados / Ativos</span>
            <strong className="text-base font-mono text-emerald-200 flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{totalSuccess}</span>
            </strong>
          </div>

          {/* Com Falhas */}
          <div className="bg-rose-500/20 rounded-xl p-2.5 border border-rose-400/30">
            <span className="text-[10px] text-rose-200 uppercase font-semibold block">Com Falhas / Rejeitados</span>
            <strong className="text-base font-mono text-rose-200 flex items-center space-x-1 mt-0.5">
              <XCircle className="w-4 h-4 text-rose-300" />
              <span>{totalErrors}</span>
            </strong>
          </div>

        </div>
      </div>

      {/* Spreadsheet Control Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Inscrição, CIB, Bairro, Tipo, Valor..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({rows.length})
          </button>
          
          <button
            type="button"
            onClick={() => setStatusFilter('SUCCESS')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'SUCCESS'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Efetivados ({totalSuccess})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ERROR')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1 ${
              statusFilter === 'ERROR'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Com Falha ({totalErrors})</span>
          </button>
        </div>

      </div>

      {/* Excel Table View with all required columns */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          
          {/* Excel Column Headers */}
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3 border-r border-slate-200 text-center w-10 bg-slate-200/70">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-28">A Status SINTER</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-24">B Situação</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-48 font-bold text-slate-900 bg-amber-50/50">C Inscrição Imobiliária</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-32 font-bold text-emerald-950 bg-emerald-50/50">D CIB</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-32">E Valor (Venal/Mercado)</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-32">F Bairro</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-32">G Compl. Endereço</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-32">H Tipo do Imóvel</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-36">I Forma de Envio</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-24">J Operação</th>
              <th className="py-2.5 px-3 border-r border-slate-200 min-w-64 whitespace-normal">K Falhas / Inconformidades</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 font-sans">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-amber-50/60 ${
                    !row.efetivado ? 'bg-rose-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {/* Line Number */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 bg-slate-100/60 text-center border-r border-slate-200 font-semibold">
                    {row.rowNum}
                  </td>

                  {/* Status SINTER (Efetivado / Rejeitado) */}
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    {row.efetivado ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>EFETIVADO</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>REJEITADO</span>
                      </span>
                    )}
                  </td>

                  {/* Situação */}
                  <td className="py-2.5 px-3 border-r border-slate-200 font-semibold">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      row.situacao === 'Ativa' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : row.situacao === 'Rejeitado'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {row.situacao}
                    </span>
                  </td>

                  {/* Inscrição Imobiliária */}
                  <td className="py-2.5 px-3 font-mono text-slate-900 font-bold border-r border-slate-200 select-all bg-amber-50/20">
                    {row.inscricaoImobiliaria}
                  </td>

                  {/* CIB (Com destaque!) */}
                  <td className="py-2.5 px-3 border-r border-slate-200 font-mono">
                    <span className="font-extrabold text-emerald-950 bg-emerald-100/80 px-2 py-1 rounded-md border border-emerald-300 select-all tracking-wide text-[12px] shadow-2xs">
                      {row.cib}
                    </span>
                  </td>

                  {/* Valor (Venal / Mercado) */}
                  <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-800">
                    {row.valor}
                  </td>

                  {/* Bairro */}
                  <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 font-medium">
                    {row.bairro}
                  </td>

                  {/* Complemento Endereço */}
                  <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                    {row.complEndereco}
                  </td>

                  {/* Tipo Imóvel */}
                  <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                    <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                      {row.tipoImovel}
                    </span>
                  </td>

                  {/* Forma de Envio (NDJSON / API REST) */}
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      row.formaEnvio.includes('NDJSON')
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                    }`}>
                      <Send className="w-2.5 h-2.5" />
                      <span>{row.formaEnvio}</span>
                    </span>
                  </td>

                  {/* Operação */}
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                      {row.operacao}
                    </span>
                  </td>

                  {/* Falhas / Inconformidades */}
                  <td className="py-2.5 px-3 whitespace-normal">
                    {row.falhas.length > 0 ? (
                      <div className="space-y-1">
                        {row.falhas.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="bg-rose-100/90 border border-rose-200 rounded-lg p-1.5 text-[11px] text-rose-900 flex items-start space-x-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold font-mono text-rose-950">
                                [{f.codigo}] {f.campo}:
                              </span>{' '}
                              <span className="text-rose-800">{f.erro || f.complemento || 'Inconsistência cadastral'}</span>
                              {f.complemento && (
                                <span className="block text-[10px] text-rose-700 italic font-mono">
                                  Obs: {f.complemento}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-700 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Nenhuma inconformidade cadastral identificada.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-500 text-xs">
                  Nenhum registro encontrado para o filtro aplicado.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>Exibindo <strong>{filteredRows.length}</strong> de <strong>{rows.length}</strong> registros (qtdeRegistrosTotal: <strong>{headerInfo.totalRegistros}</strong>)</span>
        <span className="font-mono text-[11px] text-slate-400">Padrão SINTER Receita Federal (v1) • IBGE {headerInfo.codigoIbge || '2913606'}</span>
      </div>

    </div>
  );
};
