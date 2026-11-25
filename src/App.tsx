import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import snapshotCatalog from './data/awesomeCatalogSnapshot.json';
import type {
  CatalogProject,
  CatalogResponse,
  CategorySlug,
  ProjectAnalysis,
  RebuiltProject,
  RepoInspectResult,
  SavedWorkspaceRecord,
  TargetStackId,
} from './types';
import { TopBar, type AppView } from './components/TopBar';
import { CategorySidebar } from './components/CategorySidebar';
import { CatalogExplorer } from './components/CatalogExplorer';
import { CustomRepoView } from './components/CustomRepoView';
import { SavedLibrary } from './components/SavedLibrary';
import { ProjectWorkbench, type WorkbenchTab } from './components/ProjectWorkbench';
import {
  deleteSavedWorkspace,
  loadSavedWorkspaces,
  upsertSavedWorkspace,
} from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('explorer');
  const [projects, setProjects] = useState<CatalogProject[]>(
    snapshotCatalog as CatalogProject[]
  );
  const [catalogSource, setCatalogSource] = useState<'live' | 'snapshot' | null>('snapshot');
  const [repoUrl, setRepoUrl] = useState('https://github.com/Arindam200/awesome-ai-apps');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug>('all');

  const [inspectingPath, setInspectingPath] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const [activeCategoryLabel, setActiveCategoryLabel] = useState<string | undefined>(undefined);
  const [inspected, setInspected] = useState<RepoInspectResult | null>(null);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('files');

  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [rebuild, setRebuild] = useState<RebuiltProject | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);

  const [savedRecords, setSavedRecords] = useState<SavedWorkspaceRecord[]>(() =>
    loadSavedWorkspaces()
  );

  const fetchCatalog = async (refresh = false) => {
    if (refresh) setRefreshingCatalog(true);
    try {
      const res = await fetch(`/api/catalog${refresh ? '?refresh=1' : ''}`);
      if (!res.ok) throw new Error('تعذر تحديث قائمة المشاريع.');
      const data = (await res.json()) as CatalogResponse;
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        setProjects(data.projects);
        setCatalogSource(data.source);
        setRepoUrl(data.repoUrl);
      }
    } catch {
      // Keep bundled snapshot smoothly
    } finally {
      setCatalogLoading(false);
      setRefreshingCatalog(false);
    }
  };

  useEffect(() => {
    void fetchCatalog(false);
  }, []);

  const persistWorkspace = (
    nextAnalysis: ProjectAnalysis | null,
    nextRebuild: RebuiltProject | null,
    inspectedData: RepoInspectResult,
    projName: string,
    catLabel?: string
  ) => {
    const recordId = `${inspectedData.owner}/${inspectedData.repo}/${inspectedData.subpath || 'root'}`;
    const updated = upsertSavedWorkspace({
      id: recordId,
      createdAt: new Date().toISOString(),
      projectName: projName,
      repoUrl: inspectedData.repoUrl,
      subpath: inspectedData.subpath,
      categoryAr: catLabel,
      analysis: nextAnalysis || undefined,
      rebuild: nextRebuild || undefined,
    });
    setSavedRecords(updated);
  };

  const inspectCatalogProject = async (project: CatalogProject) => {
    setGlobalError(null);
    setInspectingPath(project.path);
    try {
      const res = await fetch('/api/github/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'Arindam200',
          repo: 'awesome-ai-apps',
          subpath: project.path,
        }),
      });
      const data = (await res.json()) as RepoInspectResult & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'تعذر جلب ملفات المشروع.');
      }

      const existing = savedRecords.find(
        (r) => r.id === `${data.owner}/${data.repo}/${data.subpath || 'root'}`
      );
      setActiveProjectName(project.name);
      setActiveCategoryLabel(project.categoryAr);
      setInspected(data);
      setAnalysis(existing?.analysis || null);
      setRebuild(existing?.rebuild || null);
      setAnalysisError(null);
      setRebuildError(null);
      setWorkbenchTab('files');
      setActiveView('workbench');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب المشروع.');
    } finally {
      setInspectingPath(null);
    }
  };

  const inspectCustomUrl = async (url: string) => {
    setCustomError(null);
    setGlobalError(null);
    setCustomLoading(true);
    try {
      const res = await fetch('/api/github/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      });
      const data = (await res.json()) as RepoInspectResult & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'تعذر فحص المستودع.');
      }

      const derivedName = data.subpath
        ? data.subpath.split('/').slice(-1)[0]
        : `${data.owner}/${data.repo}`;
      const existing = savedRecords.find(
        (r) => r.id === `${data.owner}/${data.repo}/${data.subpath || 'root'}`
      );

      setActiveProjectName(derivedName);
      setActiveCategoryLabel('مستودع خارجي');
      setInspected(data);
      setAnalysis(existing?.analysis || null);
      setRebuild(existing?.rebuild || null);
      setAnalysisError(null);
      setRebuildError(null);
      setWorkbenchTab('files');
      setActiveView('workbench');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر فحص رابط GitHub.';
      setCustomError(msg);
      setGlobalError(msg);
    } finally {
      setCustomLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!inspected) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: activeProjectName,
          repoUrl: inspected.repoUrl,
          subpath: inspected.subpath,
          files: inspected.files,
        }),
      });
      const data = (await res.json()) as ProjectAnalysis & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشل التحليل المعماري.');
      }
      setAnalysis(data);
      persistWorkspace(data, rebuild, inspected, activeProjectName, activeCategoryLabel);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحليل.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRunRebuild = async (config: {
    targetStack: TargetStackId;
    enhancements: string[];
    customInstructions: string;
  }) => {
    if (!inspected) return;
    setRebuilding(true);
    setRebuildError(null);
    try {
      const res = await fetch('/api/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: activeProjectName,
          originalFiles: inspected.files,
          analysisSummary: analysis
            ? `${analysis.executiveSummary}\nالنمط: ${analysis.architecturePattern}\nالتوصيات: ${analysis.rebuildRecommendations.join('؛ ')}`
            : '',
          targetStack: config.targetStack,
          enhancements: config.enhancements,
          customInstructions: config.customInstructions,
        }),
      });
      const data = (await res.json()) as RebuiltProject & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشلت عملية إعادة البناء.');
      }
      setRebuild(data);
      persistWorkspace(analysis, data, inspected, activeProjectName, activeCategoryLabel);
    } catch (err) {
      setRebuildError(err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة البناء.');
    } finally {
      setRebuilding(false);
    }
  };

  const handleUpdateRebuild = (updated: RebuiltProject) => {
    setRebuild(updated);
    if (inspected) {
      persistWorkspace(analysis, updated, inspected, activeProjectName, activeCategoryLabel);
    }
  };

  const handleOpenSavedRecord = async (record: SavedWorkspaceRecord) => {
    setActiveProjectName(record.projectName);
    setActiveCategoryLabel(record.categoryAr);
    setAnalysis(record.analysis || null);
    setRebuild(record.rebuild || null);
    setAnalysisError(null);
    setRebuildError(null);
    setWorkbenchTab(record.rebuild ? 'rebuild' : record.analysis ? 'analysis' : 'files');
    setActiveView('workbench');

    // Hydrate source files from GitHub in the background
    try {
      const res = await fetch('/api/github/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: record.repoUrl }),
      });
      if (res.ok) {
        const data = (await res.json()) as RepoInspectResult;
        setInspected(data);
        return;
      }
    } catch {
      // Fall back to minimal placeholder if offline
    }

    const parts = record.id.split('/');
    setInspected({
      owner: parts[0] || 'Arindam200',
      repo: parts[1] || 'awesome-ai-apps',
      branch: 'main',
      subpath: record.subpath,
      repoUrl: record.repoUrl,
      treePaths: [],
      files: [],
      stats: { totalFiles: 0, fetchedFiles: 0, totalBytes: 0, languages: [] },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeView={activeView}
        onNavigate={(view) => {
          setGlobalError(null);
          setActiveView(view);
        }}
        onQuickAnalyzeExternal={() => {
          setGlobalError(null);
          setCustomError(null);
          setActiveView('custom');
        }}
        hasActiveProject={Boolean(inspected)}
      />

      {globalError && (
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              aria-label="إغلاق التنبيه"
              className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row">
        {activeView === 'explorer' && (
          <CategorySidebar
            projects={projects}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => setSelectedCategory(slug)}
            catalogSource={catalogSource}
            repoUrl={repoUrl}
            onRefreshCatalog={() => void fetchCatalog(true)}
            refreshing={refreshingCatalog}
            savedCount={savedRecords.length}
            onOpenSaved={() => setActiveView('saved')}
          />
        )}

        <main className="flex-1 min-w-0">
          {activeView === 'explorer' && (
            <CatalogExplorer
              projects={projects}
              loading={catalogLoading}
              selectedCategory={selectedCategory}
              onSelectProject={(project) => void inspectCatalogProject(project)}
              onInspectCustomUrl={(url) => void inspectCustomUrl(url)}
              inspectingPath={inspectingPath}
            />
          )}

          {activeView === 'custom' && (
            <CustomRepoView
              onInspectUrl={(url) => void inspectCustomUrl(url)}
              loading={customLoading}
              error={customError}
            />
          )}

          {activeView === 'workbench' && inspected && (
            <ProjectWorkbench
              projectName={activeProjectName}
              categoryLabel={activeCategoryLabel}
              inspected={inspected}
              activeTab={workbenchTab}
              onTabChange={setWorkbenchTab}
              analysis={analysis}
              analyzing={analyzing}
              analysisError={analysisError}
              onRunAnalysis={() => void handleRunAnalysis()}
              rebuild={rebuild}
              rebuilding={rebuilding}
              rebuildError={rebuildError}
              onRunRebuild={(cfg) => void handleRunRebuild(cfg)}
              onUpdateRebuild={handleUpdateRebuild}
              onBackToExplorer={() => setActiveView('explorer')}
            />
          )}

          {activeView === 'saved' && (
            <SavedLibrary
              records={savedRecords}
              onOpenRecord={(rec) => void handleOpenSavedRecord(rec)}
              onDeleteRecord={(id) => setSavedRecords(deleteSavedWorkspace(id))}
              onExploreCatalog={() => setActiveView('explorer')}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>مِعمار المشاريع — منصة تحليل وإعادة بناء مشاريع الذكاء الاصطناعي</span>
          <a
            href="https://github.com/Arindam200/awesome-ai-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-slate-900 transition-colors"
            dir="ltr"
          >
            Arindam200/awesome-ai-apps
          </a>
        </div>
      </footer>
    </div>
  );
}
