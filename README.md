# 🏢 CadSinter - Gestão e Integrador Cadastral Municipal SINTER / CADURB

## 🌐 Acesso ao Site Oficial (Online)
👉 **Acesse a aplicação diretamente pelo navegador:**  
### 🔗 [https://eorhuzin.github.io/Cadsinter/](https://eorhuzin.github.io/Cadsinter/)

---

> **Plataforma Web independente, gratuita e intuitiva para auxílio de gestores e servidores públicos municipais na geração, validação, gerenciamento e transmissão de arquivos imobiliários para o SINTER (Sistema Nacional de Gestão de Informações Territoriais) e CADURB da Receita Federal do Brasil.**

---

## 📋 Sumário
1. [Visão Geral](#-visão-geral)
2. [Principais Recursos](#-principais-recursos)
3. [Passo a Passo Detalhado de Uso](#-passo-a-passo-detalhado-de-uso)
   - [1. Configurar o Município (Código IBGE)](#1-configurar-o-município-código-ibge)
   - [2. Cadastrar ou Importar Imóveis](#2-cadastrar-ou-importar-imóveis)
   - [3. Visualizar e Editar no Workbench (Tabela Interativa)](#3-visualizar-e-editar-no-workbench-tabela-interativa)
   - [4. Edição em Lote (Alterações Múltiplas)](#4-edição-em-lote-alterações-múltiplas)
   - [5. Validar Regras e Estrutura SINTER](#5-validar-regras-e-estrutura-sinter)
   - [6. Exportar Arquivos (NDJSON / ZIP)](#6-exportar-arquivos-ndjson--zip)
   - [7. Enviar via API REST SINTER (Integração Direta)](#7-enviar-via-api-rest-sinter-integração-direta)
4. [Instalação e Execução Local](#-instalação-e-execução-local)
5. [Como Publicar no GitHub e GitHub Pages](#-como-publicar-no-github-e-github-pages)
6. [Segurança e Privacidade](#-segurança-e-privacidade)

---

## 🔍 Visão Geral

A Receita Federal exige que as prefeituras e municípios brasileiros enviem periodicamente os dados cadastrais das Unidades Imobiliárias Urbanas (UI) no formato padrão do **SINTER (Manual de Integração v1)**.

O **CadSinter** resolve os desafios técnicos desse processo:
- Elimina a necessidade de criar scripts complexos do zero.
- Converte formulários visuais em linhas estruturadas de **NDJSON** (JSON Delimitado por Quebra de Linha).
- Valida campos obrigatórios, inscrições imobiliárias, CPFs/CNPJs e códigos cartográficos em tempo real.
- Suporta integração direta com as APIs REST do SINTER via autenticação **OAuth 2.0 / Keycloak**.

---

## ✨ Principais Recursos

- **Suporte Total aos 3 Tipos de Imóveis**:
  - **Tipo 1 - Territorial**: Terrenos e lotes vagos.
  - **Tipo 2 - Predial**: Imóveis com edificações concluídas ou em construção.
  - **Tipo 3 - BICE**: Bens de Características Especiais (pontes, portos, antenas, praças, etc.) com seleção do **Código BICE** exclusiva e validada.
- **Controle de Gestão por Cores (Status de Revisão)**:
  - 🟢 **Verde (OK / Aprovado)**: Imóveis conferidos e validados para envio.
  - 🟡 **Amarelo (Atenção / Pendente)**: Imóveis que requerem verificação de certidões, áreas ou titulares.
  - 🔴 **Vermelho (Erro / Incorreto)**: Imóveis com dados inconsistentes que precisam de correção.
  - **Filtros e Ações em Lote**: Filtragem por cor com um clique e aplicação de status ou exclusão em massa.
  - **Dual Export (Controle Interno vs. Oficial SINTER)**: O NDJSON de Controle Interno preserva o status e cores dos imóveis (`_statusCor`) para re-importação futura sem perder o progresso de revisão, enquanto o arquivo ZIP / NDJSON Oficial SINTER é gerado 100% limpo e estritamente aderente ao manual da Receita Federal.
- **Formulário Completo com Tooltips Didáticos**: Ajuda em cada campo com regras oficiais da Receita Federal, exemplos de preenchimento e máscaras.
- **Importador de Arquivos**: Importação instantânea de arquivos nos formatos `.ndjson`, `.json`, `.csv` e `.zip`.
- **Workbench Inteligente (Tabela)**: Filtros por tipo de imóvel, busca por inscrição/endereço/titular, ordenação e pré-visualização de arquivos.
- **Edição em Lote**: Alteração simultânea de múltiplos registros (ex.: atualizar cartório, tipo de operação ou endereço de vários imóveis de uma só vez).
- **Gerador de Arquivo NDJSON e ZIP**: Exportação com nome padronizado (ex.: `2913606_carga.ndjson` e `2913606_20260816.zip`).
- **Terminal de Teste de API REST**: Teste de conectividade, geração de Bearer Token e envio de chamadas de inclusão, consulta e desativação direta ao servidor da Receita Federal.

---

## 📖 Passo a Passo Detalhado de Uso

### 1. Configurar o Município (Código IBGE)
Ao abrir a aplicação, no painel superior ou nas modais de exportação/API, certifique-se de definir o **Código IBGE de 7 dígitos** do seu município (exemplo: `2913606` para Ilhéus/BA, `3550308` para São Paulo/SP).
> **Por que é importante?** O código IBGE é utilizado na formação dos nomes dos arquivos exportados e nos endpoints das APIs REST do SINTER (`/api/v1/{codigoIbge}/uis`).

---

### 2. Cadastrar ou Importar Imóveis

Você pode alimentar o sistema de duas formas:

#### **A) Cadastro Manual via Formulário**
1. Na aba principal **"Novo Cadastro"**, selecione o **Tipo de Imóvel**:
   - `Tipo 1 (Territorial)`
   - `Tipo 2 (Predial)`
   - `Tipo 3 (BICE - Especial)` *(Ativa o campo exclusivo de Código BICE de 01 a 12)*.
2. Preencha os **Dados do Endereço**: Tipo de Logradouro (Rua, Avenida, etc.), Logradouro, Número, Bairro e CEP.
3. Preencha os **Dados Gerais do Imóvel**:
   - Inscrição Imobiliária Municipal.
   - Código Cartográfico / GEO (ID da Parcela).
   - Área do Terreno ($m^2$) e Área Construída ($m^2$).
   - Ano da Edificação e Valor Venal (R$).
4. Adicione **Titulares / Proprietários**: Informe CPF ou CNPJ e o percentual de participação (deve somar 100%).
5. Adicione **Módulos Cartorários (Opcional)**: Registro de Imóveis (RI), Cartório de Notas (Escrituras) e ITBI.
6. Clique no botão **"Salvar e Adicionar ao Workbench"**.

#### **B) Importação de Arquivo Existente**
1. Clique no botão **"Importar Arquivo"** no topo da página.
2. Arraste ou selecione seu arquivo (`.ndjson`, `.csv`, `.json` ou `.zip`).
3. O sistema fará o parse automático e carregará todos os imóveis para a lista do Workbench.

---

### 3. Visualizar e Editar no Workbench (Tabela Interativa)

Na aba **"Lista de Imóveis"**:
- **Busca Rápida**: Digite a inscrição, logradouro ou nome do proprietário para filtrar instantaneamente.
- **Filtros por Tipo**: Filtre por Territorial, Predial ou BICE.
- **Ações por Registro**:
  - ✏️ **Editar**: Abre a janela de edição com todos os dados preenchidos para ajuste.
  - 📋 **Duplicar**: Cria uma cópia rápida do imóvel para agilizar cadastros similares.
  - 🗑️ **Excluir**: Remove o registro do lote local.

---

### 4. Edição em Lote (Alterações Múltiplas)

Para alterar vários imóveis ao mesmo tempo:
1. No Workbench, selecione as caixas de seleção (checkboxes) dos imóveis desejados.
2. Clique no botão **"Edição em Lote"**.
3. Escolha quais campos deseja atualizar (ex.: alterar o código do Cartório de Registro de Imóveis ou a operação de Inclusão para Alteração).
4. Aplique as mudanças de uma só vez para todos os registros selecionados.

---

### 5. Validar Regras e Estrutura SINTER

Antes de gerar os arquivos finais:
1. Observe os alertas e sinalizações no painel de cada imóvel.
2. O sistema realiza verificações automáticas:
   - Presença de Inscrição Imobiliária e Código Cartográfico.
   - Regra exclusiva do Código BICE para Tipo 3.
   - CPFs/CNPJs dos titulares válidos.
   - SOMA dos percentuais dos titulares (100%).
   - Formato das datas no padrão `AAAA-MM-DD`.

---

### 6. Exportar Arquivos (NDJSON / ZIP)

Com os dados validados:
1. Clique em **"Gerar NDJSON"** ou **"Baixar Lote (.zip)"**.
2. **Visualização NDJSON**: É exibida uma janela com o texto bruto gerado no padrão exato exigido pela Receita Federal (uma linha JSON por imóvel).
3. Clique em **"Copiar Conteúdo"** ou **"Baixar Arquivo .ndjson"**.
4. O arquivo gerado está pronto para upload no portal oficial do SINTER/Receita Federal.

---

### 7. Enviar via API REST SINTER (Integração Direta)

Se o seu município utiliza a transmissão automatizada via webservice API REST:
1. Clique no botão **"Transmissão API"** no cabeçalho.
2. **Aba Conexão & Auth**:
   - Informe a URL do ambiente (Homologação ou Produção).
   - Preencha o `Client ID` e `Client Secret` fornecidos pela Receita Federal / Keycloak.
   - Clique em **"Testar Conexão & Obter Token"** para autenticar via OAuth 2.0 e gerar o **Bearer Token**.
3. **Aba Enviar Lote de UIs**:
   - Transmita os registros diretamente do navegador para a API do SINTER (`POST /api/v1/{codigoIbge}/uis`).
   - Acompanhe o retorno HTTP (200 OK, 400 Bad Request, etc.) e o log de execução em tempo real.

---

## 🚀 Publicação no GitHub Pages com GitHub Actions

### 1. Por que usar o GitHub Actions?
Projetos modernos desenvolvidos em **React + Vite + TypeScript** possuem código-fonte em formato que os navegadores não executam diretamente (como arquivos `.tsx`, definições de tipo do TypeScript e escopos de módulos sem empacotamento).

Para o site funcionar publicamente na web, esses arquivos precisam ser **compilados, empacotados e otimizados**, gerando os artefatos estáticos na pasta de saída `dist/` (contendo apenas HTML, CSS e JS puro).

- **Sem o Actions (O jeito que dá erro)**: O GitHub Pages tenta entregar os arquivos brutos do código-fonte (`src/App.tsx`, etc.) diretamente ao navegador. Como o navegador não sabe executar TypeScript/React sem compilação, a página resulta em tela em branco ou erro 404.
- **Com o Actions (O jeito correto)**: Sempre que você faz um `git push` para a branch `main`, o GitHub cria temporariamente um servidor virtual em nuvem, instala as dependências (`npm ci`), executa a compilação (`npm run build`), captura a pasta `dist/` resultante e a publica automaticamente no GitHub Pages.

---

### 2. O que faz a mudança no `vite.config.ts`?
Quando o site é publicado no GitHub Pages em um repositório, o endereço final fica sob o caminho do repositório:
`https://eorhuzin.github.io/Cadsinter/`

Se o Vite não for informado sobre essa subpasta `/Cadsinter/`, ele tentará buscar os scripts e folhas de estilo na raiz do domínio (`https://eorhuzin.github.io/assets/...`), resultando em erros **404 Not Found**.

A linha abaixo no `vite.config.ts` instrui o Vite a prefixar todos os caminhos dos arquivos compilados com `/Cadsinter/`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Cadsinter/', // Garante que todos os assets iniciem em /Cadsinter/
  // ...
});
```

---

### 3. O que faz o arquivo `.github/workflows/deploy.yml`?
Esse arquivo é o fluxo de automação para a nuvem do GitHub executar o build. Ele realiza a seguinte sequência:

- **Trigger (`on: push` na `main`)**: Dispara a automação a cada atualização no código.
- **Permissões (`permissions`)**: Concede autorização segura para publicar artefatos no GitHub Pages.
- **Passos (`steps`)**:
  1. **Checkout**: Baixa o código para o servidor do GitHub.
  2. **Setup Node.js & Install**: Configura a versão do Node.js e instala as dependências do `package.json`.
  3. **Build**: Executa `npm run build` gerando a pasta `dist/`.
  4. **Upload & Deploy**: Envia o conteúdo compilado de `./dist` para os servidores do GitHub Pages.

---

## 🔒 Segurança e Privacidade

- **100% Processamento Local (Client-side)**: Nenhum dado cadastral ou imobiliário digitado ou importado é armazenado em servidores de terceiros. Tudo é processado diretamente na memória do seu navegador.
- **Credenciais Seguras**: As chaves de acesso à API (`Client Secret`) e tokens Bearer nunca são salvas em arquivos estáticos ou repositórios de código.

---

## 🤝 Suporte e Contribuições

Se este sistema te ajudou ou economizou horas de trabalho na sua prefeitura, considere fazer uma contribuição voluntária para manter o projeto gratuito, atualizado e ativo!

- **Pix (Chave Aleatória)**: `93942072-0157-466d-840d-d840ef33af2a`
- **Cobrança Direta Nubank**: [Abrir Link de Cobrança Nubank](https://nubank.com.br/cobrar/v2843/6a816ec0-d115-4c13-b928-8eea2a1c8e29)

---

Desenvolvido para simplificar e modernizar a gestão territorial nos municípios brasileiros. 🇧🇷
