import React, { useState } from 'react';
import {
  Layers,
  X,
  Check,
  Sparkles,
  Building2,
  MapPin,
  CheckSquare,
  Square,
  AlertCircle,
  Hash,
  Tag,
  Sliders,
  SlidersHorizontal,
  CheckCircle2,
  Users,
  FileText,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { NDJsonRecord, DadosGeraisImovel, EnderecoImovel } from '../types';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseDadosGerais: DadosGeraisImovel;
  baseEndereco: EnderecoImovel;
  baseOperacao: string;
  onGenerateBatch: (records: Omit<NDJsonRecord, 'id'>[]) => void;
}

// Full option definition list for SINTER/CADURB schema
export interface OptionDefinition {
  key: string;
  label: string;
  category: 'endereco' | 'dadosGerais' | 'areaCompl' | 'operacao' | 'modulos';
  description: string;
  isDefaultSelected?: boolean;
}

export const ALL_BATCH_OPTIONS: OptionDefinition[] = [
  // ENDEREÇO
  { key: 'complNroImovel', label: 'Complemento do Número (ex: APTO / BLOCO)', category: 'endereco', description: 'Número de apartamento, bloco ou unidade', isDefaultSelected: true },
  { key: 'numeroImovel', label: 'Número do Imóvel', category: 'endereco', description: 'Número do prédio/casa na via', isDefaultSelected: false },
  { key: 'bairro', label: 'Bairro', category: 'endereco', description: 'Nome do bairro', isDefaultSelected: false },
  { key: 'nomeLogradouro', label: 'Nome do Logradouro', category: 'endereco', description: 'Rua, avenida, travessa etc.', isDefaultSelected: false },
  { key: 'tipoLogradouro', label: 'Tipo de Logradouro', category: 'endereco', description: 'Código do tipo de logradouro (SINTER)', isDefaultSelected: false },
  { key: 'complEndereco', label: 'Complemento do Endereço', category: 'endereco', description: 'Informações complementares de localização', isDefaultSelected: false },
  { key: 'cep', label: 'CEP', category: 'endereco', description: 'Código de Endereçamento Postal (8 dígitos)', isDefaultSelected: false },

  // DADOS GERAIS
  { key: 'tipoImovel', label: 'Tipo de Imóvel (Territorial/Predial/BICE)', category: 'dadosGerais', description: '1 = Territorial, 2 = Predial, 3 = BICE', isDefaultSelected: false },
  { key: 'areaConstruida', label: 'Área Construída (m²)', category: 'dadosGerais', description: 'Área total edificada do imóvel', isDefaultSelected: false },
  { key: 'areaTerreno', label: 'Área do Terreno (m²)', category: 'dadosGerais', description: 'Área do lote/terreno', isDefaultSelected: false },
  { key: 'valorVenal', label: 'Valor Venal (R$)', category: 'dadosGerais', description: 'Valor venal do imóvel para IPTU', isDefaultSelected: false },
  { key: 'anoConstrutivo', label: 'Ano Construtivo', category: 'dadosGerais', description: 'Ano de término da edificação', isDefaultSelected: false },
  { key: 'tpArquitetonico', label: 'Tipo Arquitetônico', category: 'dadosGerais', description: 'Código do tipo arquitetônico da edificação', isDefaultSelected: false },
  { key: 'destinacaoImovel', label: 'Destinação do Imóvel', category: 'dadosGerais', description: 'Uso: Residencial, Comercial, Industrial etc.', isDefaultSelected: false },
  { key: 'padraoConstrutivo', label: 'Padrão Construtivo', category: 'dadosGerais', description: 'Código do padrão construtivo', isDefaultSelected: false },
  { key: 'qtdGaragem', label: 'Quantidade de Garagens', category: 'dadosGerais', description: 'Número de vagas de garagem', isDefaultSelected: false },
  { key: 'temPiscina', label: 'Possui Piscina', category: 'dadosGerais', description: 'Indicador se possui piscina', isDefaultSelected: false },
  { key: 'bice', label: 'Código BICE', category: 'dadosGerais', description: 'Inscrição BICE (quando aplicável)', isDefaultSelected: false },
  { key: 'idParcela', label: 'ID Parcela / Lote', category: 'dadosGerais', description: 'Identificador único de parcela georreferenciada', isDefaultSelected: false },
  { key: 'valorRefMercado', label: 'Valor Ref. Mercado (R$)', category: 'dadosGerais', description: 'Valor de referência de mercado', isDefaultSelected: false },

  // ÁREA COMPLEMENTAR
  { key: 'areaPrivativa', label: 'Área Privativa (m²)', category: 'areaCompl', description: 'Área privativa do condomínio/unidade', isDefaultSelected: false },
  { key: 'areaComum', label: 'Área Comum (m²)', category: 'areaCompl', description: 'Área de uso comum proporcional', isDefaultSelected: false },
  { key: 'fraIdeal', label: 'Fração Ideal (%)', category: 'areaCompl', description: 'Percentual de fração ideal do terreno', isDefaultSelected: false },

  // OPERAÇÃO & DESATIVAÇÃO
  { key: 'operacao', label: 'Operação (I = Inclusão, A = Alteração)', category: 'operacao', description: 'Código da operação no lote', isDefaultSelected: false },
  { key: 'tipoDesativacao', label: 'Tipo de Desativação', category: 'operacao', description: 'Tipo de desativação (caso aplicável)', isDefaultSelected: false },
  { key: 'motivoDesativacao', label: 'Motivo de Desativação', category: 'operacao', description: 'Motivo de desativação no cadastro', isDefaultSelected: false },

  // MÓDULOS ESPECÍFICOS
  { key: 'titulares', label: 'Titulares / Proprietários', category: 'modulos', description: 'Adicionar ou alterar titulares do imóvel', isDefaultSelected: false },
  { key: 'servicoRegistroImovel', label: 'Serviço de Registro de Imóveis (Cartório RI)', category: 'modulos', description: 'Matrícula, CNS, Livro e Folha do RI', isDefaultSelected: false },
  { key: 'cartorioNotas', label: 'Cartório de Notas', category: 'modulos', description: 'Escritura, CNS, Livro e Folha de Notas', isDefaultSelected: false },
  { key: 'itbi', label: 'ITBI (Guia / Transação)', category: 'modulos', description: 'Base de cálculo, transmitente e adquirente', isDefaultSelected: false },
];

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  baseDadosGerais,
  baseEndereco,
  baseOperacao,
  onGenerateBatch,
}) => {
  const [quantity, setQuantity] = useState<number>(10);

  // Map of option keys -> boolean
  const [fieldsToAlter, setFieldsToAlter] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_BATCH_OPTIONS.forEach((opt) => {
      initial[opt.key] = opt.key === 'complNroImovel';
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleFieldToAlter = (key: string) => {
    setFieldsToAlter((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllCategory = (category?: string) => {
    setFieldsToAlter((prev) => {
      const updated = { ...prev };
      const targets = category
        ? ALL_BATCH_OPTIONS.filter((o) => o.category === category)
        : ALL_BATCH_OPTIONS;
      
      const allChecked = targets.every((t) => prev[t.key]);
      targets.forEach((t) => {
        updated[t.key] = !allChecked;
      });
      return updated;
    });
  };

  const handleSelectSimpleDefaults = () => {
    setFieldsToAlter((prev) => {
      const updated = { ...prev };
      ALL_BATCH_OPTIONS.forEach((opt) => {
        updated[opt.key] = opt.key === 'complNroImovel' || opt.key === 'numeroImovel';
      });
      return updated;
    });
  };

  const handleClearAll = () => {
    setFieldsToAlter((prev) => {
      const updated = { ...prev };
      ALL_BATCH_OPTIONS.forEach((opt) => {
        updated[opt.key] = false;
      });
      return updated;
    });
  };

  // Format inscription incrementally
  const formatInscricaoSequencial = (baseString: string, step: number) => {
    const baseNum = parseInt(baseString, 10);
    if (!isNaN(baseNum)) {
      const newNum = baseNum + step;
      if (baseString.startsWith('0') && baseString.length > 1) {
        return newNum.toString().padStart(baseString.length, '0');
      }
      return newNum.toString();
    }
    return `${baseString}-${step + 1}`;
  };

  const handleConfirm = () => {
    if (quantity <= 0 || quantity > 500) {
      alert('Por favor, informe uma quantidade entre 1 e 500.');
      return;
    }

    const newRecords: Omit<NDJsonRecord, 'id'>[] = [];
    const initialInsc = baseDadosGerais.inscricaoImobiliaria || '1';

    // List of active option keys marked for alteration
    const activeAlteredOptions = Object.keys(fieldsToAlter).filter((k) => fieldsToAlter[k]);

    for (let i = 0; i < quantity; i++) {
      // Inscrição Imobiliária is ALWAYS sequential starting from initial
      const currentInsc = formatInscricaoSequencial(initialInsc, i);

      // Clone base objects
      const currentDadosGerais: DadosGeraisImovel = { ...baseDadosGerais };
      const currentEndereco: EnderecoImovel = { ...baseEndereco };
      let currentOperacao = baseOperacao;

      // Set inscription
      currentDadosGerais.inscricaoImobiliaria = currentInsc;

      newRecords.push({
        dadosGerais: currentDadosGerais,
        endereco: currentEndereco,
        operacao: currentOperacao,
        isBatch: true,
        batchMode: 'lote',
        alteredOptions: activeAlteredOptions.length > 0 ? activeAlteredOptions : ['complNroImovel'],
      });
    }

    onGenerateBatch(newRecords);
    onClose();
  };

  const categories = [
    { key: 'endereco', title: '1. Endereço do Imóvel', icon: MapPin },
    { key: 'dadosGerais', title: '2. Dados Gerais do Imóvel', icon: Building2 },
    { key: 'areaCompl', title: '3. Área Construída Complementar', icon: FileText },
    { key: 'operacao', title: '4. Operação & Desativação', icon: Sliders },
    { key: 'modulos', title: '5. Titulares & Módulos Cartorários', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Inclusão em Lote</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md border border-indigo-200 uppercase">
                  SINTER / CADURB
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Gere múltiplos registros sequenciais e selecione quais campos/opções deseja alterar na tabela.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">

          {/* 1. Quantity Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block font-bold text-slate-900 text-xs">
                  1. Quantidade de Registros a Gerar
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Inscrição Imobiliária <strong>sequencial</strong> a partir de: <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono font-bold text-indigo-600">{baseDadosGerais.inscricaoImobiliaria || '11'}</code>
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm text-slate-900 font-bold font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
                <span className="text-slate-600 font-semibold">itens</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    quantity === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{num} unidades
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar for Options Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/60 p-3.5 border border-indigo-100 rounded-2xl">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>2. Seleção de Opções/Campos para Alteração no Lote</span>
              </span>
              <p className="text-[11px] text-indigo-800">
                Abaixo estão <strong>todas as opções</strong> do esquema SINTER/CADURB separadas por seção. Marque as que deseja liberar na tabela.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectSimpleDefaults}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              >
                Padrão (Complemento)
              </button>
              <button
                type="button"
                onClick={() => handleSelectAllCategory()}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs"
              >
                Marcar Todas
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              >
                Desmarcar Todas
              </button>
            </div>
          </div>

          {/* Categorized Display containing ALL options of the schema */}
          <div className="space-y-6">
            {categories.map((cat) => {
              const catOptions = ALL_BATCH_OPTIONS.filter((o) => o.category === cat.key);
              const catIcon = cat.icon;
              const IconComponent = catIcon;

              return (
                <div key={cat.key} className="space-y-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-xs">{cat.title}</h4>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded-full font-mono">
                        {catOptions.filter((o) => fieldsToAlter[o.key]).length}/{catOptions.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategory(cat.key)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      {catOptions.every((o) => fieldsToAlter[o.key]) ? 'Desmarcar Seção' : 'Marcar Seção'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {catOptions.map((opt) => {
                      const isChecked = !!fieldsToAlter[opt.key];
                      return (
                        <label
                          key={opt.key}
                          className={`p-3 border rounded-xl flex items-start justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <span className="font-bold text-slate-800 text-xs block">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 block">{opt.description}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFieldToAlter(opt.key)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer mt-0.5"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Alert */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-[11px] text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Ao confirmar, serão gerados <strong>{quantity} registros</strong>. O número total de opções marcadas para alteração é{' '}
              <strong className="text-indigo-700 font-mono">
                {Object.values(fieldsToAlter).filter(Boolean).length} opção(ões)
              </strong>. Na tabela de registros em lote, apenas estes campos aparecerão para alteração individual.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs font-semibold text-indigo-700 font-mono">
            Gerar {quantity} registro(s) com {Object.values(fieldsToAlter).filter(Boolean).length} opção(ões)
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar {quantity} Registros no JSON</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

