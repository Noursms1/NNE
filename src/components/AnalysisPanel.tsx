import React from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import type { ProjectAnalysis } from '../types';

interface AnalysisPanelProps {
  analysis: ProjectAnalysis | null;
  analyzing: boolean;
  error: string | null;
  onRunAnalysis: () => void;
  onProceedToRebuild: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  analyzing,
  error,
  onRunAnalysis,
  onProceedToRebuild,
}) => {
  if (analyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            جاري فحص الملفات واستخراج البنية المعمارية عبر Gemini...
          </p>
          <p className="text-xs text-slate-500">
            يتم تحليل الاعتماديات، تدفق البيانات بين الوكلاء، نقاط القوة، ومتطلبات إعادة البناء.
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">تعذر إتمام التحليل المعماري</h3>
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRunAnalysis}
          className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          جاهز لإجراء التحليل المعماري العميق
        </h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          سيقوم محرك التحليل بقراءة كافة الملفات المصدرية المجلوبة لاستخراج نمط المعمارية، تدفق البيانات، المكتبات المستخدمة، المخاطر الهندسية، وخطة إعادة البناء.
        </p>
        <button
          type="button"
          onClick={onRunAnalysis}
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
        >
          بدء التحليل المعماري
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              01. الملخص التنفيذي والنمط المعماري
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>النمط: {analysis.architecturePattern}</span>
              <span aria-hidden="true">·</span>
              <span>مستوى التعقيد: {analysis.complexityLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRunAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث التحليل</span>
            </button>
            <button
              type="button"
              onClick={onProceedToRebuild}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
            >
              <span>إعادة البناء وفق التحليل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500">وصف البنية العامة</h3>
            <p className="text-sm text-slate-800 leading-relaxed">{analysis.executiveSummary}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500">المشكلة التي يعالجها النظام</h3>
            <p className="text-sm text-slate-800 leading-relaxed">{analysis.problemSolved}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900">
          02. مسار تدفق البيانات والعمليات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {analysis.pipelineSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-slate-50/50"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-semibold text-blue-700 tabular-nums">
                  خطوة {String(step.stepNumber).padStart(2, '0')}
                </span>
                <span className="font-mono text-slate-500 truncate" dir="ltr">
                  {step.component}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              <div className="pt-2 border-t border-slate-200/70 space-y-1 text-[11px] text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">المدخل: </span>
                  <span>{step.input}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">المخرج: </span>
                  <span>{step.output}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">03. المكدس التقني والاعتماديات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">التقنية / المكتبة</th>
                  <th className="py-2.5 px-4">الفئة</th>
                  <th className="py-2.5 px-4">الدور الوظيفي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {analysis.techStack.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap" dir="ltr">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{item.category}</td>
                    <td className="py-2.5 px-4 text-slate-700">{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">04. خريطة الملفات والوحدات الحرجة</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {analysis.keyComponents.map((comp, idx) => (
              <div key={idx} className="p-4 space-y-1.5">
                <div className="font-mono text-xs font-semibold text-slate-900" dir="ltr">
                  {comp.filePath}
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{comp.responsibility}</p>
                {comp.criticalFunctions.length > 0 && (
                  <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                    {comp.criticalFunctions.join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">05. نقاط القوة الهندسية</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
            {analysis.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">06. القيود والمخاطر التقنية</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
            {analysis.limitationsAndRisks.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">07. توصيات إعادة البناء</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
            {analysis.rebuildRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.envVariables.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">08. متغيرات البيئة المطلوبة للتشغيل</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">المتغير</th>
                  <th className="py-2.5 px-4">الحالة</th>
                  <th className="py-2.5 px-4">الغرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {analysis.envVariables.map((env, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900" dir="ltr">
                      {env.key}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {env.required ? 'مطلوب' : 'اختياري'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{env.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
