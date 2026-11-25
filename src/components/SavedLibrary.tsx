import React from 'react';
import { Trash2, ArrowUpLeft, Download, FileJson } from 'lucide-react';
import type { SavedWorkspaceRecord } from '../types';
import { downloadRebuiltProjectZip } from '../utils/zipExport';

interface SavedLibraryProps {
  records: SavedWorkspaceRecord[];
  onOpenRecord: (record: SavedWorkspaceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExploreCatalog: () => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  records,
  onOpenRecord,
  onDeleteRecord,
  onExploreCatalog,
}) => {
  const handleExportJson = (record: SavedWorkspaceRecord) => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.projectName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()}-report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-700">الأرشيف المحلي</p>
          <h1 className="text-2xl font-bold text-slate-900">
            التحليلات والمشاريع المعاد بناؤها
          </h1>
          <p className="text-sm text-slate-600">
            تُحفظ نتائج التحليل المعماري ومخرجات إعادة البناء محلياً في متصفحك للرجوع إليها وتنزيلها في أي وقت.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {records.length} سجل محفوظ
        </span>
      </div>

      {records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <p className="text-base font-semibold text-slate-900">
            لا توجد تحليلات محفوظة حتى الآن
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            اختر أي مشروع من مستودع Awesome AI Apps وقم بتحليله أو إعادة بنائه ليتم حفظ نسخته هنا تلقائياً.
          </p>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            استعراض المشاريع
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
          {records.map((rec) => {
            const dateText = new Date(rec.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            return (
              <div
                key={rec.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{rec.categoryAr || 'مستودع GitHub'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{dateText}</span>
                    {rec.analysis && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>تحليل معماري مكتمل</span>
                      </>
                    )}
                    {rec.rebuild && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>إعادة بناء ({rec.rebuild.files.length} ملفات)</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 truncate">
                    {rec.projectName}
                  </h2>
                  {rec.analysis && (
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                      {rec.analysis.executiveSummary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRecord(rec)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-blue-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>فتح في المعمل</span>
                    <ArrowUpLeft className="w-3.5 h-3.5" />
                  </button>

                  {rec.rebuild && (
                    <button
                      type="button"
                      onClick={() => void downloadRebuiltProjectZip(rec.rebuild!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ZIP</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleExportJson(rec)}
                    title="تصدير التقرير بصيغة JSON"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  >
                    <FileJson className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    title="حذف من السجل"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
