import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type {
  ProjectAnalysis,
  RebuiltProject,
  RepoInspectResult,
  TargetStackId,
} from '../types';
import { SourceFilesPanel } from './SourceFilesPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { RebuildStudioPanel } from './RebuildStudioPanel';

export type WorkbenchTab = 'files' | 'analysis' | 'rebuild';

interface ProjectWorkbenchProps {
  projectName: string;
  categoryLabel?: string;
  inspected: RepoInspectResult;
  activeTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
  analysis: ProjectAnalysis | null;
  analyzing: boolean;
  analysisError: string | null;
  onRunAnalysis: () => void;
  rebuild: RebuiltProject | null;
  rebuilding: boolean;
  rebuildError: string | null;
  onRunRebuild: (config: {
    targetStack: TargetStackId;
    enhancements: string[];
    customInstructions: string;
  }) => void;
  onUpdateRebuild: (updated: RebuiltProject) => void;
  onBackToExplorer: () => void;
}

export const ProjectWorkbench: React.FC<ProjectWorkbenchProps> = ({
  projectName,
  categoryLabel,
  inspected,
  activeTab,
  onTabChange,
  analysis,
  analyzing,
  analysisError,
  onRunAnalysis,
  rebuild,
  rebuilding,
  rebuildError,
  onRunRebuild,
  onUpdateRebuild,
  onBackToExplorer,
}) => {
  const totalKb = (inspected.stats.totalBytes / 1024).toFixed(1);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={onBackToExplorer}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 font-medium cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للمستكشف</span>
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-mono" dir="ltr">
              {inspected.owner}/{inspected.repo}
            </span>
            {categoryLabel && (
              <>
                <span aria-hidden="true">/</span>
                <span>{categoryLabel}</span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{inspected.stats.totalFiles} ملفاً إجمالاً</span>
            <span aria-hidden="true">·</span>
            <span>{inspected.stats.fetchedFiles} ملفاً محللاً</span>
            <span aria-hidden="true">·</span>
            <span dir="ltr">{totalKb} KB</span>
            {inspected.stats.languages.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono" dir="ltr">
                  {inspected.stats.languages.slice(0, 4).join(', ')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={inspected.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <span>المصدر على GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            disabled={analyzing}
            onClick={() => {
              onTabChange('analysis');
              if (!analysis) onRunAnalysis();
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {analyzing ? 'جاري التحليل...' : analysis ? 'عرض التحليل المعماري' : 'تشغيل التحليل المعماري'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => onTabChange('files')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'files'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الملفات المصدرية ({inspected.files.length})
        </button>
        <button
          type="button"
          onClick={() => onTabChange('analysis')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'analysis'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          التحليل المعماري
        </button>
        <button
          type="button"
          onClick={() => onTabChange('rebuild')}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'rebuild'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          معمل إعادة البناء
        </button>
      </div>

      {activeTab === 'files' && <SourceFilesPanel inspected={inspected} />}

      {activeTab === 'analysis' && (
        <AnalysisPanel
          analysis={analysis}
          analyzing={analyzing}
          error={analysisError}
          onRunAnalysis={onRunAnalysis}
          onProceedToRebuild={() => onTabChange('rebuild')}
        />
      )}

      {activeTab === 'rebuild' && (
        <RebuildStudioPanel
          projectName={projectName}
          rebuild={rebuild}
          rebuilding={rebuilding}
          error={rebuildError}
          onRunRebuild={onRunRebuild}
          onUpdateRebuild={onUpdateRebuild}
        />
      )}
    </div>
  );
};
