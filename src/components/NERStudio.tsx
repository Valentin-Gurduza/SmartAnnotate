import React, { useState, useRef } from 'react';
import { TextItem, NEREntity, TaxonomyClass } from '../types/annotation';
import {
  Sparkles,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  FileText,
  Search,
  MessageSquare,
  Check
} from 'lucide-react';

interface NERStudioProps {
  items: TextItem[];
  currentItemIndex: number;
  onSelectItemIndex: (index: number) => void;
  classes: TaxonomyClass[];
  onUpdateItem: (itemId: string, updated: Partial<TextItem>) => void;
  onAddNewTextItem: (title: string, text: string) => void;
  onTriggerAiNer: (item: TextItem) => Promise<void>;
  onTriggerAiClassification: (item: TextItem) => Promise<void>;
  isAiLoading: boolean;
}

export const NERStudio: React.FC<NERStudioProps> = ({
  items,
  currentItemIndex,
  onSelectItemIndex,
  classes,
  onUpdateItem,
  onAddNewTextItem,
  onTriggerAiNer,
  onTriggerAiClassification,
  isAiLoading,
}) => {
  const currentItem = items[currentItemIndex];
  const [activeClassId, setActiveClassId] = useState<string>(classes[0]?.id || '');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocText, setNewDocText] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  const getClassColor = (label: string): string => {
    const found = classes.find((c) => c.name.toLowerCase() === label.toLowerCase());
    return found ? found.color : '#3B82F6';
  };

  // Handle manual text selection to create an entity
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !currentItem) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Determine character offset in currentItem.text
    // We look for selectedText in the full text
    const fullText = currentItem.text;
    const startIndex = fullText.indexOf(selectedText);
    if (startIndex === -1) return;

    const endIndex = startIndex + selectedText.length;

    // Check if overlap exists
    const overlaps = currentItem.entities.some(
      (e) => (startIndex >= e.start && startIndex < e.end) || (endIndex > e.start && endIndex <= e.end)
    );

    if (overlaps) {
      selection.removeAllRanges();
      return;
    }

    const newEntity: NEREntity = {
      id: `entity-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: selectedText,
      label: activeClass.name,
      start: startIndex,
      end: endIndex,
      confidence: 1.0,
      isAiSuggested: false,
    };

    const updated = [...currentItem.entities, newEntity].sort((a, b) => a.start - b.start);
    onUpdateItem(currentItem.id, { entities: updated, status: 'annotated' });
    setSelectedEntityId(newEntity.id);
    selection.removeAllRanges();
  };

  const handleRemoveEntity = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    const updated = currentItem.entities.filter((ent) => ent.id !== id);
    onUpdateItem(currentItem.id, { entities: updated });
    if (selectedEntityId === id) setSelectedEntityId(null);
  };

  const handleAcceptAiEntity = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    const updated = currentItem.entities.map((ent) =>
      ent.id === id ? { ...ent, isAiSuggested: false } : ent
    );
    onUpdateItem(currentItem.id, { entities: updated, status: 'annotated' });
  };

  // Render text with entity highlights
  const renderAnnotatedText = () => {
    if (!currentItem) return null;
    const text = currentItem.text;
    const entities = [...currentItem.entities].sort((a, b) => a.start - b.start);

    if (entities.length === 0) {
      return <span className="leading-relaxed">{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    entities.forEach((ent) => {
      // Add plain text before entity
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, ent.start)}</span>
        );
      }

      const color = getClassColor(ent.label);
      const isSelected = selectedEntityId === ent.id;

      // Add highlighted entity
      elements.push(
        <mark
          key={ent.id}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEntityId(ent.id);
          }}
          className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded border text-slate-100 font-medium cursor-pointer transition-all ${
            isSelected ? 'ring-2 ring-white shadow-md' : ''
          }`}
          style={{
            backgroundColor: `${color}25`,
            borderColor: color,
          }}
        >
          <span>{ent.text}</span>
          <span
            className="text-[10px] font-mono px-1 py-0.2 rounded text-white font-bold leading-tight"
            style={{ backgroundColor: color }}
          >
            {ent.label}
          </span>
          {ent.isAiSuggested && (
            <button
              onClick={(e) => handleAcceptAiEntity(ent.id, e)}
              className="hover:bg-emerald-600 rounded p-0.5 text-emerald-400 hover:text-white"
              title="Accept AI Entity"
            >
              <Check className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={(e) => handleRemoveEntity(ent.id, e)}
            className="hover:bg-rose-600 rounded p-0.5 text-slate-400 hover:text-white"
            title="Remove Tag"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </mark>
      );

      lastIndex = ent.end;
    });

    // Add remaining plain text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-tail`}>{text.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="flex-1 flex min-h-0 bg-slate-950 overflow-hidden">
      {/* Left List of Text Documents */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Documents ({items.length})</span>
          <button
            onClick={() => setIsAddingDoc(true)}
            className="p-1 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
            title="Add Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {items.map((doc, idx) => {
            const isCurrent = idx === currentItemIndex;
            const hasAi = doc.entities.some((e) => e.isAiSuggested);
            return (
              <button
                key={doc.id}
                onClick={() => onSelectItemIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate max-w-[170px]">{doc.title}</span>
                  {hasAi ? (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  ) : doc.status === 'annotated' ? (
                    <span className="text-emerald-400 text-[10px]">✓</span>
                  ) : null}
                </div>
                <p className="line-clamp-2 text-[11px] text-slate-500">{doc.text}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{doc.entities.length} entities</span>
                  {doc.classification && (
                    <span className="text-indigo-400 truncate max-w-[100px]">
                      · {doc.classification.category}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Center Editor View */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
        {/* Sub-header toolbar */}
        <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">{currentItem?.title}</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentItem?.text.length || 0} chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerAiNer(currentItem)}
              disabled={isAiLoading || !currentItem}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {isAiLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Extract Entities (AI)</span>
            </button>

            <button
              onClick={() => onTriggerAiClassification(currentItem)}
              disabled={isAiLoading || !currentItem}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Classify Text (AI)</span>
            </button>
          </div>
        </div>

        {/* Text Annotation Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentItem?.classification && (
            <div className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold text-indigo-300">
                    Category: {currentItem.classification.category}
                  </span>
                  {currentItem.classification.rationale && (
                    <p className="text-[11px] text-indigo-200/80 mt-0.5">
                      {currentItem.classification.rationale}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-mono text-indigo-400 font-semibold tabular-nums">
                {Math.round(currentItem.classification.confidence * 100)}%
              </span>
            </div>
          )}

          {/* Interactive Highlightable Text Card */}
          <div
            ref={textContainerRef}
            onMouseUp={handleMouseUp}
            className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 text-sm leading-relaxed shadow-lg select-text font-sans"
            style={{ minHeight: '260px' }}
          >
            {renderAnnotatedText()}
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            💡 Highlight any text span to assign the active label (<strong>{activeClass?.name}</strong>).
          </p>
        </div>
      </div>

      {/* Right Sidebar: Entity Types & Extracted Entities List */}
      <div className="w-72 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
        {/* Entity Class Palette */}
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Entity Classes</span>
            <span className="text-[11px] text-slate-500 font-mono">Select to Tag</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {classes.map((c) => {
              const isSelected = activeClassId === c.id;
              const count = currentItem?.entities.filter((e) => e.label === c.name).length || 0;

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveClassId(c.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border border-slate-700 text-white shadow-sm'
                      : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="font-mono text-[10px] text-slate-300 bg-slate-800 px-1 rounded tabular-nums">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extracted Entities Table */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 pb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Extracted Entities ({currentItem?.entities.length || 0})
            </span>
            {currentItem && currentItem.entities.length > 0 && (
              <button
                onClick={() => onUpdateItem(currentItem.id, { entities: [] })}
                className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5">
            {currentItem?.entities.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <FileText className="w-5 h-5 mb-1 opacity-40" />
                <p>No entities tagged</p>
                <p className="text-[10px] text-slate-600">Highlight text or run AI Extract</p>
              </div>
            ) : (
              currentItem?.entities.map((ent) => {
                const color = getClassColor(ent.label);
                const isSelected = selectedEntityId === ent.id;

                return (
                  <div
                    key={ent.id}
                    onClick={() => setSelectedEntityId(ent.id)}
                    className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {ent.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                          [{ent.start}:{ent.end}]
                        </span>
                        <button
                          onClick={(e) => handleRemoveEntity(ent.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-200 font-medium truncate">{ent.text}</div>
                    {ent.isAiSuggested && (
                      <div className="mt-1 flex items-center justify-between text-[10px] text-amber-400">
                        <span>AI Suggestion</span>
                        <button
                          onClick={(e) => handleAcceptAiEntity(ent.id, e)}
                          className="px-1.5 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded font-medium"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-3">Add Document to Dataset</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title / Identifier</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Clinical Report 04"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Text Content</label>
                <textarea
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Paste or write document text..."
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddingDoc(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newDocText.trim()) {
                    onAddNewTextItem(newDocTitle || 'Untitled Document', newDocText);
                    setNewDocTitle('');
                    setNewDocText('');
                    setIsAddingDoc(false);
                  }
                }}
                disabled={!newDocText.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded"
              >
                Add Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
