import { useState, useEffect } from 'react';
import { NDJsonRecord } from './types';
import { SAMPLE_RECORDS } from './constants';
import { recordsToNDJsonContent, downloadFile } from './utils/ndjson';
import { Header } from './components/Header';
import { RecordForm } from './components/RecordForm';
import { RecordList } from './components/RecordList';
import { NDJsonPreview } from './components/NDJsonPreview';
import { ImportModal } from './components/ImportModal';
import { EditRecordModal } from './components/EditRecordModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ApiModal } from './components/ApiModal';
import { ZipModal } from './components/ZipModal';
import { DonateSection } from './components/DonateSection';
import { DonateModal } from './components/DonateModal';
import {
  FileText,
  Code,
  Download,
  Database,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ListPlus,
  Globe,
  FileArchive
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ndjson_generator_records_v1';

export default function App() {
  const [records, setRecords] = useState<NDJsonRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'workbench' | 'preview'>('workbench');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [showDonateBanner, setShowDonateBanner] = useState(true);
  const [editingRecord, setEditingRecord] = useState<NDJsonRecord | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  // Handler: Add single record
  const handleAddRecord = (recordData: Omit<NDJsonRecord, 'id'>) => {
    const newRecord: NDJsonRecord = {
      ...recordData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setRecords((prev) => [...prev, newRecord]);
  };

  // Handler: Add batch records
  const handleAddBatchRecords = (batchRecords: Omit<NDJsonRecord, 'id'>[]) => {
    const newRecords: NDJsonRecord[] = batchRecords.map((r, index) => ({
      ...r,
      id: `rec-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    }));
    setRecords((prev) => [...prev, ...newRecords]);
  };

  // Handler: Quick update single field in a record (inline editing in table)
  const handleUpdateRecordField = (id: string, path: string, value: any) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = {
          ...r,
          dadosGerais: { ...r.dadosGerais },
          endereco: { ...r.endereco },
        };

        if (path.startsWith('dadosGerais.')) {
          const key = path.split('.')[1] as keyof typeof updated.dadosGerais;
          if (key === 'areaTerreno' || key === 'areaConstruida' || key === 'anoConstrutivo' || key === 'tipoImovel' || key === 'tpArquitetonico' || key === 'destinacaoImovel') {
            const num = parseFloat(value);
            (updated.dadosGerais as any)[key] = isNaN(num) ? 0 : num;
          } else if (key === 'temBairro') {
            updated.dadosGerais.temBairro = value === 'true' || value === true;
          } else {
            (updated.dadosGerais as any)[key] = value;
          }
        } else if (path.startsWith('endereco.')) {
          const key = path.split('.')[1] as keyof typeof updated.endereco;
          if (key === 'tipoLogradouro') {
            updated.endereco.tipoLogradouro = parseInt(value, 10) || 0;
          } else {
            (updated.endereco as any)[key] = value;
          }
        } else if (path === 'operacao') {
          updated.operacao = value;
        }

        return updated;
      })
    );
  };

  // Handler: Delete record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Handler: Duplicate record (adds right after the target record)
  const handleDuplicateRecord = (targetRecord: NDJsonRecord) => {
    const index = records.findIndex((r) => r.id === targetRecord.id);
    const newRecord: NDJsonRecord = {
      ...targetRecord,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dadosGerais: { ...targetRecord.dadosGerais },
      endereco: { ...targetRecord.endereco },
    };

    if (index !== -1) {
      const updated = [...records];
      updated.splice(index + 1, 0, newRecord);
      setRecords(updated);
    } else {
      setRecords((prev) => [...prev, newRecord]);
    }
  };

  // Handler: Save edited record
  const handleSaveEditedRecord = (updatedRecord: NDJsonRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  };

  // Handler: Reorder records
  const handleMoveRecord = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === records.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...records];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setRecords(updated);
  };

  // Handler: Load sample records
  const handleLoadSamples = () => {
    setRecords(SAMPLE_RECORDS);
  };

  // Handler: Clear all records
  const handleClearAll = () => {
    setIsClearModalOpen(true);
  };

  // Handler: Import records
  const handleImportRecords = (imported: NDJsonRecord[], replace: boolean) => {
    if (replace) {
      setRecords(imported);
    } else {
      setRecords((prev) => [...prev, ...imported]);
    }
  };

  // Handler: Download NDJSON file
  const handleDownload = () => {
    if (records.length === 0) return;
    const content = recordsToNDJsonContent(records);
    downloadFile(content, 'imoveis_cadastrados.ndjson');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Header Bar */}
      <Header
        count={records.length}
        onDownload={handleDownload}
        onOpenImport={() => setIsImportModalOpen(true)}
        onLoadSamples={handleLoadSamples}
        onClearAll={handleClearAll}
        onOpenApi={() => setIsApiModalOpen(true)}
        onOpenZip={() => setIsZipModalOpen(true)}
        onOpenDonate={() => setIsDonateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Banner: Me doe um Café ☕ */}
        {showDonateBanner && (
          <DonateSection
            isDismissible={true}
            onClose={() => setShowDonateBanner(false)}
            defaultExpanded={false}
          />
        )}
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          
          <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('workbench')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'workbench'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>Formulário e Lista</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                activeTab === 'workbench' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {records.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Código NDJSON Final</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleDownload}
              disabled={records.length === 0}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Baixar arquivo de texto .ndjson"
            >
              <span>BAIXAR NDJSON</span>
            </button>

            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer"
              title="Acessar painel de envio por API REST (SINTER / CADURB)"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>ENVIAR POR API</span>
            </button>

            <button
              type="button"
              onClick={() => setIsZipModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all cursor-pointer"
              title="Baixar arquivo compactado .ZIP contendo o NDJSON"
            >
              <FileArchive className="w-4 h-4 text-amber-600" />
              <span>BAIXAR NDJSON ZIP</span>
            </button>
          </div>

          {/* Quick Counter Banner */}
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl font-mono shadow-2xs">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total de Registros:</span>
              <strong className="text-emerald-600 font-bold text-sm">
                {records.length}
              </strong>
            </div>

            {records.length > 0 && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar NDJSON</span>
              </button>
            )}
          </div>

        </div>

        {/* Tab 1: Workbench (Form + Record Table) */}
        {activeTab === 'workbench' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Record Form */}
            <RecordForm
              onAddRecord={handleAddRecord}
              onAddBatchRecords={handleAddBatchRecords}
              lastAddedCount={records.length}
            />

            {/* Record Table List */}
            <RecordList
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onDuplicateRecord={handleDuplicateRecord}
              onEditRecord={(rec) => setEditingRecord(rec)}
              onUpdateRecordField={handleUpdateRecordField}
              onMoveRecord={handleMoveRecord}
              onLoadSamples={handleLoadSamples}
              onClearAll={handleClearAll}
              onDownload={handleDownload}
              onOpenApi={() => setIsApiModalOpen(true)}
            />

          </div>
        )}

        {/* Tab 2: Raw NDJSON Preview */}
        {activeTab === 'preview' && (
          <div className="animate-fade-in">
            <NDJsonPreview records={records} onOpenApi={() => setIsApiModalOpen(true)} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-slate-500">
            CadSinter • Integrador Cadastral Municipal & Gerador SINTER / CADURB
          </p>
          <button
            type="button"
            onClick={() => setIsDonateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/60 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <span>☕ Me doe um Café (Pix)</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      <ApiModal
        records={records}
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      <ZipModal
        records={records}
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportRecords={handleImportRecords}
      />

      <EditRecordModal
        record={editingRecord}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEditedRecord}
      />

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => setRecords([])}
        count={records.length}
      />

    </div>
  );
}
