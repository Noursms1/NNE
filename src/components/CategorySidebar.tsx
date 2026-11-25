import React from 'react';
import { FolderGit2, RefreshCw, ExternalLink, Archive } from 'lucide-react';
import type { CatalogProject, CategorySlug } from '../types';

interface CategorySidebarProps {
  projects: CatalogProject[];
  selectedCategory: CategorySlug;
  onSelectCategory: (slug: CategorySlug) => void;
  catalogSource: 'live' | 'snapshot' | null;
  repoUrl: string;
  onRefreshCatalog: () => void;
  refreshing: boolean;
  savedCount: number;
  onOpenSaved: () => void;
}

const CATEGORY_ORDER: Array<{ slug: CategorySlug; label: string }> = [
  { slug: 'all', label: 'جميع المشاريع' },
  { slug: 'starter', label: 'وكلاء البداية' },
  { slug: 'simple', label: 'وكلاء المهام البسيطة' },
  { slug: 'voice', label: 'وكلاء الصوت' },
  { slug: 'mcp', label: 'خوادم ووكلاء MCP' },
  { slug: 'memory', label: 'وكلاء الذاكرة' },
  { slug: 'rag', label: 'تطبيقات البحث (RAG)' },
  { slug: 'advanced', label: 'الوكلاء المتقدمون' },
  { slug: 'finetuning', label: 'الضبط الدقيق (Fine-Tuning)' },
];

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  projects,
  selectedCategory,
  onSelectCategory,
  catalogSource,
  repoUrl,
  onRefreshCatalog,
  refreshing,
  savedCount,
  onOpenSaved,
}) => {
  const counts: Record<string, number> = { all: projects.length };
  for (const p of projects) {
    counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-l border-slate-200 bg-white">
      <div className="p-5 space-y-6">
        <div className="space-y-2 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-blue-700 shrink-0" />
              المستودع المرجعي
            </span>
            <button
              type="button"
              onClick={onRefreshCatalog}
              disabled={refreshing}
              title="تحديث القائمة من GitHub"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs font-mono text-slate-600 truncate" dir="ltr">
            Arindam200/awesome-ai-apps
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{projects.length} مشروعاً</span>
            <span aria-hidden="true">·</span>
            <span>{catalogSource === 'live' ? 'مزامنة حية' : 'نسخة مرجعية'}</span>
          </div>
          <a
            href={repoUrl || 'https://github.com/Arindam200/awesome-ai-apps'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline pt-1"
          >
            <span>عرض المستودع على GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-slate-500 px-2.5 pb-1.5">
            تصنيفات المشاريع
          </h2>
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {CATEGORY_ORDER.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = counts[cat.slug] || 0;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onOpenSaved}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-500" />
              <span>التحليلات المحفوظة</span>
            </span>
            <span className="font-mono tabular-nums text-slate-900">{savedCount}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
