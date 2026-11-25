export type CategorySlug =
  | 'all'
  | 'starter'
  | 'simple'
  | 'voice'
  | 'mcp'
  | 'memory'
  | 'rag'
  | 'advanced'
  | 'finetuning';

export interface CatalogProject {
  id: string;
  name: string;
  path: string;
  description: string;
  categoryEn: string;
  categoryAr: string;
  categorySlug: Exclude<CategorySlug, 'all'>;
}

export interface CatalogResponse {
  source: 'live' | 'snapshot';
  repoUrl: string;
  updatedAt: string;
  projects: CatalogProject[];
}

export interface FetchedFile {
  path: string;
  name: string;
  size: number;
  language: string;
  content: string;
  truncated?: boolean;
}

export interface RepoInspectResult {
  owner: string;
  repo: string;
  branch: string;
  subpath: string;
  repoUrl: string;
  treePaths: string[];
  files: FetchedFile[];
  stats: {
    totalFiles: number;
    fetchedFiles: number;
    totalBytes: number;
    languages: string[];
  };
}

export interface TechStackItem {
  name: string;
  role: string;
  category: string;
}

export interface PipelineStep {
  stepNumber: number;
  title: string;
  component: string;
  input: string;
  output: string;
  description: string;
}

export interface KeyComponent {
  filePath: string;
  responsibility: string;
  criticalFunctions: string[];
}

export interface EnvVariableItem {
  key: string;
  purpose: string;
  required: boolean;
}

export interface ProjectAnalysis {
  executiveSummary: string;
  problemSolved: string;
  architecturePattern: string;
  complexityLevel: string;
  techStack: TechStackItem[];
  pipelineSteps: PipelineStep[];
  keyComponents: KeyComponent[];
  strengths: string[];
  limitationsAndRisks: string[];
  envVariables: EnvVariableItem[];
  rebuildRecommendations: string[];
}

export type TargetStackId =
  | 'typescript-genai'
  | 'nextjs-fullstack'
  | 'fastapi-clean'
  | 'react-express';

export interface RebuiltFile {
  path: string;
  language: string;
  summary: string;
  content: string;
}

export interface MigrationDecision {
  from: string;
  to: string;
  rationale: string;
}

export interface RebuiltProject {
  rebuiltProjectName: string;
  targetStackLabel: string;
  architectureOverview: string;
  migrationDecisions: MigrationDecision[];
  setupCommands: string[];
  envTemplate: string;
  files: RebuiltFile[];
}

export interface SavedWorkspaceRecord {
  id: string;
  createdAt: string;
  projectName: string;
  repoUrl: string;
  subpath: string;
  categoryAr?: string;
  analysis?: ProjectAnalysis;
  rebuild?: RebuiltProject;
}
