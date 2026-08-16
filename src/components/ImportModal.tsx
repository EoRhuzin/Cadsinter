import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, FileCode } from 'lucide-react';
import { parseNDJsonContent } from '../utils/ndjson';
import { NDJsonRecord } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (imported: NDJsonRecord[], replace: boolean) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parseResult, setParseResult] = useState<{
    records: NDJsonRecord[];
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPasteContent(text);
        const result = parseNDJsonContent(text);
        setParseResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setPasteContent(text);
    if (text.trim()) {
      const result = parseNDJsonContent(text);
      setParseResult(result);
    } else {
      setParseResult(null);
    }
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.records.length > 0) {
      onImportRecords(parseResult.records, importMode === 'replace');
      setPasteContent('');
      setParseResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Importar ou Carregar Arquivo NDJSON
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              1. Selecionar Arquivo do Computador (.ndjson ou .json)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer relative group">
              <input
                type="file"
                accept=".ndjson,.json,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileCode className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
              <p className="text-xs text-slate-700 font-medium">
                Arraste seu arquivo NDJSON aqui ou <span className="text-indigo-600 font-semibold underline">Clique para navegar</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Suporta arquivos NDJSON com uma linha por objeto
              </p>
            </div>
          </div>

          {/* Paste Raw NDJSON */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              2. Ou Cole o Conteúdo NDJSON diretamente abaixo
            </label>
            <textarea
              rows={5}
              placeholder={`Cole aqui suas linhas NDJSON, ex:\n{"ui":{"DadosGeraisImovel":{"inscricaoImobiliaria":"11"...},"EnderecoImovel":{...}},"operacao":"I"}`}
              value={pasteContent}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          {/* Parse Result Info */}
          {parseResult && (
            <div className="space-y-3">
              {parseResult.records.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Foram identificados <strong>{parseResult.records.length}</strong> registro(s) válido(s) para importação.
                  </span>
                </div>
              )}

              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
                  <div className="flex items-center space-x-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Atenção aos erros identificados:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] pl-2 space-y-0.5 text-rose-700">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Import Mode Radio */}
          {parseResult && parseResult.records.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Opção de Importação:
              </label>
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                <label className="flex items-center space-x-2 text-slate-800 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300"
                  />
                  <span>Adicionar à lista atual (Manter existentes)</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-800 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300"
                  />
                  <span>Substituir lista atual completamente</span>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.records.length === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
              parseResult && parseResult.records.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Confirmar Importação ({parseResult?.records.length || 0})
          </button>
        </div>

      </div>
    </div>
  );
};
