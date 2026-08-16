import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, AlertCircle, ShieldCheck, AlertTriangle, Sliders, User, UserPlus, Users, Trash2, FileText, BookOpen } from 'lucide-react';
import { NDJsonRecord, DadosGeraisImovel, EnderecoImovel, AreaConstruidaCompl, TitularItem, ServicoRegistroImovel, CartorioNotas, ITBI } from '../types';
import { SearchableSelect } from './SearchableSelect';
import {
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
} from '../constants';
import { validateRecordData, sanitizeAreaTerreno } from '../utils/validation';
import { HelpTooltip } from './HelpTooltip';
import { SINTER_FIELDS_HELP, sanitizeTextInput } from '../utils/fieldHelp';

interface EditRecordModalProps {
  record: NDJsonRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: NDJsonRecord) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [dadosGerais, setDadosGerais] = useState<DadosGeraisImovel | null>(null);
  const [endereco, setEndereco] = useState<EnderecoImovel | null>(null);
  const [areaConstruidaCompl, setAreaConstruidaCompl] = useState<AreaConstruidaCompl>({});
  const [titulares, setTitulares] = useState<TitularItem[]>([]);
  const [servicoRegistroImovel, setServicoRegistroImovel] = useState<ServicoRegistroImovel>({});
  const [cartorioNotas, setCartorioNotas] = useState<CartorioNotas>({});
  const [itbi, setItbi] = useState<ITBI>({});
  const [operacao, setOperacao] = useState<string>('I');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setDadosGerais({ ...record.dadosGerais });
      setEndereco({ ...record.endereco });
      setAreaConstruidaCompl(record.areaConstruidaCompl ? { ...record.areaConstruidaCompl } : {});
      setTitulares(record.titulares ? [...record.titulares] : []);
      setServicoRegistroImovel(record.servicoRegistroImovel ? { ...record.servicoRegistroImovel } : {});
      setCartorioNotas(record.cartorioNotas ? { ...record.cartorioNotas } : {});
      setItbi(record.itbi ? JSON.parse(JSON.stringify(record.itbi)) : {});
      setOperacao(record.operacao || 'I');
      setHasAttemptedSubmit(false);
    }
  }, [record]);

  if (!isOpen || !record || !dadosGerais || !endereco) return null;

  const isTipo1 = Number(dadosGerais.tipoImovel) === 1;
  const isTipo2 = Number(dadosGerais.tipoImovel) === 2;
  const isTipo3 = Number(dadosGerais.tipoImovel) === 3;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validationResult.isValid) {
      return;
    }

    const cleanAreaTerreno = sanitizeAreaTerreno(dadosGerais.areaTerreno);
    const cleanCep = String(endereco.cep || '').replace(/\D/g, '');

    const hasAreaCompl = !isTipo1 && (
      areaConstruidaCompl.areaPrivativa !== undefined ||
      areaConstruidaCompl.areaComum !== undefined ||
      areaConstruidaCompl.fraIdeal !== undefined
    );

    const validTitulares = titulares.filter(
      (t) => t && (t.niTitular || t.nomeTitular || t.percTitular !== undefined || t.percTitularidade !== undefined)
    );

    const hasServicoRI = servicoRegistroImovel && Object.values(servicoRegistroImovel).some(v => v !== undefined && v !== null && String(v).trim() !== '');
    const hasCartorioNotas = cartorioNotas && Object.values(cartorioNotas).some(v => v !== undefined && v !== null && String(v).trim() !== '');
    const hasItbi = itbi && Object.values(itbi).some(v => v !== undefined && v !== null && String(v).trim() !== '');

    onSave({
      id: record.id,
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Editar Registro (#{dadosGerais.inscricaoImobiliaria})
                </h3>
                {isTipo1 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    <span>Tipo 1 (Territorial)</span>
                  </span>
                ) : isTipo2 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-700" />
                    <span>Tipo 2 (Predial)</span>
                  </span>
                ) : isTipo3 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-700" />
                    <span>Tipo 3 (BICE)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Tipo {dadosGerais.tipoImovel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Altere os valores e salve para atualizar este item na lista NDJSON.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors alert */}
        {hasAttemptedSubmit && !validationResult.isValid && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Pendências de validação encontradas:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-rose-700 pl-1">
              {validationResult.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Dados Gerais */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs border-b border-slate-100 pb-2">
              <div className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Dados Gerais do Imóvel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Inscrição Imobiliária */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inscrição Imobiliária <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={45}
                  required
                  value={dadosGerais.inscricaoImobiliaria}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, inscricaoImobiliaria: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                />
                <div className="flex items-center justify-between text-[10px] mt-0.5 text-slate-400">
                  <span>máx 45 car.</span>
                  <span className="font-mono font-bold">{(dadosGerais.inscricaoImobiliaria || '').length}/45</span>
                </div>
              </div>

              {/* Tem Bairro */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tem Bairro? <span className="text-rose-500">*</span>
                </label>
                <select
                  value={dadosGerais.temBairro ? 'true' : 'false'}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, temBairro: e.target.value === 'true' })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="true">Sim (true)</option>
                  <option value="false">Não (false)</option>
                </select>
              </div>

              {/* Tipo Imóvel */}
              <div>
                <SearchableSelect
                  label="Tipo Imóvel *"
                  value={dadosGerais.tipoImovel}
                  options={TIPO_IMOVEL_OPTIONS}
                  placeholder="Selecione o Tipo..."
                  hasError={hasAttemptedSubmit && !!fieldErrors['tipoImovel']}
                  onChange={(val) => {
                    const newTipo = Number(val);
                    setDadosGerais({
                      ...dadosGerais,
                      tipoImovel: newTipo,
                      bice: newTipo === 3 ? dadosGerais.bice : 0,
                    });
                  }}
                />
                {hasAttemptedSubmit && fieldErrors['tipoImovel'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['tipoImovel']}</p>
                )}
              </div>

              {/* Código BICE */}
              <div>
                <SearchableSelect
                  label={`Código BICE${isTipo3 ? ' *' : ''}`}
                  value={isTipo3 ? (dadosGerais.bice || 0) : 0}
                  options={BICE_OPTIONS}
                  placeholder={isTipo3 ? 'Selecione o BICE...' : 'Bloqueado (Apenas Tipo 3)'}
                  disabled={!isTipo3}
                  hasError={hasAttemptedSubmit && isTipo3 && !!fieldErrors['bice']}
                  onChange={(val) => setDadosGerais({ ...dadosGerais, bice: Number(val) })}
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isTipo3
                    ? 'Obrigatório para Tipo 3 (BICE)'
                    : '🔒 Bloqueado • Exclusivo para Tipo 3'}
                </p>
                {hasAttemptedSubmit && isTipo3 && fieldErrors['bice'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['bice']}</p>
                )}
              </div>

              {/* Tipo Arquitetônico */}
              <div>
                <SearchableSelect
                  label={`Tipo Arquitetônico${isTipo2 ? ' *' : ''}`}
                  value={dadosGerais.tpArquitetonico}
                  options={TP_ARQUITETONICO_OPTIONS}
                  placeholder="Selecione o Tipo Arquitetônico..."
                  hasError={hasAttemptedSubmit && !!fieldErrors['tpArquitetonico']}
                  onChange={(val) => setDadosGerais({ ...dadosGerais, tpArquitetonico: Number(val) })}
                />
                {hasAttemptedSubmit && fieldErrors['tpArquitetonico'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['tpArquitetonico']}</p>
                )}
              </div>

              {/* Destinação Imóvel */}
              <div>
                <SearchableSelect
                  label={`Destinação Imóvel${isTipo2 ? ' *' : ''}`}
                  value={dadosGerais.destinacaoImovel}
                  options={DESTINACAO_IMOVEL_OPTIONS}
                  placeholder="Selecione a Destinação..."
                  hasError={hasAttemptedSubmit && !!fieldErrors['destinacaoImovel']}
                  onChange={(val) => setDadosGerais({ ...dadosGerais, destinacaoImovel: Number(val) })}
                />
                {hasAttemptedSubmit && fieldErrors['destinacaoImovel'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['destinacaoImovel']}</p>
                )}
              </div>

              {/* Área Terreno */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Área Terreno (m²) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={dadosGerais.areaTerreno || ''}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, areaTerreno: parseFloat(e.target.value) || 0 })}
                  className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 shadow-2xs ${
                    hasAttemptedSubmit && fieldErrors['areaTerreno']
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {hasAttemptedSubmit && fieldErrors['areaTerreno'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['areaTerreno']}</p>
                )}
              </div>

              {/* Área Construída */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Área Construída (m²) {isTipo2 && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={dadosGerais.areaConstruida || ''}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, areaConstruida: parseFloat(e.target.value) || 0 })}
                  className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 shadow-2xs ${
                    hasAttemptedSubmit && fieldErrors['areaConstruida']
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {hasAttemptedSubmit && fieldErrors['areaConstruida'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['areaConstruida']}</p>
                )}
              </div>

              {/* Ano Construtivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ano Construtivo {isTipo2 && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1990"
                  value={dadosGerais.anoConstrutivo || ''}
                  onChange={(e) => setDadosGerais({ ...dadosGerais, anoConstrutivo: parseInt(e.target.value, 10) || 0 })}
                  className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 shadow-2xs ${
                    hasAttemptedSubmit && fieldErrors['anoConstrutivo']
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {hasAttemptedSubmit && fieldErrors['anoConstrutivo'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['anoConstrutivo']}</p>
                )}
              </div>

            </div>

            {/* Sub-section: Campos Avançados / Opcionais */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 bg-slate-50/70 -mx-6 px-6 pb-3 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-slate-800 font-semibold text-xs">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Campos Avançados do Imóvel (Opcionais)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* idParcela */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID Parcela (<code className="font-mono text-indigo-600">idParcela</code>)
                  </label>
                  <input
                    type="text"
                    maxLength={35}
                    placeholder="Ex: PARC-001"
                    disabled={isTipo1}
                    value={dadosGerais.idParcela || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, idParcela: e.target.value })}
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 shadow-2xs ${
                      isTipo1
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                        : hasAttemptedSubmit && fieldErrors['idParcela']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {hasAttemptedSubmit && fieldErrors['idParcela'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['idParcela']}</p>
                  )}
                </div>

                {/* valorVenal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Venal (R$) (<code className="font-mono text-indigo-600">valorVenal</code>)
                  </label>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['valorVenal'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['valorVenal']}</p>
                  )}
                </div>

                {/* dtUltimoValorVenal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Últ. Valor Venal (<code className="font-mono text-indigo-600">dtUltimoValorVenal</code>)
                  </label>
                  <input
                    type="date"
                    value={dadosGerais.dtUltimoValorVenal || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, dtUltimoValorVenal: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['dtUltimoValorVenal'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['dtUltimoValorVenal']}</p>
                  )}
                </div>

                {/* padraoConstrutivo */}
                <div>
                  <SearchableSelect
                    label="Padrão Construtivo (padraoConstrutivo)"
                    value={dadosGerais.padraoConstrutivo || 0}
                    options={PADRAO_CONSTRUTIVO_OPTIONS}
                    placeholder="Selecione o Padrão..."
                    onChange={(val) => setDadosGerais({ ...dadosGerais, padraoConstrutivo: Number(val) || undefined })}
                  />
                </div>

                {/* qtdGaragem */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qtd. Garagens (<code className="font-mono text-indigo-600">qtdGaragem</code>)
                  </label>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['qtdGaragem'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['qtdGaragem']}</p>
                  )}
                </div>

                {/* temPiscina */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tem Piscina? (<code className="font-mono text-indigo-600">temPiscina</code>)
                  </label>
                  <select
                    value={dadosGerais.temPiscina === undefined ? '' : dadosGerais.temPiscina ? 'true' : 'false'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDadosGerais({
                        ...dadosGerais,
                        temPiscina: val === '' ? undefined : val === 'true',
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                  >
                    <option value="">Omitir (Não informado)</option>
                    <option value="true">Sim (true)</option>
                    <option value="false">Não (false)</option>
                  </select>
                </div>

                {/* valorRefMercado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Ref. Mercado (R$) (<code className="font-mono text-indigo-600">valorRefMercado</code>)
                  </label>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['valorRefMercado'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['valorRefMercado']}</p>
                  )}
                </div>

                {/* dataUltValorMercado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Últ. Avaliação Mercado (<code className="font-mono text-indigo-600">dataUltValorMercado</code>)
                  </label>
                  <input
                    type="date"
                    value={dadosGerais.dataUltValorMercado || ''}
                    onChange={(e) => setDadosGerais({ ...dadosGerais, dataUltValorMercado: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['dataUltValorMercado'] && (
                    <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['dataUltValorMercado']}</p>
                  )}
                </div>

              </div>

              {/* Subseção: Área Construída Complementar (AreaConstruidaCompl) */}
              <div className="mt-4 pt-3 border-t border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Área Construída Complementar (<code className="text-indigo-600 font-mono">AreaConstruidaCompl</code>)
                  </span>
                  {isTipo1 ? (
                    <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Não preenchida para Tipo 1
                    </span>
                  ) : (
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Opcional para Tipo 2 e 3
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* areaPrivativa */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Área Privativa (m²) (<code className="font-mono text-indigo-600">areaPrivativa</code>)
                    </label>
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
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none shadow-2xs ${
                        isTipo1 ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60' : 'bg-white border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400">12 inteiros + 4 decimais</span>
                    {hasAttemptedSubmit && fieldErrors['areaPrivativa'] && (
                      <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['areaPrivativa']}</p>
                    )}
                  </div>

                  {/* areaComum */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Área Comum (m²) (<code className="font-mono text-indigo-600">areaComum</code>)
                    </label>
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
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none shadow-2xs ${
                        isTipo1 ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60' : 'bg-white border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400">12 inteiros + 4 decimais</span>
                    {hasAttemptedSubmit && fieldErrors['areaComum'] && (
                      <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['areaComum']}</p>
                    )}
                  </div>

                  {/* fraIdeal */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fração Ideal (<code className="font-mono text-indigo-600">fraIdeal</code>)
                    </label>
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
                      className={`w-full border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none shadow-2xs ${
                        isTipo1 ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60' : 'bg-white border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400">1 inteiro + 4 decimais</span>
                    {hasAttemptedSubmit && fieldErrors['fraIdeal'] && (
                      <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['fraIdeal']}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Endereço */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs border-b border-slate-100 pb-2">
              <div className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Endereço do Imóvel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Tipo Logradouro */}
              <div>
                <SearchableSelect
                  label="Tipo Logradouro *"
                  value={endereco.tipoLogradouro}
                  options={TIPO_LOGRADOURO_OPTIONS}
                  placeholder="Selecione o Tipo de Logradouro..."
                  hasError={hasAttemptedSubmit && !!fieldErrors['tipoLogradouro']}
                  onChange={(val) => setEndereco({ ...endereco, tipoLogradouro: Number(val) })}
                />
                {hasAttemptedSubmit && fieldErrors['tipoLogradouro'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['tipoLogradouro']}</p>
                )}
              </div>

              {/* Nome Logradouro */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Logradouro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={endereco.nomeLogradouro}
                  onChange={(e) => setEndereco({ ...endereco, nomeLogradouro: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
                <div className="flex items-center justify-between text-[10px] mt-0.5 text-slate-400">
                  <span>máx 30 car.</span>
                  <span className="font-mono font-bold">{(endereco.bairro || '').length}/30</span>
                </div>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CEP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={endereco.cep}
                  onChange={(e) => setEndereco({ ...endereco, cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Número Imóvel */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número Imóvel
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ex: 1500"
                  value={endereco.numeroImovel || ''}
                  onChange={(e) => setEndereco({ ...endereco, numeroImovel: sanitizeTextInput(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
                <div className="flex items-center justify-between text-[10px] mt-0.5 text-slate-400">
                  <span>máx 8 car.</span>
                  <span className="font-mono font-bold">{(endereco.numeroImovel || '').length}/8</span>
                </div>
                {hasAttemptedSubmit && fieldErrors['numeroImovel'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['numeroImovel']}</p>
                )}
              </div>

              {/* Compl Número */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compl. Número Imóvel
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Ex: APTO 302"
                  value={endereco.complNroImovel || ''}
                  onChange={(e) => setEndereco({ ...endereco, complNroImovel: sanitizeTextInput(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
                <div className="flex items-center justify-between text-[10px] mt-0.5 text-slate-400">
                  <span>máx 30 car.</span>
                  <span className="font-mono font-bold">{(endereco.complNroImovel || '').length}/30</span>
                </div>
                {hasAttemptedSubmit && fieldErrors['complNroImovel'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['complNroImovel']}</p>
                )}
              </div>

              {/* Compl Endereço */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compl. Endereço
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="Ex: EDIF SOLAR ACACIAS"
                  value={endereco.complEndereco || ''}
                  onChange={(e) => setEndereco({ ...endereco, complEndereco: sanitizeTextInput(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
                <div className="flex items-center justify-between text-[10px] mt-0.5 text-slate-400">
                  <span>máx 30 car.</span>
                  <span className="font-mono font-bold">{(endereco.complEndereco || '').length}/30</span>
                </div>
                {hasAttemptedSubmit && fieldErrors['complEndereco'] && (
                  <p className="text-[10px] text-rose-600 mt-1">{fieldErrors['complEndereco']}</p>
                )}
              </div>

              {/* Operação */}
              <div>
                <SearchableSelect
                  label="Operação"
                  value={operacao}
                  options={OPERACAO_OPTIONS}
                  onChange={(val) => setOperacao(String(val))}
                />
              </div>

            </div>

            {/* Subseção: Titulares / Proprietários (Titular) */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
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

              <p className="text-xs text-slate-500">
                Lista de proprietários ou possuidores do imóvel. Se informado CPF/CNPJ ou Nome, os demais campos do titular tornam-se obrigatórios.
              </p>

              {titulares.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                  Nenhum titular cadastrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {titulares.map((titular, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
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
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
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
                              NI do Titular (CPF/CNPJ)
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
                            placeholder="Ex: 123.456.789-01"
                            value={titular.niTitular || ''}
                            onChange={(e) => {
                              const val = sanitizeTextInput(e.target.value);
                              const updated = [...titulares];
                              updated[idx] = { ...updated[idx], niTitular: val };
                              setTitulares(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                          />
                          <p className="text-[10px] text-slate-400 mt-0.5">11 (CPF) ou 14 (CNPJ)</p>
                          {hasAttemptedSubmit && fieldErrors[`titular_${idx}_niTitular`] && (
                            <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors[`titular_${idx}_niTitular`]}</p>
                          )}
                        </div>

                        {/* nomeTitular */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">
                              Nome do Titular
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
                              Participação (%)
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
                            placeholder="Ex: 100.0000"
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
                              Data Aquisição
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
                            placeholder="Selecione..."
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
                            placeholder="Selecione..."
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Opcional (máx 300 car.)</span>
                    <span>{(servicoRegistroImovel.nomeServentiaRI || '').length}/300</span>
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
                    placeholder="Ex: 012345"
                    value={servicoRegistroImovel.cnsRI !== undefined ? String(servicoRegistroImovel.cnsRI) : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setServicoRegistroImovel({ ...servicoRegistroImovel, cnsRI: digits ? parseInt(digits, 10) : undefined });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">6 dígitos</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Código Nac. Matrícula (16 car.)</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Até 15 car.</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Até 7 car.</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Até 4 car.</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Até 4 car.</p>
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">AAAA-MM-DD</p>
                  {hasAttemptedSubmit && fieldErrors['dtUltAtualizacao'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['dtUltAtualizacao']}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Cartório de Notas (CartorioNotas) */}
            <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100/80 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cartório de Notas (<code className="text-emerald-600 font-mono font-normal">CartorioNotas</code>)</span>
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* nomeServentiaNotas */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Nome Serventia (<code className="font-mono text-emerald-600">nomeServentiaNotas</code>)
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['nomeServentiaNotas'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['nomeServentiaNotas']}</p>
                  )}
                </div>

                {/* cnsNotas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      CNS (<code className="font-mono text-emerald-600">cnsNotas</code>)
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
                    placeholder="Ex: 098765"
                    value={cartorioNotas.cnsNotas !== undefined ? String(cartorioNotas.cnsNotas) : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCartorioNotas({ ...cartorioNotas, cnsNotas: digits ? parseInt(digits, 10) : undefined });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['cnsNotas'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['cnsNotas']}</p>
                  )}
                </div>

                {/* lvCartNotas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Livro (<code className="font-mono text-emerald-600">lvCartNotas</code>)
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['lvCartNotas'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['lvCartNotas']}</p>
                  )}
                </div>

                {/* flCartNotas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Folha (<code className="font-mono text-emerald-600">flCartNotas</code>)
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  {hasAttemptedSubmit && fieldErrors['flCartNotas'] && (
                    <p className="text-[10px] font-medium text-rose-600 mt-1">{fieldErrors['flCartNotas']}</p>
                  )}
                </div>

              </div>
            </div>

            {/* ITBI Section */}
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
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                      hasAttemptedSubmit && fieldErrors['baseCalculITBI']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
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
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                      hasAttemptedSubmit && fieldErrors['valorRefITBI']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
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
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                      hasAttemptedSubmit && fieldErrors['dtTransacaoITBI']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
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
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                      hasAttemptedSubmit && fieldErrors['percTransacionadoITBI']
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
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
                  <div className="text-center py-2 text-xs text-amber-700/80 bg-amber-100/40 rounded-xl border border-dashed border-amber-200">
                    Nenhum transmitente cadastrado.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itbi.TransmitenteITBI.map((t, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <div>
                            <input
                              type="text"
                              maxLength={300}
                              placeholder="Nome / Razão Social"
                              value={t.nomeTransmitenteITBI || ''}
                              onChange={(e) => {
                                const list = [...(itbi.TransmitenteITBI || [])];
                                list[idx] = { ...list[idx], nomeTransmitenteITBI: sanitizeTextInput(e.target.value) };
                                setItbi({ ...itbi, TransmitenteITBI: list });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                            />
                            {hasAttemptedSubmit && fieldErrors[`transmitente_${idx}_nome`] && (
                              <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`transmitente_${idx}_nome`]}</p>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              maxLength={14}
                              placeholder="CPF / CNPJ"
                              value={t.niTransmitenteITBI || t.idTransmitenteITBI || ''}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                                const list = [...(itbi.TransmitenteITBI || [])];
                                list[idx] = { ...list[idx], niTransmitenteITBI: digits, idTransmitenteITBI: digits };
                                setItbi({ ...itbi, TransmitenteITBI: list });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
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
                  <div className="text-center py-2 text-xs text-amber-700/80 bg-amber-100/40 rounded-xl border border-dashed border-amber-200">
                    Nenhum adquirente cadastrado.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itbi.AdquirenteITBI.map((a, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                          <div>
                            <input
                              type="text"
                              maxLength={300}
                              placeholder="Nome / Razão Social"
                              value={a.nomeAdquirenteITBI || ''}
                              onChange={(e) => {
                                const list = [...(itbi.AdquirenteITBI || [])];
                                list[idx] = { ...list[idx], nomeAdquirenteITBI: sanitizeTextInput(e.target.value) };
                                setItbi({ ...itbi, AdquirenteITBI: list });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                            />
                            {hasAttemptedSubmit && fieldErrors[`adquirente_${idx}_nome`] && (
                              <p className="text-[10px] text-rose-600 mt-0.5">{fieldErrors[`adquirente_${idx}_nome`]}</p>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              maxLength={14}
                              placeholder="CPF / CNPJ"
                              value={a.niAdquirenteITBI || a.idAdquirenteITBI || ''}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                                const list = [...(itbi.AdquirenteITBI || [])];
                                list[idx] = { ...list[idx], niAdquirenteITBI: digits, idAdquirenteITBI: digits };
                                setItbi({ ...itbi, AdquirenteITBI: list });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
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
                              placeholder="Perc. Transac."
                              value={a.percTransacAdquirenteITBI !== undefined ? a.percTransacAdquirenteITBI : ''}
                              onChange={(e) => {
                                const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                                const list = [...(itbi.AdquirenteITBI || [])];
                                list[idx] = { ...list[idx], percTransacAdquirenteITBI: val };
                                setItbi({ ...itbi, AdquirenteITBI: list });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
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

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

