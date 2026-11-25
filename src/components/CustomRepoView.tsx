import React, { useState } from 'react';
import { GitBranch, ArrowUpLeft, AlertCircle } from 'lucide-react';

interface CustomRepoViewProps {
  onInspectUrl: (url: string) => void;
  loading: boolean;
  error: string | null;
}

const PRESET_EXAMPLES = [
  {
    title: 'Multi-Agent Orchestrator (Awesome AI Apps)',
    url: 'https://github.com/Arindam200/awesome-ai-apps/tree/main/advance_ai_agents/multi_agent_orchestrator',
    summary: 'نظام وكلاء متعددين مبني بـ LangGraph مع مخطط ومنفذين وتكلفة حية.',
  },
  {
    title: 'Coding Harness Starter (Awesome AI Apps)',
    url: 'https://github.com/Arindam200/awesome-ai-apps/tree/main/starter_ai_agents/coding_harness_starter',
    summary: 'حلقة برمجة وكيلة تشمل التخطيط والتعديل المعتمد والاختبار.',
  },
  {
    title: 'MCP Server + Agent Starter (Awesome AI Apps)',
    url: 'https://github.com/Arindam200/awesome-ai-apps/tree/main/starter_ai_agents/langgraph_starter',
    summary: 'قالب بداية لوكيل ReAct عبر LangGraph مع أدوات مخصصة.',
  },
  {
    title: 'RAG Application (Awesome AI Apps)',
    url: 'https://github.com/Arindam200/awesome-ai-apps/tree/main/rag_apps/agentic_rag',
    summary: 'تطبيق استرجاع معزز بالذكاء (Agentic RAG) لفحص الوثائق والاستشهاد.',
  },
];

export const CustomRepoView: React.FC<CustomRepoViewProps> = ({
  onInspectUrl,
  loading,
  error,
}) => {
  const [url, setUrl] = useState('https://github.com/Arindam200/awesome-ai-apps');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInspectUrl(url.trim());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-blue-700">محلل المستودعات المباشر</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          فحص وتحليل أي مستودع أو مجلد على GitHub
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          أدخل رابط أي مستودع عام على GitHub أو رابط مجلد فرعي داخله (مثل{' '}
          <span className="font-mono text-xs text-slate-800" dir="ltr">
            /tree/main/folder
          </span>
          ) ليقوم الخادم بجلب شجرة الملفات والكود المصدري وتمريرها إلى معمل التحليل وإعادة البناء.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <label htmlFor="github-url-input" className="block text-sm font-semibold text-slate-900">
          رابط المستودع أو المجلد الفرعي
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <GitBranch className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="github-url-input"
              type="url"
              dir="ltr"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full pr-10 pl-4 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'جاري جلب الملفات...' : 'جلب وفحص المستودع'}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">
          01. مسارات مقترحة للفحص الفوري
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_EXAMPLES.map((item) => (
            <button
              key={item.url}
              type="button"
              disabled={loading}
              onClick={() => {
                setUrl(item.url);
                onInspectUrl(item.url);
              }}
              className="text-right bg-white border border-slate-200 hover:border-blue-600 rounded-xl p-4 space-y-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                <ArrowUpLeft className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
              <p className="text-xs font-mono text-slate-400 truncate" dir="ltr">
                {item.url}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
