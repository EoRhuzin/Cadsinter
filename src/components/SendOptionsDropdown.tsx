import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Globe, FileArchive, ChevronDown } from 'lucide-react';

interface SendOptionsDropdownProps {
  onDownload: () => void;
  onOpenApi?: () => void;
  onOpenZip?: () => void;
  count: number;
  variant?: 'primary' | 'subtle';
  buttonLabel?: string;
}

export const SendOptionsDropdown: React.FC<SendOptionsDropdownProps> = ({
  onDownload,
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
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5 divide-y divide-slate-100 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Selecione o Formato / Método
          </div>

          <div className="py-1 space-y-1">
            {/* 1. BAIXAR NDJSON */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDownload();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-left transition-colors group cursor-pointer"
            >
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                  BAIXAR NDJSON
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Arquivo de texto puro (.ndjson)
                </div>
              </div>
            </button>

            {/* 2. ENVIAR POR API */}
            {onOpenApi && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenApi();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    ENVIAR POR API
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Transmissão REST (SINTER / CADURB)
                  </div>
                </div>
              </button>
            )}

            {/* 3. BAIXAR NDJSON ZIP */}
            {onOpenZip && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenZip();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                    BAIXAR NDJSON ZIP
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Pacote compactado em lote (.zip)
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
