import React, { useState } from 'react';
import { ActiveWorkspace, VisionItem, TextItem, RLHFItem, TaxonomyClass, AuditReport } from './types/annotation';
import {
  initialVisionItems,
  initialTextItems,
  initialRLHFItems,
  defaultVisionClasses,
  defaultNERClasses,
} from './data/sampleDatasets';
import { urbanStreetSvg, warehouseLogisticsSvg, retailShelfSvg } from './utils/svgScenes';
import { TopNav } from './components/TopNav';
import { VisionStudio } from './components/VisionStudio';
import { NERStudio } from './components/NERStudio';
import { RLHFStudio } from './components/RLHFStudio';
import { AuditStudio } from './components/AuditStudio';
import { TaxonomyManager } from './components/TaxonomyManager';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { Check, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>('vision');
  const [datasetName, setDatasetName] = useState<string>('Autonomous Driving & Multimodal Benchmark');

  // Vision state
  const [visionItems, setVisionItems] = useState<VisionItem[]>(initialVisionItems);
  const [currentVisionIndex, setCurrentVisionIndex] = useState<number>(0);
  const [visionClasses, setVisionClasses] = useState<TaxonomyClass[]>(defaultVisionClasses);

  // NER / Text state
  const [textItems, setTextItems] = useState<TextItem[]>(initialTextItems);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [nerClasses, setNerClasses] = useState<TaxonomyClass[]>(defaultNERClasses);

  // RLHF state
  const [rlhfItems, setRlhfItems] = useState<RLHFItem[]>(initialRLHFItems);
  const [currentRLHFIndex, setCurrentRLHFIndex] = useState<number>(0);

  // Quality Audit state
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Modals & UI states
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Global Keyboard Shortcuts via useKeyboardShortcut hook
  useKeyboardShortcut('Ctrl+1', () => {
    setActiveWorkspace('vision');
    showToast('Switched to Object Detection Studio (Ctrl+1)', 'info');
  });

  useKeyboardShortcut('Ctrl+2', () => {
    setActiveWorkspace('ner');
    showToast('Switched to NER & Text Studio (Ctrl+2)', 'info');
  });

  useKeyboardShortcut('Ctrl+3', () => {
    setActiveWorkspace('rlhf');
    showToast('Switched to RLHF Evaluation Studio (Ctrl+3)', 'info');
  });

  useKeyboardShortcut('Ctrl+4', () => {
    setActiveWorkspace('audit');
    showToast('Switched to Quality Audit (Ctrl+4)', 'info');
  });

  useKeyboardShortcut('Ctrl+5', () => {
    setActiveWorkspace('taxonomy');
    showToast('Switched to Taxonomy Manager (Ctrl+5)', 'info');
  });

  useKeyboardShortcut(['Ctrl+Enter', 'Alt+L'], () => {
    handleTriggerAiAutoLabel();
  });

  useKeyboardShortcut('Ctrl+E', () => {
    setIsExportOpen((prev) => !prev);
  });

  useKeyboardShortcut('Ctrl+I', () => {
    setIsImportOpen((prev) => !prev);
  });

  useKeyboardShortcut('?', () => {
    setIsShortcutsOpen((prev) => !prev);
  });

  useKeyboardShortcut('Escape', () => {
    setIsExportOpen(false);
    setIsImportOpen(false);
    setIsShortcutsOpen(false);
  });

  // 1. Computer Vision Object Detection via Gemini API
  const handleTriggerVisionAi = async (item: VisionItem, threshold: number = 0.75, guidelines?: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/annotate/detect-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: item.imageUrl,
          name: item.name,
          itemId: item.id,
          classes: visionClasses.map((c) => c.name),
          taskGuidelines: guidelines,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const detectedAnnotations = (data.annotations || []).filter(
        (a: any) => (a.confidence ?? 1) >= threshold
      );

      const newBoxes = detectedAnnotations.map((det: any, i: number) => ({
        id: `ai-box-${Date.now()}-${i}`,
        label: det.label,
        box_2d: det.box_2d as [number, number, number, number],
        confidence: det.confidence,
        isAiSuggested: true,
        reviewed: false,
        rationale: det.rationale,
      }));

      // Keep user-reviewed or manually drawn boxes, replace stale unreviewed AI suggestions with fresh detections
      const preservedBoxes = item.boxes.filter((b) => !b.isAiSuggested || b.reviewed);
      const updatedBoxes = [...preservedBoxes, ...newBoxes];

      setVisionItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, boxes: updatedBoxes, status: 'ai_suggested' } : it
        )
      );

      const scenarioLabel =
        item.id === 'vis-2' || item.name.includes('forklift') || item.name.includes('warehouse')
          ? 'Forklift & Warehouse'
          : item.id === 'vis-3' || item.name.includes('shelf')
          ? 'Shelf Consumables'
          : 'Objects';

      showToast(`Detected ${newBoxes.length} ${scenarioLabel} with Gemini AI!`);
    } catch (error: any) {
      console.error('Vision AI error:', error);
      showToast(error.message || 'Failed to detect objects with AI', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 2. NER Entity Extraction via Gemini API
  const handleTriggerNerAi = async (item: TextItem) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/annotate/ner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: item.text,
          entityTypes: nerClasses.map((c) => ({ name: c.name, description: c.description })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const extractedEntities = (data.entities || []).map((ent: any, i: number) => ({
        id: `ai-ner-${Date.now()}-${i}`,
        text: ent.text,
        label: ent.label,
        start: ent.start,
        end: ent.end,
        confidence: ent.confidence ?? 0.95,
        isAiSuggested: true,
      }));

      // Combine without duplicating exact overlapping spans
      const existingStarts = new Set(item.entities.map((e) => e.start));
      const filteredNew = extractedEntities.filter((e: any) => !existingStarts.has(e.start));
      const combined = [...item.entities, ...filteredNew].sort((a, b) => a.start - b.start);

      setTextItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, entities: combined, status: 'ai_suggested' } : t))
      );

      showToast(`Extracted ${filteredNew.length} named entities with Gemini!`);
    } catch (error: any) {
      console.error('NER AI error:', error);
      showToast(error.message || 'Failed to extract entities with AI', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 3. Document Classification via Gemini API
  const handleTriggerTextClassification = async (item: TextItem) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/annotate/classify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: item.text,
          classes: ['Contract Execution', 'Clinical Advisory', 'Billing Dispute', 'Technical Inquiry', 'General'],
        }),
      });

      if (!res.ok) throw new Error('Failed to classify text');

      const data = await res.json();
      const topPred = data.predictions?.[0];
      if (topPred) {
        setTextItems((prev) =>
          prev.map((t) =>
            t.id === item.id
              ? {
                  ...t,
                  classification: {
                    category: topPred.label,
                    confidence: topPred.score,
                    rationale: topPred.rationale,
                  },
                }
              : t
          )
        );
        showToast(`Classified as "${topPred.label}" (${Math.round(topPred.score * 100)}%)`);
      }
    } catch (error: any) {
      console.error('Classification error:', error);
      showToast(error.message || 'Failed to classify document', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 4. RLHF Model Pairwise Critique via Gemini API
  const handleTriggerRLHFCritique = async (item: RLHFItem, rubric?: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/annotate/rlhf-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: item.prompt,
          responseA: item.responseA.text,
          responseB: item.responseB.text,
          rubric,
        }),
      });

      if (!res.ok) throw new Error('Failed to run RLHF critique');

      const data = await res.json();
      setRlhfItems((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? {
                ...r,
                aiCritique: data,
                preference: data.preferred as 'A' | 'B' | 'TIE',
                status: 'annotated',
              }
            : r
        )
      );

      showToast(`AI Judge completed: Prefers Model ${data.preferred}!`);
    } catch (error: any) {
      console.error('RLHF AI error:', error);
      showToast(error.message || 'Failed to evaluate responses with AI', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 5. Dataset Quality Audit
  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const auditPayload = [
        ...visionItems.map((v) => ({
          id: v.id,
          name: v.name,
          boxesCount: v.boxes.length,
          classes: v.boxes.map((b) => b.label),
          hasAiSuggestions: v.boxes.some((b) => b.isAiSuggested),
        })),
        ...textItems.map((t) => ({
          id: t.id,
          name: t.title,
          entitiesCount: t.entities.length,
          entityTypes: t.entities.map((e) => e.label),
        })),
      ];

      const res = await fetch('/api/annotate/audit-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetType: 'multimodal',
          items: auditPayload,
        }),
      });

      if (!res.ok) throw new Error('Failed to audit dataset');

      const data = await res.json();
      setAuditReport({
        healthScore: data.healthScore ?? 92,
        summary: data.summary ?? 'Annotations show high inter-label agreement.',
        issues: data.issues || [],
        auditedAt: new Date().toLocaleTimeString(),
      });

      showToast(`Quality audit complete. Health score: ${data.healthScore ?? 92}%`);
    } catch (error: any) {
      console.error('Audit error:', error);
      showToast(error.message || 'Failed to run dataset audit', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  // 6. AI Taxonomy Generator
  const handleGenerateTaxonomy = async (domain: string, taskType: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/annotate/generate-taxonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, taskType }),
      });

      if (!res.ok) throw new Error('Failed to generate taxonomy');

      const data = await res.json();
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        const generatedClasses: TaxonomyClass[] = data.classes.map((cls: any, idx: number) => ({
          id: `gen-cls-${Date.now()}-${idx}`,
          name: cls.name,
          color: cls.color || '#3B82F6',
          hotkey: cls.hotkey || `${(idx % 9) + 1}`,
          description: cls.description || '',
          dosAndDonts: cls.dosAndDonts,
        }));

        if (taskType === 'object_detection') {
          setVisionClasses(generatedClasses);
        } else {
          setNerClasses(generatedClasses);
        }
        showToast(`Generated ${generatedClasses.length} taxonomy classes for "${domain}"!`);
      }
    } catch (error: any) {
      console.error('Taxonomy generation error:', error);
      showToast(error.message || 'Failed to generate taxonomy', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Universal Smart Label trigger for TopNav button
  const handleTriggerAiAutoLabel = () => {
    if (activeWorkspace === 'vision') {
      const item = visionItems[currentVisionIndex];
      if (item) handleTriggerVisionAi(item);
    } else if (activeWorkspace === 'ner') {
      const item = textItems[currentTextIndex];
      if (item) handleTriggerNerAi(item);
    } else if (activeWorkspace === 'rlhf') {
      const item = rlhfItems[currentRLHFIndex];
      if (item) handleTriggerRLHFCritique(item);
    } else if (activeWorkspace === 'audit') {
      handleRunAudit();
    } else {
      showToast('Select Object Detection, NER, or RLHF to run Smart Label', 'info');
    }
  };

  // File upload handler for Vision
  const handleAddNewVisionImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newItem: VisionItem = {
          id: `custom-img-${Date.now()}`,
          name: file.name,
          imageUrl: result,
          width: img.naturalWidth || 1280,
          height: img.naturalHeight || 720,
          status: 'unannotated',
          boxes: [],
          tags: ['uploaded', file.type],
        };
        setVisionItems((prev) => [...prev, newItem]);
        setCurrentVisionIndex(visionItems.length);
        showToast(`Added ${file.name}`);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Batch Image import handler
  const handleImportCustomImages = (files: FileList) => {
    Array.from(files).forEach((file) => handleAddNewVisionImage(file));
  };

  // Custom text import
  const handleImportCustomText = (title: string, text: string) => {
    const newItem: TextItem = {
      id: `custom-text-${Date.now()}`,
      title,
      text,
      entities: [],
      status: 'unannotated',
    };
    setTextItems((prev) => [...prev, newItem]);
    setCurrentTextIndex(textItems.length);
    setActiveWorkspace('ner');
    showToast(`Added document: ${title}`);
  };

  // Dataset Preset Switcher
  const handleLoadDatasetPreset = (preset: 'urban' | 'warehouse' | 'retail' | 'legal') => {
    if (preset === 'urban') {
      setCurrentVisionIndex(0);
      setActiveWorkspace('vision');
      setDatasetName('Autonomous Driving Benchmark');
      showToast('Loaded Urban Autonomous Driving Dataset');
    } else if (preset === 'warehouse') {
      setCurrentVisionIndex(1);
      setActiveWorkspace('vision');
      setDatasetName('Warehouse Logistics & Robotics Dataset');
      showToast('Loaded Warehouse Logistics Dataset');
    } else if (preset === 'retail') {
      setCurrentVisionIndex(2);
      setActiveWorkspace('vision');
      setDatasetName('Retail Supermarket Planogram Dataset');
      showToast('Loaded Retail Supermarket Dataset');
    } else if (preset === 'legal') {
      setCurrentTextIndex(0);
      setActiveWorkspace('ner');
      setDatasetName('Enterprise Contracts & Legal NER');
      showToast('Loaded Enterprise Legal Dataset');
    }
  };

  // Counts for TopNav
  const totalItems = visionItems.length + textItems.length;
  const annotatedCount =
    visionItems.filter((i) => i.status === 'annotated' || i.status === 'reviewed').length +
    textItems.filter((t) => t.status === 'annotated' || t.status === 'reviewed').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Contract Navigation */}
      <TopNav
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        datasetName={datasetName}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onTriggerAiAutoLabel={handleTriggerAiAutoLabel}
        isAiProcessing={isAiLoading || isAuditing}
        totalItems={totalItems}
        annotatedCount={annotatedCount}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex min-h-0 relative">
        {activeWorkspace === 'vision' && (
          <VisionStudio
            items={visionItems}
            currentItemIndex={currentVisionIndex}
            onSelectItemIndex={setCurrentVisionIndex}
            classes={visionClasses}
            onUpdateItemBoxes={(itemId, boxes, status) => {
              setVisionItems((prev) =>
                prev.map((it) =>
                  it.id === itemId
                    ? { ...it, boxes, status: status || (boxes.length > 0 ? 'annotated' : 'unannotated') }
                    : it
                )
              );
            }}
            onAddNewImage={handleAddNewVisionImage}
            onTriggerAiDetection={handleTriggerVisionAi}
            isAiLoading={isAiLoading}
          />
        )}

        {activeWorkspace === 'ner' && (
          <NERStudio
            items={textItems}
            currentItemIndex={currentTextIndex}
            onSelectItemIndex={setCurrentTextIndex}
            classes={nerClasses}
            onUpdateItem={(itemId, updated) => {
              setTextItems((prev) =>
                prev.map((it) => (it.id === itemId ? { ...it, ...updated } : it))
              );
            }}
            onAddNewTextItem={handleImportCustomText}
            onTriggerAiNer={handleTriggerNerAi}
            onTriggerAiClassification={handleTriggerTextClassification}
            isAiLoading={isAiLoading}
          />
        )}

        {activeWorkspace === 'rlhf' && (
          <RLHFStudio
            items={rlhfItems}
            currentItemIndex={currentRLHFIndex}
            onSelectItemIndex={setCurrentRLHFIndex}
            onUpdateItem={(itemId, updated) => {
              setRlhfItems((prev) =>
                prev.map((it) => (it.id === itemId ? { ...it, ...updated } : it))
              );
            }}
            onAddNewRLHFItem={(prompt, respA, respB) => {
              const newItem: RLHFItem = {
                id: `rlhf-${Date.now()}`,
                prompt,
                responseA: { modelName: 'Candidate Alpha', text: respA },
                responseB: { modelName: 'Candidate Beta', text: respB },
                status: 'unannotated',
              };
              setRlhfItems((prev) => [...prev, newItem]);
              setCurrentRLHFIndex(rlhfItems.length);
              showToast('Added comparison pair');
            }}
            onTriggerAiCritique={handleTriggerRLHFCritique}
            isAiLoading={isAiLoading}
          />
        )}

        {activeWorkspace === 'audit' && (
          <AuditStudio
            visionItems={visionItems}
            textItems={textItems}
            auditReport={auditReport}
            onRunAudit={handleRunAudit}
            isAuditing={isAuditing}
            onNavigateToVisionItem={(index) => {
              setCurrentVisionIndex(index);
              setActiveWorkspace('vision');
            }}
            onNavigateToTextItem={(index) => {
              setCurrentTextIndex(index);
              setActiveWorkspace('ner');
            }}
          />
        )}

        {activeWorkspace === 'taxonomy' && (
          <TaxonomyManager
            visionClasses={visionClasses}
            nerClasses={nerClasses}
            onUpdateVisionClasses={setVisionClasses}
            onUpdateNerClasses={setNerClasses}
            onGenerateTaxonomy={handleGenerateTaxonomy}
            isAiGenerating={isAiLoading}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        visionItems={visionItems}
        textItems={textItems}
        currentVisionItem={visionItems[currentVisionIndex]}
        visionClasses={visionClasses}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onLoadDatasetPreset={handleLoadDatasetPreset}
        onImportCustomImages={handleImportCustomImages}
        onImportCustomText={handleImportCustomText}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/95 text-rose-200 border-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-indigo-950/95 text-indigo-200 border-indigo-800'
                : 'bg-emerald-950/95 text-emerald-200 border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
