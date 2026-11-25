import React, { useMemo, useState } from 'react';
import { Search, ArrowUpLeft, LayoutGrid, List, Link2 } from 'lucide-react';
import type { CatalogProject, CategorySlug } from '../types';

interface CatalogExplorerProps {
  projects: CatalogProject[];
  loading: boolean;
  selectedCategory: CategorySlug;
  onSelectProject: (project: CatalogProject) => void;
  onInspectCustomUrl: (url: string) => void;
  inspectingPath: string | null;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  projects,
  loading,
  selectedCategory,
  onSelectProject,
  onInspectCustomUrl,
  inspectingPath,
}) => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [quickUrl, setQuickUrl] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        p.categoryAr.toLowerCase().includes(q) ||
        p.categoryEn.toLowerCase().includes(q)
      );
    });
  }, [projects, selectedCategory, query]);

  const handleQuickUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    onInspectCustomUrl(quickUrl.trim());
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-blue-700">
            منصة الفحص المعماري وإعادة البناء
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            تحليل وإعادة بناء مشاريع Awesome AI Apps
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            استعرض {projects.length} مشروعاً فعلياً من مستودع{' '}
            <span className="font-mono text-xs text-slate-800" dir="ltr">
              Arindam200/awesome-ai-apps
            </span>
            ، افحص ملفاتها المصدرية مباشرة، واستخدم التحليل المعماري لإعادة بنائها بمكدس تقني حديث.
          </p>
        </div>

        <form onSubmit={handleQuickUrlSubmit} className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <Link2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              dir="ltr"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              aria-label="رابط مستودع GitHub"
              className="w-full pr-9 pl-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={!quickUrl.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            فحص الرابط
          </button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الإطار البرمجي (LangGraph, RAG, MCP)، أو المسار..."
            className="w-full pr-9 pl-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <span className="text-xs text-slate-500 tabular-nums">
            عرض {filtered.length} من أصل {projects.length} مشروع
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="عرض جدولي"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="عرض شبكي"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>شبكة</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-100 rounded w-56 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-96 animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-slate-200 rounded-xl bg-white p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            لا توجد مشاريع مطابقة لبحثك
          </p>
          <p className="text-sm text-slate-500">
            جرّب كلمات مفتاحية أخرى مثل CrewAI أو MCP أو LangGraph أو أعد ضبط الفلتر.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            مسح نص البحث
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">المشروع والوصف</th>
                  <th className="py-3 px-4 whitespace-nowrap">الفئة</th>
                  <th className="py-3 px-4 whitespace-nowrap">المسار في المستودع</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((project, index) => {
                  const isBusy = inspectingPath === project.path;
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 max-w-xl">
                        <div className="font-semibold text-slate-900">{project.name}</div>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                          {project.description}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {project.categoryAr}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap" dir="ltr">
                        {project.path}
                      </td>
                      <td className="py-3 px-4 text-left whitespace-nowrap">
                        <button
                          type="button"
                          disabled={Boolean(inspectingPath)}
                          onClick={() => onSelectProject(project)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <span>{isBusy ? 'جاري الجلب...' : 'فحص وتحليل'}</span>
                          <ArrowUpLeft className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const isBusy = inspectingPath === project.path;
            return (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{project.categoryAr}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono truncate" dir="ltr">
                      {project.path.split('/')[0]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {project.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-slate-400 truncate" dir="ltr">
                    {project.path.split('/').slice(-1)[0]}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(inspectingPath)}
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isBusy ? 'جاري الجلب...' : 'فتح في المعمل'}</span>
                    <ArrowUpLeft className="w-3.5 h-3.5" />
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
