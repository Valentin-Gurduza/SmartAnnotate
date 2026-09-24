import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'Workspace Navigation',
    items: [
      { keys: ['Ctrl', '1'], description: 'Switch to Object Detection Studio' },
      { keys: ['Ctrl', '2'], description: 'Switch to NER & Text Studio' },
      { keys: ['Ctrl', '3'], description: 'Switch to RLHF Evaluation Studio' },
      { keys: ['Ctrl', '4'], description: 'Switch to Quality Audit Studio' },
      { keys: ['Ctrl', '5'], description: 'Switch to Schema Taxonomy Manager' },
    ],
  },
  {
    title: 'Global Actions',
    items: [
      { keys: ['Ctrl', 'Enter'], description: 'Trigger Smart Label (AI) on active workspace' },
      { keys: ['Ctrl', 'E'], description: 'Open Export Dataset modal' },
      { keys: ['Ctrl', 'I'], description: 'Open Import & Benchmarks modal' },
      { keys: ['?'], description: 'Open this Keyboard Shortcuts cheat sheet' },
      { keys: ['Esc'], description: 'Close active modal / Deselect current item' },
    ],
  },
  {
    title: 'Vision Annotation Tools',
    items: [
      { keys: ['W'], description: 'Box Drawing crosshair tool' },
      { keys: ['V'], description: 'Select / Move bounding box tool' },
      { keys: ['Space', 'Drag'], description: 'Pan viewport canvas' },
      { keys: ['1', '–', '8'], description: 'Assign class to selected bounding box' },
      { keys: ['Enter'], description: 'Accept active AI suggested proposal' },
      { keys: ['Del'], description: 'Delete selected bounding box' },
      { keys: ['D'], description: 'Next image in dataset' },
      { keys: ['A'], description: 'Previous image in dataset' },
    ],
  },
  {
    title: 'NER & Document Tools',
    items: [
      { keys: ['Highlight'], description: 'Select text with cursor to create entity tag' },
      { keys: ['1', '–', '7'], description: 'Select active entity class for highlighting' },
    ],
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs text-slate-400">
            Use these shortcuts to navigate workspaces and speed up annotation throughput without touching the mouse.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SHORTCUT_SECTIONS.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-2.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-1">
                  {sec.title}
                </h4>

                <div className="space-y-2">
                  {sec.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-300 leading-tight">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-sm">
                              {k}
                            </kbd>
                            {kIdx < item.keys.length - 1 && k !== '–' && item.keys[kIdx + 1] !== '–' && (
                              <span className="text-slate-600 text-[10px]">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Press <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">?</kbd> anytime to open this guide.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
