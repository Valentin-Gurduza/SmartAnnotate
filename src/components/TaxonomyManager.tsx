import React, { useState } from 'react';
import { TaxonomyClass } from '../types/annotation';
import { BookOpen, Plus, Trash2, Sparkles, Check, Edit2, Palette } from 'lucide-react';

interface TaxonomyManagerProps {
  visionClasses: TaxonomyClass[];
  nerClasses: TaxonomyClass[];
  onUpdateVisionClasses: (classes: TaxonomyClass[]) => void;
  onUpdateNerClasses: (classes: TaxonomyClass[]) => void;
  onGenerateTaxonomy: (domain: string, taskType: string) => Promise<void>;
  isAiGenerating: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EAB308', // Yellow
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
];

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({
  visionClasses,
  nerClasses,
  onUpdateVisionClasses,
  onUpdateNerClasses,
  onGenerateTaxonomy,
  isAiGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'ner'>('vision');
  const [domainPrompt, setDomainPrompt] = useState<string>('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // New class state
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState(PRESET_COLORS[0]);
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassHotkey, setNewClassHotkey] = useState('');

  const currentClasses = activeTab === 'vision' ? visionClasses : nerClasses;
  const updateCurrentClasses = activeTab === 'vision' ? onUpdateVisionClasses : onUpdateNerClasses;

  const handleAddClass = () => {
    if (!newClassName.trim()) return;

    const nextHotkey = newClassHotkey || `${(currentClasses.length % 9) + 1}`;
    const newClass: TaxonomyClass = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      color: newClassColor,
      hotkey: nextHotkey,
      description: newClassDesc.trim() || 'No description provided.',
    };

    updateCurrentClasses([...currentClasses, newClass]);
    setNewClassName('');
    setNewClassDesc('');
    setNewClassHotkey('');
  };

  const handleDeleteClass = (id: string) => {
    updateCurrentClasses(currentClasses.filter((c) => c.id !== id));
  };

  const handleUpdateClass = (id: string, updated: Partial<TaxonomyClass>) => {
    updateCurrentClasses(currentClasses.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-y-auto">
      {/* Top Banner */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm text-white">Schema Taxonomy & Labeling Guidelines</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Standardized class definitions for annotators</span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'vision' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Object Detection ({visionClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('ner')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'ner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NER Entities ({nerClasses.length})
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* AI Taxonomy Generator Bar */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900/40">
          <div className="flex items-center gap-2 mb-2 text-indigo-300 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Taxonomy Schema Generator</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Enter a domain or application (e.g., &quot;Agricultural Drone Crop Disease&quot;, &quot;Maritime Vessel Traffic&quot;, &quot;Biomedical Clinical Notes&quot;), and Gemini will generate a full label taxonomy with guidelines and distinct colors.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={domainPrompt}
              onChange={(e) => setDomainPrompt(e.target.value)}
              placeholder="e.g., Autonomous Delivery Robots, Warehouse Safety, Fintech Receipts..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => onGenerateTaxonomy(domainPrompt, activeTab === 'vision' ? 'object_detection' : 'ner')}
              disabled={isAiGenerating || !domainPrompt.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              {isAiGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate Schema</span>
            </button>
          </div>
        </div>

        {/* Existing Classes Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Taxonomy Classes ({currentClasses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentClasses.map((cls) => {
              const isEditing = editingClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cls.color }}
                        />
                        <span className="font-semibold text-sm text-slate-100">{cls.name}</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                          {cls.hotkey}
                        </kbd>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingClassId(isEditing ? null : cls.id)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-2 pt-2 border-t border-slate-800">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Class Name</label>
                          <input
                            type="text"
                            value={cls.name}
                            onChange={(e) => handleUpdateClass(cls.id, { name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Definition / Criteria</label>
                          <textarea
                            value={cls.description}
                            onChange={(e) => handleUpdateClass(cls.id, { description: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Color:</span>
                          <div className="flex items-center gap-1">
                            {PRESET_COLORS.map((col) => (
                              <button
                                key={col}
                                onClick={() => handleUpdateClass(cls.id, { color: col })}
                                className={`w-4 h-4 rounded-full ${cls.color === col ? 'ring-2 ring-white' : ''}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed">{cls.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Class Form */}
        <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add New Class to Taxonomy</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Class Name</label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Traffic Cone, Emergency Vehicle"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Keyboard Hotkey</label>
              <input
                type="text"
                maxLength={1}
                value={newClassHotkey}
                onChange={(e) => setNewClassHotkey(e.target.value)}
                placeholder="1-9"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Label Color</label>
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.slice(0, 7).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewClassColor(color)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      newClassColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[11px] text-slate-400 block mb-1">Annotator Guidelines & Definitions</label>
            <input
              type="text"
              value={newClassDesc}
              onChange={(e) => setNewClassDesc(e.target.value)}
              placeholder="e.g., Include orange safety pylons and barriers in construction zones..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleAddClass}
            disabled={!newClassName.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Add Class
          </button>
        </div>
      </div>
    </div>
  );
};
