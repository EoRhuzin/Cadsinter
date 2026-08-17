import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, X, GraduationCap, Building2, Home, Landmark, AlertCircle, HelpCircle, Layers, Check, Youtube, Play, Tv, ExternalLink, Video } from 'lucide-react';

export type TutorialMode = 'type1' | 'type2' | 'type3' | 'overview';

export interface VideoTutorialItem {
  id: 'overview' | 'type1' | 'type2' | 'type3';
  title: string;
  badge: string;
  badgeColor: string;
  youtubeId: string;
  embedUrl: string;
  description: string;
  highlights: string[];
}

export const YOUTUBE_TUTORIALS: VideoTutorialItem[] = [
  {
    id: 'overview',
    title: 'Tour Geral: Visão Completa da Plataforma CadSinter',
    badge: 'Geral',
    badgeColor: 'bg-slate-700 text-slate-100 border-slate-600',
    youtubeId: 'dwpmWI1CPQA',
    embedUrl: 'https://www.youtube.com/embed/dwpmWI1CPQA?si=LXjnPOvCqY4b2KWh',
    description: 'Aprenda a navegar pela interface, gerenciar a lista de imóveis, conferir regras do SINTER/CADURB e exportar em NDJSON de forma simples.',
    highlights: ['Visão panorâmica da interface', 'Importação e exportação NDJSON', 'Validação e contadores de imóveis'],
  },
  {
    id: 'type1',
    title: 'Imóvel Tipo 1 (Territorial): Preencher e Gerar NDJSON',
    badge: 'Tipo 1 - Territorial',
    badgeColor: 'bg-emerald-600 text-emerald-100 border-emerald-500',
    youtubeId: 'MjUgXit4nRA',
    embedUrl: 'https://www.youtube.com/embed/MjUgXit4nRA?si=SUfyuTcQZyUUShWo',
    description: 'Passo a passo prático para cadastrar lotes, terrenos vazios e glebas sem edificação averbada com todos os 8 campos obrigatórios.',
    highlights: ['Lotes e terrenos vazios', '8 campos obrigatórios destacados', 'Validações para SINTER / CADURB'],
  },
  {
    id: 'type2',
    title: 'Imóvel Tipo 2 (Predial): Edificações e NDJSON',
    badge: 'Tipo 2 - Predial',
    badgeColor: 'bg-indigo-600 text-indigo-100 border-indigo-500',
    youtubeId: 'BxUuDC58PYQ',
    embedUrl: 'https://www.youtube.com/embed/BxUuDC58PYQ?si=pCQz_nsClaSeLkm8',
    description: 'Como cadastrar edificações, casas, prédios, preenchendo área construída, ano da construção, padrão arquitetônico e destinação.',
    highlights: ['Casas, apartamentos e galpões', 'Área construída e ano construtivo', 'Padrão arquitetônico e destinação'],
  },
  {
    id: 'type3',
    title: 'Imóvel Tipo 3 (Bem Especial): Cadastro de Bens Públicos',
    badge: 'Tipo 3 - Bem Especial',
    badgeColor: 'bg-amber-600 text-amber-100 border-amber-500',
    youtubeId: 'USAW9mk_muM',
    embedUrl: 'https://www.youtube.com/embed/USAW9mk_muM?si=QsHpyRqv7VTzjsnO',
    description: 'Como cadastrar praças, parques, ruas e equipamentos públicos municipais com o código BICE obrigatório no SINTER.',
    highlights: ['Bens de uso comum e especial', 'Seleção de Código BICE obrigatório', 'Formatos oficiais para prefeituras'],
  },
];

export interface TutorialDetailItem {
  icon?: string;
  title: string;
  text: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  details?: TutorialDetailItem[];
  tip?: string;
}

// 🎯 TUTORIAL EXCLUSIVO: COMO CRIAR IMÓVEL DO TIPO 1 (TERRITORIAL / LOTE)
export const TUTORIAL_TIPO1_STEPS: TutorialStep[] = [
  {
    id: 'tipo1-inscricao',
    title: 'Passo 1: Colocar a Inscrição Imobiliária',
    highlightSelector: '#tutorial-field-inscricao',
    description: 'Comece preenchendo o código oficial da Inscrição Imobiliária do município para o lote/terreno (até 45 caracteres).',
    details: [
      {
        icon: '🔢',
        title: 'Identificador Cadastral Único',
        text: 'Insira o número cadastral municipal (ex: 01010010001 ou setor/quadra/lote concatenados).',
      },
      {
        icon: '⚠️',
        title: 'Regra SINTER / CADURB',
        text: 'Texto de até 45 caracteres alfanuméricos, sem espaços extras ou caracteres de controle invisíveis.',
      },
    ],
    tip: 'Digite a inscrição do imóvel territorial no campo em destaque para começar.',
  },
  {
    id: 'tipo1-tipo-imovel',
    title: 'Passo 2: Colocar o Tipo de Imóvel (Tipo 1)',
    highlightSelector: '#tutorial-field-tipo-imovel',
    description: 'No campo Tipo do Imóvel (tipoImovel), selecione a opção "1 - Territorial (Lote / Terreno)".',
    details: [
      {
        icon: '🌱',
        title: 'Tipo 1 = Territorial / Terreno',
        text: 'Destinado a terrenos vazios, lotes ou glebas sem edificação averbada.',
      },
      {
        icon: '🔒',
        title: 'Ajuste Inteligente de Regras',
        text: 'Ao selecionar Tipo 1, o sistema desabilita campos exclusivos de edificação (área construída, ano, padrão) e BICE.',
      },
    ],
    tip: 'O sistema trava automaticamente os campos de construção quando o Tipo 1 está ativo.',
  },
  {
    id: 'tipo1-campos-obrigatorios',
    title: 'Passo 3: Preencher Todos os Campos Obrigatórios para o Tipo 1',
    highlightSelector: '#tutorial-field-inscricao, #tutorial-field-tipo-imovel, #tutorial-field-area-terreno, #tutorial-field-tem-bairro, #tutorial-field-tipo-logradouro, #tutorial-field-nome-logradouro, #tutorial-field-bairro, #tutorial-field-cep',
    description: 'Para o Imóvel Tipo 1, todos os 8 campos obrigatórios estão destacados em VERMELHO com aviso visual para facilitar seu preenchimento rápido:',
    details: [
      {
        icon: '🔴',
        title: '1. Inscrição Imobiliária',
        text: 'Identificador do imóvel no cadastro municipal.',
      },
      {
        icon: '🔴',
        title: '2. Tipo do Imóvel = 1 (Territorial)',
        text: 'Indica cadastro territorial/lote.',
      },
      {
        icon: '🔴',
        title: '3. Área Terreno (m²)',
        text: 'Metragem do terreno maior que zero (até 12 inteiros + 4 decimais, ex: 360.0000).',
      },
      {
        icon: '🔴',
        title: '4. Tem Bairro? (temBairro)',
        text: 'Marque Sim (true) ou Não (false).',
      },
      {
        icon: '🔴',
        title: '5. Tipo Logradouro',
        text: 'Código numérico do logradouro conforme SINTER (ex: 250 - RUA).',
      },
      {
        icon: '🔴',
        title: '6. Nome do Logradouro',
        text: 'Nome da via pública do imóvel (até 300 caracteres).',
      },
      {
        icon: '🔴',
        title: '7. Bairro',
        text: 'Nome do bairro onde se localiza o lote (até 30 caracteres, obrigatório se temBairro for Sim).',
      },
      {
        icon: '🔴',
        title: '8. CEP',
        text: 'Exatamente 8 dígitos numéricos válidos (ex: 45653758).',
      },
    ],
    tip: 'Observe que todos os campos obrigatórios do Tipo 1 estão marcados em VERMELHO para sua rápida localização!',
  },
  {
    id: 'tipo1-finalizar',
    title: 'Passo 4: Salvar e Adicionar Imóvel na Tabela',
    highlightSelector: '#tutorial-submit-btn',
    description: 'Com todos os campos obrigatórios preenchidos, clique no botão "+ Adicionar Imóvel" (ou pressione Ctrl+Enter) para gravar o registro.',
    details: [
      {
        icon: '💾',
        title: 'Validação e Gravação Imediata',
        text: 'O imóvel Tipo 1 será salvo na lista municipal e auditado pelas regras do SINTER / CADURB.',
      },
      {
        icon: '✨',
        title: 'Teste Automático',
        text: 'Você pode clicar no botão "Preencher Exemplo Tipo 1" para ver todos os campos validados em verde!',
      },
    ],
    tip: 'Parabéns! Você concluiu o tutorial de cadastro de Imóvel Tipo 1 (Territorial)!',
  },
];

// 🏠 TUTORIAL EXCLUSIVO: COMO CRIAR IMÓVEL DO TIPO 2 (PREDIAL / EDIFICAÇÃO)
export const TUTORIAL_TIPO2_STEPS: TutorialStep[] = [
  {
    id: 'tipo2-inscricao',
    title: 'Passo 1: Colocar a Inscrição Imobiliária',
    highlightSelector: '#tutorial-field-inscricao',
    description: 'Informe a Inscrição Imobiliária municipal da edificação/unidade construída (até 45 caracteres).',
    details: [
      {
        icon: '🔢',
        title: 'Identificador do Imóvel Predial',
        text: 'Código oficial da unidade predial no cadastro tributário municipal.',
      },
      {
        icon: '🏢',
        title: 'Unidade Autônoma ou Edificação',
        text: 'Pode ser casa, apartamento, sala comercial ou galpão com área edificada.',
      },
    ],
    tip: 'Preencha a inscrição imobiliária predial no campo indicado.',
  },
  {
    id: 'tipo2-tipo-imovel',
    title: 'Passo 2: Colocar o Tipo de Imóvel (Tipo 2)',
    highlightSelector: '#tutorial-field-tipo-imovel',
    description: 'No campo Tipo do Imóvel (tipoImovel), selecione a opção "2 - Predial (Edificação / Construção)".',
    details: [
      {
        icon: '🏠',
        title: 'Tipo 2 = Predial / Edificado',
        text: 'Identifica imóveis com construção permanente averbada ou cadastrada.',
      },
      {
        icon: '📐',
        title: 'Liberação de Campos Construtivos',
        text: 'O sistema habilita obrigatoriamente a Área Construída, Ano Construtivo, Tipo Arquitetônico e Destinação.',
      },
    ],
    tip: 'Ao selecionar Tipo 2, os campos de área construída e ano de construção tornam-se obrigatórios.',
  },
  {
    id: 'tipo2-campos-obrigatorios',
    title: 'Passo 3: Preencher Todos os Campos Obrigatórios para o Tipo 2',
    highlightSelector: '#tutorial-field-inscricao, #tutorial-field-tipo-imovel, #tutorial-field-area-terreno, #tutorial-field-tem-bairro, #tutorial-field-area-construida, #tutorial-field-ano-construtivo, #tutorial-field-tp-arquitetonico, #tutorial-field-destinacao, #tutorial-field-tipo-logradouro, #tutorial-field-nome-logradouro, #tutorial-field-bairro, #tutorial-field-cep',
    description: 'Para o Imóvel Tipo 2, todos os campos obrigatórios e essenciais de edificação estão destacados em VERMELHO:',
    details: [
      {
        icon: '🔴',
        title: '1. Inscrição Imobiliária',
        text: 'Identificador municipal do imóvel predial.',
      },
      {
        icon: '🔴',
        title: '2. Tipo do Imóvel = 2 (Predial)',
        text: 'Indica imóvel edificado.',
      },
      {
        icon: '🔴',
        title: '3. Área Terreno (m²)',
        text: 'Área da fração ideal ou terreno total (> 0 m²).',
      },
      {
        icon: '🔴',
        title: '4. Tem Bairro? (temBairro)',
        text: 'Indicação se o endereço possui bairro demarcado.',
      },
      {
        icon: '🔴',
        title: '5. Área Construída (m²)',
        text: 'Metragem quadrada da edificação (OBRIGATÓRIO > 0 para Tipo 2, ex: 145.5000).',
      },
      {
        icon: '🔴',
        title: '6. Ano Construtivo',
        text: 'Ano de conclusão da obra ou habite-se (OBRIGATÓRIO para Tipo 2, ex: 2018).',
      },
      {
        icon: '🔴',
        title: '7. Tipo Arquitetônico & Destinação',
        text: 'Classificação da construção (Casa, Apartamento, Comercial, etc.).',
      },
      {
        icon: '🔴',
        title: '8. Tipo Logradouro, Nome, Bairro e CEP',
        text: 'Endereço completo da edificação conforme normas do SINTER.',
      },
    ],
    tip: 'Para Tipo 2, lembre-se: Área Construída e Ano Construtivo NÃO podem ser zero!',
  },
  {
    id: 'tipo2-finalizar',
    title: 'Passo 4: Salvar e Adicionar Imóvel Predial na Tabela',
    highlightSelector: '#tutorial-submit-btn',
    description: 'Clique no botão "+ Adicionar Imóvel" (ou pressione Ctrl+Enter) para gravar o imóvel predial com todas as suas características construtivas.',
    details: [
      {
        icon: '💾',
        title: 'Conformidade SINTER Predial',
        text: 'O registro é validado contra o esquema oficial de unidades prediais do CADURB.',
      },
      {
        icon: '✨',
        title: 'Teste Automático',
        text: 'Clique em "Preencher Exemplo Tipo 2" para carregar automaticamente uma residência pronta.',
      },
    ],
    tip: 'Excelente! Você completou o tutorial para Imóveis Prediais (Tipo 2)!',
  },
];

// 🏛️ TUTORIAL EXCLUSIVO: COMO CRIAR IMÓVEL DO TIPO 3 (BEM ESPECIAL / BICE)
export const TUTORIAL_TIPO3_STEPS: TutorialStep[] = [
  {
    id: 'tipo3-inscricao',
    title: 'Passo 1: Colocar a Inscrição Imobiliária',
    highlightSelector: '#tutorial-field-inscricao',
    description: 'Digite o código de Inscrição Imobiliária municipal atribuído ao Bem de Características Especiais (BICE).',
    details: [
      {
        icon: '🔢',
        title: 'Identificador Cadastral de BICE',
        text: 'Código único cadastral do bem público ou especial no município.',
      },
      {
        icon: '🏛️',
        title: 'Bens Especiais',
        text: 'Aplicável a praças, parques, cemitérios, pontes, viadutos, redes ou infraestruturas públicas.',
      },
    ],
    tip: 'Preencha o código cadastral municipal do Bem Especial no campo destacado.',
  },
  {
    id: 'tipo3-tipo-imovel',
    title: 'Passo 2: Colocar o Tipo de Imóvel (Tipo 3)',
    highlightSelector: '#tutorial-field-tipo-imovel',
    description: 'No campo Tipo do Imóvel (tipoImovel), selecione a opção "3 - Bem Especial (BICE)".',
    details: [
      {
        icon: '🏛️',
        title: 'Tipo 3 = Bem Especial (BICE)',
        text: 'Indica Bem Imóvel de Características Especiais do município.',
      },
      {
        icon: '🔑',
        title: 'Ativação do Código BICE',
        text: 'Ao selecionar Tipo 3, o campo "Código BICE (bice)" é desbloqueado e torna-se OBRIGATÓRIO.',
      },
    ],
    tip: 'Ao ativar o Tipo 3, o sistema exige a seleção de uma categoria válida da tabela BICE do SINTER.',
  },
  {
    id: 'tipo3-campos-obrigatorios',
    title: 'Passo 3: Preencher Todos os Campos Obrigatórios para o Tipo 3',
    highlightSelector: '#tutorial-field-inscricao, #tutorial-field-tipo-imovel, #tutorial-field-area-terreno, #tutorial-field-tem-bairro, #tutorial-field-bice, #tutorial-field-tipo-logradouro, #tutorial-field-nome-logradouro, #tutorial-field-bairro, #tutorial-field-cep',
    description: 'Para o Imóvel Tipo 3, todos os campos obrigatórios estão destacados em VERMELHO, incluindo o Código BICE:',
    details: [
      {
        icon: '🔴',
        title: '1. Inscrição Imobiliária',
        text: 'Identificador cadastral do bem no município.',
      },
      {
        icon: '🔴',
        title: '2. Tipo do Imóvel = 3 (Bem Especial)',
        text: 'Define a natureza do imóvel como BICE.',
      },
      {
        icon: '🔴',
        title: '3. Código BICE (bice)',
        text: 'OBRIGATÓRIO para Tipo 3: selecione a categoria oficial (ex: Praças e Parques, Pontes, Cemitério, etc.).',
      },
      {
        icon: '🔴',
        title: '4. Área Terreno (m²)',
        text: 'Área territorial ocupada pelo bem (> 0 m²).',
      },
      {
        icon: '🔴',
        title: '5. Tem Bairro? (temBairro)',
        text: 'Indicação de localização em bairro demarcado.',
      },
      {
        icon: '🔴',
        title: '6. Tipo Logradouro, Nome, Bairro e CEP',
        text: 'Localização geográfica e endereçamento oficial do bem público/especial.',
      },
    ],
    tip: 'Atenção especial ao campo "Código BICE": ele é exclusivo e indispensável para o Tipo 3!',
  },
  {
    id: 'tipo3-finalizar',
    title: 'Passo 4: Salvar e Adicionar Bem Especial na Tabela',
    highlightSelector: '#tutorial-submit-btn',
    description: 'Clique no botão "+ Adicionar Imóvel" (ou pressione Ctrl+Enter) para gravar o Bem Especial na sua lista cadastral.',
    details: [
      {
        icon: '💾',
        title: 'Validação SINTER BICE',
        text: 'O registro será gravado com o código BICE formatado conforme manual técnico da Receita Federal.',
      },
      {
        icon: '✨',
        title: 'Teste Automático',
        text: 'Clique em "Preencher Exemplo Tipo 3" para carregar um modelo de praça pública pronto.',
      },
    ],
    tip: 'Pronto! Você aprendeu a cadastrar Bens de Características Especiais (Tipo 3)!',
  },
];

// 🏛️ TOUR GERAL DA PLATAFORMA (CABEÇALHO, EXPORTAÇÃO, LISTAS)
export const TUTORIAL_OVERVIEW_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '1. Visão Geral do CadSinter',
    description: 'Esta é a plataforma de Gestão e Integração Cadastral Municipal para envio de dados imobiliários ao SINTER e CADURB da Receita Federal do Brasil.',
    tip: 'Conheça todos os recursos principais da plataforma para emissão de arquivos NDJSON sem erros.',
  },
  {
    id: 'counter-step',
    title: '2. Indicador de Registros ("Registros: X")',
    highlightSelector: '#tutorial-record-counter',
    description: 'Este indicador exibe em tempo real a quantidade de imóveis cadastrados na sua sessão atual.',
    details: [
      {
        icon: '📊',
        title: 'Contador em Tempo Real',
        text: 'Mostra quantos imóveis já foram adicionados (ex: "5 registros"). Fica em verde quando há dados gravados.',
      },
      {
        icon: '💾',
        title: 'Armazenamento Seguro',
        text: 'Os registros ficam preservados no seu navegador para você continuar de onde parou.',
      },
    ],
    tip: 'Acompanhe este contador para saber exatamente quantos registros serão exportados no lote.',
  },
  {
    id: 'clear-sample-step',
    title: '3. Botão "Limpar Lista" / "Carregar Exemplos"',
    highlightSelector: '#tutorial-clear-btn, #tutorial-sample-btn',
    description: 'Recursos rápidos para gerenciamento e teste imediato da lista de imóveis:',
    details: [
      {
        icon: '✨',
        title: 'Carregar Exemplos',
        text: 'Quando a lista está vazia, insere 3 imóveis de amostragem completos com 1 clique para você testar todas as validações.',
      },
      {
        icon: '🗑️',
        title: 'Limpar Lista',
        text: 'Quando há registros cadastrados, este botão em vermelho apaga todos os imóveis da sessão para iniciar um novo lote do zero.',
      },
    ],
    tip: 'Experimente clicar em "Carregar Exemplos" para ver como o sistema valida CPFs e coordenadas geográficas!',
  },
  {
    id: 'import-step',
    title: '4. Botão "Importar NDJSON"',
    highlightSelector: '#tutorial-import-btn',
    description: 'Permite carregar arquivos .ndjson gerados previamente ou por outros sistemas municipais.',
    details: [
      {
        icon: '📤',
        title: 'Importação Flexível',
        text: 'Abre uma janela para você selecionar o arquivo do computador e revisar cada registro antes de transmitir.',
      },
      {
        icon: '🔀',
        title: 'Mesclar ou Substituir',
        text: 'Você pode escolher entre adicionar os novos imóveis aos existentes ou substituir a lista inteira.',
      },
    ],
    tip: 'Útil para municípios que já possuem relatórios do SINTER e querem validar ou atualizar cadastros.',
  },
  {
    id: 'send-options-step',
    title: '5. Menu "Opções de Envio"',
    highlightSelector: '#tutorial-send-options',
    description: 'O principal centro de exportação do sistema. Clique para acessar 3 formatos de transmissão:',
    details: [
      {
        icon: '📄',
        title: '1. Baixar Arquivo .NDJSON',
        text: 'Gera o arquivo NDJSON oficial com formatação exigida pela Receita Federal para o SINTER/CADURB.',
      },
      {
        icon: '📦',
        title: '2. Baixar Pacote .ZIP',
        text: 'Cria uma pasta compactada com o arquivo NDJSON, relatórios e comprovantes cadastrais.',
      },
      {
        icon: '🌐',
        title: '3. Enviar via API REST',
        text: 'Permite configurar token de autenticação e transmitir os dados diretamente ao endpoint do governo.',
      },
    ],
    tip: 'Sempre que terminar de cadastrar seus imóveis, clique em "Opções de Envio" para realizar o download ou transmissão!',
  },
  {
    id: 'donate-step',
    title: '6. Botão "Me doe um Café ☕" (Apoio ao Projeto)',
    highlightSelector: '#tutorial-donate-btn',
    description: 'O CadSinter é uma ferramenta GovTech 100% gratuita desenvolvida para ajudar prefeituras e gestores municipais.',
    details: [
      {
        icon: '☕',
        title: 'Apoie o Desenvolvedor',
        text: 'Abre a janela com chave Pix para doações voluntárias de qualquer valor.',
      },
      {
        icon: '💚',
        title: 'Manutenção Gratuita',
        text: 'Sua ajuda fortalece o desenvolvimento contínuo de atualizações para as normas do SINTER.',
      },
    ],
    tip: 'Se a ferramenta economizou tempo no seu município, considere nos pagar um café!',
  },
  {
    id: 'form-workbench-step',
    title: '7. Formulário de Digitação e Edição em Lote',
    highlightSelector: '#tutorial-tab-workbench',
    description: 'Na área de trabalho principal, você encontra o formulário para inclusão de imóveis.',
    details: [
      {
        icon: '📝',
        title: 'Inscrição Imobiliária e Dados Gerais',
        text: 'Preencha setor, quadra, lote, número do imóvel e tipo do cadastro (Territorial, Predial ou BICE).',
      },
      {
        icon: '📍',
        title: 'Endereço & Busca de CEP Automática',
        text: 'Informe o CEP para preencher Logradouro e Bairro automaticamente via busca integrada.',
      },
      {
        icon: '👥',
        title: 'Quadro de Proprietários',
        text: 'Adicione múltiplos proprietários com validação automática de CPF e CNPJ.',
      },
      {
        icon: '⚡',
        title: 'Modo em Lote',
        text: 'Altere campos iguais em dezenas de imóveis de uma só vez para agilizar o trabalho!',
      },
    ],
    tip: 'O sistema preenche campos padrão para facilitar a digitação diária da sua equipe.',
  },
  {
    id: 'validation-table-step',
    title: '8. Tabela de Registros, Auditoria e Alertas SINTER',
    highlightSelector: '#tutorial-tab-workbench',
    description: 'Logo abaixo do formulário, a tabela lista todos os imóveis cadastrados para conferência.',
    details: [
      {
        icon: '✅',
        title: 'Validação Automática SINTER',
        text: 'Verifica formato de Inscrição, CPF/CNPJ, CEP e Coordenadas Geográficas (Latitude/Longitude).',
      },
      {
        icon: '⚠️',
        title: 'Alertas de Preenchimento',
        text: 'Exibe avisos amarelos em registros que exigem atenção antes da transmissão final.',
      },
      {
        icon: '✏️',
        title: 'Ações Rápidas',
        text: 'Edite, duplique ou exclua qualquer registro diretamente na tabela.',
      },
    ],
    tip: 'Parabéns! Agora você domina todas as funcionalidades do CadSinter!',
  },
];

export const TutorialWelcomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStartTour: (mode: TutorialMode) => void;
  initialTab?: 'videos' | 'interactive';
  initialVideoId?: 'overview' | 'type1' | 'type2' | 'type3';
}> = ({ isOpen, onClose, onStartTour, initialTab = 'videos', initialVideoId = 'overview' }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'interactive'>(initialTab);
  const [selectedVideoId, setSelectedVideoId] = useState<'overview' | 'type1' | 'type2' | 'type3'>(initialVideoId);

  if (!isOpen) return null;

  const currentVideo = YOUTUBE_TUTORIALS.find((v) => v.id === selectedVideoId) || YOUTUBE_TUTORIALS[0];

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('cadsinter_skip_tutorial', 'true');
    }
    onClose();
  };

  const handleStart = (mode: TutorialMode) => {
    if (dontShowAgain) {
      localStorage.setItem('cadsinter_skip_tutorial', 'true');
    }
    onStartTour(mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in-0 duration-200 overflow-y-auto">
      
      {/* Dialog Box */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden relative animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Decorative Bar */}
        <div className="bg-gradient-to-r from-red-600 via-indigo-600 to-emerald-500 h-2.5 w-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer z-10"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 space-y-5">
          
          {/* Header */}
          <div className="space-y-2 pr-8">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Central de Treinamento & Tutoriais CadSinter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Aprenda a Usar a Plataforma CadSinter 🏛️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Assista aos tutoriais em vídeo ou siga o guia interativo passo a passo na tela para cadastrar seus imóveis SINTER/CADURB.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-4 h-4 text-rose-600" />
              <span>🎬 Vídeo Aulas no YouTube ({YOUTUBE_TUTORIALS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interactive')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'interactive'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>🎓 Guias Interativos na Tela</span>
            </button>
          </div>

          {/* TAB 1: VIDEO TUTORIALS */}
          {activeTab === 'videos' ? (
            <div className="space-y-4">
              
              {/* Video Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {YOUTUBE_TUTORIALS.map((video) => {
                  const isSelected = video.id === selectedVideoId;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setSelectedVideoId(video.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5">
                        {video.badge}
                      </span>
                      <span className="line-clamp-1 text-[11px] font-extrabold">
                        {video.title.split(':')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* YouTube Iframe Player */}
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950">
                  <iframe
                    src={currentVideo.embedUrl}
                    title={currentVideo.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                {/* Video Info Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md border text-white mb-1 ${currentVideo.badgeColor}`}>
                        {currentVideo.badge}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        {currentVideo.title}
                      </h3>
                    </div>
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors shrink-0"
                      title="Abrir no aplicativo do YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>Abrir no YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {currentVideo.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentVideo.highlights.map((h, i) => (
                      <span key={i} className="inline-flex items-center space-x-1 text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>

                  {/* Practice Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Quer testar na prática enquanto digita?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStart(currentVideo.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Praticar este Tutorial na Tela</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* TAB 2: INTERACTIVE STEP-BY-STEP GUIDES */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Option 1: Tutorial Imóvel Tipo 1 */}
              <button
                type="button"
                onClick={() => handleStart('type1')}
                className="flex flex-col justify-between p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 hover:to-emerald-100/50 text-slate-900 border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group text-left active:scale-98"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                      Tipo 1
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Imóvel Tipo 1: Territorial
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal leading-snug mt-1">
                      Lotes, terrenos vazios e glebas. Aprenda os 8 campos obrigatórios destacados em vermelho.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-emerald-700 mt-3 pt-2 border-t border-emerald-100">
                  <span>Iniciar Guia Tipo 1</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Tutorial Imóvel Tipo 2 */}
              <button
                type="button"
                onClick={() => handleStart('type2')}
                className="flex flex-col justify-between p-4 bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 hover:to-indigo-100/50 text-slate-900 border-2 border-indigo-300 hover:border-indigo-500 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group text-left active:scale-98"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-200">
                      Tipo 2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Imóvel Tipo 2: Predial
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal leading-snug mt-1">
                      Casas, apartamentos e prédios. Área construída, ano de construção e padrão arquitetônico.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-indigo-700 mt-3 pt-2 border-t border-indigo-100">
                  <span>Iniciar Guia Tipo 2</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 3: Tutorial Imóvel Tipo 3 */}
              <button
                type="button"
                onClick={() => handleStart('type3')}
                className="flex flex-col justify-between p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 hover:to-amber-100/50 text-slate-900 border-2 border-amber-300 hover:border-amber-500 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group text-left active:scale-98"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-200">
                      Tipo 3
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                      Imóvel Tipo 3: Bem Especial
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal leading-snug mt-1">
                      Praças, parques e infraestruturas públicas com código BICE obrigatório.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-700 mt-3 pt-2 border-t border-amber-100">
                  <span>Iniciar Guia Tipo 3</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 4: Tour Geral da Plataforma */}
              <button
                type="button"
                onClick={() => handleStart('overview')}
                className="flex flex-col justify-between p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group text-left active:scale-98"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-700 text-white rounded-xl shadow-xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Geral
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-slate-700 transition-colors">
                      Tour Geral da Plataforma
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal leading-snug mt-1">
                      Visão de cabeçalho, contadores, opções de exportação NDJSON e auditoria de erros.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-bold text-slate-700 mt-3 pt-2 border-t border-slate-200">
                  <span>Iniciar Tour Geral</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          )}

          {/* Option: Skip Tutorial */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <label htmlFor="cadsinter_dont_show" className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                id="cadsinter_dont_show"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span>Não abrir automaticamente nas próximas visitas</span>
            </label>

            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Ir direto para a digitação
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export const VideoTutorialModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: 'overview' | 'type1' | 'type2' | 'type3';
  onStartTour?: (mode: TutorialMode) => void;
}> = ({ isOpen, onClose, initialVideoId = 'overview', onStartTour }) => {
  if (!isOpen) return null;

  return (
    <TutorialWelcomeModal
      isOpen={isOpen}
      onClose={onClose}
      onStartTour={(mode) => {
        if (onStartTour) onStartTour(mode);
        onClose();
      }}
      initialTab="videos"
      initialVideoId={initialVideoId}
    />
  );
};

export const TutorialTourOverlay: React.FC<{
  mode: TutorialMode;
  activeStep: number | null;
  recordsCount?: number;
  onLoadSamples?: () => void;
  onFillSampleTipo1?: () => void;
  onFillSampleTipo2?: () => void;
  onFillSampleTipo3?: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}> = ({
  mode,
  activeStep,
  recordsCount = 0,
  onLoadSamples,
  onFillSampleTipo1,
  onFillSampleTipo2,
  onFillSampleTipo3,
  onNext,
  onPrev,
  onClose,
}) => {
  const getSteps = () => {
    switch (mode) {
      case 'type1':
        return TUTORIAL_TIPO1_STEPS;
      case 'type2':
        return TUTORIAL_TIPO2_STEPS;
      case 'type3':
        return TUTORIAL_TIPO3_STEPS;
      case 'overview':
      default:
        return TUTORIAL_OVERVIEW_STEPS;
    }
  };

  const steps = getSteps();
  const step = activeStep !== null && activeStep >= 0 && activeStep < steps.length ? steps[activeStep] : null;

  const isOverviewStep3 = mode === 'overview' && step?.id === 'clear-sample-step';
  const isTypeStep3 = (mode === 'type1' || mode === 'type2' || mode === 'type3') && activeStep === 2;

  // Dynamic selector
  const effectiveSelector = isOverviewStep3
    ? recordsCount === 0
      ? '#tutorial-sample-btn'
      : '#tutorial-clear-btn'
    : step?.highlightSelector;

  React.useEffect(() => {
    if (!effectiveSelector) return;
    const selectors = effectiveSelector.split(',').map((s) => s.trim());
    const matchedElements: Element[] = [];

    selectors.forEach((sel) => {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => matchedElements.push(el));
      } catch {
        // ignore invalid selector
      }
    });

    if (matchedElements.length > 0) {
      matchedElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      matchedElements.forEach((el) => {
        if (isTypeStep3) {
          el.classList.add('tutorial-tipo1-required-highlight');
        } else {
          el.classList.add('tutorial-spotlight-active');
        }
      });
    }

    return () => {
      matchedElements.forEach((el) => {
        el.classList.remove('tutorial-spotlight-active');
        el.classList.remove('tutorial-tipo1-required-highlight');
      });
    };
  }, [effectiveSelector, step, isTypeStep3]);

  if (!step || activeStep === null) {
    return null;
  }

  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  const handleNextWithAction = () => {
    if (isOverviewStep3 && recordsCount === 0 && onLoadSamples) {
      onLoadSamples();
    }
    onNext();
  };

  const getHeaderBadge = () => {
    switch (mode) {
      case 'type1':
        return { label: 'Tutorial Imóvel Tipo 1 (Territorial)', bg: 'bg-emerald-600', border: 'border-emerald-500' };
      case 'type2':
        return { label: 'Tutorial Imóvel Tipo 2 (Predial)', bg: 'bg-indigo-600', border: 'border-indigo-500' };
      case 'type3':
        return { label: 'Tutorial Imóvel Tipo 3 (Bem Especial)', bg: 'bg-amber-600', border: 'border-amber-500' };
      default:
        return { label: 'Tour CadSinter', bg: 'bg-slate-700', border: 'border-slate-600' };
    }
  };

  const badge = getHeaderBadge();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-end p-3 sm:p-6">
      
      {/* Floating Card Box at Bottom Right */}
      <div className="pointer-events-auto max-w-lg w-full animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Dialog Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-slate-300 ring-4 ring-slate-900/10 w-full overflow-hidden relative">
          
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`${badge.bg} text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                {badge.label}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Passo {activeStep + 1} de {steps.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isTypeStep3 ? (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Campos em Vermelho</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-2xs">
                  👆 Em Destaque
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Sair do Tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>{step.title}</span>
            </h3>

            {/* Special Interactive Box for Step 3 in Tipo 1, 2, or 3 */}
            {isTypeStep3 ? (
              <div className="space-y-2.5">
                <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-3 space-y-2 shadow-xs">
                  <div className="flex items-center space-x-2 text-rose-950 font-black text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Campos Obrigatórios Marcados em VERMELHO:</span>
                  </div>
                  <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
                    {mode === 'type1' && 'Observe o formulário: todos os 8 campos exigidos para o Tipo 1 (Territorial) estão destacados com borda vermelha e badge de alerta.'}
                    {mode === 'type2' && 'Observe o formulário: os campos obrigatórios para o Tipo 2 (Predial) estão destacados em vermelho, incluindo Área Construída (>0 m²) e Ano Construtivo.'}
                    {mode === 'type3' && 'Observe o formulário: os campos obrigatórios para o Tipo 3 (Bem Especial) estão destacados em vermelho, incluindo a seleção do Código BICE.'}
                  </p>
                  
                  {mode === 'type1' && onFillSampleTipo1 && (
                    <button
                      type="button"
                      onClick={onFillSampleTipo1}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-lg text-xs shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ Preencher Exemplo do Tipo 1 Automaticamente</span>
                    </button>
                  )}

                  {mode === 'type2' && onFillSampleTipo2 && (
                    <button
                      type="button"
                      onClick={onFillSampleTipo2}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black rounded-lg text-xs shadow-md transition-all cursor-pointer ring-2 ring-indigo-400/50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ Preencher Exemplo do Tipo 2 (Predial) Automaticamente</span>
                    </button>
                  )}

                  {mode === 'type3' && onFillSampleTipo3 && (
                    <button
                      type="button"
                      onClick={onFillSampleTipo3}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black rounded-lg text-xs shadow-md transition-all cursor-pointer ring-2 ring-amber-400/50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ Preencher Exemplo do Tipo 3 (BICE) Automaticamente</span>
                    </button>
                  )}
                </div>
              </div>
            ) : isOverviewStep3 ? (
              recordsCount === 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    A lista de imóveis está vazia. Para ver a opção <strong>"Limpar Lista"</strong> em ação, você precisa ter registros cadastrados!
                  </p>

                  <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 space-y-2 text-center shadow-xs">
                    <span className="text-xs font-black text-amber-950 flex items-center justify-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Ação Obrigatória do Passo 3:</span>
                    </span>
                    <p className="text-[11px] text-amber-900 font-medium">
                      Clique no botão <strong>"Carregar Exemplos"</strong> em destaque no topo do site para incluir 3 imóveis!
                    </p>
                    {onLoadSamples && (
                      <button
                        type="button"
                        onClick={onLoadSamples}
                        className="w-full flex items-center justify-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-lg text-xs shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>✨ Clique Aqui para Carregar Exemplos Agora</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1 text-emerald-950 text-xs shadow-2xs">
                    <div className="flex items-center space-x-1.5 font-extrabold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>3 Imóveis de Exemplo Carregados!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-tight">
                      Observe o botão vermelho em destaque no cabeçalho acima: <strong>"Limpar Lista (3)"</strong>.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {step.description}
              </p>
            )}

            {/* List of Detail Items */}
            {!isOverviewStep3 && step.details && step.details.length > 0 && (
              <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-2.5 space-y-2 text-xs">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start space-x-2 border-b border-slate-200/60 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-sm shrink-0 select-none">{detail.icon || '📌'}</span>
                    <div>
                      <strong className="font-bold text-slate-900 block text-[11px]">{detail.title}</strong>
                      <span className="text-slate-600 text-[10px] leading-tight block">{detail.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step.tip && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start space-x-2 text-[11px] text-amber-900 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-950">Dica Prática:</strong> {step.tip}
                </div>
              </div>
            )}

            {/* Progress dots & Footer Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              
              <div className="flex items-center space-x-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeStep
                        ? 'w-4 bg-indigo-600'
                        : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={isFirst}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    isFirst
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={isLast ? onClose : handleNextWithAction}
                  className="flex items-center space-x-1 px-3 py-1.5 text-white font-bold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  {isLast ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Concluir</span>
                    </>
                  ) : (
                    <>
                      <span>{isOverviewStep3 && recordsCount === 0 ? 'Carregar e Avançar' : 'Próximo'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
