import React, { useState } from 'react';
import { NDJsonRecord } from '../types';
import { recordsToNDJsonContent, downloadFile } from '../utils/ndjson';
import { Code, Copy, Check, FileText, Eye } from 'lucide-react';
import { SendOptionsDropdown } from './SendOptionsDropdown';

interface NDJsonPreviewProps {
  records: NDJsonRecord[];
  onOpenApi?: () => void;
  onOpenZip?: () => void;
}

export const NDJsonPreview: React.FC<NDJsonPreviewProps> = ({ records, onOpenApi, onOpenZip }) => {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  const rawNDJson = recordsToNDJsonContent(records);

  const handleCopy = async () => {
    if (!rawNDJson) return;
    try {
      await navigator.clipboard.writeText(rawNDJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback copy
      const textArea = document.createElement('textarea');
      textArea.value = rawNDJson;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (records.length > 0) {
      downloadFile(rawNDJson, 'imoveis_cadastrados.ndjson');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Pré-visualização do Arquivo NDJSON</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200 font-semibold">
                .ndjson
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Cada linha do código abaixo é um objeto JSON válido separado por quebra de linha (\n).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              wordWrap
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Quebrar Linhas</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={records.length === 0}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              records.length > 0
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-2xs'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Conteúdo</span>
              </>
            )}
          </button>

          <SendOptionsDropdown
            count={records.length}
            onDownload={handleDownload}
            onOpenApi={onOpenApi}
            onOpenZip={onOpenZip}
            variant="primary"
          />

        </div>
      </div>

      {/* Code Container */}
      <div className="p-4 bg-slate-900 font-mono text-xs overflow-x-auto max-h-[400px]">
        {records.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-600" />
            <p>Nenhum conteúdo gerado ainda.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {records.map((record, index) => {
              const line = recordsToNDJsonContent([record]);
              return (
                <div key={record.id} className="flex items-start space-x-3 group hover:bg-slate-800/80 p-1 rounded-md transition-colors">
                  <span className="text-slate-500 select-none text-right font-semibold w-8 shrink-0">
                    {index + 1}.
                  </span>
                  <pre
                    className={`text-slate-200 font-mono ${
                      wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                    }`}
                  >
                    {line}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Footer info */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 text-[11px] text-slate-500 flex items-center justify-between font-mono">
        <span>Formato: NDJSON (UTF-8)</span>
        <span>Linhas: {records.length} | Caracteres: {rawNDJson.length}</span>
      </div>

    </div>
  );
};
