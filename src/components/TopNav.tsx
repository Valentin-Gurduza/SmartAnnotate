import React from 'react';
import { ActiveWorkspace } from '../types/annotation';
import { Sparkles, Download, Upload, Play, ShieldAlert, BookOpen, Layers, Type, Award } from 'lucide-react';

interface TopNavProps {
  activeWorkspace: ActiveWorkspace;
  setActiveWorkspace: (ws: ActiveWorkspace) => void;
  datasetName: string;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenShortcuts: () => void;
  onTriggerAiAutoLabel: () => void;
  isAiProcessing: boolean;
  totalItems: number;
  annotatedCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeWorkspace,
  setActiveWorkspace,
  datasetName,
  onOpenExport,
  onOpenImport,
  onOpenShortcuts,
  onTriggerAiAutoLabel,
  isAiProcessing,
  totalItems,
  annotatedCount,
}) => {
  const percentComplete = totalItems > 0 ? Math.round((annotatedCount / totalItems) * 100) : 0;

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Zone 1: Wordmark & Context Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">AnnotateAI</span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">/</span>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium truncate max-w-[140px] md:max-w-[200px]">{datasetName}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-300">
            {annotatedCount}/{totalItems} <span className="text-slate-500">({percentComplete}%)</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Workspaces */}
      <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
        <button
          onClick={() => setActiveWorkspace('vision')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeWorkspace === 'vision'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Object Detection Studio (Ctrl+1)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Object Detection</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-black/20 opacity-70">^1</kbd>
        </button>

        <button
          onClick={() => setActiveWorkspace('ner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeWorkspace === 'ner'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="NER & Text Studio (Ctrl+2)"
        >
          <Type className="w-3.5 h-3.5" />
          <span>NER & Text</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-black/20 opacity-70">^2</kbd>
        </button>

        <button
          onClick={() => setActiveWorkspace('rlhf')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeWorkspace === 'rlhf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="RLHF Model Evaluation Studio (Ctrl+3)"
        >
          <Award className="w-3.5 h-3.5" />
          <span>RLHF Eval</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-black/20 opacity-70">^3</kbd>
        </button>

        <button
          onClick={() => setActiveWorkspace('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeWorkspace === 'audit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Quality & Consistency Audit (Ctrl+4)"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Quality Audit</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-black/20 opacity-70">^4</kbd>
        </button>

        <button
          onClick={() => setActiveWorkspace('taxonomy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeWorkspace === 'taxonomy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="Schema Taxonomy & Guidelines (Ctrl+5)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Taxonomy</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-black/20 opacity-70">^5</kbd>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTriggerAiAutoLabel}
          disabled={isAiProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-lg shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer active:scale-95"
          title="Auto-label with Gemini AI (Ctrl+Enter)"
        >
          {isAiProcessing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isAiProcessing ? 'AI Labeling...' : 'Smart Label (AI)'}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenImport}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Import images, text, or load benchmarks (Ctrl+I)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onOpenExport}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Export YOLO, COCO, VOC, CoNLL, or CSV (Ctrl+E)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Keyboard Shortcuts Cheat Sheet (?)"
        >
          <span className="font-mono text-xs font-bold px-1 text-slate-400 hover:text-white">?</span>
        </button>
      </div>
    </header>
  );
};
