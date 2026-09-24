import React, { useState } from 'react';
import { VisionItem, TextItem, TaxonomyClass } from '../types/annotation';
import {
  exportToYOLO,
  exportToCOCO,
  exportToPascalVOC,
  exportToCoNLL,
  exportToJSONL,
  exportToCSV
} from '../utils/exportFormats';
import { Download, Copy, Check, X, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visionItems: VisionItem[];
  textItems: TextItem[];
  currentVisionItem: VisionItem;
  visionClasses: TaxonomyClass[];
}

type ExportFormat = 'yolo' | 'coco' | 'voc' | 'conll' | 'jsonl' | 'csv';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  visionItems,
  textItems,
  currentVisionItem,
  visionClasses,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('coco');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  let exportContent = '';
  let filename = '';
  let mimeType = 'text/plain';

  switch (selectedFormat) {
    case 'yolo':
      exportContent = exportToYOLO(currentVisionItem, visionClasses);
      filename = `${currentVisionItem.name.replace(/\.[^/.]+$/, '')}.txt`;
      break;
    case 'coco':
      exportContent = exportToCOCO(visionItems, visionClasses);
      filename = 'annotations_coco.json';
      mimeType = 'application/json';
      break;
    case 'voc':
      exportContent = exportToPascalVOC(currentVisionItem);
      filename = `${currentVisionItem.name.replace(/\.[^/.]+$/, '')}.xml`;
      mimeType = 'application/xml';
      break;
    case 'conll':
      exportContent = exportToCoNLL(textItems);
      filename = 'dataset_conll.txt';
      break;
    case 'jsonl':
      exportContent = exportToJSONL(textItems);
      filename = 'dataset_finetuning.jsonl';
      mimeType = 'application/x-jsonlines';
      break;
    case 'csv':
      exportContent = exportToCSV(visionItems);
      filename = 'annotations_dataset.csv';
      mimeType = 'text/csv';
      break;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">Export Dataset</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selectors */}
        <div className="p-4 px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedFormat('coco')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'coco'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            COCO JSON (Vision)
          </button>

          <button
            onClick={() => setSelectedFormat('yolo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'yolo'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            YOLOv8/v11 (Vision)
          </button>

          <button
            onClick={() => setSelectedFormat('voc')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'voc'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Pascal VOC XML
          </button>

          <button
            onClick={() => setSelectedFormat('conll')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'conll'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            CoNLL / IOB (NER)
          </button>

          <button
            onClick={() => setSelectedFormat('jsonl')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'jsonl'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Fine-Tuning JSONL
          </button>

          <button
            onClick={() => setSelectedFormat('csv')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFormat === 'csv'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            CSV Format
          </button>
        </div>

        {/* Code Preview Viewport */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 select-text leading-relaxed">
          <pre className="whitespace-pre-wrap">{exportContent || '// No annotations available to export'}</pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="font-mono text-xs text-slate-400">File: {filename}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {filename}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
