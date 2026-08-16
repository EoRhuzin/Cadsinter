import React, { useState } from 'react';
import { Coffee, Copy, Check, Heart, X, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface DonateSectionProps {
  onClose?: () => void;
  isDismissible?: boolean;
  defaultExpanded?: boolean;
}

export const DonateSection: React.FC<DonateSectionProps> = ({
  onClose,
  isDismissible = false,
  defaultExpanded = false,
}) => {
  const pixKey = '93942072-0157-466d-840d-d840ef33af2a';
  const nubankUrl = 'https://nubank.com.br/cobrar/v2843/6a816ec0-d115-4c13-b928-8eea2a1c8e29';

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(nubankUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-indigo-500/10 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden transition-all duration-300">
      {/* Decorative Background Accents */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Minimized View Header / Control Bar */}
      {!isExpanded ? (
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Clickable Header Info */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-3 cursor-pointer group flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-amber-800 transition-colors">
                  Me doe um Café ☕
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300/60 uppercase tracking-wide flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                  Apoie
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Contribuição voluntária para manter o CadSinter gratuito
              </p>
            </div>
          </div>

          {/* Compact Right Actions */}
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleCopyKey}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                copiedKey
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 border border-amber-400'
              }`}
              title="Copiar Chave Pix"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Pix Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Pix</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white/90 hover:bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Maximizar</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {isDismissible && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Maximized / Expanded View */
        <div className="relative z-10 space-y-4">
          {/* Header Bar when Expanded */}
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Me doe um Café ☕
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300/60 uppercase tracking-wide flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    Apoie o Projeto
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Contribuição voluntária para manter o CadSinter gratuito, atualizado e ativo
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/90 hover:bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                title="Minimizar seção"
              >
                <span>Minimizar</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isDismissible && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
                  title="Fechar aviso"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            O <strong>CadSinter</strong> é uma plataforma independente e gratuita criada para simplificar a vida de gestores e servidores públicos municipais na geração dos arquivos <strong>SINTER/CADURB</strong> para a Receita Federal.
            Se este sistema te ajudou ou economizou horas de trabalho na sua prefeitura, considere fazer uma doação via Pix!
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-600">Valores sugeridos:</span>
            {['☕ R$ 5 (Café)', '☕☕ R$ 10 (Duplo)', '🍕 R$ 25 (Lanche)', '🚀 Qualquer valor'].map((val, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white/80 border border-amber-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs"
              >
                {val}
              </span>
            ))}
          </div>

          {/* Pix Key and Nubank Link Buttons */}
          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chave Pix Aleatória:
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <div className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 font-semibold truncate shadow-2xs select-all">
                  {pixKey}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ${
                    copiedKey
                      ? 'bg-emerald-600 text-white border border-emerald-600'
                      : 'bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 border border-amber-400'
                  }`}
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Pix</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Nubank link option */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={nubankUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Link de Cobrança Nubank</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

