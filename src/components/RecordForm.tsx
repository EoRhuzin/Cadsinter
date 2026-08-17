import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  RotateCcw,
  Home,
  MapPin,
  Sparkles,
  Check,
  Hash,
  Layers,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  Sparkle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  UserPlus,
  Users,
  Trash2,
  FileText,
  BookOpen,
} from 'lucide-react';
import { NDJsonRecord, DadosGeraisImovel, EnderecoImovel, AreaConstruidaCompl, TitularItem, ServicoRegistroImovel, CartorioNotas, ITBI } from '../types';
import { SearchableSelect } from './SearchableSelect';
import { BatchModal } from './BatchModal';
import {
  DEFAULT_RECORD_DADOS,
  DEFAULT_RECORD_ENDERECO,
  DEFAULT_OPERACAO,
  TIPO_LOGRADOURO_OPTIONS,
  TIPO_IMOVEL_OPTIONS,
  TP_ARQUITETONICO_OPTIONS,
  DESTINACAO_IMOVEL_OPTIONS,
  PADRAO_CONSTRUTIVO_OPTIONS,
  BICE_OPTIONS,
  OPERACAO_OPTIONS,
  TIPO_TITULARIDADE_OPTIONS,
  DOC_TITULARIDADE_OPTIONS,
  TP_TRANSACAO_ITBI_OPTIONS,
  SAMPLE_RECORDS,
} from '../constants';
import {
  validateRecordData,
  TIPO_1_MANDATORY_FIELDS,
  TIPO_2_MANDATORY_FIELDS,
  TIPO_3_MANDATORY_FIELDS,
  sanitizeAreaTerreno,
} from '../utils/validation';
import { HelpTooltip } from './HelpTooltip';
import { SINTER_FIELDS_HELP, sanitizeTextInput } from '../utils/fieldHelp';

interface RecordFormProps {
  onAddRecord: (record: Omit<NDJsonRecord, 'id'>) => void;
  onAddBatchRecords: (records: Omit<NDJsonRecord, 'id'>[]) => void;
  lastAddedCount: number;
  tutorialMode?: 'type1' | 'type2' | 'type3' | 'overview' | null;
  tutorialStep?: number | null;
  onStartTutorialTipo1?: () => void;
  onStartTutorialTipo2?: () => void;
  onStartTutorialTipo3?: () => void;
  onStartTutorialOverview?: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  onAddRecord,
  onAddBatchRecords,
  tutorialMode = null,
  tutorialStep = null,
  onStartTutorialTipo1,
  onStartTutorialTipo2,
  onStartTutorialTipo3,
  onStartTutorialOverview,
}) => {
  const [dadosGerais, setDadosGerais] = useState<DadosGeraisImovel>(DEFAULT_RECORD_DADOS);
  const [endereco, setEndereco] = useState<EnderecoImovel>(DEFAULT_RECORD_ENDERECO);
  const [areaConstruidaCompl, setAreaConstruidaCompl] = useState<AreaConstruidaCompl>({});
  const [titulares, setTitulares] = useState<TitularItem[]>([]);
  const [servicoRegistroImovel, setServicoRegistroImovel] = useState<ServicoRegistroImovel>({});
  const [cartorioNotas, setCartorioNotas] = useState<CartorioNotas>({});
  const [itbi, setItbi] = useState<ITBI>({});
  const [operacao, setOperacao] = useState<string>(DEFAULT_OPERACAO);

  // Dropdown state for tutorials
  const [isTutorialDropdownOpen, setIsTutorialDropdownOpen] = useState(false);

  // Tutorial Step flags
  const isTutorialTipo1 = tutorialMode === 'type1';
  const isTutorialTipo2 = tutorialMode === 'type2';
  const isTutorialTipo3 = tutorialMode === 'type3';
  const isTutorialActive = isTutorialTipo1 || isTutorialTipo2 || isTutorialTipo3;
  const isTutorialTipo1Step3 = isTutorialTipo1 && tutorialStep === 2; // Step 3: Campos obrigatórios do Tipo 1 em vermelho
  const isTutorialTipo2Step3 = isTutorialTipo2 && tutorialStep === 2; // Step 3: Campos obrigatórios do Tipo 2 em vermelho
  const isTutorialTipo3Step3 = isTutorialTipo3 && tutorialStep === 2; // Step 3: Campos obrigatórios do Tipo 3 em vermelho
  const isTutorialStep3 = isTutorialTipo1Step3 || isTutorialTipo2Step3 || isTutorialTipo3Step3;

  // Fill sample data for Tipo 1 helper (Territorial)
  const handleFillSampleTipo1 = () => {
    setDadosGerais({
      ...DEFAULT_RECORD_DADOS,
      inscricaoImobiliaria: '01010010001',
      tipoImovel: 1,
      areaTerreno: 360.0,
      temBairro: true,
      tpArquitetonico: 0,
      destinacaoImovel: 0,
      areaConstruida: 0,
      anoConstrutivo: 0,
      bice: 0,
    });
    setEndereco({
      tipoLogradouro: 250, // Rua
      nomeLogradouro: 'Rua das Palmeiras',
      bairro: 'Centro',
      numeroImovel: '120',
      complNroImovel: 'Lote 15',
      cep: '45653758',
    });
    setAreaConstruidaCompl({});
    setTitulares([]);
    setServicoRegistroImovel({});
    setCartorioNotas({});
    setItbi({});
    setHasAttemptedSubmit(false);
  };

  // Fill sample data for Tipo 2 helper (Predial)
  const handleFillSampleTipo2 = () => {
    setDadosGerais({
      ...DEFAULT_RECORD_DADOS,
      inscricaoImobiliaria: '02020020002',
      tipoImovel: 2,
      areaTerreno: 250.0,
      temBairro: true,
      areaConstruida: 145.5,
      anoConstrutivo: 2018,
      tpArquitetonico: 1, // Casa
      destinacaoImovel: 1, // Residencial
      bice: 0,
    });
    setEndereco({
      tipoLogradouro: 250, // Rua
      nomeLogradouro: 'Avenida Brasil',
      bairro: 'Jardim América',
      numeroImovel: '450',
      complNroImovel: 'Casa',
      cep: '45653758',
    });
    setAreaConstruidaCompl({});
    setTitulares([]);
    setServicoRegistroImovel({});
    setCartorioNotas({});
    setItbi({});
    setHasAttemptedSubmit(false);
  };

  // Fill sample data for Tipo 3 helper (Bem Especial / BICE)
  const handleFillSampleTipo3 = () => {
    setDadosGerais({
      ...DEFAULT_RECORD_DADOS,
      inscricaoImobiliaria: '03030030003',
      tipoImovel: 3,
      areaTerreno: 1200.0,
      temBairro: true,
      tpArquitetonico: 0,
      destinacaoImovel: 0,
      areaConstruida: 0,
      anoConstrutivo: 0,
      bice: 1, // Praças e Parques
    });
    setEndereco({
      tipoLogradouro: 250, // Rua
      nomeLogradouro: 'Praça da Matriz',
      bairro: 'Centro',
      numeroImovel: 'S/N',
      complNroImovel: 'Parque Municipal',
      cep: '45653758',
    });
    setAreaConstruidaCompl({});
    setTitulares([]);
    setServicoRegistroImovel({});
    setCartorioNotas({});
    setItbi({});
    setHasAttemptedSubmit(false);
  };

  // Form Mode: Simples (Obrigatórios/Básicos) vs Avançado (Todos os campos adicionais opcionais)
  const [formMode, setFormMode] = useState<'simples' | 'avancado'>('simples');

  // Quick fill preferences
  const [keepAddressOnAdd, setKeepAddressOnAdd] = useState<boolean>(true);
  const [keepDadosGeraisOnAdd, setKeepDadosGeraisOnAdd] = useState<boolean>(true);
  const [autoIncrementInscricao, setAutoIncrementInscricao] = useState<boolean>(false);

  // Batch modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);

  // Success toast animation indicator
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Form submission attempt flag to trigger visible validation errors
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  // Check if current form is Tipo 1 (Territorial), Tipo 2 (Predial), or Tipo 3 (BICE)
  const isTipo1 = Number(dadosGerais.tipoImovel) === 1;
  const isTipo2 = Number(dadosGerais.tipoImovel) === 2;
  const isTipo3 = Number(dadosGerais.tipoImovel) === 3;

  // Real-time validation
  const validationResult = validateRecordData(
    dadosGerais,
    endereco,
    operacao,
    areaConstruidaCompl,
    titulares,
    servicoRegistroImovel,
    cartorioNotas,
    itbi
  );
  const fieldErrors = validationResult.fieldErrors;

  // Handle submit / Add record
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validationResult.isValid) {
      // Focus on validation issues
      return;
    }

    // Pass data to parent with sanitized areaTerreno if numeric
    const cleanAreaTerreno = sanitizeAreaTerreno(dadosGerais.areaTerreno);
    const cleanCep = String(endereco.cep || '').replace(/\D/g, '');

    // Format AreaConstruidaCompl if provided and not Tipo 1
    const hasAreaCompl = !isTipo1 && (
      areaConstruidaCompl.areaPrivativa !== undefined ||
      areaConstruidaCompl.areaComum !== undefined ||
      areaConstruidaCompl.fraIdeal !== undefined
    );

    // Filter valid titulares
    const validTitulares = titulares.filter(
      (t) => t && (t.niTitular || t.nomeTitular || t.percTitular !== undefined || t.percTitularidade !== undefined)
    );

    const hasServicoRI = servicoRegistroImovel && Object.values(servicoRegistroImovel).some(v => v !== undefined && v !== null && String(v).trim() !== '');
    const hasCartorioNotas = cartorioNotas && Object.values(cartorioNotas).some(v => v !== undefined && v !== null && String(v).trim() !== '');
    const hasItbi = itbi && Object.values(itbi).some(v => v !== undefined && v !== null && String(v).trim() !== '');

    onAddRecord({
      dadosGerais: {
        ...dadosGerais,
        areaTerreno: cleanAreaTerreno,
        inscricaoImobiliaria: dadosGerais.inscricaoImobiliaria.trim(),
      },
      endereco: {
        ...endereco,
        cep: cleanCep,
        nomeLogradouro: endereco.nomeLogradouro.trim(),
        bairro: endereco.bairro.trim(),
      },
      operacao,
      ...(hasAreaCompl ? { areaConstruidaCompl } : {}),
      ...(validTitulares.length > 0 ? { titulares: validTitulares } : {}),
      ...(hasServicoRI ? { servicoRegistroImovel } : {}),
      ...(hasCartorioNotas ? { cartorioNotas } : {}),
      ...(hasItbi ? { itbi } : {}),
    });

    // Reset attempt flag and show success toast
    setHasAttemptedSubmit(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);

    // Prepare form state for next entry
    let nextInscricao = dadosGerais.inscricaoImobiliaria;
    if (autoIncrementInscricao) {
      const num = parseInt(dadosGerais.inscricaoImobiliaria, 10);
      if (!isNaN(num)) {
        nextInscricao = String(num + 1);
      }
    }

    // Reset or keep values according to user preferences
    setDadosGerais((prev) => ({
      ...DEFAULT_RECORD_DADOS,
      ...(keepDadosGeraisOnAdd
        ? {
            temBairro: prev.temBairro,
            tipoImovel: prev.tipoImovel,
            tpArquitetonico: prev.tpArquitetonico,
            destinacaoImovel: prev.destinacaoImovel,
            areaTerreno: prev.areaTerreno,
            anoConstrutivo: prev.anoConstrutivo,
            bice: prev.bice,
            idParcela: prev.idParcela,
            valorVenal: prev.valorVenal,
            dtUltimoValorVenal: prev.dtUltimoValorVenal,
            padraoConstrutivo: prev.padraoConstrutivo,
            qtdGaragem: prev.qtdGaragem,
            temPiscina: prev.temPiscina,
            valorRefMercado: prev.valorRefMercado,
            dataUltValorMercado: prev.dataUltValorMercado,
          }
        : {}),
      inscricaoImobiliaria: autoIncrementInscricao ? nextInscricao : keepDadosGeraisOnAdd ? prev.inscricaoImobiliaria : '',
    }));

    if (!keepAddressOnAdd) {
      setEndereco(DEFAULT_RECORD_ENDERECO);
      setAreaConstruidaCompl({});
      setTitulares([]);
    } else {
      setEndereco((prev) => ({
        ...prev,
        complNroImovel: '',
      }));
    }
  };

  // Keyboard shortcut Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dadosGerais, endereco, areaConstruidaCompl, titulares, operacao, keepAddressOnAdd, keepDadosGeraisOnAdd, autoIncrementInscricao, validationResult]);

  // Fill form with sample record helper
  const handleLoadSampleIndex = (index: number) => {
    const sample = SAMPLE_RECORDS[index];
    if (sample) {
      setDadosGerais({ ...sample.dadosGerais });
      setEndereco({ ...sample.endereco });
      setAreaConstruidaCompl(sample.areaConstruidaCompl ? { ...sample.areaConstruidaCompl } : {});
      setTitulares(sample.titulares ? [...sample.titulares] : []);
      setServicoRegistroImovel(sample.servicoRegistroImovel ? { ...sample.servicoRegistroImovel } : {});
      setCartorioNotas(sample.cartorioNotas ? { ...sample.cartorioNotas } : {});
      setItbi(sample.itbi ? JSON.parse(JSON.stringify(sample.itbi)) : {});
      setOperacao(sample.operacao || DEFAULT_OPERACAO);
      setHasAttemptedSubmit(false);
    }
  };

  const handleResetForm = () => {
    setDadosGerais(DEFAULT_RECORD_DADOS);
    setEndereco(DEFAULT_RECORD_ENDERECO);
    setAreaConstruidaCompl({});
    setTitulares([]);
    setServicoRegistroImovel({});
    setCartorioNotas({});
    setItbi({});
    setOperacao(DEFAULT_OPERACAO);
    setHasAttemptedSubmit(false);
  };

  // CEP input handler with 8-digit mask
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 8);
    setEndereco({ ...endereco, cep: digitsOnly });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      
      {/* Form Header with Simples / Avançado Selector */}
      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Preenchimento de Registro
              </h2>
              {isTipo1 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tipo 1 (Territorial)</span>
                </span>
              ) : isTipo2 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Tipo 2 (Predial)</span>
                </span>
              ) : isTipo3 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Tipo 3 (BICE - Especial)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Preencha os dados
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Preencha os campos obrigatórios do SINTER e clique em <strong className="text-indigo-600">Incluir no JSON</strong>.
            </p>
          </div>
        </div>

        {/* Mode Selector & Quick Examples */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Quick Tutorials Selection Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTutorialDropdownOpen(!isTutorialDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer active:scale-98 ${
                isTutorialActive
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Selecione um tutorial interativo guiado passo a passo"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTutorialActive ? 'text-amber-300 animate-pulse' : 'text-indigo-500'}`} />
              <span>
                {isTutorialTipo1 && 'Tutorial: Tipo 1 (Territorial)'}
                {isTutorialTipo2 && 'Tutorial: Tipo 2 (Predial)'}
                {isTutorialTipo3 && 'Tutorial: Tipo 3 (BICE)'}
                {!isTutorialActive && 'Tutoriais Guiados'}
              </span>
              {isTutorialDropdownOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isTutorialDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-30 cursor-default" 
                  onClick={() => setIsTutorialDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Tutoriais Interativos
                  </div>
                  
                  {onStartTutorialTipo1 && (
                    <button
                      type="button"
                      onClick={() => {
                        onStartTutorialTipo1();
                        setIsTutorialDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <p className="font-bold">Imóvel Tipo 1 (Territorial)</p>
                        <p className="text-[10px] text-slate-400 font-medium">Lote / Terreno sem construção</p>
                      </div>
                    </button>
                  )}

                  {onStartTutorialTipo2 && (
                    <button
                      type="button"
                      onClick={() => {
                        onStartTutorialTipo2();
                        setIsTutorialDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <div>
                        <p className="font-bold">Imóvel Tipo 2 (Predial)</p>
                        <p className="text-[10px] text-slate-400 font-medium">Edificado / Casa / Apartamento</p>
                      </div>
                    </button>
                  )}

                  {onStartTutorialTipo3 && (
                    <button
                      type="button"
                      onClick={() => {
                        onStartTutorialTipo3();
                        setIsTutorialDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-purple-50 hover:text-purple-700 text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <div>
                        <p className="font-bold">Imóvel Tipo 3 (Bem Especial)</p>
                        <p className="text-[10px] text-slate-400 font-medium">Características Especiais / BICE</p>
                      </div>
                    </button>
                  )}

                  {onStartTutorialOverview && (
                    <button
                      type="button"
                      onClick={() => {
                        onStartTutorialOverview();
                        setIsTutorialDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 text-slate-700 border-t border-slate-100 mt-1 transition-colors flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">Visão Geral da Plataforma</p>
                        <p className="text-[10px] text-slate-400 font-medium">Tour completo da central SINTER</p>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modo de Envio: Simples vs Avançado */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300/70 shadow-2xs">
            <button
              type="button"
              onClick={() => setFormMode('simples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                formMode === 'simples'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Modo Simples</span>
            </button>
            <button
              type="button"
              onClick={() => setFormMode('avancado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                formMode === 'avancado'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Modo Avançado</span>
              <span className="px-1.5 py-0.2 bg-indigo-500 text-[10px] text-white rounded-md">
                + Opções
              </span>
            </button>
          </div>

          {/* Exemplos Rápidos */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-400 font-medium hidden sm:inline mr-1">Exemplos:</span>
            <button
              type="button"
              onClick={() => handleLoadSampleIndex(0)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-mono text-xs transition-all shadow-2xs cursor-pointer"
              title="Carregar exemplo 1 (Inscrição 11)"
            >
              #1 (Insc 11)
            </button>
            <button
              type="button"
              onClick={() => handleLoadSampleIndex(1)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-mono text-xs transition-all shadow-2xs cursor-pointer"
              title="Carregar exemplo 2 (Inscrição 66)"
            >
              #2 (Insc 66)
            </button>
          </div>

        </div>
      </div>

      {/* Tutorial Active Top Guide Banner (Tipo 1, Tipo 2 ou Tipo 3) */}
      {isTutorialActive && (
        <div className={`mx-6 mt-4 p-4 rounded-2xl border-2 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300 ${
          isTutorialTipo1
            ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border-rose-400'
            : isTutorialTipo2
            ? 'bg-gradient-to-r from-indigo-50 via-sky-50 to-teal-50 border-indigo-400'
            : 'bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 border-purple-400'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md ${
              isTutorialTipo1
                ? 'bg-rose-600 shadow-rose-200'
                : isTutorialTipo2
                ? 'bg-indigo-600 shadow-indigo-200'
                : 'bg-purple-600 shadow-purple-200'
            }`}>
              {isTutorialTipo1 ? 'TIPO 1' : isTutorialTipo2 ? 'TIPO 2' : 'TIPO 3'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-900">
                  {isTutorialTipo1 && 'Tutorial Imóvel Tipo 1 (Territorial / Lote)'}
                  {isTutorialTipo2 && 'Tutorial Imóvel Tipo 2 (Predial / Edificado)'}
                  {isTutorialTipo3 && 'Tutorial Imóvel Tipo 3 (Bem Especial / BICE)'}
                </span>
                <span className={`text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  isTutorialTipo1 ? 'bg-rose-600' : isTutorialTipo2 ? 'bg-indigo-600' : 'bg-purple-600'
                }`}>
                  {tutorialStep === 0 && 'Passo 1 de 4 • Inscrição'}
                  {tutorialStep === 1 && 'Passo 2 de 4 • Tipo do Imóvel'}
                  {tutorialStep === 2 && 'Passo 3 de 4 • Campos Obrigatórios em Vermelho'}
                  {tutorialStep === 3 && 'Passo 4 de 4 • Gravar e Finalizar'}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                {isTutorialTipo1 && (
                  <>
                    {tutorialStep === 0 && '1. Digite a Inscrição Imobiliária municipal do imóvel no campo em destaque.'}
                    {tutorialStep === 1 && '2. Selecione o Tipo do Imóvel = "1 - Territorial (Lote / Terreno)".'}
                    {tutorialStep === 2 && '3. Observe abaixo: todos os 8 campos obrigatórios para o Tipo 1 estão marcados em VERMELHO para rápida identificação!'}
                    {tutorialStep === 3 && '4. Clique no botão "+ Incluir Registro no JSON" (ou Ctrl+Enter) para gravar o imóvel na lista!'}
                  </>
                )}
                {isTutorialTipo2 && (
                  <>
                    {tutorialStep === 0 && '1. Digite a Inscrição Imobiliária municipal do imóvel predial.'}
                    {tutorialStep === 1 && '2. Selecione o Tipo do Imóvel = "2 - Predial (Edificado / Construção)".'}
                    {tutorialStep === 2 && '3. Observe: para Tipo 2, além dos básicos, são obrigatórios Tipo Arquitetônico, Destinação, Área Construída (> 0 m²) e Ano Construtivo!'}
                    {tutorialStep === 3 && '4. Clique no botão "+ Incluir Registro no JSON" (ou Ctrl+Enter) para gravar a edificação no lote!'}
                  </>
                )}
                {isTutorialTipo3 && (
                  <>
                    {tutorialStep === 0 && '1. Digite a Inscrição Imobiliária municipal do bem público / especial.'}
                    {tutorialStep === 1 && '2. Selecione o Tipo do Imóvel = "3 - Bem de Características Especiais (BICE)".'}
                    {tutorialStep === 2 && '3. Observe: para Tipo 3, o campo "Código BICE" fica desbloqueado e obrigatório com os códigos da tabela SINTER!'}
                    {tutorialStep === 3 && '4. Clique no botão "+ Incluir Registro no JSON" (ou Ctrl+Enter) para registrar o bem especial no lote!'}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTutorialTipo1 && (
              <button
                type="button"
                onClick={handleFillSampleTipo1}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preencher Exemplo Tipo 1</span>
              </button>
            )}
            {isTutorialTipo2 && (
              <button
                type="button"
                onClick={handleFillSampleTipo2}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preencher Exemplo Tipo 2</span>
              </button>
            )}
            {isTutorialTipo3 && (
              <button
                type="button"
                onClick={handleFillSampleTipo3}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preencher Exemplo Tipo 3</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Validation Errors Alert */}
      {hasAttemptedSubmit && !validationResult.isValid && (
        <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5 animate-shake">
          <div className="flex items-center space-x-2 font-bold text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Corrija as pendências de formato antes de incluir no JSON:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 pl-2">
            {validationResult.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* SECTION 1: Dados Gerais do Imóvel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5 text-slate-900 font-semibold text-sm">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <Home className="w-4 h-4 text-indigo-600" />
              <span>1. Dados Gerais do Imóvel (<code className="text-xs text-indigo-600 font-mono font-normal">ui.DadosGeraisImovel</code>)</span>
            </div>
            {formMode === 'avancado' && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Exibindo campos avançados e adicionais
              </span>
            )}
          </div>

          {/* Grid de Campos Básicos / Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Inscrição Imobiliária */}
            <div id="tutorial-field-inscricao">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Inscrição Imobiliária <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.inscricaoImobiliaria.label}
                  description={SINTER_FIELDS_HELP.inscricaoImobiliaria.description}
                  format={SINTER_FIELDS_HELP.inscricaoImobiliaria.format}
                  mandatoryRule={SINTER_FIELDS_HELP.inscricaoImobiliaria.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.inscricaoImobiliaria.rules}
                  example={SINTER_FIELDS_HELP.inscricaoImobiliaria.example}
                  position="top"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={45}
                  required
                  placeholder="Ex: 01010010001"
                  value={dadosGerais.inscricaoImobiliaria}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, inscricaoImobiliaria: sanitizeTextInput(e.target.value) })}
                  className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                    isTutorialStep3 || (hasAttemptedSubmit && fieldErrors['inscricaoImobiliaria'])
                      ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-slate-500">Regra: String até 45 car.</span>
                <span className={`font-mono font-bold ${
                  (dadosGerais.inscricaoImobiliaria || '').length > 45 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(dadosGerais.inscricaoImobiliaria || '').length}/45
                </span>
              </div>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 1. Obrigatório: Inscrição Imobiliária</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['inscricaoImobiliaria'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['inscricaoImobiliaria']}</p>
              )}
            </div>

            {/* 2. Tipo do Imóvel */}
            <div id="tutorial-field-tipo-imovel">
              <SearchableSelect
                label="Tipo do Imóvel (tipoImovel) *"
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.tipoImovel.label}
                    description={SINTER_FIELDS_HELP.tipoImovel.description}
                    format={SINTER_FIELDS_HELP.tipoImovel.format}
                    mandatoryRule={SINTER_FIELDS_HELP.tipoImovel.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.tipoImovel.rules}
                    example={SINTER_FIELDS_HELP.tipoImovel.example}
                    position="top"
                  />
                }
                value={dadosGerais.tipoImovel}
                options={TIPO_IMOVEL_OPTIONS}
                placeholder="Selecione o Tipo do Imóvel..."
                hasError={isTutorialStep3 || (hasAttemptedSubmit && !!fieldErrors['tipoImovel'])}
                onChange={(val) => {
                  const newTipo = Number(val);
                  setDadosGerais((prev) => ({
                    ...prev,
                    tipoImovel: newTipo,
                    bice: newTipo === 3 ? prev.bice : 0,
                  }));
                }}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {isTipo1
                  ? 'Tipo 1: Territorial (Lote / Terreno)'
                  : isTipo2
                  ? 'Tipo 2: Predial / Edificado'
                  : isTipo3
                  ? 'Tipo 3: Bem Especial (BICE)'
                  : 'Selecione o tipo do imóvel'}
              </p>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>
                    🔴 2. Obrigatório: Tipo {isTutorialTipo1 ? '1 (Territorial)' : isTutorialTipo2 ? '2 (Predial)' : '3 (Bem Especial)'}
                  </span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['tipoImovel'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['tipoImovel']}</p>
              )}
            </div>

            {/* 3. Área Terreno */}
            <div id="tutorial-field-area-terreno">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Área Terreno (m²) <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.areaTerreno.label}
                  description={SINTER_FIELDS_HELP.areaTerreno.description}
                  format={SINTER_FIELDS_HELP.areaTerreno.format}
                  mandatoryRule={SINTER_FIELDS_HELP.areaTerreno.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.areaTerreno.rules}
                  example={SINTER_FIELDS_HELP.areaTerreno.example}
                  position="top"
                />
              </div>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="Ex: 250.0000"
                value={dadosGerais.areaTerreno || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setDadosGerais({ ...dadosGerais, areaTerreno: val === '' ? 0 : parseFloat(val) });
                }}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                  isTutorialStep3 || (hasAttemptedSubmit && fieldErrors['areaTerreno'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Regra: 12 inteiros + 4 decimais</span>
                <span className="font-mono text-indigo-600 font-bold">m²</span>
              </div>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 3. Obrigatório: Área Terreno &gt; 0</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['areaTerreno'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['areaTerreno']}</p>
              )}
            </div>

            {/* 4. Tem Bairro? */}
            <div id="tutorial-field-tem-bairro">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Tem Bairro? (temBairro) <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.temBairro.label}
                  description={SINTER_FIELDS_HELP.temBairro.description}
                  format={SINTER_FIELDS_HELP.temBairro.format}
                  mandatoryRule={SINTER_FIELDS_HELP.temBairro.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.temBairro.rules}
                  example={SINTER_FIELDS_HELP.temBairro.example}
                  position="top"
                />
              </div>
              <div className={`flex items-center space-x-4 bg-white border rounded-xl px-3 py-2 h-[38px] shadow-2xs ${
                isTutorialStep3
                  ? 'border-2 border-rose-500 bg-rose-50/40'
                  : 'border-slate-200'
              }`}>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="temBairro"
                    checked={dadosGerais.temBairro === true}
                    onChange={() => setDadosGerais({ ...dadosGerais, temBairro: true })}
                    className="text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="font-semibold text-emerald-700">Sim (true)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="temBairro"
                    checked={dadosGerais.temBairro === false}
                    onChange={() => setDadosGerais({ ...dadosGerais, temBairro: false })}
                    className="text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-slate-600">Não (false)</span>
                </label>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {dadosGerais.temBairro ? 'Bairro obrigatório no endereço' : 'Sem bairro demarcado'}
              </p>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 4. Obrigatório: Tem Bairro?</span>
                </div>
              )}
            </div>

            {/* 5. Código BICE (bice) - Exclusivo e Obrigatório para Tipo 3 */}
            <div id="tutorial-field-bice" className={isTipo3 ? 'col-span-1 sm:col-span-2' : ''}>
              <SearchableSelect
                label={`Código BICE (bice) ${isTipo3 ? '*' : ''}`}
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.bice.label}
                    description={SINTER_FIELDS_HELP.bice.description}
                    format={SINTER_FIELDS_HELP.bice.format}
                    mandatoryRule={SINTER_FIELDS_HELP.bice.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.bice.rules}
                    example={SINTER_FIELDS_HELP.bice.example}
                    position="top"
                  />
                }
                value={isTipo3 ? (dadosGerais.bice || 0) : 0}
                options={BICE_OPTIONS}
                placeholder={isTipo3 ? 'Selecione o Código BICE...' : 'Bloqueado (Apenas para Imóvel Tipo 3)'}
                disabled={!isTipo3}
                hasError={isTutorialTipo3Step3 || (hasAttemptedSubmit && isTipo3 && !dadosGerais.bice)}
                onChange={(val) => setDadosGerais({ ...dadosGerais, bice: Number(val) })}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isTipo3
                  ? 'Obrigatório para Imóvel Tipo 3 (Bem de Características Especiais)'
                  : '🔒 Bloqueado • Exclusivo para Imóvel Tipo 3 (BICE)'}
              </p>
              {isTutorialTipo3Step3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 5. Obrigatório Tipo 3: Código BICE</span>
                </div>
              )}
              {hasAttemptedSubmit && isTipo3 && fieldErrors['bice'] && !isTutorialTipo3Step3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['bice']}</p>
              )}
            </div>

            {/* Tipo Arquitetônico */}
            <div id="tutorial-field-tp-arquitetonico">
              <SearchableSelect
                label={`Tipo Arquitetônico (tpArquitetonico) ${isTipo2 ? '*' : ''}`}
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.tpArquitetonico.label}
                    description={SINTER_FIELDS_HELP.tpArquitetonico.description}
                    format={SINTER_FIELDS_HELP.tpArquitetonico.format}
                    mandatoryRule={SINTER_FIELDS_HELP.tpArquitetonico.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.tpArquitetonico.rules}
                    example={SINTER_FIELDS_HELP.tpArquitetonico.example}
                    position="top"
                  />
                }
                value={dadosGerais.tpArquitetonico}
                options={TP_ARQUITETONICO_OPTIONS}
                placeholder="Selecione o Tipo Arquitetônico..."
                hasError={isTutorialTipo2Step3 || (hasAttemptedSubmit && !!fieldErrors['tpArquitetonico'])}
                onChange={(val) => setDadosGerais({ ...dadosGerais, tpArquitetonico: Number(val) })}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isTipo1
                  ? 'Opcional / Padrão Terreno para Tipo 1'
                  : isTipo2
                  ? 'Obrigatório para Imóvel Tipo 2 (Predial)'
                  : 'Opcional para Tipo 3'}
              </p>
              {isTutorialTipo2Step3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 5. Obrigatório Tipo 2: Tipo Arquitetônico</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['tpArquitetonico'] && !isTutorialTipo2Step3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['tpArquitetonico']}</p>
              )}
            </div>

            {/* Destinação do Imóvel */}
            <div id="tutorial-field-destinacao">
              <SearchableSelect
                label={`Destinação do Imóvel (destinacaoImovel) ${isTipo2 ? '*' : ''}`}
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.destinacaoImovel.label}
                    description={SINTER_FIELDS_HELP.destinacaoImovel.description}
                    format={SINTER_FIELDS_HELP.destinacaoImovel.format}
                    mandatoryRule={SINTER_FIELDS_HELP.destinacaoImovel.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.destinacaoImovel.rules}
                    example={SINTER_FIELDS_HELP.destinacaoImovel.example}
                    position="top"
                  />
                }
                value={dadosGerais.destinacaoImovel}
                options={DESTINACAO_IMOVEL_OPTIONS}
                placeholder="Selecione a Destinação..."
                hasError={isTutorialTipo2Step3 || (hasAttemptedSubmit && !!fieldErrors['destinacaoImovel'])}
                onChange={(val) => setDadosGerais({ ...dadosGerais, destinacaoImovel: Number(val) })}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isTipo1
                  ? 'Opcional para Tipo 1'
                  : isTipo2
                  ? 'Obrigatório para Imóvel Tipo 2 (Predial)'
                  : 'Opcional para Tipo 3'}
              </p>
              {isTutorialTipo2Step3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 6. Obrigatório Tipo 2: Destinação</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['destinacaoImovel'] && !isTutorialTipo2Step3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['destinacaoImovel']}</p>
              )}
            </div>

            {/* Área Construída */}
            <div id="tutorial-field-area-construida">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Área Construída (m²) {isTipo2 && <span className="text-rose-500">*</span>}
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.areaConstruida.label}
                  description={SINTER_FIELDS_HELP.areaConstruida.description}
                  format={SINTER_FIELDS_HELP.areaConstruida.format}
                  mandatoryRule={SINTER_FIELDS_HELP.areaConstruida.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.areaConstruida.rules}
                  example={SINTER_FIELDS_HELP.areaConstruida.example}
                  position="top"
                />
              </div>
              <input
                type="number"
                step="0.0001"
                placeholder={isTipo1 || isTipo3 ? '0 (Sem edificação)' : 'Ex: 145.26'}
                value={dadosGerais.areaConstruida || ''}
                onChange={(e) => setDadosGerais({ ...dadosGerais, areaConstruida: parseFloat(e.target.value) || 0 })}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                  isTutorialTipo2Step3 || (hasAttemptedSubmit && fieldErrors['areaConstruida'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isTipo1 || isTipo3 ? '0 m² caso sem edificação' : 'Obrigatório para Tipo 2 (> 0 m²)'}
              </p>
              {isTutorialTipo2Step3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 7. Obrigatório Tipo 2: Área Construída &gt; 0 m²</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['areaConstruida'] && !isTutorialTipo2Step3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['areaConstruida']}</p>
              )}
            </div>

            {/* Ano Construtivo */}
            <div id="tutorial-field-ano-construtivo">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ano Construtivo {isTipo2 && <span className="text-rose-500">*</span>}
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.anoConstrutivo.label}
                  description={SINTER_FIELDS_HELP.anoConstrutivo.description}
                  format={SINTER_FIELDS_HELP.anoConstrutivo.format}
                  mandatoryRule={SINTER_FIELDS_HELP.anoConstrutivo.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.anoConstrutivo.rules}
                  example={SINTER_FIELDS_HELP.anoConstrutivo.example}
                  position="top"
                />
              </div>
              <input
                type="number"
                placeholder={isTipo1 || isTipo3 ? '0 ou 1900' : 'Ex: 1990'}
                value={dadosGerais.anoConstrutivo || ''}
                onChange={(e) => setDadosGerais({ ...dadosGerais, anoConstrutivo: parseInt(e.target.value, 10) || 0 })}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                  isTutorialTipo2Step3 || (hasAttemptedSubmit && fieldErrors['anoConstrutivo'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isTipo1 || isTipo3 ? 'Não aplicável (0 ou padrão 1900)' : 'Obrigatório para Tipo 2 (Ex: 1990, 2020)'}
              </p>
              {isTutorialTipo2Step3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 8. Obrigatório Tipo 2: Ano Construtivo</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['anoConstrutivo'] && !isTutorialTipo2Step3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['anoConstrutivo']}</p>
              )}
            </div>

          </div>

          {/* SECTION 1.B: CAMPOS AVANÇADOS / OPCIONAIS (Exibidos se formMode === 'avancado') */}
          {formMode === 'avancado' && (
            <div className="mt-4 pt-4 border-t border-indigo-100/70 bg-indigo-50/30 -mx-6 px-6 pb-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Campos Avançados & Dados Complementares do Imóvel (Opcionais)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500">
                  Valores incluídos no JSON se preenchidos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* idParcela */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      ID da Parcela (<code className="font-mono text-indigo-600">idParcela</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.idParcela.label}
                      description={SINTER_FIELDS_HELP.idParcela.description}
                      format={SINTER_FIELDS_HELP.idParcela.format}
                      mandatoryRule={SINTER_FIELDS_HELP.idParcela.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.idParcela.rules}
                      example={SINTER_FIELDS_HELP.idParcela.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="text"
                    maxLength={35}
                    placeholder="Ex: PARC-2024-001 (máx 35 car.)"
                    disabled={isTipo1}
                    value={dadosGerais.idParcela || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, idParcela: sanitizeTextInput(e.target.value) })}
                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                      isTipo1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                        : hasAttemptedSubmit && fieldErrors['idParcela']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isTipo1 ? 'Não deve ser informado para Tipo 1' : 'Identificador da parcela no município'}
                  </p>
                  {hasAttemptedSubmit && fieldErrors['idParcela'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['idParcela']}</p>
                  )}
                </div>

                {/* valorVenal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Valor Venal (R$) (<code className="font-mono text-indigo-600">valorVenal</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.valorVenal.label}
                      description={SINTER_FIELDS_HELP.valorVenal.description}
                      format={SINTER_FIELDS_HELP.valorVenal.format}
                      mandatoryRule={SINTER_FIELDS_HELP.valorVenal.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.valorVenal.rules}
                      example={SINTER_FIELDS_HELP.valorVenal.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 185000.00"
                    value={dadosGerais.valorVenal !== undefined ? dadosGerais.valorVenal : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDadosGerais({
                        ...dadosGerais,
                        valorVenal: val === '' ? undefined : parseFloat(val),
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Valor base de cálculo tributário municipal</p>
                  {hasAttemptedSubmit && fieldErrors['valorVenal'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['valorVenal']}</p>
                  )}
                </div>

                {/* dtUltimoValorVenal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Data Últ. Valor Venal (<code className="font-mono text-indigo-600">dtUltimoValorVenal</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.dtUltimoValorVenal.label}
                      description={SINTER_FIELDS_HELP.dtUltimoValorVenal.description}
                      format={SINTER_FIELDS_HELP.dtUltimoValorVenal.format}
                      mandatoryRule={SINTER_FIELDS_HELP.dtUltimoValorVenal.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.dtUltimoValorVenal.rules}
                      example={SINTER_FIELDS_HELP.dtUltimoValorVenal.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="date"
                    value={dadosGerais.dtUltimoValorVenal || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, dtUltimoValorVenal: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Formato AAAA-MM-DD</p>
                  {hasAttemptedSubmit && fieldErrors['dtUltimoValorVenal'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['dtUltimoValorVenal']}</p>
                  )}
                </div>

                {/* padraoConstrutivo */}
                <div>
                  <SearchableSelect
                    label="Padrão Construtivo"
                    rightLabelElement={
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.padraoConstrutivo.label}
                        description={SINTER_FIELDS_HELP.padraoConstrutivo.description}
                        format={SINTER_FIELDS_HELP.padraoConstrutivo.format}
                        mandatoryRule={SINTER_FIELDS_HELP.padraoConstrutivo.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.padraoConstrutivo.rules}
                        example={SINTER_FIELDS_HELP.padraoConstrutivo.example}
                        position="top"
                      />
                    }
                    value={dadosGerais.padraoConstrutivo || 0}
                    options={PADRAO_CONSTRUTIVO_OPTIONS}
                    placeholder="Selecione o Padrão..."
                    onChange={(val) => setDadosGerais({ ...dadosGerais, padraoConstrutivo: Number(val) || undefined })}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Classificação do padrão da edificação</p>
                </div>

                {/* qtdGaragem */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Qtd. Garagens (<code className="font-mono text-indigo-600">qtdGaragem</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.qtdGaragem.label}
                      description={SINTER_FIELDS_HELP.qtdGaragem.description}
                      format={SINTER_FIELDS_HELP.qtdGaragem.format}
                      mandatoryRule={SINTER_FIELDS_HELP.qtdGaragem.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.qtdGaragem.rules}
                      example={SINTER_FIELDS_HELP.qtdGaragem.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    placeholder="Ex: 2"
                    value={dadosGerais.qtdGaragem !== undefined ? dadosGerais.qtdGaragem : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDadosGerais({
                        ...dadosGerais,
                        qtdGaragem: val === '' ? undefined : parseInt(val, 10),
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Número de vagas de garagem (0 a 999)</p>
                  {hasAttemptedSubmit && fieldErrors['qtdGaragem'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['qtdGaragem']}</p>
                  )}
                </div>

                {/* temPiscina */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Tem Piscina? (<code className="font-mono text-indigo-600">temPiscina</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.temPiscina.label}
                      description={SINTER_FIELDS_HELP.temPiscina.description}
                      format={SINTER_FIELDS_HELP.temPiscina.format}
                      mandatoryRule={SINTER_FIELDS_HELP.temPiscina.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.temPiscina.rules}
                      example={SINTER_FIELDS_HELP.temPiscina.example}
                      position="top"
                    />
                  </div>
                  <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl px-3 py-2 h-[38px] shadow-2xs">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="temPiscina"
                        checked={dadosGerais.temPiscina === true}
                        onChange={() => setDadosGerais({ ...dadosGerais, temPiscina: true })}
                        className="text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <span>Sim (true)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="temPiscina"
                        checked={dadosGerais.temPiscina === false}
                        onChange={() => setDadosGerais({ ...dadosGerais, temPiscina: false })}
                        className="text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <span>Não (false)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs text-slate-500 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="temPiscina"
                        checked={dadosGerais.temPiscina === undefined}
                        onChange={() => setDadosGerais({ ...dadosGerais, temPiscina: undefined })}
                        className="text-slate-400 focus:ring-slate-400 border-slate-300 cursor-pointer"
                      />
                      <span>Omitir</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Indicação de existência de piscina</p>
                </div>

                {/* valorRefMercado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Valor Ref. Mercado (R$) (<code className="font-mono text-indigo-600">valorRefMercado</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.valorRefMercado.label}
                      description={SINTER_FIELDS_HELP.valorRefMercado.description}
                      format={SINTER_FIELDS_HELP.valorRefMercado.format}
                      mandatoryRule={SINTER_FIELDS_HELP.valorRefMercado.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.valorRefMercado.rules}
                      example={SINTER_FIELDS_HELP.valorRefMercado.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 220000.00"
                    value={dadosGerais.valorRefMercado !== undefined ? dadosGerais.valorRefMercado : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDadosGerais({
                        ...dadosGerais,
                        valorRefMercado: val === '' ? undefined : parseFloat(val),
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Valor de mercado estimado para avaliação</p>
                  {hasAttemptedSubmit && fieldErrors['valorRefMercado'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['valorRefMercado']}</p>
                  )}
                </div>

                {/* dataUltValorMercado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Data Últ. Avaliação Mercado (<code className="font-mono text-indigo-600">dataUltValorMercado</code>)
                    </label>
                    <HelpTooltip
                      title={SINTER_FIELDS_HELP.dataUltValorMercado.label}
                      description={SINTER_FIELDS_HELP.dataUltValorMercado.description}
                      format={SINTER_FIELDS_HELP.dataUltValorMercado.format}
                      mandatoryRule={SINTER_FIELDS_HELP.dataUltValorMercado.mandatoryRule}
                      rules={SINTER_FIELDS_HELP.dataUltValorMercado.rules}
                      example={SINTER_FIELDS_HELP.dataUltValorMercado.example}
                      position="top"
                    />
                  </div>
                  <input
                    type="date"
                    value={dadosGerais.dataUltValorMercado || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, dataUltValorMercado: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Formato AAAA-MM-DD</p>
                  {hasAttemptedSubmit && fieldErrors['dataUltValorMercado'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['dataUltValorMercado']}</p>
                  )}
                </div>

              </div>

              {/* Subseção: Área Construída Complementar (AreaConstruidaCompl) */}
              <div className="mt-5 pt-4 border-t border-indigo-100/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Área Construída Complementar (<code className="text-indigo-600 font-mono font-normal">AreaConstruidaCompl</code>)</span>
                    </h5>
                  </div>
                  {isTipo1 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      Não preenchida para Tipo 1 (Territorial)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Opcional para Tipo 2 ou 3
                    </span>
                  )}
                </div>

                {isTipo1 && (
                  <div className="mb-3 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Conforme o manual do SINTER, <strong>AreaConstruidaCompl não deve ser preenchida</strong> para imóveis territoriais (Tipo 1).</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* areaPrivativa */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Área Privativa (m²) (<code className="font-mono text-indigo-600">areaPrivativa</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.areaPrivativa.label}
                        description={SINTER_FIELDS_HELP.areaPrivativa.description}
                        format={SINTER_FIELDS_HELP.areaPrivativa.format}
                        mandatoryRule={SINTER_FIELDS_HELP.areaPrivativa.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.areaPrivativa.rules}
                        example={SINTER_FIELDS_HELP.areaPrivativa.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.0001"
                      disabled={isTipo1}
                      placeholder={isTipo1 ? 'Desabilitado para Tipo 1' : 'Ex: 85.5000'}
                      value={areaConstruidaCompl.areaPrivativa !== undefined ? areaConstruidaCompl.areaPrivativa : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAreaConstruidaCompl({
                          ...areaConstruidaCompl,
                          areaPrivativa: val === '' ? undefined : parseFloat(val),
                        });
                      }}
                      className={`w-full border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        isTipo1
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">12 inteiros + 4 decimais (uso exclusivo)</p>
                    {hasAttemptedSubmit && fieldErrors['areaPrivativa'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['areaPrivativa']}</p>
                    )}
                  </div>

                  {/* areaComum */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Área Comum (m²) (<code className="font-mono text-indigo-600">areaComum</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.areaComum.label}
                        description={SINTER_FIELDS_HELP.areaComum.description}
                        format={SINTER_FIELDS_HELP.areaComum.format}
                        mandatoryRule={SINTER_FIELDS_HELP.areaComum.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.areaComum.rules}
                        example={SINTER_FIELDS_HELP.areaComum.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.0001"
                      disabled={isTipo1}
                      placeholder={isTipo1 ? 'Desabilitado para Tipo 1' : 'Ex: 25.2000'}
                      value={areaConstruidaCompl.areaComum !== undefined ? areaConstruidaCompl.areaComum : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAreaConstruidaCompl({
                          ...areaConstruidaCompl,
                          areaComum: val === '' ? undefined : parseFloat(val),
                        });
                      }}
                      className={`w-full border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        isTipo1
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">12 inteiros + 4 decimais (uso comum)</p>
                    {hasAttemptedSubmit && fieldErrors['areaComum'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['areaComum']}</p>
                    )}
                  </div>

                  {/* fraIdeal */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Fração Ideal (<code className="font-mono text-indigo-600">fraIdeal</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.fraIdeal.label}
                        description={SINTER_FIELDS_HELP.fraIdeal.description}
                        format={SINTER_FIELDS_HELP.fraIdeal.format}
                        mandatoryRule={SINTER_FIELDS_HELP.fraIdeal.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.fraIdeal.rules}
                        example={SINTER_FIELDS_HELP.fraIdeal.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.0001"
                      disabled={isTipo1}
                      placeholder={isTipo1 ? 'Desabilitado para Tipo 1' : 'Ex: 0.0425'}
                      value={areaConstruidaCompl.fraIdeal !== undefined ? areaConstruidaCompl.fraIdeal : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAreaConstruidaCompl({
                          ...areaConstruidaCompl,
                          fraIdeal: val === '' ? undefined : parseFloat(val),
                        });
                      }}
                      className={`w-full border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        isTipo1
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">1 inteiro + 4 decimais (ex: 0.0425)</p>
                    {hasAttemptedSubmit && fieldErrors['fraIdeal'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['fraIdeal']}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Subseção: Titulares / Proprietários (Titular) */}
              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Titulares / Proprietários (<code className="text-indigo-600 font-mono font-normal">Titular</code>)</span>
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTitulares([
                        ...titulares,
                        {
                          niTitular: '',
                          nomeTitular: '',
                          percTitular: 100,
                          dtAquisicaoTitular: new Date().toISOString().split('T')[0],
                          tipoTitularidade: 1,
                          docTitularidade: 1,
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Titular</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Cadastre a lista de proprietários ou possuidores do imóvel (opcional). Se informado CPF/CNPJ ou Nome, os demais campos do titular tornam-se obrigatórios.
                </p>

                {titulares.length === 0 ? (
                  <div className="p-4 bg-white border border-dashed border-indigo-200 rounded-xl text-center text-slate-500 text-xs">
                    Nenhum titular adicionado. Clique em <strong className="text-indigo-600">+ Adicionar Titular</strong> para incluir a lista de proprietários.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {titulares.map((titular, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs relative">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            Titular #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = titulares.filter((_, i) => i !== idx);
                              setTitulares(updated);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                            title="Remover Titular"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {/* niTitular */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                NI do Titular (CPF/CNPJ) (<code className="font-mono text-indigo-600">niTitular</code>)
                              </label>
                              <HelpTooltip
                                title={SINTER_FIELDS_HELP.niTitular.label}
                                description={SINTER_FIELDS_HELP.niTitular.description}
                                format={SINTER_FIELDS_HELP.niTitular.format}
                                mandatoryRule={SINTER_FIELDS_HELP.niTitular.mandatoryRule}
                                rules={SINTER_FIELDS_HELP.niTitular.rules}
                                example={SINTER_FIELDS_HELP.niTitular.example}
                                position="top"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Ex: 123.456.789-01 ou CNPJ"
                              value={titular.niTitular || ''}
                              onChange={(e) => {
                                const val = sanitizeTextInput(e.target.value);
                                const updated = [...titulares];
                                updated[idx] = { ...updated[idx], niTitular: val };
                                setTitulares(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">11 dígitos (CPF) ou 14 (CNPJ)</p>
                            {hasAttemptedSubmit && fieldErrors[`titular_${idx}_niTitular`] && (
                              <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors[`titular_${idx}_niTitular`]}</p>
                            )}
                          </div>

                          {/* nomeTitular */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Nome do Titular (<code className="font-mono text-indigo-600">nomeTitular</code>)
                              </label>
                              <HelpTooltip
                                title={SINTER_FIELDS_HELP.nomeTitular.label}
                                description={SINTER_FIELDS_HELP.nomeTitular.description}
                                format={SINTER_FIELDS_HELP.nomeTitular.format}
                                mandatoryRule={SINTER_FIELDS_HELP.nomeTitular.mandatoryRule}
                                rules={SINTER_FIELDS_HELP.nomeTitular.rules}
                                example={SINTER_FIELDS_HELP.nomeTitular.example}
                                position="top"
                              />
                            </div>
                            <input
                              type="text"
                              maxLength={300}
                              placeholder="Ex: João da Silva"
                              value={titular.nomeTitular || ''}
                              onChange={(e) => {
                                const val = sanitizeTextInput(e.target.value);
                                const updated = [...titulares];
                                updated[idx] = { ...updated[idx], nomeTitular: val };
                                setTitulares(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                              <span>Até 300 car.</span>
                              <span>{(titular.nomeTitular || '').length}/300</span>
                            </div>
                            {hasAttemptedSubmit && fieldErrors[`titular_${idx}_nomeTitular`] && (
                              <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors[`titular_${idx}_nomeTitular`]}</p>
                            )}
                          </div>

                          {/* percTitular */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Participação (%) (<code className="font-mono text-indigo-600">percTitular</code>)
                              </label>
                              <HelpTooltip
                                title={SINTER_FIELDS_HELP.percTitular.label}
                                description={SINTER_FIELDS_HELP.percTitular.description}
                                format={SINTER_FIELDS_HELP.percTitular.format}
                                mandatoryRule={SINTER_FIELDS_HELP.percTitular.mandatoryRule}
                                rules={SINTER_FIELDS_HELP.percTitular.rules}
                                example={SINTER_FIELDS_HELP.percTitular.example}
                                position="top"
                              />
                            </div>
                            <input
                              type="number"
                              step="0.0001"
                              placeholder="Ex: 100.0000 ou 50.0000"
                              value={titular.percTitular !== undefined ? titular.percTitular : (titular.percTitularidade !== undefined ? titular.percTitularidade : '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...titulares];
                                updated[idx] = {
                                  ...updated[idx],
                                  percTitular: val === '' ? undefined : parseFloat(val),
                                };
                                setTitulares(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">1 inteiro + 4 decimais</p>
                            {hasAttemptedSubmit && fieldErrors[`titular_${idx}_percTitular`] && (
                              <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors[`titular_${idx}_percTitular`]}</p>
                            )}
                          </div>

                          {/* dtAquisicaoTitular */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Data Aquisição (<code className="font-mono text-indigo-600">dtAquisicaoTitular</code>)
                              </label>
                              <HelpTooltip
                                title={SINTER_FIELDS_HELP.dtAquisicaoTitular.label}
                                description={SINTER_FIELDS_HELP.dtAquisicaoTitular.description}
                                format={SINTER_FIELDS_HELP.dtAquisicaoTitular.format}
                                mandatoryRule={SINTER_FIELDS_HELP.dtAquisicaoTitular.mandatoryRule}
                                rules={SINTER_FIELDS_HELP.dtAquisicaoTitular.rules}
                                example={SINTER_FIELDS_HELP.dtAquisicaoTitular.example}
                                position="top"
                              />
                            </div>
                            <input
                              type="date"
                              value={titular.dtAquisicaoTitular || ''}
                              onChange={(e) => {
                                const updated = [...titulares];
                                updated[idx] = { ...updated[idx], dtAquisicaoTitular: e.target.value };
                                setTitulares(updated);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-0.5">YYYY-MM-DD</p>
                            {hasAttemptedSubmit && fieldErrors[`titular_${idx}_dtAquisicaoTitular`] && (
                              <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors[`titular_${idx}_dtAquisicaoTitular`]}</p>
                            )}
                          </div>

                          {/* tipoTitularidade */}
                          <div>
                            <SearchableSelect
                              label="Tipo Titularidade"
                              rightLabelElement={
                                <HelpTooltip
                                  title={SINTER_FIELDS_HELP.tipoTitularidade.label}
                                  description={SINTER_FIELDS_HELP.tipoTitularidade.description}
                                  format={SINTER_FIELDS_HELP.tipoTitularidade.format}
                                  mandatoryRule={SINTER_FIELDS_HELP.tipoTitularidade.mandatoryRule}
                                  rules={SINTER_FIELDS_HELP.tipoTitularidade.rules}
                                  example={SINTER_FIELDS_HELP.tipoTitularidade.example}
                                  position="top"
                                />
                              }
                              options={TIPO_TITULARIDADE_OPTIONS}
                              value={titular.tipoTitularidade ?? 1}
                              onChange={(val) => {
                                const updated = [...titulares];
                                updated[idx] = { ...updated[idx], tipoTitularidade: Number(val) };
                                setTitulares(updated);
                              }}
                              placeholder="Selecione o tipo..."
                              error={hasAttemptedSubmit ? fieldErrors[`titular_${idx}_tipoTitularidade`] : undefined}
                            />
                          </div>

                          {/* docTitularidade */}
                          <div>
                            <SearchableSelect
                              label="Documento Titularidade"
                              rightLabelElement={
                                <HelpTooltip
                                  title={SINTER_FIELDS_HELP.docTitularidade.label}
                                  description={SINTER_FIELDS_HELP.docTitularidade.description}
                                  format={SINTER_FIELDS_HELP.docTitularidade.format}
                                  mandatoryRule={SINTER_FIELDS_HELP.docTitularidade.mandatoryRule}
                                  rules={SINTER_FIELDS_HELP.docTitularidade.rules}
                                  example={SINTER_FIELDS_HELP.docTitularidade.example}
                                  position="top"
                                />
                              }
                              options={DOC_TITULARIDADE_OPTIONS}
                              value={titular.docTitularidade ?? 1}
                              onChange={(val) => {
                                const updated = [...titulares];
                                updated[idx] = { ...updated[idx], docTitularidade: Number(val) };
                                setTitulares(updated);
                              }}
                              placeholder="Selecione o documento..."
                              error={hasAttemptedSubmit ? fieldErrors[`titular_${idx}_docTitularidade`] : undefined}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subseção: Serviço de Registro de Imóveis (ServicoRegistroImovel) */}
              <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-100/80 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-4 bg-sky-600 rounded-full" />
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Serviço de Registro de Imóveis (<code className="text-sky-600 font-mono font-normal">ServicoRegistroImovel</code>)</span>
                  </h5>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dados cartoriais opcionais do imóvel no Registro de Imóveis (RI).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* nomeServentiaRI */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nome da Serventia RI (<code className="font-mono text-sky-600">nomeServentiaRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.nomeServentiaRI.label}
                        description={SINTER_FIELDS_HELP.nomeServentiaRI.description}
                        format={SINTER_FIELDS_HELP.nomeServentiaRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.nomeServentiaRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.nomeServentiaRI.rules}
                        example={SINTER_FIELDS_HELP.nomeServentiaRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Ex: 1º Cartório de Registro de Imóveis"
                      value={servicoRegistroImovel.nomeServentiaRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, nomeServentiaRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs transition-all"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Opcional (máx 300 car.)</span>
                      <span className="font-mono font-bold">{(servicoRegistroImovel.nomeServentiaRI || '').length}/300</span>
                    </div>
                    {hasAttemptedSubmit && fieldErrors['nomeServentiaRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['nomeServentiaRI']}</p>
                    )}
                  </div>

                  {/* cnsRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        CNS RI (<code className="font-mono text-sky-600">cnsRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.cnsRI.label}
                        description={SINTER_FIELDS_HELP.cnsRI.description}
                        format={SINTER_FIELDS_HELP.cnsRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.cnsRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.cnsRI.rules}
                        example={SINTER_FIELDS_HELP.cnsRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Ex: 012345 (6 dígitos)"
                      value={servicoRegistroImovel.cnsRI !== undefined ? String(servicoRegistroImovel.cnsRI) : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setServicoRegistroImovel({ ...servicoRegistroImovel, cnsRI: digits ? parseInt(digits, 10) : undefined });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">6 dígitos (Código Nacional Serventia)</p>
                    {hasAttemptedSubmit && fieldErrors['cnsRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['cnsRI']}</p>
                    )}
                  </div>

                  {/* cnmRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        CNM RI (<code className="font-mono text-sky-600">cnmRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.cnmRI.label}
                        description={SINTER_FIELDS_HELP.cnmRI.description}
                        format={SINTER_FIELDS_HELP.cnmRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.cnmRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.cnmRI.rules}
                        example={SINTER_FIELDS_HELP.cnmRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={25}
                      placeholder="Ex: 012345.2.0001234-56"
                      value={servicoRegistroImovel.cnmRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, cnmRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Código Nac. Matrícula (16 car.)</p>
                    {hasAttemptedSubmit && fieldErrors['cnmRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['cnmRI']}</p>
                    )}
                  </div>

                  {/* numMatriculaRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nº Matrícula RI (<code className="font-mono text-sky-600">numMatriculaRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.numMatriculaRI.label}
                        description={SINTER_FIELDS_HELP.numMatriculaRI.description}
                        format={SINTER_FIELDS_HELP.numMatriculaRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.numMatriculaRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.numMatriculaRI.rules}
                        example={SINTER_FIELDS_HELP.numMatriculaRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="Ex: 123456"
                      value={servicoRegistroImovel.numMatriculaRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, numMatriculaRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 15 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['numMatriculaRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['numMatriculaRI']}</p>
                    )}
                  </div>

                  {/* numUltimoAtoRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nº Último Ato (<code className="font-mono text-sky-600">numUltimoAtoRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.numUltimoAtoRI.label}
                        description={SINTER_FIELDS_HELP.numUltimoAtoRI.description}
                        format={SINTER_FIELDS_HELP.numUltimoAtoRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.numUltimoAtoRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.numUltimoAtoRI.rules}
                        example={SINTER_FIELDS_HELP.numUltimoAtoRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={7}
                      placeholder="Ex: R-12345"
                      value={servicoRegistroImovel.numUltimoAtoRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, numUltimoAtoRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 7 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['numUltimoAtoRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['numUltimoAtoRI']}</p>
                    )}
                  </div>

                  {/* lvCartRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Livro Cartorial (<code className="font-mono text-sky-600">lvCartRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.lvCartRI.label}
                        description={SINTER_FIELDS_HELP.lvCartRI.description}
                        format={SINTER_FIELDS_HELP.lvCartRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.lvCartRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.lvCartRI.rules}
                        example={SINTER_FIELDS_HELP.lvCartRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ex: 2-A"
                      value={servicoRegistroImovel.lvCartRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, lvCartRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 4 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['lvCartRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['lvCartRI']}</p>
                    )}
                  </div>

                  {/* flCartRI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Folha do Livro (<code className="font-mono text-sky-600">flCartRI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.flCartRI.label}
                        description={SINTER_FIELDS_HELP.flCartRI.description}
                        format={SINTER_FIELDS_HELP.flCartRI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.flCartRI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.flCartRI.rules}
                        example={SINTER_FIELDS_HELP.flCartRI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ex: 150"
                      value={servicoRegistroImovel.flCartRI || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, flCartRI: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 4 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['flCartRI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['flCartRI']}</p>
                    )}
                  </div>

                  {/* dtUltAtualizacao */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Data Última Atualização (<code className="font-mono text-sky-600">dtUltAtualizacao</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.dtUltAtualizacao.label}
                        description={SINTER_FIELDS_HELP.dtUltAtualizacao.description}
                        format={SINTER_FIELDS_HELP.dtUltAtualizacao.format}
                        mandatoryRule={SINTER_FIELDS_HELP.dtUltAtualizacao.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.dtUltAtualizacao.rules}
                        example={SINTER_FIELDS_HELP.dtUltAtualizacao.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="date"
                      value={servicoRegistroImovel.dtUltAtualizacao || ''}
                      onChange={(e) => setServicoRegistroImovel({ ...servicoRegistroImovel, dtUltAtualizacao: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Formato: AAAA-MM-DD</p>
                    {hasAttemptedSubmit && fieldErrors['dtUltAtualizacao'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['dtUltAtualizacao']}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Subseção: Cartório de Notas (CartorioNotas) */}
              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/80 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Cartório de Notas (<code className="text-emerald-600 font-mono font-normal">CartorioNotas</code>)</span>
                  </h5>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dados cartoriais opcionais do Tabelionato de Notas onde foi lavrada a escritura.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* nomeServentiaNotas */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nome da Serventia (<code className="font-mono text-emerald-600">nomeServentiaNotas</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.nomeServentiaNotas.label}
                        description={SINTER_FIELDS_HELP.nomeServentiaNotas.description}
                        format={SINTER_FIELDS_HELP.nomeServentiaNotas.format}
                        mandatoryRule={SINTER_FIELDS_HELP.nomeServentiaNotas.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.nomeServentiaNotas.rules}
                        example={SINTER_FIELDS_HELP.nomeServentiaNotas.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Ex: 2º Tabelionato de Notas"
                      value={cartorioNotas.nomeServentiaNotas || ''}
                      onChange={(e) => setCartorioNotas({ ...cartorioNotas, nomeServentiaNotas: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Opcional (máx 300 car.)</span>
                      <span className="font-mono font-bold">{(cartorioNotas.nomeServentiaNotas || '').length}/300</span>
                    </div>
                    {hasAttemptedSubmit && fieldErrors['nomeServentiaNotas'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['nomeServentiaNotas']}</p>
                    )}
                  </div>

                  {/* cnsNotas */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        CNS Notas (<code className="font-mono text-emerald-600">cnsNotas</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.cnsNotas.label}
                        description={SINTER_FIELDS_HELP.cnsNotas.description}
                        format={SINTER_FIELDS_HELP.cnsNotas.format}
                        mandatoryRule={SINTER_FIELDS_HELP.cnsNotas.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.cnsNotas.rules}
                        example={SINTER_FIELDS_HELP.cnsNotas.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Ex: 098765 (6 dígitos)"
                      value={cartorioNotas.cnsNotas !== undefined ? String(cartorioNotas.cnsNotas) : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCartorioNotas({ ...cartorioNotas, cnsNotas: digits ? parseInt(digits, 10) : undefined });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">6 dígitos (CNJ Serventia)</p>
                    {hasAttemptedSubmit && fieldErrors['cnsNotas'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['cnsNotas']}</p>
                    )}
                  </div>

                  {/* lvCartNotas */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Livro do Cartório (<code className="font-mono text-emerald-600">lvCartNotas</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.lvCartNotas.label}
                        description={SINTER_FIELDS_HELP.lvCartNotas.description}
                        format={SINTER_FIELDS_HELP.lvCartNotas.format}
                        mandatoryRule={SINTER_FIELDS_HELP.lvCartNotas.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.lvCartNotas.rules}
                        example={SINTER_FIELDS_HELP.lvCartNotas.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ex: 120A"
                      value={cartorioNotas.lvCartNotas || ''}
                      onChange={(e) => setCartorioNotas({ ...cartorioNotas, lvCartNotas: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 4 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['lvCartNotas'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['lvCartNotas']}</p>
                    )}
                  </div>

                  {/* flCartNotas */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Folha do Cartório (<code className="font-mono text-emerald-600">flCartNotas</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.flCartNotas.label}
                        description={SINTER_FIELDS_HELP.flCartNotas.description}
                        format={SINTER_FIELDS_HELP.flCartNotas.format}
                        mandatoryRule={SINTER_FIELDS_HELP.flCartNotas.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.flCartNotas.rules}
                        example={SINTER_FIELDS_HELP.flCartNotas.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Ex: 045"
                      value={cartorioNotas.flCartNotas || ''}
                      onChange={(e) => setCartorioNotas({ ...cartorioNotas, flCartNotas: sanitizeTextInput(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono shadow-2xs transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Até 4 caracteres</p>
                    {hasAttemptedSubmit && fieldErrors['flCartNotas'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['flCartNotas']}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* ITBI (Imposto sobre Transmissão de Bens Imóveis) */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">
                      ITBI - Imposto sobre Transmissão de Bens Imóveis (<code className="font-mono text-amber-700">itbi</code>)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                    Opcional / Fato Gerador
                  </span>
                </div>

                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Informações da última transação onerosa do imóvel. <strong>Regra SINTER:</strong> Se informado qualquer valor no bloco de ITBI, todos os campos passam a ser obrigatórios, e é necessário incluir ao menos um Transmitente e um Adquirente.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* baseCalculITBI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Base de Cálculo (R$) (<code className="font-mono text-amber-700">baseCalculITBI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.baseCalculITBI.label}
                        description={SINTER_FIELDS_HELP.baseCalculITBI.description}
                        format={SINTER_FIELDS_HELP.baseCalculITBI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.baseCalculITBI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.baseCalculITBI.rules}
                        example={SINTER_FIELDS_HELP.baseCalculITBI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 350000.00"
                      value={itbi.baseCalculITBI !== undefined ? itbi.baseCalculITBI : ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                        setItbi({ ...itbi, baseCalculITBI: val });
                      }}
                      className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        hasAttemptedSubmit && fieldErrors['baseCalculITBI']
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Numérico (18 int + 2 dec)</p>
                    {hasAttemptedSubmit && fieldErrors['baseCalculITBI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['baseCalculITBI']}</p>
                    )}
                  </div>

                  {/* valorRefITBI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Valor de Referência (R$) (<code className="font-mono text-amber-700">valorRefITBI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.valorRefITBI.label}
                        description={SINTER_FIELDS_HELP.valorRefITBI.description}
                        format={SINTER_FIELDS_HELP.valorRefITBI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.valorRefITBI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.valorRefITBI.rules}
                        example={SINTER_FIELDS_HELP.valorRefITBI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 380000.00"
                      value={itbi.valorRefITBI !== undefined ? itbi.valorRefITBI : ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                        setItbi({ ...itbi, valorRefITBI: val });
                      }}
                      className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        hasAttemptedSubmit && fieldErrors['valorRefITBI']
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Numérico (18 int + 2 dec)</p>
                    {hasAttemptedSubmit && fieldErrors['valorRefITBI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['valorRefITBI']}</p>
                    )}
                  </div>

                  {/* dtTransacaoITBI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Data da Transação (<code className="font-mono text-amber-700">dtTransacaoITBI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.dtTransacaoITBI.label}
                        description={SINTER_FIELDS_HELP.dtTransacaoITBI.description}
                        format={SINTER_FIELDS_HELP.dtTransacaoITBI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.dtTransacaoITBI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.dtTransacaoITBI.rules}
                        example={SINTER_FIELDS_HELP.dtTransacaoITBI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="date"
                      value={itbi.dtTransacaoITBI || ''}
                      onChange={(e) => setItbi({ ...itbi, dtTransacaoITBI: e.target.value })}
                      className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        hasAttemptedSubmit && fieldErrors['dtTransacaoITBI']
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Formato YYYY-MM-DD</p>
                    {hasAttemptedSubmit && fieldErrors['dtTransacaoITBI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['dtTransacaoITBI']}</p>
                    )}
                  </div>

                  {/* tpTransacaoITBI */}
                  <div>
                    <SearchableSelect
                      label="Tipo de Transação ITBI *"
                      rightLabelElement={
                        <HelpTooltip
                          title={SINTER_FIELDS_HELP.tpTransacaoITBI.label}
                          description={SINTER_FIELDS_HELP.tpTransacaoITBI.description}
                          format={SINTER_FIELDS_HELP.tpTransacaoITBI.format}
                          mandatoryRule={SINTER_FIELDS_HELP.tpTransacaoITBI.mandatoryRule}
                          rules={SINTER_FIELDS_HELP.tpTransacaoITBI.rules}
                          example={SINTER_FIELDS_HELP.tpTransacaoITBI.example}
                          position="top"
                        />
                      }
                      value={itbi.tpTransacaoITBI || ''}
                      options={TP_TRANSACAO_ITBI_OPTIONS}
                      placeholder="Selecione o tipo..."
                      hasError={hasAttemptedSubmit && !!fieldErrors['tpTransacaoITBI']}
                      onChange={(val) => setItbi({ ...itbi, tpTransacaoITBI: Number(val) })}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Inteiro (2 dígitos)</p>
                    {hasAttemptedSubmit && fieldErrors['tpTransacaoITBI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['tpTransacaoITBI']}</p>
                    )}
                  </div>

                  {/* percTransacionadoITBI */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Percentual Transacionado (<code className="font-mono text-amber-700">percTransacionadoITBI</code>)
                      </label>
                      <HelpTooltip
                        title={SINTER_FIELDS_HELP.percTransacionadoITBI.label}
                        description={SINTER_FIELDS_HELP.percTransacionadoITBI.description}
                        format={SINTER_FIELDS_HELP.percTransacionadoITBI.format}
                        mandatoryRule={SINTER_FIELDS_HELP.percTransacionadoITBI.mandatoryRule}
                        rules={SINTER_FIELDS_HELP.percTransacionadoITBI.rules}
                        example={SINTER_FIELDS_HELP.percTransacionadoITBI.example}
                        position="top"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      placeholder="Ex: 1.000000 (100%)"
                      value={itbi.percTransacionadoITBI !== undefined ? itbi.percTransacionadoITBI : ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                        setItbi({ ...itbi, percTransacionadoITBI: val });
                      }}
                      className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                        hasAttemptedSubmit && fieldErrors['percTransacionadoITBI']
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Numérico (1 int + 6 dec. Ex: 1.000000 = 100%)</p>
                    {hasAttemptedSubmit && fieldErrors['percTransacionadoITBI'] && (
                      <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['percTransacionadoITBI']}</p>
                    )}
                  </div>
                </div>

                {/* Transmitentes ITBI */}
                <div className="pt-3 border-t border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-900">
                        Transmitentes do ITBI ({itbi.TransmitenteITBI?.length || 0})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const list = itbi.TransmitenteITBI || [];
                        setItbi({
                          ...itbi,
                          TransmitenteITBI: [...list, { idTransmitenteITBI: '', niTransmitenteITBI: '', nomeTransmitenteITBI: '' }],
                        });
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Adicionar Transmitente</span>
                    </button>
                  </div>

                  {hasAttemptedSubmit && fieldErrors['TransmitenteITBI'] && (
                    <p className="text-[11px] font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {fieldErrors['TransmitenteITBI']}
                    </p>
                  )}

                  {(!itbi.TransmitenteITBI || itbi.TransmitenteITBI.length === 0) ? (
                    <div className="text-center py-3 text-xs text-amber-700/80 bg-amber-100/40 rounded-xl border border-dashed border-amber-200">
                      Nenhum transmitente adicionado. Clique em &quot;Adicionar Transmitente&quot;.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {itbi.TransmitenteITBI.map((t, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            <div>
                              <input
                                type="text"
                                maxLength={300}
                                placeholder="Nome Completo / Razão Social"
                                value={t.nomeTransmitenteITBI || ''}
                                onChange={(e) => {
                                  const list = [...(itbi.TransmitenteITBI || [])];
                                  list[idx] = { ...list[idx], nomeTransmitenteITBI: sanitizeTextInput(e.target.value) };
                                  setItbi({ ...itbi, TransmitenteITBI: list });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                              />
                              {hasAttemptedSubmit && fieldErrors[`transmitente_${idx}_nome`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`transmitente_${idx}_nome`]}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                maxLength={14}
                                placeholder="CPF / CNPJ (apenas números)"
                                value={t.niTransmitenteITBI || t.idTransmitenteITBI || ''}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                                  const list = [...(itbi.TransmitenteITBI || [])];
                                  list[idx] = { ...list[idx], niTransmitenteITBI: digits, idTransmitenteITBI: digits };
                                  setItbi({ ...itbi, TransmitenteITBI: list });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                              />
                              {hasAttemptedSubmit && fieldErrors[`transmitente_${idx}_ni`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`transmitente_${idx}_ni`]}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const list = (itbi.TransmitenteITBI || []).filter((_, i) => i !== idx);
                              setItbi({ ...itbi, TransmitenteITBI: list });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remover Transmitente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adquirentes ITBI */}
                <div className="pt-3 border-t border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-900">
                        Adquirentes do ITBI ({itbi.AdquirenteITBI?.length || 0})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const list = itbi.AdquirenteITBI || [];
                        setItbi({
                          ...itbi,
                          AdquirenteITBI: [...list, { idAdquirenteITBI: '', niAdquirenteITBI: '', nomeAdquirenteITBI: '', percTransacAdquirenteITBI: 1 }],
                        });
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Adicionar Adquirente</span>
                    </button>
                  </div>

                  {hasAttemptedSubmit && fieldErrors['AdquirenteITBI'] && (
                    <p className="text-[11px] font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {fieldErrors['AdquirenteITBI']}
                    </p>
                  )}

                  {(!itbi.AdquirenteITBI || itbi.AdquirenteITBI.length === 0) ? (
                    <div className="text-center py-3 text-xs text-amber-700/80 bg-amber-100/40 rounded-xl border border-dashed border-amber-200">
                      Nenhum adquirente adicionado. Clique em &quot;Adicionar Adquirente&quot;.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {itbi.AdquirenteITBI.map((a, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                            <div>
                              <input
                                type="text"
                                maxLength={300}
                                placeholder="Nome Completo / Razão Social"
                                value={a.nomeAdquirenteITBI || ''}
                                onChange={(e) => {
                                  const list = [...(itbi.AdquirenteITBI || [])];
                                  list[idx] = { ...list[idx], nomeAdquirenteITBI: sanitizeTextInput(e.target.value) };
                                  setItbi({ ...itbi, AdquirenteITBI: list });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                              />
                              {hasAttemptedSubmit && fieldErrors[`adquirente_${idx}_nome`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`adquirente_${idx}_nome`]}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                maxLength={14}
                                placeholder="CPF / CNPJ (números)"
                                value={a.niAdquirenteITBI || a.idAdquirenteITBI || ''}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                                  const list = [...(itbi.AdquirenteITBI || [])];
                                  list[idx] = { ...list[idx], niAdquirenteITBI: digits, idAdquirenteITBI: digits };
                                  setItbi({ ...itbi, AdquirenteITBI: list });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                              />
                              {hasAttemptedSubmit && fieldErrors[`adquirente_${idx}_ni`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`adquirente_${idx}_ni`]}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="number"
                                step="0.000001"
                                min="0.000001"
                                placeholder="Perc. Transac. Ex: 1.000000"
                                value={a.percTransacAdquirenteITBI !== undefined ? a.percTransacAdquirenteITBI : ''}
                                onChange={(e) => {
                                  const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                                  const list = [...(itbi.AdquirenteITBI || [])];
                                  list[idx] = { ...list[idx], percTransacAdquirenteITBI: val };
                                  setItbi({ ...itbi, AdquirenteITBI: list });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                              />
                              {hasAttemptedSubmit && fieldErrors[`adquirente_${idx}_perc`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`adquirente_${idx}_perc`]}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const list = (itbi.AdquirenteITBI || []).filter((_, i) => i !== idx);
                              setItbi({ ...itbi, AdquirenteITBI: list });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remover Adquirente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Endereço do Imóvel */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2.5 text-slate-900 font-semibold text-sm pb-2.5 border-b border-slate-100">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>2. Endereço do Imóvel (<code className="text-xs text-emerald-600 font-mono font-normal">ui.EnderecoImovel</code>)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 5. Tipo Logradouro */}
            <div id="tutorial-field-tipo-logradouro">
              <SearchableSelect
                label="Tipo Logradouro *"
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.tipoLogradouro.label}
                    description={SINTER_FIELDS_HELP.tipoLogradouro.description}
                    format={SINTER_FIELDS_HELP.tipoLogradouro.format}
                    mandatoryRule={SINTER_FIELDS_HELP.tipoLogradouro.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.tipoLogradouro.rules}
                    example={SINTER_FIELDS_HELP.tipoLogradouro.example}
                    position="top"
                  />
                }
                value={endereco.tipoLogradouro}
                options={TIPO_LOGRADOURO_OPTIONS}
                placeholder="Selecione o Tipo de Logradouro..."
                hasError={isTutorialStep3 || (hasAttemptedSubmit && !!fieldErrors['tipoLogradouro'])}
                onChange={(val) => setEndereco({ ...endereco, tipoLogradouro: Number(val) })}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Código da tabela SINTER (Ex: 250 = RUA)
              </p>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 Obrigatório: Tipo Logradouro</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['tipoLogradouro'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['tipoLogradouro']}</p>
              )}
            </div>

            {/* 6. Nome Logradouro */}
            <div id="tutorial-field-nome-logradouro">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Nome do Logradouro <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.nomeLogradouro.label}
                  description={SINTER_FIELDS_HELP.nomeLogradouro.description}
                  format={SINTER_FIELDS_HELP.nomeLogradouro.format}
                  mandatoryRule={SINTER_FIELDS_HELP.nomeLogradouro.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.nomeLogradouro.rules}
                  example={SINTER_FIELDS_HELP.nomeLogradouro.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={300}
                placeholder="Ex: 2 De Julho (máx 300 car.)"
                value={endereco.nomeLogradouro}
                onChange={(e) => setEndereco({ ...endereco, nomeLogradouro: sanitizeTextInput(e.target.value) })}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                  isTutorialStep3 || (hasAttemptedSubmit && fieldErrors['nomeLogradouro'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Regra: String até 300 car.</span>
                <span className={`font-mono font-bold ${
                  (endereco.nomeLogradouro || '').length > 300 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(endereco.nomeLogradouro || '').length}/300
                </span>
              </div>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 Obrigatório: Nome Logradouro</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['nomeLogradouro'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['nomeLogradouro']}</p>
              )}
            </div>

            {/* 7. Bairro */}
            <div id="tutorial-field-bairro">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Bairro <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.bairro.label}
                  description={SINTER_FIELDS_HELP.bairro.description}
                  format={SINTER_FIELDS_HELP.bairro.format}
                  mandatoryRule={SINTER_FIELDS_HELP.bairro.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.bairro.rules}
                  example={SINTER_FIELDS_HELP.bairro.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={30}
                placeholder="Ex: São Sebastião (máx 30 car.)"
                value={endereco.bairro}
                onChange={(e) => setEndereco({ ...endereco, bairro: sanitizeTextInput(e.target.value) })}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                  isTutorialStep3 || (hasAttemptedSubmit && fieldErrors['bairro'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Regra: String até 30 car.</span>
                <span className={`font-mono font-bold ${
                  (endereco.bairro || '').length > 30 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(endereco.bairro || '').length}/30
                </span>
              </div>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 Obrigatório: Bairro</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['bairro'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['bairro']}</p>
              )}
            </div>

            {/* 8. CEP */}
            <div id="tutorial-field-cep">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  CEP <span className="text-rose-500">*</span>
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.cep.label}
                  description={SINTER_FIELDS_HELP.cep.description}
                  format={SINTER_FIELDS_HELP.cep.format}
                  mandatoryRule={SINTER_FIELDS_HELP.cep.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.cep.rules}
                  example={SINTER_FIELDS_HELP.cep.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={8}
                placeholder="Ex: 45653758 (8 dígitos)"
                value={endereco.cep}
                onChange={handleCepChange}
                className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-mono shadow-2xs transition-all ${
                  isTutorialStep3 || (hasAttemptedSubmit && fieldErrors['cep'])
                    ? 'border-2 border-rose-500 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Regra: Exatamente 8 números</span>
                <span className={`font-mono font-bold ${
                  (endereco.cep || '').length === 8 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {(endereco.cep || '').length}/8
                </span>
              </div>
              {isTutorialStep3 && (
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  <span>🔴 Obrigatório: CEP (8 dígitos)</span>
                </div>
              )}
              {hasAttemptedSubmit && fieldErrors['cep'] && !isTutorialStep3 && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['cep']}</p>
              )}
            </div>

            {/* Número Imóvel */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Número do Imóvel (<code className="font-mono text-emerald-600">numeroImovel</code>)
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.numeroImovel.label}
                  description={SINTER_FIELDS_HELP.numeroImovel.description}
                  format={SINTER_FIELDS_HELP.numeroImovel.format}
                  mandatoryRule={SINTER_FIELDS_HELP.numeroImovel.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.numeroImovel.rules}
                  example={SINTER_FIELDS_HELP.numeroImovel.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={8}
                placeholder="Ex: 23 ou S/N (máx 8 car.)"
                value={endereco.numeroImovel}
                onChange={(e) => setEndereco({ ...endereco, numeroImovel: sanitizeTextInput(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-2xs transition-all"
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Opcional (até 8 car.)</span>
                <span className={`font-mono font-bold ${
                  (endereco.numeroImovel || '').length > 8 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(endereco.numeroImovel || '').length}/8
                </span>
              </div>
              {hasAttemptedSubmit && fieldErrors['numeroImovel'] && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['numeroImovel']}</p>
              )}
            </div>

            {/* Compl Nro Imóvel */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Complemento Número (<code className="font-mono text-emerald-600">complNroImovel</code>)
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.complNroImovel.label}
                  description={SINTER_FIELDS_HELP.complNroImovel.description}
                  format={SINTER_FIELDS_HELP.complNroImovel.format}
                  mandatoryRule={SINTER_FIELDS_HELP.complNroImovel.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.complNroImovel.rules}
                  example={SINTER_FIELDS_HELP.complNroImovel.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={30}
                placeholder="Ex: APTO 302, BL B (máx 30 car.)"
                value={endereco.complNroImovel}
                onChange={(e) => setEndereco({ ...endereco, complNroImovel: sanitizeTextInput(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Opcional (até 30 car.)</span>
                <span className={`font-mono font-bold ${
                  (endereco.complNroImovel || '').length > 30 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(endereco.complNroImovel || '').length}/30
                </span>
              </div>
              {hasAttemptedSubmit && fieldErrors['complNroImovel'] && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['complNroImovel']}</p>
              )}
            </div>

            {/* Compl Endereço */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Complemento Endereço (<code className="font-mono text-emerald-600">complEndereco</code>)
                </label>
                <HelpTooltip
                  title={SINTER_FIELDS_HELP.complEndereco.label}
                  description={SINTER_FIELDS_HELP.complEndereco.description}
                  format={SINTER_FIELDS_HELP.complEndereco.format}
                  mandatoryRule={SINTER_FIELDS_HELP.complEndereco.mandatoryRule}
                  rules={SINTER_FIELDS_HELP.complEndereco.rules}
                  example={SINTER_FIELDS_HELP.complEndereco.example}
                  position="top"
                />
              </div>
              <input
                type="text"
                maxLength={30}
                placeholder="Ex: EDIF DAS FLORES (máx 30 car.)"
                value={endereco.complEndereco}
                onChange={(e) => setEndereco({ ...endereco, complEndereco: sanitizeTextInput(e.target.value) })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
              />
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Opcional (até 30 car.)</span>
                <span className={`font-mono font-bold ${
                  (endereco.complEndereco || '').length > 30 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  {(endereco.complEndereco || '').length}/30
                </span>
              </div>
              {hasAttemptedSubmit && fieldErrors['complEndereco'] && (
                <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['complEndereco']}</p>
              )}
            </div>

            {/* Operação */}
            <div>
              <SearchableSelect
                label="Operação (operacao)"
                rightLabelElement={
                  <HelpTooltip
                    title={SINTER_FIELDS_HELP.operacao.label}
                    description={SINTER_FIELDS_HELP.operacao.description}
                    format={SINTER_FIELDS_HELP.operacao.format}
                    mandatoryRule={SINTER_FIELDS_HELP.operacao.mandatoryRule}
                    rules={SINTER_FIELDS_HELP.operacao.rules}
                    example={SINTER_FIELDS_HELP.operacao.example}
                    position="top"
                  />
                }
                value={operacao}
                options={OPERACAO_OPTIONS}
                onChange={(val) => setOperacao(String(val))}
              />
              <p className="text-[10px] text-slate-400 mt-1">I = Inclusão, A = Alteração, E = Exclusão</p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Limpar Formulário</span>
          </button>

          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
            
            {showSuccessToast && (
              <span className="flex items-center space-x-1.5 text-xs font-medium text-emerald-700 animate-fade-in bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Registro validado e incluído no JSON!</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Abrir gerador em lote para incluir múltiplos registros sequenciais"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Incluir em Lote</span>
            </button>

            <button
              id="tutorial-submit-btn"
              type="submit"
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                isTipo1
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Incluir Registro no JSON</span>
              <span className="hidden md:inline text-[10px] font-mono ml-1 bg-black/20 px-1.5 py-0.5 rounded opacity-90">
                Ctrl+Enter
              </span>
            </button>

          </div>

        </div>

      </form>

      {/* Batch Generation Modal */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        baseDadosGerais={dadosGerais}
        baseEndereco={endereco}
        baseOperacao={operacao}
        baseAreaConstruidaCompl={areaConstruidaCompl}
        baseTitulares={titulares}
        baseServicoRegistroImovel={servicoRegistroImovel}
        baseCartorioNotas={cartorioNotas}
        baseItbi={itbi}
        onGenerateBatch={(newRecords) => {
          onAddBatchRecords(newRecords);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 2500);
        }}
      />
    </div>
  );
};

