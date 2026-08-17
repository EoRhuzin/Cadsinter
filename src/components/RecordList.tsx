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
import { SendOptionsDropdown } from './SendOptionsDropdown';
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
  Palette,
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
  onDownloadInternal?: () => void;
  onDownloadSinter?: () => void;
  onOpenApi?: () => void;
  onOpenZip?: () => void;
  onBatchSetStatusColor?: (ids: string[], color: string) => void;
  onBatchDelete?: (ids: string[]) => void;
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
  onDownloadInternal,
  onDownloadSinter,
  onOpenApi,
  onOpenZip,
  onBatchSetStatusColor,
  onBatchDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<'all' | 'verde' | 'amarelo' | 'vermelho' | 'nenhum'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Count records by status color
  const greenCount = records.filter((r) => r.statusCor === 'verde').length;
  const yellowCount = records.filter((r) => r.statusCor === 'amarelo').length;
  const redCount = records.filter((r) => r.statusCor === 'vermelho').length;
  const noneCount = records.filter((r) => !r.statusCor || r.statusCor === 'nenhum').length;

  // Filter records based on search and color
  const filteredRecords = records.filter((rec) => {
    // Filter by color
    if (colorFilter === 'verde' && rec.statusCor !== 'verde') return false;
    if (colorFilter === 'amarelo' && rec.statusCor !== 'amarelo') return false;
    if (colorFilter === 'vermelho' && rec.statusCor !== 'vermelho') return false;
    if (colorFilter === 'nenhum' && rec.statusCor && rec.statusCor !== 'nenhum') return false;

    // Filter by search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const insc = (rec.dadosGerais.inscricaoImobiliaria || '').toLowerCase();
    const logr = (rec.endereco.nomeLogradouro || '').toLowerCase();
    const compl = (rec.endereco.complNroImovel || '').toLowerCase();
    const complEnd = (rec.endereco.complEndereco || '').toLowerCase();
    const bairro = (rec.endereco.bairro || '').toLowerCase();

    return (
      insc.includes(term) ||
      logr.includes(term) ||
      compl.includes(term) ||
      complEnd.includes(term) ||
      bairro.includes(term)
    );
  });

  // Handle select all
  const allFilteredSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredRecords.some((r) => r.id === id)));
    } else {
      const idsToAdd = filteredRecords.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const handleToggleSelectRecord = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk color setter
  const handleApplyBulkColor = (color: string) => {
    if (selectedIds.length === 0) return;
    if (onBatchSetStatusColor) {
      onBatchSetStatusColor(selectedIds, color);
    } else if (onUpdateRecordField) {
      selectedIds.forEach((id) => {
        onUpdateRecordField(id, 'statusCor', color);
      });
    }
  };

  // Bulk delete
  const handleApplyBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Deseja remover os ${selectedIds.length} registro(s) selecionado(s)?`)) {
      if (onBatchDelete) {
        onBatchDelete(selectedIds);
      } else {
        selectedIds.forEach((id) => onDeleteRecord(id));
      }
      setSelectedIds([]);
    }
  };

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

          {/* Send options dropdown */}
          {onDownload && (
            <SendOptionsDropdown
              count={records.length}
              onDownload={onDownload}
              onDownloadInternal={onDownloadInternal}
              onDownloadSinter={onDownloadSinter}
              onOpenApi={onOpenApi}
              onOpenZip={onOpenZip}
              variant="primary"
            />
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

      {/* Filter and Bulk Action Toolbar */}
      <div className="bg-slate-50/50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Status Color Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtro Gestão:</span>
          </span>

          <button
            type="button"
            onClick={() => setColorFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              colorFilter === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({records.length})
          </button>

          <button
            type="button"
            onClick={() => setColorFilter('verde')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'verde'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🟢 OK</span>
            <span className="opacity-90 font-mono text-[10px]">({greenCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setColorFilter('amarelo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'amarelo'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>🟡 Atenção</span>
            <span className="opacity-90 font-mono text-[10px]">({yellowCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setColorFilter('vermelho')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              colorFilter === 'vermelho'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>🔴 Erro</span>
            <span className="opacity-90 font-mono text-[10px]">({redCount})</span>
          </button>

          {noneCount > 0 && (
            <button
              type="button"
              onClick={() => setColorFilter('nenhum')}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                colorFilter === 'nenhum'
                  ? 'bg-slate-400 text-white shadow-2xs'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sem cor ({noneCount})
            </button>
          )}
        </div>

        {/* Bulk Action Controls if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl animate-fade-in text-xs font-bold">
            <span className="text-indigo-900 font-mono">
              {selectedIds.length} selecionado(s):
            </span>

            {/* Set Green */}
            <button
              type="button"
              onClick={() => handleApplyBulkColor('verde')}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Marcar selecionados como OK / Verde"
            >
              🟢 OK
            </button>

            {/* Set Yellow */}
            <button
              type="button"
              onClick={() => handleApplyBulkColor('amarelo')}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Marcar selecionados como Atenção / Amarelo"
            >
              🟡 Atenção
            </button>

            {/* Set Red */}
            <button
              type="button"
              onClick={() => handleApplyBulkColor('vermelho')}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Marcar selecionados como Erro / Vermelho"
            >
              🔴 Erro
            </button>

            {/* Clear color */}
            <button
              type="button"
              onClick={() => handleApplyBulkColor('nenhum')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer text-[11px]"
              title="Limpar status dos selecionados"
            >
              Limpar Cor
            </button>

            {/* Bulk Delete */}
            <button
              type="button"
              onClick={handleApplyBulkDelete}
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1"
              title="Excluir selecionados"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Excluir</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer ml-1"
            >
              Desmarcar
            </button>
          </div>
        )}
      </div>

      {/* Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  title="Selecionar todos os registros visíveis"
                />
              </th>
              <th className="py-3 px-2 w-10 text-center">#</th>
              <th className="py-3 px-3 w-32">Status / Gestão</th>
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

              const isSelected = selectedIds.includes(rec.id);
              const isGreen = rec.statusCor === 'verde';
              const isYellow = rec.statusCor === 'amarelo';
              const isRed = rec.statusCor === 'vermelho';

              const rowBgClass = isGreen
                ? 'border-l-[6px] border-l-emerald-500 bg-emerald-100/40 hover:bg-emerald-100/70 border-b border-emerald-200/60'
                : isYellow
                ? 'border-l-[6px] border-l-amber-500 bg-amber-100/40 hover:bg-amber-100/70 border-b border-amber-200/60'
                : isRed
                ? 'border-l-[6px] border-l-rose-500 bg-rose-100/40 hover:bg-rose-100/70 border-b border-rose-200/60'
                : !valResult.isValid
                ? 'bg-rose-50/40'
                : isBatch
                ? 'bg-indigo-50/20'
                : 'hover:bg-slate-50/70';

              return (
                <tr
                  key={rec.id}
                  className={`transition-colors group ${rowBgClass}`}
                >
                  {/* Checkbox column */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectRecord(rec.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* # - Index number & reordering controls */}
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400">
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

                  {/* Status / Color Selector column */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRecordField?.(
                              rec.id,
                              'statusCor',
                              rec.statusCor === 'verde' ? 'nenhum' : 'verde'
                            )
                          }
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-transform active:scale-90 cursor-pointer ${
                            rec.statusCor === 'verde'
                              ? 'bg-emerald-500 text-white shadow-xs ring-2 ring-emerald-300 scale-110 font-bold'
                              : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 opacity-60 hover:opacity-100'
                          }`}
                          title="Marcar Verde (OK / Aprovado)"
                        >
                          🟢
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRecordField?.(
                              rec.id,
                              'statusCor',
                              rec.statusCor === 'amarelo' ? 'nenhum' : 'amarelo'
                            )
                          }
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-transform active:scale-90 cursor-pointer ${
                            rec.statusCor === 'amarelo'
                              ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300 scale-110 font-bold'
                              : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 opacity-60 hover:opacity-100'
                          }`}
                          title="Marcar Amarelo (Atenção / Pendente)"
                        >
                          🟡
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRecordField?.(
                              rec.id,
                              'statusCor',
                              rec.statusCor === 'vermelho' ? 'nenhum' : 'vermelho'
                            )
                          }
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-transform active:scale-90 cursor-pointer ${
                            rec.statusCor === 'vermelho'
                              ? 'bg-rose-500 text-white shadow-xs ring-2 ring-rose-300 scale-110 font-bold'
                              : 'bg-rose-100/70 hover:bg-rose-200 text-rose-800 opacity-60 hover:opacity-100'
                          }`}
                          title="Marcar Vermelho (Erro / Incorreto)"
                        >
                          🔴
                        </button>
                      </div>

                      <div>
                        {rec.statusCor === 'verde' ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300/80 inline-block">
                            OK / Aprovado
                          </span>
                        ) : rec.statusCor === 'amarelo' ? (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300/80 inline-block">
                            Atenção / Pendente
                          </span>
                        ) : rec.statusCor === 'vermelho' ? (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded border border-rose-300/80 inline-block">
                            Erro / Incorreto
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium italic">
                            Sem status
                          </span>
                        )}
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
                                value={rec.endereco.complNroImovel || ''}
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
                                value={rec.endereco.numeroImovel || ''}
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
                                value={rec.endereco.bairro || ''}
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
                                value={rec.endereco.nomeLogradouro || ''}
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
                                value={rec.endereco.complEndereco || ''}
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
                                value={rec.endereco.cep || ''}
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

      {/* Mobile Card View (shown only on mobile/tablet) */}
      <div className="block md:hidden divide-y divide-slate-100 bg-white">
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

          const isSelected = selectedIds.includes(rec.id);
          const isGreen = rec.statusCor === 'verde';
          const isYellow = rec.statusCor === 'amarelo';
          const isRed = rec.statusCor === 'vermelho';

          const mobileCardBg =
            isGreen
              ? 'border-l-[6px] border-l-emerald-500 bg-emerald-50/90 border border-emerald-200/80 shadow-2xs'
              : isYellow
              ? 'border-l-[6px] border-l-amber-500 bg-amber-50/90 border border-amber-200/80 shadow-2xs'
              : isRed
              ? 'border-l-[6px] border-l-rose-500 bg-rose-50/90 border border-rose-200/80 shadow-2xs'
              : !valResult.isValid
              ? 'bg-rose-50/30'
              : isBatch
              ? 'bg-indigo-50/10'
              : '';

          return (
            <div
              key={rec.id}
              className={`p-4 space-y-3 hover:bg-slate-50/60 transition-colors ${mobileCardBg}`}
            >
              {/* Header: Checkbox, Index, Inscrição & Color Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectRecord(rec.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-slate-400">
                    #{originalIndex + 1}
                  </span>
                  {onUpdateRecordField ? (
                    <input
                      type="text"
                      maxLength={45}
                      value={rec.dadosGerais.inscricaoImobiliaria}
                      onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.inscricaoImobiliaria', e.target.value)}
                      placeholder="Inscrição"
                      className="w-28 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-lg px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 shadow-2xs"
                    />
                  ) : (
                    <span className="font-mono font-bold text-indigo-600 text-xs">
                      #{rec.dadosGerais.inscricaoImobiliaria}
                    </span>
                  )}
                </div>

                {/* Status Color buttons on mobile */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRecordField?.(
                        rec.id,
                        'statusCor',
                        rec.statusCor === 'verde' ? 'nenhum' : 'verde'
                      )
                    }
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] cursor-pointer ${
                      rec.statusCor === 'verde'
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-110 font-bold'
                        : 'bg-emerald-100 text-emerald-800 opacity-60'
                    }`}
                    title="Verde (OK)"
                  >
                    🟢
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRecordField?.(
                        rec.id,
                        'statusCor',
                        rec.statusCor === 'amarelo' ? 'nenhum' : 'amarelo'
                      )
                    }
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] cursor-pointer ${
                      rec.statusCor === 'amarelo'
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 scale-110 font-bold'
                        : 'bg-amber-100 text-amber-900 opacity-60'
                    }`}
                    title="Amarelo (Atenção)"
                  >
                    🟡
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateRecordField?.(
                        rec.id,
                        'statusCor',
                        rec.statusCor === 'vermelho' ? 'nenhum' : 'vermelho'
                      )
                    }
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] cursor-pointer ${
                      rec.statusCor === 'vermelho'
                        ? 'bg-rose-500 text-white ring-2 ring-rose-300 scale-110 font-bold'
                        : 'bg-rose-100 text-rose-800 opacity-60'
                    }`}
                    title="Vermelho (Erro)"
                  >
                    🔴
                  </button>
                </div>

                <div className="flex items-center gap-1 w-full justify-between pt-1">
                  <div className="flex items-center gap-1">
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

                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Op: {rec.operacao || 'I'}
                    </span>
                  </div>

                  {rec.statusCor === 'verde' ? (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      OK / Aprovado
                    </span>
                  ) : rec.statusCor === 'amarelo' ? (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                      Atenção / Pendente
                    </span>
                  ) : rec.statusCor === 'vermelho' ? (
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                      Erro / Incorreto
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs text-slate-700 space-y-2">
                {isBatch ? (
                  /* Batch fields view with inline inputs on mobile */
                  <div className="grid grid-cols-1 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {alteredOpts.includes('complNroImovel') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Compl. Nº:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            value={rec.endereco.complNroImovel || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.complNroImovel', e.target.value)}
                            className="w-36 bg-white border border-indigo-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-indigo-950"
                          />
                        ) : (
                          <span className="font-bold text-indigo-800">{rec.endereco.complNroImovel || '(Vazio)'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('numeroImovel') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Nº:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            value={rec.endereco.numeroImovel || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.numeroImovel', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{rec.endereco.numeroImovel || 'S/N'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('bairro') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Bairro:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            value={rec.endereco.bairro || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.bairro', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                          />
                        ) : (
                          <span className="text-slate-800">{rec.endereco.bairro || '(Vazio)'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('nomeLogradouro') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Logradouro:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            value={rec.endereco.nomeLogradouro || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.nomeLogradouro', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                          />
                        ) : (
                          <span className="text-slate-800">{rec.endereco.nomeLogradouro || '(Vazio)'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('tipoLogradouro') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Tipo Logr:</span>
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
                          <span className="font-bold text-slate-800">{rec.endereco.tipoLogradouro}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('complEndereco') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Compl. End:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            value={rec.endereco.complEndereco || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.complEndereco', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800"
                          />
                        ) : (
                          <span className="text-slate-800">{rec.endereco.complEndereco || '(Vazio)'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('cep') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">CEP:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="text"
                            maxLength={8}
                            value={rec.endereco.cep || ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'endereco.cep', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-mono text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-mono text-slate-800">{formatCepDisplay(rec.endereco.cep)}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('tipoImovel') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Tipo:</span>
                        {onUpdateRecordField ? (
                          <select
                            value={rec.dadosGerais.tipoImovel}
                            onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.tipoImovel', Number(e.target.value))}
                            className="bg-white border border-indigo-500 rounded px-1.5 py-0.5 text-xs font-bold text-slate-800"
                          >
                            <option value={1}>1 - Territorial</option>
                            <option value={2}>2 - Predial</option>
                            <option value={3}>3 - BICE</option>
                          </select>
                        ) : (
                          <span className="font-bold text-slate-800">Tipo {rec.dadosGerais.tipoImovel}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('areaConstruida') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Área Cst:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="number"
                            step="any"
                            value={rec.dadosGerais.areaConstruida !== undefined ? rec.dadosGerais.areaConstruida : ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.areaConstruida', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{rec.dadosGerais.areaConstruida || 0} m²</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('areaTerreno') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Área Ter:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="number"
                            step="any"
                            value={rec.dadosGerais.areaTerreno !== undefined ? rec.dadosGerais.areaTerreno : ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.areaTerreno', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{rec.dadosGerais.areaTerreno || 0} m²</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('valorVenal') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Valor Venal:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="number"
                            step="any"
                            value={rec.dadosGerais.valorVenal !== undefined ? rec.dadosGerais.valorVenal : ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.valorVenal', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-bold text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">R$ {rec.dadosGerais.valorVenal || 0}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('anoConstrutivo') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Ano Constr:</span>
                        {onUpdateRecordField ? (
                          <input
                            type="number"
                            value={rec.dadosGerais.anoConstrutivo !== undefined ? rec.dadosGerais.anoConstrutivo : ''}
                            onChange={(e) => onUpdateRecordField(rec.id, 'dadosGerais.anoConstrutivo', e.target.value)}
                            className="w-36 bg-white border border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 font-mono text-xs text-slate-800"
                          />
                        ) : (
                          <span className="font-mono text-slate-800">{rec.dadosGerais.anoConstrutivo || 'N/A'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('tpArquitetonico') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-600">Arq:</span>
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
                          <span className="font-bold text-slate-800">Arq {rec.dadosGerais.tpArquitetonico}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('operacao') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-900">Op:</span>
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
                          <span className="font-bold text-amber-900">{rec.operacao || 'I'}</span>
                        )}
                      </div>
                    )}

                    {alteredOpts.includes('titulares') && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-indigo-900">Titulares:</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-bold text-indigo-800">{rec.titulares?.length || 0} Titular(es)</span>
                          <button
                            type="button"
                            onClick={() => onEditRecord(rec)}
                            className="text-[10px] font-bold text-indigo-600 underline cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Individual field summary */
                  <div className="space-y-2 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">{rec.endereco.nomeLogradouro || 'Sem Logr.'}, Nº {rec.endereco.numeroImovel || 'S/N'}</div>
                        <div className="text-slate-500 text-[11px]">
                          Bairro: {rec.endereco.bairro || '(Vazio)'} | CEP: {formatCepDisplay(rec.endereco.cep)}
                        </div>
                        {rec.endereco.complNroImovel && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px] border border-indigo-100/60">
                            Compl: {rec.endereco.complNroImovel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-slate-100 text-[11px]">
                      <div><strong>Terreno:</strong> {rec.dadosGerais.areaTerreno || 0}m²</div>
                      <div><strong>Construída:</strong> {rec.dadosGerais.areaConstruida || 0}m²</div>
                      <div><strong>Ano Constr:</strong> {rec.dadosGerais.anoConstrutivo || 'N/A'}</div>
                      <div><strong>Tipo / Arq:</strong> {rec.dadosGerais.tipoImovel} / {rec.dadosGerais.tpArquitetonico}</div>
                    </div>

                    {rec.dadosGerais.valorVenal ? (
                      <div className="text-[11px] font-bold text-emerald-700">
                        Venal: R$ {Number(rec.dadosGerais.valorVenal).toLocaleString('pt-BR')}
                      </div>
                    ) : null}

                    {/* Tags of Modules */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {isTipo1 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Territorial (1)
                        </span>
                      ) : isTipo2 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Predial (2)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          BICE (3)
                        </span>
                      )}

                      {rec.titulares && rec.titulares.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />
                          <span>{rec.titulares.length} Titular(es)</span>
                        </span>
                      )}

                      {rec.servicoRegistroImovel && Object.values(rec.servicoRegistroImovel).some((v) => v) && (
                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-150">
                          RI
                        </span>
                      )}

                      {rec.cartorioNotas && Object.values(rec.cartorioNotas).some((v) => v) && (
                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          Notas
                        </span>
                      )}

                      {rec.itbi && Object.values(rec.itbi).some((v) => v) && (
                        <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-150">
                          ITBI
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions & Order buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {/* Reordering */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onMoveRecord(originalIndex, 'up')}
                    disabled={originalIndex === 0}
                    className="p-1.5 bg-slate-100 text-slate-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg cursor-pointer flex items-center gap-0.5 text-[10px] font-semibold"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Subir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveRecord(originalIndex, 'down')}
                    disabled={originalIndex === records.length - 1}
                    className="p-1.5 bg-slate-100 text-slate-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg cursor-pointer flex items-center gap-0.5 text-[10px] font-semibold"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Descer</span>
                  </button>
                </div>

                {/* Main Actions */}
                <div className="flex items-center space-x-1">
                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => onDuplicateRecord(rec)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-slate-200"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicar</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => onEditRecord(rec)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-slate-200"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-rose-200"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
