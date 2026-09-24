import React, { useState } from 'react';
import { RLHFItem } from '../types/annotation';
import { Sparkles, Award, ThumbsUp, Check, Scale, BookOpen, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface RLHFStudioProps {
  items: RLHFItem[];
  currentItemIndex: number;
  onSelectItemIndex: (index: number) => void;
  onUpdateItem: (itemId: string, updated: Partial<RLHFItem>) => void;
  onAddNewRLHFItem: (prompt: string, responseA: string, responseB: string) => void;
  onTriggerAiCritique: (item: RLHFItem, rubric?: string) => Promise<void>;
  isAiLoading: boolean;
}

export const RLHFStudio: React.FC<RLHFStudioProps> = ({
  items,
  currentItemIndex,
  onSelectItemIndex,
  onUpdateItem,
  onAddNewRLHFItem,
  onTriggerAiCritique,
  isAiLoading,
}) => {
  const currentItem = items[currentItemIndex];
  const [rubric, setRubric] = useState<string>(
    'Prioritize correctness, conciseness, instruction following, and safety. Disfavor hallucinations.'
  );
  const [evaluatorNotes, setEvaluatorNotes] = useState<string>(currentItem?.evaluatorNotes || '');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newRespA, setNewRespA] = useState('');
  const [newRespB, setNewRespB] = useState('');

  const handleSetPreference = (pref: 'A' | 'B' | 'TIE') => {
    if (!currentItem) return;
    onUpdateItem(currentItem.id, { preference: pref, status: 'annotated', evaluatorNotes });
  };

  return (
    <div className="flex-1 flex min-h-0 bg-slate-950 overflow-hidden">
      {/* Left List of Comparison Pairs */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">RLHF Prompts ({items.length})</span>
          <button
            onClick={() => setIsAddingItem(true)}
            className="p-1 rounded bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
            title="Add Comparison Pair"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {items.map((item, idx) => {
            const isCurrent = idx === currentItemIndex;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectItemIndex(idx);
                  setEvaluatorNotes(item.evaluatorNotes || '');
                }}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold font-mono text-[10px] text-slate-400">
                    Prompt #{idx + 1}
                  </span>
                  {item.preference ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Prefers {item.preference}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">Pending</span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] text-slate-300">{item.prompt}</p>
                {item.aiCritique && (
                  <div className="mt-2 text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Scored: A({item.aiCritique.scoreA})/B({item.aiCritique.scoreB})</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center & Right: Pairwise Comparison Canvas */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-y-auto">
        {/* Sub-header toolbar */}
        <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">Pairwise Preference Evaluation</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Human-in-the-Loop RLHF</span>
          </div>

          <button
            onClick={() => onTriggerAiCritique(currentItem, rubric)}
            disabled={isAiLoading || !currentItem}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-500/20"
          >
            {isAiLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>AI Co-Evaluator / Judge</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
          {/* Prompt Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">User Prompt</span>
              <span className="text-[11px] text-slate-500 font-mono">Input</span>
            </div>
            <p className="text-sm text-slate-100 font-medium whitespace-pre-wrap">{currentItem?.prompt}</p>
          </div>

          {/* AI Co-Evaluator Critique Banner if available */}
          {currentItem?.aiCritique && (
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900/40 text-xs shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Judge Analysis (Gemini Flash)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-300">
                    Model A: <strong className="text-white">{currentItem.aiCritique.scoreA}/10</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="font-mono text-slate-300">
                    Model B: <strong className="text-white">{currentItem.aiCritique.scoreB}/10</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500 text-white font-bold">
                    Suggested: {currentItem.aiCritique.preferred}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">{currentItem.aiCritique.justification}</p>

              {currentItem.aiCritique.suggestedGoldResponse && (
                <div className="mt-3 pt-3 border-t border-indigo-500/20">
                  <span className="font-semibold text-cyan-300 text-[11px]">
                    ✨ Synthesized Gold Response:
                  </span>
                  <p className="mt-1 text-slate-400 italic text-[11px]">
                    {currentItem.aiCritique.suggestedGoldResponse}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Side-by-side Response A vs Response B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Response A */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                currentItem?.preference === 'A'
                  ? 'border-emerald-500/80 bg-slate-900/90 shadow-lg ring-1 ring-emerald-500/30'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-semibold text-xs text-slate-200">
                    {currentItem?.responseA.modelName || 'Model A'}
                  </span>
                  {currentItem?.preference === 'A' && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Preferred
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap overflow-x-auto">
                  {currentItem?.responseA.text}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleSetPreference('A')}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentItem?.preference === 'A'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{currentItem?.preference === 'A' ? 'Selected as Preferred (A)' : 'Prefer Response A'}</span>
                </button>
              </div>
            </div>

            {/* Model Response B */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                currentItem?.preference === 'B'
                  ? 'border-emerald-500/80 bg-slate-900/90 shadow-lg ring-1 ring-emerald-500/30'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-semibold text-xs text-slate-200">
                    {currentItem?.responseB.modelName || 'Model B'}
                  </span>
                  {currentItem?.preference === 'B' && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Preferred
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap overflow-x-auto">
                  {currentItem?.responseB.text}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleSetPreference('B')}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    currentItem?.preference === 'B'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{currentItem?.preference === 'B' ? 'Selected as Preferred (B)' : 'Prefer Response B'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tie or Neutral Choice & Evaluator Notes */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => handleSetPreference('TIE')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentItem?.preference === 'TIE'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Mark as Tie / Equivalent Quality</span>
            </button>

            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                value={evaluatorNotes}
                onChange={(e) => setEvaluatorNotes(e.target.value)}
                onBlur={() => {
                  if (currentItem) {
                    onUpdateItem(currentItem.id, { evaluatorNotes });
                  }
                }}
                placeholder="Add annotator rationale or notes for model trainers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Add RLHF Comparison Pair</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">User Prompt</label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="User input question or command..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Model A Response</label>
                <textarea
                  value={newRespA}
                  onChange={(e) => setNewRespA(e.target.value)}
                  placeholder="Candidate A response..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Model B Response</label>
                <textarea
                  value={newRespB}
                  onChange={(e) => setNewRespB(e.target.value)}
                  placeholder="Candidate B response..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAddingItem(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPrompt && newRespA && newRespB) {
                    onAddNewRLHFItem(newPrompt, newRespA, newRespB);
                    setNewPrompt('');
                    setNewRespA('');
                    setNewRespB('');
                    setIsAddingItem(false);
                  }
                }}
                disabled={!newPrompt || !newRespA || !newRespB}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded"
              >
                Add Pair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
