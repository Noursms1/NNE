import React, { useState } from 'react';
import { Download, Copy, Check, FileCode2, AlertCircle, Wand2 } from 'lucide-react';
import type { RebuiltProject, TargetStackId } from '../types';
import { downloadRebuiltProjectZip } from '../utils/zipExport';

interface RebuildStudioPanelProps {
  projectName: string;
  rebuild: RebuiltProject | null;
  rebuilding: boolean;
  error: string | null;
  onRunRebuild: (config: {
    targetStack: TargetStackId;
    enhancements: string[];
    customInstructions: string;
  }) => void;
  onUpdateRebuild: (updated: RebuiltProject) => void;
}

const TARGET_STACKS: Array<{ id: TargetStackId; title: string; subtitle: string }> = [
  {
    id: 'typescript-genai',
    title: 'TypeScript + @google/genai',
    subtitle: 'خدمة Node.js حديثة بأنواع صارمة وموديل Gemini 4',
  },
  {
    id: 'react-express',
    title: 'React + Express Full-Stack',
    subtitle: 'واجهة ويب تفاعلية كاملة متصلة بخادم API آمن',
  },
  {
    id: 'nextjs-fullstack',
    title: 'Next.js App Router',
    subtitle: 'تطبيق إنتاجي متكامل مع Route Handlers و Tailwind',
  },
  {
    id: 'fastapi-clean',
    title: 'Python FastAPI Clean Arch',
    subtitle: 'إعادة هيكلة بايثون قياسية مع Pydantic v2 و Docker',
  },
];

const ENHANCEMENT_OPTIONS = [
  'ترقية استدعاءات الذكاء الاصطناعي إلى Gemini 4 عبر @google/genai',
  'إضافة واجهة مستخدم تفاعلية لإدارة المدخلات والنتائج',
  'معالجة أخطاء الشبكة والتحقق الصارم من المدخلات',
  'تجهيز ملف Dockerfile و .env.example للنشر السريع',
];

export const RebuildStudioPanel: React.FC<RebuildStudioPanelProps> = ({
  projectName,
  rebuild,
  rebuilding,
  error,
  onRunRebuild,
  onUpdateRebuild,
}) => {
  const [targetStack, setTargetStack] = useState<TargetStackId>('react-express');
  const [enhancements, setEnhancements] = useState<string[]>([
    ENHANCEMENT_OPTIONS[0],
    ENHANCEMENT_OPTIONS[2],
  ]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineNote, setRefineNote] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  const toggleEnhancement = (item: string) => {
    setEnhancements((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const activeFile =
    rebuild?.files.find((f) => f.path === selectedFilePath) || rebuild?.files[0] || null;

  const handleCopyFile = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedPath(activeFile.path);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Ignore
    }
  };

  const handleRefineFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rebuild || !activeFile || !refineInstruction.trim()) return;
    setRefining(true);
    setRefineError(null);
    setRefineNote(null);

    try {
      const res = await fetch('/api/refine-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: rebuild.rebuiltProjectName,
          filePath: activeFile.path,
          currentContent: activeFile.content,
          instruction: refineInstruction.trim(),
        }),
      });
      const data = (await res.json()) as {
        updatedContent?: string;
        changeSummary?: string;
        error?: string;
      };
      if (!res.ok || !data.updatedContent) {
        throw new Error(data.error || 'تعذر تعديل الملف.');
      }

      const nextFiles = rebuild.files.map((f) =>
        f.path === activeFile.path ? { ...f, content: data.updatedContent! } : f
      );
      onUpdateRebuild({ ...rebuild, files: nextFiles });
      setRefineNote(data.changeSummary || 'تم تحديث الملف بنجاح.');
      setRefineInstruction('');
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : 'تعذر تعديل الملف.');
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            01. إعدادات إعادة البناء والتحويل المعماري
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            اختر المكدس التقني المستهدف لإعادة بناء{' '}
            <span className="font-semibold text-slate-900">{projectName}</span> وتوليد حزمة ملفات متكاملة جاهزة للتنزيل.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {TARGET_STACKS.map((stack) => {
            const active = targetStack === stack.id;
            return (
              <button
                key={stack.id}
                type="button"
                onClick={() => setTargetStack(stack.id)}
                className={`text-right p-4 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                  active
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900" dir="ltr">
                  {stack.title}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{stack.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-700">
              التحسينات المعمارية المضمنة
            </span>
            <div className="space-y-2">
              {ENHANCEMENT_OPTIONS.map((opt) => {
                const checked = enhancements.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEnhancement(opt)}
                      className="mt-1 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="custom-rebuild-notes" className="block text-xs font-semibold text-slate-700">
              متطلبات أو تعديلات إضافية (اختياري)
            </label>
            <textarea
              id="custom-rebuild-notes"
              rows={4}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="مثال: أضف واجهة باللغة العربية، واستخدم SQLite لحفظ السجلات، مع فصل طبقة الوكلاء في مجلد مستقل."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            يتم توليد الكود الكامل للملفات مع ملف README وخطوات التشغيل.
          </span>
          <button
            type="button"
            disabled={rebuilding}
            onClick={() =>
              onRunRebuild({
                targetStack,
                enhancements,
                customInstructions,
              })
            }
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {rebuilding ? 'جاري توليد المشروع المعاد بناؤه...' : rebuild ? 'إعادة توليد المشروع' : 'بدء إعادة البناء'}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {rebuilding && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <p className="text-sm font-semibold text-slate-900">
            يقوم Gemini ببناء هيكل المشروع الجديد وكتابة الملفات المصدرية...
          </p>
          <div className="space-y-2.5">
            <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-4/5 animate-pulse" />
          </div>
        </div>
      )}

      {rebuild && !rebuilding && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>المشروع الناتج</span>
                  <span aria-hidden="true">·</span>
                  <span>{rebuild.targetStackLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{rebuild.files.length} ملفات</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900" dir="ltr">
                  {rebuild.rebuiltProjectName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => void downloadRebuiltProjectZip(rebuild)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل الحزمة الكاملة (.zip)</span>
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{rebuild.architectureOverview}</p>

            {rebuild.migrationDecisions.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-right border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-4">في المشروع الأصلي</th>
                      <th className="py-2.5 px-4">في البناء الجديد</th>
                      <th className="py-2.5 px-4">المبرر الهندسي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rebuild.migrationDecisions.map((m, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 text-slate-600">{m.from}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{m.to}</td>
                        <td className="py-2.5 px-4 text-slate-700">{m.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {rebuild.setupCommands.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-600">أوامر التثبيت والتشغيل</h3>
                <div className="bg-slate-950 text-slate-100 rounded-lg p-3.5 font-mono text-xs space-y-1" dir="ltr">
                  {rebuild.setupCommands.map((cmd, idx) => (
                    <div key={idx}>$ {cmd}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-l border-slate-200 bg-slate-50/70">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">ملفات المشروع المعاد بناؤه</span>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {rebuild.files.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {rebuild.files.map((file) => {
                  const selected = activeFile?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => {
                        setSelectedFilePath(file.path);
                        setRefineNote(null);
                        setRefineError(null);
                      }}
                      className={`w-full text-right px-4 py-3 space-y-1 transition-colors cursor-pointer ${
                        selected ? 'bg-white text-blue-700' : 'text-slate-700 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="font-mono text-xs font-semibold truncate" dir="ltr">
                          {file.path}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{file.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-w-0">
              {activeFile && (
                <>
                  <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-slate-900 truncate" dir="ltr">
                        {activeFile.path}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{activeFile.summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopyFile()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      {copiedPath === activeFile.path ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedPath === activeFile.path ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-100 p-4 sm:p-5 overflow-auto max-h-[480px] flex-1">
                    <pre className="font-mono text-xs leading-relaxed whitespace-pre" dir="ltr">
                      <code>{activeFile.content}</code>
                    </pre>
                  </div>

                  <form
                    onSubmit={handleRefineFile}
                    className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder={`اطلب تعديلاً فورياً على ${activeFile.path} (مثال: أضف التحقق من المدخلات أو دعم البث المباشر)...`}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        disabled={refining || !refineInstruction.trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{refining ? 'جاري التعديل...' : 'تعديل الملف بالذكاء'}</span>
                      </button>
                    </div>
                    {refineNote && (
                      <p className="text-xs text-emerald-700 font-medium">{refineNote}</p>
                    )}
                    {refineError && (
                      <p className="text-xs text-red-700 font-medium">{refineError}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
