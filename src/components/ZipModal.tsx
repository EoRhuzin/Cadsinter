import React, { useState } from 'react';
import {
  X,
  FileArchive,
  Download,
  RefreshCw,
  Archive,
  Info
} from 'lucide-react';
import JSZip from 'jszip';
import { NDJsonRecord } from '../types';
import { recordsToNDJsonContent } from '../utils/ndjson';

interface ZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: NDJsonRecord[];
}

export const ZipModal: React.FC<ZipModalProps> = ({ isOpen, onClose, records }) => {
  const [ibgeCode, setIbgeCode] = useState('4314902');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const currentIbge = ibgeCode.trim() || '4314902';
  const timestamp = Date.now();
  const defaultZipName = `${currentIbge}_${timestamp}.zip`;
  const defaultNdjsonName = `${currentIbge}_carga.ndjson`;

  // Handler: Generate and download the ZIP file locally
  const handleDownloadZip = async () => {
    if (records.length === 0) {
      alert('Nenhum registro no workbench para exportar.');
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      // Ensure strict SINTER standard (no internal tags) for the official ZIP file
      const ndjsonContent = recordsToNDJsonContent(records, { forSinter: true });
      zip.file(defaultNdjsonName, ndjsonContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultZipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      alert(`Erro ao gerar o arquivo ZIP: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-xs">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Baixar NDJSON ZIP
              </h2>
              <p className="text-xs text-slate-400">
                Gera o arquivo comprimido .ZIP padrão SINTER contendo os dados NDJSON
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-slate-50/50">

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
            <Archive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Compactação em Arquivo .ZIP</span>
              <p className="text-amber-800 leading-relaxed">
                O arquivo gerado conterá a carga NDJSON <code className="font-mono bg-amber-100 px-1 rounded">{defaultNdjsonName}</code> com os registros envelopados na estrutura oficial SINTER (<code className="font-mono bg-amber-100 px-1 rounded">{"{\"ui\": {...}, \"operacao\": \"...\"}"}</code>).
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código IBGE do Município:
                </label>
                <input
                  type="text"
                  value={ibgeCode}
                  onChange={(e) => setIbgeCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="4314902"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Arquivo .ZIP:
                </label>
                <input
                  type="text"
                  readOnly
                  value={defaultZipName}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Registros a incluir: <strong className="text-amber-700 font-mono">{records.length} UI(s)</strong></span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isGenerating || records.length === 0}
            className="flex items-center space-x-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>BAIXAR NDJSON ZIP</span>
          </button>
        </div>

      </div>
    </div>
  );
};

