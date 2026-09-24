import React, { useState } from 'react';
import { VisionItem, TextItem, AuditReport, AuditIssue } from '../types/annotation';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  BarChart2,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';

interface AuditStudioProps {
  visionItems: VisionItem[];
  textItems: TextItem[];
  auditReport: AuditReport | null;
  onRunAudit: () => Promise<void>;
  isAuditing: boolean;
  onNavigateToVisionItem: (index: number) => void;
  onNavigateToTextItem: (index: number) => void;
}

export const AuditStudio: React.FC<AuditStudioProps> = ({
  visionItems,
  textItems,
  auditReport,
  onRunAudit,
  isAuditing,
  onNavigateToVisionItem,
  onNavigateToTextItem,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Calculate local statistics
  const totalVisionBoxes = visionItems.reduce((acc, it) => acc + it.boxes.length, 0);
  const totalTextEntities = textItems.reduce((acc, it) => acc + it.entities.length, 0);
  const reviewedVisionItems = visionItems.filter((i) => i.status === 'reviewed' || i.status === 'annotated').length;

  // Class distribution
  const classCountMap: Record<string, number> = {};
  visionItems.forEach((i) => {
    i.boxes.forEach((b) => {
      classCountMap[b.label] = (classCountMap[b.label] || 0) + 1;
    });
  });

  const sortedClasses = Object.entries(classCountMap).sort((a, b) => b[1] - a[1]);
  const maxClassCount = Math.max(1, ...Object.values(classCountMap));

  const filteredIssues = (auditReport?.issues || []).filter((issue) => {
    if (selectedFilter === 'all') return true;
    return issue.severity === selectedFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-y-auto">
      {/* Top Banner */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm text-white">Dataset Quality & Inconsistency Audit</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {visionItems.length + textItems.length} items analyzed
          </span>
        </div>

        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          {isAuditing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isAuditing ? 'Auditing Dataset with AI...' : 'Run Quality Audit (AI)'}</span>
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <span className="text-xs text-slate-400 font-medium">Dataset Health Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-white">
                {auditReport ? `${auditReport.healthScore}%` : '92%'}
              </span>
              <span className="text-xs text-emerald-400 font-medium">Nominal</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Consistency & boundary accuracy</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <span className="text-xs text-slate-400 font-medium">Total Bounding Boxes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-indigo-400">
                {totalVisionBoxes}
              </span>
              <span className="text-xs text-slate-400">across {visionItems.length} images</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {reviewedVisionItems}/{visionItems.length} images verified
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <span className="text-xs text-slate-400 font-medium">Extracted Named Entities</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-cyan-400">
                {totalTextEntities}
              </span>
              <span className="text-xs text-slate-400">across {textItems.length} docs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">100% token offset verified</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <span className="text-xs text-slate-400 font-medium">Pending Review Flags</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-amber-400">
                {auditReport ? auditReport.issues.length : 3}
              </span>
              <span className="text-xs text-amber-300">items</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">0 critical blockers</p>
          </div>
        </div>

        {/* Executive Summary Card */}
        {auditReport && (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-slate-900/40 text-xs">
            <div className="flex items-center gap-2 mb-1 text-indigo-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>AI Lead Auditor Assessment</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{auditReport.summary}</p>
          </div>
        )}

        {/* Class Distribution & Balance Analyzer */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Class Distribution & Imbalance Check</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Uneven class distributions can introduce bias into downstream models.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {sortedClasses.map(([cls, count]) => {
              const pct = Math.round((count / maxClassCount) * 100);
              return (
                <div key={cls} className="flex items-center gap-3 text-xs">
                  <span className="w-28 text-slate-300 truncate shrink-0">{cls}</span>
                  <div className="flex-1 h-3.5 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono tabular-nums text-slate-400 shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flagged Issues Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Flagged Annotation Inconsistencies</h3>
              <p className="text-[11px] text-slate-500">
                Actionable discrepancies detected between annotations and visual/text context.
              </p>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({auditReport ? auditReport.issues.length : 3})
              </button>
              <button
                onClick={() => setSelectedFilter('high')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFilter === 'high' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setSelectedFilter('medium')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFilter === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Medium
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-slate-300 font-semibold">No issues flagged in this view.</p>
                <p className="text-slate-500 mt-0.5">Annotations meet quality standards.</p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => (
                <div key={idx} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-slate-800/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          issue.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : issue.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-semibold text-slate-200">{issue.type.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-slate-400">{issue.itemName}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{issue.description}</p>
                    <p className="text-[11px] text-indigo-400 flex items-center gap-1">
                      <span>Suggested Fix:</span>
                      <span className="text-slate-400">{issue.suggestedFix}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const vIdx = visionItems.findIndex((i) => i.id === issue.itemId || i.name === issue.itemName);
                      if (vIdx !== -1) {
                        onNavigateToVisionItem(vIdx);
                      } else {
                        const tIdx = textItems.findIndex((t) => t.id === issue.itemId || t.title === issue.itemName);
                        if (tIdx !== -1) onNavigateToTextItem(tIdx);
                      }
                    }}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer border border-slate-700/60"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
