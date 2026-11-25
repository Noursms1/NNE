import React, { useState } from 'react';
import { FileCode2, Copy, Check } from 'lucide-react';
import type { RepoInspectResult } from '../types';

interface SourceFilesPanelProps {
  inspected: RepoInspectResult;
}

export const SourceFilesPanel: React.FC<SourceFilesPanelProps> = ({ inspected }) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    inspected.files[0]?.path || ''
  );
  const [copied, setCopied] = useState(false);

  const activeFile =
    inspected.files.find((f) => f.path === selectedPath) || inspected.files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-l border-slate-200 bg-slate-50/70">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">الملفات المجلوبة</span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {inspected.files.length} / {inspected.stats.totalFiles}
          </span>
        </div>
        <div className="max-h-[420px] lg:max-h-[640px] overflow-y-auto divide-y divide-slate-100">
          {inspected.files.map((file) => {
            const isSelected = activeFile?.path === file.path;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={`w-full text-right px-4 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileCode2 className="w-4 h-4 shrink-0 text-slate-400" />
                  <span className="font-mono text-xs truncate" dir="ltr">
                    {file.path}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0" dir="ltr">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-w-0">
        {activeFile ? (
          <>
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                <span className="font-mono font-medium text-slate-900 truncate" dir="ltr">
                  {activeFile.path}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{activeFile.language}</span>
                {activeFile.truncated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700">مختصر للمعاينة</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-100 p-4 sm:p-5 overflow-auto max-h-[640px] flex-1">
              <pre className="font-mono text-xs leading-relaxed whitespace-pre" dir="ltr">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">
            اختر ملفاً من القائمة لعرض محتواه المصدري.
          </div>
        )}
      </div>
    </div>
  );
};
