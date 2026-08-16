import React from 'react';
import { Upload, Sparkles, Database, Trash2, Coffee } from 'lucide-react';
import { SendOptionsDropdown } from './SendOptionsDropdown';
import cadsinterLogo from '../assets/images/cadsinter_logo_1786865365558.jpg';

interface HeaderProps {
  count: number;
  onDownload: () => void;
  onOpenImport: () => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  onOpenApi?: () => void;
  onOpenZip?: () => void;
  onOpenDonate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  count,
  onDownload,
  onOpenImport,
  onLoadSamples,
  onClearAll,
  onOpenApi,
  onOpenZip,
  onOpenDonate,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-indigo-200 shadow-xs shrink-0 bg-indigo-50 p-0.5">
              <img
                src={cadsinterLogo}
                alt="CadSinter Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-indigo-800 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  CadSinter
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 tracking-wider uppercase">
                  GovTech SINTER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Plataforma de Gestão Cadastral Municipal & Gerador SINTER / CADURB
              </p>
            </div>
          </div>

          {/* Counter badge and Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Record Counter Badge */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Registros:</span>
              <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                count > 0 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {count} {count === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {/* Load sample data button */}
            {count === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Carregar 3 registros de exemplo fornecidos no modelo"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Carregar Exemplos</span>
              </button>
            )}

            {/* Clear All button */}
            {count > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Limpar todos os registros adicionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Lista</span>
              </button>
            )}

            {/* Import NDJSON */}
            <button
              type="button"
              onClick={onOpenImport}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar NDJSON</span>
            </button>

            {/* Opções de Envio Dropdown */}
            <SendOptionsDropdown
              count={count}
              onDownload={onDownload}
              onOpenApi={onOpenApi}
              onOpenZip={onOpenZip}
              variant="primary"
            />

            {/* ME DOE UM CAFÉ (DONATE) */}

            {/* 4. ME DOE UM CAFÉ (DONATE) */}
            {onOpenDonate && (
              <button
                type="button"
                onClick={onOpenDonate}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white rounded-xl shadow-xs transition-all cursor-pointer ring-2 ring-amber-400/30 animate-pulse-subtle"
                title="Apoie o desenvolvedor com uma doação via Pix"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-100" />
                <span>Me doe um Café ☕</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
