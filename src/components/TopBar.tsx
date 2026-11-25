import React from 'react';

export type AppView = 'explorer' | 'custom' | 'workbench' | 'saved';

interface TopBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onQuickAnalyzeExternal: () => void;
  hasActiveProject: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  onQuickAnalyzeExternal,
  hasActiveProject,
}) => {
  const navItems: Array<{ id: AppView; label: string; disabled?: boolean }> = [
    { id: 'explorer', label: 'مستكشف المستودع' },
    { id: 'custom', label: 'محلل GitHub' },
    { id: 'workbench', label: 'معمل البناء', disabled: !hasActiveProject },
    { id: 'saved', label: 'السجل المحفوظ' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onNavigate('explorer')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          مِعمار المشاريع
        </button>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onQuickAnalyzeExternal}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            تحليل مستودع جديد
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-600">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors disabled:opacity-40 ${
                isActive ? 'border-blue-600 text-slate-900 font-semibold' : 'border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
