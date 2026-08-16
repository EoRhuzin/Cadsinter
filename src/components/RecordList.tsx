import React, { useState } from 'react';
import { NDJsonRecord } from '../types';
import { formatCepDisplay } from '../utils/ndjson';
import { validateNDJsonRecord } from '../utils/validation';
import {
  TIPO_LOGRADOURO_OPTIONS,
  TIPO_IMOVEL_OPTIONS,
  TP_ARQUITETONICO_OPTIONS,
  DESTINACAO_IMOVEL_OPTIONS,
} from '../constants';
import {
  Search,
  Trash2,
  Copy,
  Edit2,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  Sparkles,
  ListOrdered,
  Download,
  Globe,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Users,
  Layers,
  Sliders,
} from 'lucide-react';

interface RecordListProps {
  records: NDJsonRecord[];
  onDeleteRecord: (id: string) => void;
  onDuplicateRecord: (record: NDJsonRecord) => void;
  onEditRecord: (record: NDJsonRecord) => void;
  onUpdateRecordField?: (id: string, path: string, value: any) => void;
  onMoveRecord: (index: number, direction: 'up' | 'down') => void;
  onLoadSamples: () => void;
  onClearAll?: () => void;
  onDownload?: () => void;
  onOpenApi?: () => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  onDeleteRecord,
  onDuplicateRecord,
  onEditRecord,
  onUpdateRecordField,
  onMoveRecord,
  onLoadSamples,
  onClearAll,
  onDownload,
  onOpenApi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter records based on search
  const filteredRecords = records.filter((rec) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const insc = rec.dadosGerais.inscricaoImobiliaria.toLowerCase();
    const logr = rec.endereco.nomeLogradouro.toLowerCase();
    const compl = rec.endereco.complNroImovel.toLowerCase();
    const complEnd = rec.endereco.complEndereco.toLowerCase();
    const bairro = rec.endereco.bairro.toLowerCase();

    return (
      insc.includes(term) ||
      logr.includes(term) ||
      compl.includes(term) ||
      complEnd.includes(term) ||
      bairro.includes(term)
    );
  });

  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-2">
          <ListOrdered className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Nenhum registro adicionado ainda
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Preencha o formulário acima e clique em <strong className="text-indigo-600 font-semibold">Incluir Registro no JSON</strong> para iniciar a lista, ou utilize o botão de inclusão em lote.
        </p>
        <div>
          <button
            type="button"
            onClick={onLoadSamples}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Carregar 3 Registros de Exemplo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
      
      {/* Table Bar */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Lista de Registros no JSON</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                {records.length} {records.length === 1 ? 'item' : 'itens'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Registros em lote exibem inline apenas as opções selecionadas para alteração; registros individuais exibem o resumo completo.
            </p>
          </div>
        </div>

        {/* Search & Actions toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search input */}
          <div className="w-full sm:w-56 relative">
            <input
              type="text"
              placeholder="Buscar por inscrição, endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Send via API button */}
          {onOpenApi && (
            <button
              type="button"
              onClick={onOpenApi}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Abrir painel de envio por API REST (SINTER/CADURB)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Enviar por API</span>
            </button>
          )}

          {/* Download button */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Baixar todos os registros em formato .ndjson"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .ndjson</span>
            </button>
          )}

          {/* Clear List button */}
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Limpar todos os registros da lista"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Limpar Lista</span>
            </button>
          )}
        </div>

      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 w-40">Inscrição</th>
              <th className="py-3 px-3">Dados e Opções Selecionadas</th>
              <th className="py-3 px-3 text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredRecords.map((rec) => {
              const originalIndex = records.findIndex((r) => r.id === rec.id);
              const valResult = validateNDJsonRecord(rec);
              const tipoNum = Number(rec.dadosGerais.tipoImovel);
              const isTipo1 = tipoNum === 1;
              const isTipo2 = tipoNum === 2;
              const isTipo3 = tipoNum === 3;

              // Check if record is from Batch (Lote)
              const isBatch = !!rec.isBatch;
              const alteredOpts = rec.alteredOptions || ['complNroImovel'];

              return (
                <tr
                  key={rec.id}
                  className={`hover:bg-slate-50/60 transition-colors group ${
                    !valResult.isValid ? 'bg-rose-50/30' : isBatch ? 'bg-indigo-50/10' : ''
                  }`}
                >
                  {/* # - Index number & reordering controls */}
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-slate-700">{originalIndex + 1}</span>
                      <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onMoveRecord(originalIndex, 'up')}
                          disabled={originalIndex === 0}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveRecord(originalIndex, 'down')}
                          disabled={originalIndex === records.length - 1}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Inscrição Imobiliária & Badges */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="space-y-1">
                      {onUpdateRecordField ? (
                        <input
                          type="text"
                          maxLength={45}
                          value={rec.dadosGerais.inscricaoImobiliaria}
                          onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.inscricaoImobiliaria', e.target.value)}
                          placeholder="Inscrição"
                          className="w-32 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-lg px-2 py-1 font-mono text-xs font-bold text-indigo-700 shadow-2xs"
                          title="Inscrição Imobiliária"
                        />
                      ) : (
                        <span className="font-mono font-bold text-indigo-600">
                          #{rec.dadosGerais.inscricaoImobiliaria}
                        </span>
                      )}

                      <div className="flex flex-wrap items-center gap-1">
                        {/* Origin Badge */}
                        {isBatch ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Layers className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Lote</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Tag className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Individual</span>
                          </span>
                        )}

                        {/* Operação Badge */}
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Op: {rec.operacao || 'I'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Content Cell: LOTE vs INDIVIDUAL */}
                  <td className="py-2.5 px-3">
                    {isBatch ? (
                      /* LOTE: Render ONLY the options that were marked to alter! */
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Option: Complemento Número */}
                        {alteredOpts.includes('complNroImovel') && (
                          <div className="flex items-center space-x-1.5 bg-indigo-50/80 border border-indigo-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-indigo-900 shrink-0">Compl. Nº:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                value={rec.endereco.complNroImovel}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.complNroImovel', e.target.value)}
                                placeholder="ex: APTO 101"
                                className="w-28 bg-white border border-indigo-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-indigo-900"
                              />
                            ) : (
                              <span className="font-bold text-indigo-800 text-xs">
                                {rec.endereco.complNroImovel || '(Vazio)'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Option: Número Imóvel */}
                        {alteredOpts.includes('numeroImovel') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Nº:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                value={rec.endereco.numeroImovel}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.numeroImovel', e.target.value)}
                                placeholder="S/N"
                                className="w-16 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">{rec.endereco.numeroImovel || 'S/N'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Bairro */}
                        {alteredOpts.includes('bairro') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Bairro:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                value={rec.endereco.bairro}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.bairro', e.target.value)}
                                placeholder="Bairro"
                                className="w-28 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                              />
                            ) : (
                              <span className="text-slate-800 text-xs">{rec.endereco.bairro || '(Vazio)'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Nome Logradouro */}
                        {alteredOpts.includes('nomeLogradouro') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Logradouro:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                value={rec.endereco.nomeLogradouro}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.nomeLogradouro', e.target.value)}
                                placeholder="Logradouro"
                                className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                              />
                            ) : (
                              <span className="text-slate-800 text-xs">{rec.endereco.nomeLogradouro || '(Vazio)'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Tipo Logradouro */}
                        {alteredOpts.includes('tipoLogradouro') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Tipo Logr:</span>
                            {onUpdateRecordField ? (
                              <select
                                value={rec.endereco.tipoLogradouro}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.tipoLogradouro', Number(e.target.value))}
                                className="bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-xs font-bold text-slate-800"
                              >
                                {TIPO_LOGRADOURO_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">{rec.endereco.tipoLogradouro}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Complemento Endereço */}
                        {alteredOpts.includes('complEndereco') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Compl. End:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                value={rec.endereco.complEndereco}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.complEndereco', e.target.value)}
                                placeholder="Complemento"
                                className="w-28 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                              />
                            ) : (
                              <span className="text-slate-800 text-xs">{rec.endereco.complEndereco || '(Vazio)'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: CEP */}
                        {alteredOpts.includes('cep') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">CEP:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="text"
                                maxLength={8}
                                value={rec.endereco.cep}
                                onChange={(e) => onUpdateRecordField(rec.id, 'endereco.cep', e.target.value)}
                                placeholder="00000000"
                                className="w-20 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-mono text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-mono text-slate-800 text-xs">{formatCepDisplay(rec.endereco.cep)}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Tipo de Imóvel */}
                        {alteredOpts.includes('tipoImovel') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Tipo:</span>
                            {onUpdateRecordField ? (
                              <select
                                value={rec.dadosGerais.tipoImovel}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.tipoImovel', Number(e.target.value))}
                                className="bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs font-bold text-slate-800"
                              >
                                <option value={1}>1 - Territorial</option>
                                <option value={2}>2 - Predial</option>
                                <option value={3}>3 - BICE</option>
                              </select>
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">Tipo {rec.dadosGerais.tipoImovel}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Área Construída */}
                        {alteredOpts.includes('areaConstruida') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Área Cst:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="number"
                                step="any"
                                value={rec.dadosGerais.areaConstruida || ''}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.areaConstruida', e.target.value)}
                                placeholder="m²"
                                className="w-20 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">{rec.dadosGerais.areaConstruida || 0} m²</span>
                            )}
                          </div>
                        )}

                        {/* Option: Área Terreno */}
                        {alteredOpts.includes('areaTerreno') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Área Ter:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="number"
                                step="any"
                                value={rec.dadosGerais.areaTerreno || ''}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.areaTerreno', e.target.value)}
                                placeholder="m²"
                                className="w-20 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">{rec.dadosGerais.areaTerreno || 0} m²</span>
                            )}
                          </div>
                        )}

                        {/* Option: Valor Venal */}
                        {alteredOpts.includes('valorVenal') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Valor Venal:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="number"
                                step="any"
                                value={rec.dadosGerais.valorVenal || ''}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.valorVenal', e.target.value)}
                                placeholder="R$"
                                className="w-24 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">R$ {rec.dadosGerais.valorVenal || 0}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Ano Construtivo */}
                        {alteredOpts.includes('anoConstrutivo') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Ano Constr:</span>
                            {onUpdateRecordField ? (
                              <input
                                type="number"
                                value={rec.dadosGerais.anoConstrutivo || ''}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.anoConstrutivo', e.target.value)}
                                placeholder="ex: 2024"
                                className="w-20 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-mono text-xs text-slate-800"
                              />
                            ) : (
                              <span className="font-mono text-slate-800 text-xs">{rec.dadosGerais.anoConstrutivo || 'N/A'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Tipo Arquitetônico */}
                        {alteredOpts.includes('tpArquitetonico') && (
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-slate-600 shrink-0">Arq:</span>
                            {onUpdateRecordField ? (
                              <select
                                value={rec.dadosGerais.tpArquitetonico}
                                onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.tpArquitetonico', Number(e.target.value))}
                                className="bg-white border border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-xs font-bold text-slate-800"
                              >
                                {TP_ARQUITETONICO_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-bold text-slate-800 text-xs">Arq {rec.dadosGerais.tpArquitetonico}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Operação */}
                        {alteredOpts.includes('operacao') && (
                          <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-bold text-amber-900 shrink-0">Op:</span>
                            {onUpdateRecordField ? (
                              <select
                                value={rec.operacao || 'I'}
                                onChange={(e) => onUpdateRecordField(rec.id, 'operacao', e.target.value)}
                                className="bg-white border border-amber-200 focus:border-amber-500 rounded px-1 py-0.5 text-xs font-bold text-amber-900"
                              >
                                <option value="I">I (Inclusão)</option>
                                <option value="A">A (Alteração)</option>
                                <option value="E">E (Exclusão)</option>
                              </select>
                            ) : (
                              <span className="font-bold text-amber-900 text-xs">{rec.operacao || 'I'}</span>
                            )}
                          </div>
                        )}

                        {/* Option: Titulares */}
                        {alteredOpts.includes('titulares') && (
                          <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1">
                            <Users className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span className="text-[10px] font-bold text-indigo-900">
                              {rec.titulares?.length || 0} Titular(es)
                            </span>
                            <button
                              type="button"
                              onClick={() => onEditRecord(rec)}
                              className="text-[10px] font-bold text-indigo-600 underline ml-1 cursor-pointer"
                            >
                              Editar
                            </button>
                          </div>
                        )}

                        {/* Option: Registro de Imóveis */}
                        {alteredOpts.includes('servicoRegistroImovel') && (
                          <div className="flex items-center space-x-1 bg-sky-50 border border-sky-200 rounded-lg px-2 py-1 text-[10px] font-bold text-sky-800">
                            <span>Cartório RI: {rec.servicoRegistroImovel?.numMatriculaRI ? `Mat. ${rec.servicoRegistroImovel.numMatriculaRI}` : 'Ativo'}</span>
                          </div>
                        )}

                        {/* Option: Cartório de Notas */}
                        {alteredOpts.includes('cartorioNotas') && (
                          <div className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-[10px] font-bold text-emerald-800">
                            <span>Notas: {rec.cartorioNotas?.cnsNotas ? `CNS ${rec.cartorioNotas.cnsNotas}` : 'Ativo'}</span>
                          </div>
                        )}

                        {/* Option: ITBI */}
                        {alteredOpts.includes('itbi') && (
                          <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-[10px] font-bold text-amber-900">
                            <span>ITBI: {rec.itbi?.baseCalculITBI ? `R$ ${rec.itbi.baseCalculITBI}` : 'Ativo'}</span>
                          </div>
                        )}

                        {/* Fallback if no specific altered Option was selected */}
                        {alteredOpts.length === 0 && (
                          <span className="text-slate-400 italic text-[11px]">
                            Registro gerado em lote com opções padrão.
                          </span>
                        )}

                      </div>
                    ) : (
                      /* INDIVIDUAL: Complete summary view with all details */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Summary 1: Endereço & Bairro */}
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{rec.endereco.nomeLogradouro || 'Sem Logr.'}, Nº {rec.endereco.numeroImovel || 'S/N'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Bairro: {rec.endereco.bairro || '(Vazio)'} | CEP: {formatCepDisplay(rec.endereco.cep)}
                          </div>
                          {rec.endereco.complNroImovel && (
                            <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                              Compl: {rec.endereco.complNroImovel}
                            </span>
                          )}
                        </div>

                        {/* Summary 2: Áreas e Tipologia */}
                        <div className="space-y-1">
                          <div className="text-xs text-slate-800">
                            <strong>Terreno:</strong> {rec.dadosGerais.areaTerreno || 0}m² | <strong>Const:</strong> {rec.dadosGerais.areaConstruida || 0}m²
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Ano: {rec.dadosGerais.anoConstrutivo || 'N/A'} • Tipo: {rec.dadosGerais.tipoImovel} • Arq: {rec.dadosGerais.tpArquitetonico}
                          </div>
                          {rec.dadosGerais.valorVenal ? (
                            <div className="text-[11px] font-bold text-emerald-700">
                              Venal: R$ {Number(rec.dadosGerais.valorVenal).toLocaleString('pt-BR')}
                            </div>
                          ) : null}
                        </div>

                        {/* Summary 3: Integrantes & Módulos */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isTipo1 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Territorial (1)
                            </span>
                          ) : isTipo2 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Predial (2)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              BICE (3)
                            </span>
                          )}

                          {rec.titulares && rec.titulares.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{rec.titulares.length} Titular(es)</span>
                            </span>
                          )}

                          {rec.servicoRegistroImovel && Object.values(rec.servicoRegistroImovel).some((v) => v) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              RI
                            </span>
                          )}

                          {rec.cartorioNotas && Object.values(rec.cartorioNotas).some((v) => v) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Notas
                            </span>
                          )}

                          {rec.itbi && Object.values(rec.itbi).some((v) => v) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              ITBI
                            </span>
                          )}
                        </div>

                      </div>
                    )}
                  </td>

                  {/* Row Actions */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      
                      {/* Duplicate Record */}
                      <button
                        type="button"
                        onClick={() => onDuplicateRecord(rec)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicar este registro"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Edit Record */}
                      <button
                        type="button"
                        onClick={() => onEditRecord(rec)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar todos os campos deste registro no formulário completo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Record */}
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Remover este registro do JSON"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
