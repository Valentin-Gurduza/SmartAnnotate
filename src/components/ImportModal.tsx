import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileText, CheckCircle, Database, X } from 'lucide-react';
import { initialVisionItems, initialTextItems, initialRLHFItems } from '../data/sampleDatasets';
import { VisionItem, TextItem, RLHFItem } from '../types/annotation';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDatasetPreset: (preset: 'urban' | 'warehouse' | 'retail' | 'legal') => void;
  onImportCustomImages: (files: FileList) => void;
  onImportCustomText: (title: string, text: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onLoadDatasetPreset,
  onImportCustomImages,
  onImportCustomText,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'images' | 'text'>('presets');
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocContent, setCustomDocContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">Import Data & Benchmark Datasets</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Benchmark Presets
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'images'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Upload Images
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Paste Text Data
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Instantly load production-grade benchmark datasets equipped with verified ground-truth annotations and AI proposals:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onLoadDatasetPreset('urban');
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold text-xs text-white group-hover:text-indigo-300">
                      Urban Autonomous Driving
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Vehicles, pedestrians on zebra crossings, bicycles, and regulatory street signals.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    6 classes · 1280x720 vector benchmark
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadDatasetPreset('warehouse');
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-xs text-white group-hover:text-indigo-300">
                      Warehouse Logistics & Robotics
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Forklifts, high-bay storage racks, pallets, workers in PPE, and hazard warning signs.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    5 classes · Industrial logistics
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadDatasetPreset('retail');
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-xs text-white group-hover:text-indigo-300">
                      Retail Supermarket Planogram
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Beverage bottles, cereal boxes, pasta packages, and shelf edge price labels.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    Dense shelf inventory detection
                  </div>
                </button>

                <button
                  onClick={() => {
                    onLoadDatasetPreset('legal');
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="font-semibold text-xs text-white group-hover:text-indigo-300">
                      Enterprise Contracts & Clinical Notes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Named Entity Recognition dataset for ORG, DATE, MONEY, TECH, and clinical trials.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-500">
                    7 entity classes · Token boundary tags
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl bg-slate-950/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <FileImage className="w-10 h-10 text-indigo-400 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">
                  Click to select images or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, JPEG, WEBP, and SVG</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onImportCustomImages(e.target.files);
                    onClose();
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  placeholder="e.g., Customer Support Log #120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Text Content to Annotate</label>
                <textarea
                  value={customDocContent}
                  onChange={(e) => setCustomDocContent(e.target.value)}
                  placeholder="Paste raw text, dialog transcripts, emails, or medical notes..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (customDocContent.trim()) {
                      onImportCustomText(customDocTitle || 'Custom Text Document', customDocContent);
                      onClose();
                    }
                  }}
                  disabled={!customDocContent.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Import to NER Studio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
