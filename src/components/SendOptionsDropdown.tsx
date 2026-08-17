import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Globe, FileArchive, ChevronDown, ShieldCheck, Palette } from 'lucide-react';

interface SendOptionsDropdownProps {
  onDownload?: () => void;
  onDownloadInternal?: () => void;
  onDownloadSinter?: () => void;
  onOpenApi?: () => void;
  onOpenZip?: () => void;
  count: number;
  variant?: 'primary' | 'subtle';
  buttonLabel?: string;
}

export const SendOptionsDropdown: React.FC<SendOptionsDropdownProps> = ({
  onDownload,
  onDownloadInternal,
  onDownloadSinter,
  onOpenApi,
  onOpenZip,
  count,
  variant = 'primary',
  buttonLabel = 'Opções de Envio',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const disabled = count === 0;

  const handleInternal = () => {
    setIsOpen(false);
    if (onDownloadInternal) onDownloadInternal();
    else if (onDownload) onDownload();
  };

  const handleSinter = () => {
    setIsOpen(false);
    if (onDownloadSinter) onDownloadSinter();
    else if (onDownload) onDownload();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
          disabled
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            : variant === 'primary'
            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white ring-2 ring-indigo-500/20'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs'
        }`}
        title="Selecione o formato de envio ou download dos dados imobiliários"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5 divide-y divide-slate-100 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Selecione o Formato / Método
          </div>

          <div className="py-1 space-y-1">
            {/* 1. BAIXAR NDJSON - CONTROLE INTERNO */}
            <button
              type="button"
              onClick={handleInternal}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-left transition-colors group cursor-pointer"
            >
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                  <span>BAIXAR NDJSON</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                    Controle
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Com status de cores para gestão e reimportação
                </div>
              </div>
            </button>

            {/* 2. BAIXAR NDJSON - OFICIAL SINTER */}
            <button
              type="button"
              onClick={handleSinter}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors group cursor-pointer"
            >
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <span>BAIXAR NDJSON OFICIAL</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    SINTER
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Padrão estrito para upload na Receita Federal
                </div>
              </div>
            </button>

            {/* 3. ENVIAR POR API */}
            {onOpenApi && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenApi();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-sky-900">
                    ENVIAR POR API
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Transmissão REST (SINTER / CADURB)
                  </div>
                </div>
              </button>
            )}

            {/* 4. BAIXAR NDJSON ZIP */}
            {onOpenZip && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenZip();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                    BAIXAR NDJSON ZIP
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Pacote oficial compactado em lote (.zip)
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
