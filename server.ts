import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const AWESOME_OWNER = 'Arindam200';
const AWESOME_REPO = 'awesome-ai-apps';
const AWESOME_URL = `https://github.com/${AWESOME_OWNER}/${AWESOME_REPO}`;

const CATEGORY_MAP: Record<string, { ar: string; slug: string }> = {
  'Starter Agents': { ar: 'وكلاء البداية', slug: 'starter' },
  'Simple Agents': { ar: 'وكلاء المهام البسيطة', slug: 'simple' },
  'Voice Agents': { ar: 'وكلاء الصوت', slug: 'voice' },
  'MCP Agents': { ar: 'خوادم ووكلاء MCP', slug: 'mcp' },
  'Memory Agents': { ar: 'وكلاء الذاكرة', slug: 'memory' },
  'RAG Applications': { ar: 'تطبيقات البحث المعزز (RAG)', slug: 'rag' },
  'Advanced Agents': { ar: 'الوكلاء المتقدمون', slug: 'advanced' },
  'Fine-Tuning': { ar: 'الضبط الدقيق (Fine-Tuning)', slug: 'finetuning' },
};

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const catalogCache: { entry?: CacheEntry<{ source: 'live' | 'snapshot'; projects: unknown[] }> } = {};
const treeCache = new Map<string, CacheEntry<{ branch: string; paths: string[] }>>();
const fileContentCache = new Map<string, CacheEntry<string>>();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY غير مهيأ في بيئة الخادم. يرجى التحقق من Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseAwesomeReadme(markdown: string) {
  const lines = markdown.split('\n');
  let currentCat: { en: string; ar: string; slug: string } | null = null;
  const projects: Array<{
    id: string;
    name: string;
    path: string;
    description: string;
    categoryEn: string;
    categoryAr: string;
    categorySlug: string;
  }> = [];

  for (const line of lines) {
    const h3 = line.match(/^###\s+[^\w]*\s*(.+)$/);
    if (h3) {
      const title = h3[1].trim();
      if (CATEGORY_MAP[title]) {
        currentCat = { en: title, ...CATEGORY_MAP[title] };
      } else {
        currentCat = null;
      }
      continue;
    }
    if (currentCat) {
      const item = line.match(/^- \[([^\]]+)\]\(([^)]+)\):\s*(.+)$/);
      if (item) {
        const cleanPath = item[2].replace(/\/$/, '').trim();
        projects.push({
          id: cleanPath,
          name: item[1].trim(),
          path: cleanPath,
          description: item[3].trim(),
          categoryEn: currentCat.en,
          categoryAr: currentCat.ar,
          categorySlug: currentCat.slug,
        });
      }
    }
  }
  return projects;
}

function loadSnapshotCatalog() {
  const snapshotPath = path.join(__dirname, 'src', 'data', 'awesomeCatalogSnapshot.json');
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  return JSON.parse(raw) as unknown[];
}

function parseGithubInput(input: {
  repoUrl?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  subpath?: string;
}) {
  if (input.repoUrl && input.repoUrl.trim()) {
    const rawUrl = input.repoUrl.trim().replace(/\.git$/, '');
    const match = rawUrl.match(
      /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:\/(?:tree|blob)\/([^/\s]+)(?:\/(.*))?)?/i
    );
    if (!match) {
      throw new Error('رابط GitHub غير صالح. مثال: https://github.com/Arindam200/awesome-ai-apps');
    }
    return {
      owner: match[1],
      repo: match[2],
      branch: match[3] || input.branch || '',
      subpath: (match[4] || input.subpath || '').replace(/^\/+|\/+$/g, ''),
    };
  }

  return {
    owner: input.owner || AWESOME_OWNER,
    repo: input.repo || AWESOME_REPO,
    branch: input.branch || '',
    subpath: (input.subpath || '').replace(/^\/+|\/+$/g, ''),
  };
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();
  if (base === 'dockerfile') return 'dockerfile';
  const map: Record<string, string> = {
    '.py': 'python',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.toml': 'toml',
    '.txt': 'text',
    '.env': 'dotenv',
    '.example': 'dotenv',
    '.sh': 'bash',
    '.sql': 'sql',
    '.html': 'html',
    '.css': 'css',
  };
  return map[ext] || 'text';
}

function scoreFilePriority(filePath: string): number {
  const lower = filePath.toLowerCase();
  const base = path.basename(lower);
  if (base === 'readme.md') return 100;
  if (base === 'package.json' || base === 'pyproject.toml' || base === 'requirements.txt') return 95;
  if (base === '.env.example' || base === 'dockerfile' || base === 'docker-compose.yml') return 90;
  if (['main.py', 'app.py', 'server.py', 'agent.py', 'index.ts', 'server.ts', 'app.ts', 'main.ts'].includes(base)) {
    return 85;
  }
  if (/\.(py|ts|tsx|js|jsx|yaml|yml|json|toml)$/.test(lower)) return 70;
  if (/\.ipynb$/.test(lower)) return 55;
  return 30;
}

const SKIP_BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.pdf', '.zip',
  '.tar', '.gz', '.woff', '.woff2', '.ttf', '.mp3', '.wav', '.mp4', '.lock',
]);

async function fetchRepoTree(owner: string, repo: string, requestedBranch?: string) {
  const cacheKey = `${owner}/${repo}@${requestedBranch || 'default'}`;
  const cached = treeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  let branch = requestedBranch;
  if (!branch) {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'awesome-ai-analyzer',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error(`المستودع ${owner}/${repo} غير موجود أو خاص.`);
      }
      if (repoRes.status === 403) {
        throw new Error('تم تجاوز حد طلبات GitHub API مؤقتاً. حاول مجدداً بعد قليل.');
      }
      throw new Error(`تعذر الوصول إلى بيانات المستودع من GitHub (${repoRes.status}).`);
    }
    const repoData = (await repoRes.json()) as { default_branch?: string };
    branch = repoData.default_branch || 'main';
  }

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    {
      headers: {
        'User-Agent': 'awesome-ai-analyzer',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(12000),
    }
  );
  if (!treeRes.ok) {
    throw new Error(`تعذر قراءة شجرة ملفات المستودع (${treeRes.status}).`);
  }
  const treeData = (await treeRes.json()) as {
    tree?: Array<{ path: string; type: string; size?: number }>;
  };
  const paths = (treeData.tree || [])
    .filter((item) => item.type === 'blob')
    .map((item) => item.path);

  const result = { branch, paths };
  treeCache.set(cacheKey, { value: result, expiresAt: Date.now() + 15 * 60 * 1000 });
  return result;
}

async function fetchRawFile(owner: string, repo: string, branch: string, filePath: string): Promise<string> {
  const key = `${owner}/${repo}@${branch}:${filePath}`;
  const cached = fileContentCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${filePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')}`;
  const res = await fetch(rawUrl, {
    headers: { 'User-Agent': 'awesome-ai-analyzer' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    return '';
  }
  const text = await res.text();
  fileContentCache.set(key, { value: text, expiresAt: Date.now() + 15 * 60 * 1000 });
  return text;
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('GEMINI_API_KEY')) {
    return { status: 400, message: msg };
  }
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'مفتاح Gemini API غير صالح أو يفتقر للصلاحيات. تحقق من Settings > Secrets.',
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'تم استهلاك حصة Gemini API المؤقتة. يرجى الانتظار لحظات والمحاولة مجدداً.',
    };
  }
  return { status: 500, message: `حدث خطأ أثناء المعالجة الذكية: ${msg}` };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/catalog', async (req, res) => {
    const forceRefresh = req.query.refresh === '1';
    if (!forceRefresh && catalogCache.entry && catalogCache.entry.expiresAt > Date.now()) {
      return res.json({
        source: catalogCache.entry.value.source,
        repoUrl: AWESOME_URL,
        updatedAt: new Date().toISOString(),
        projects: catalogCache.entry.value.projects,
      });
    }

    try {
      const readmeRes = await fetch(
        `https://raw.githubusercontent.com/${AWESOME_OWNER}/${AWESOME_REPO}/main/README.md`,
        {
          headers: { 'User-Agent': 'awesome-ai-analyzer' },
          signal: AbortSignal.timeout(7000),
        }
      );
      if (readmeRes.ok) {
        const md = await readmeRes.text();
        const parsed = parseAwesomeReadme(md);
        if (parsed.length > 0) {
          catalogCache.entry = {
            value: { source: 'live', projects: parsed },
            expiresAt: Date.now() + 15 * 60 * 1000,
          };
          return res.json({
            source: 'live',
            repoUrl: AWESOME_URL,
            updatedAt: new Date().toISOString(),
            projects: parsed,
          });
        }
      }
    } catch {
      // Fallback to local snapshot below
    }

    const snapshot = loadSnapshotCatalog();
    catalogCache.entry = {
      value: { source: 'snapshot', projects: snapshot },
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    return res.json({
      source: 'snapshot',
      repoUrl: AWESOME_URL,
      updatedAt: new Date().toISOString(),
      projects: snapshot,
    });
  });

  app.post('/api/github/inspect', async (req, res) => {
    try {
      const parsed = parseGithubInput(req.body || {});
      const { branch, paths } = await fetchRepoTree(parsed.owner, parsed.repo, parsed.branch);

      const prefix = parsed.subpath ? `${parsed.subpath}/` : '';
      const scopedPaths = prefix
        ? paths.filter((p) => p.startsWith(prefix) || p === parsed.subpath)
        : paths;

      if (scopedPaths.length === 0) {
        return res.status(404).json({
          error: `لم يتم العثور على ملفات في المسار "${parsed.subpath || '/'}" داخل المستودع.`,
        });
      }

      const readablePaths = scopedPaths
        .filter((p) => {
          const ext = path.extname(p).toLowerCase();
          return !SKIP_BINARY_EXT.has(ext) && !p.includes('node_modules/') && !p.includes('.git/');
        })
        .sort((a, b) => scoreFilePriority(b) - scoreFilePriority(a))
        .slice(0, 18);

      const fetched = await Promise.all(
        readablePaths.map(async (fullPath) => {
          const raw = await fetchRawFile(parsed.owner, parsed.repo, branch, fullPath);
          const relPath = prefix ? fullPath.slice(prefix.length) : fullPath;
          const MAX_CHARS = 14000;
          const truncated = raw.length > MAX_CHARS;
          const content = truncated ? `${raw.slice(0, MAX_CHARS)}\n\n# ... [تم اختصار بقية الملف لطوله]` : raw;
          return {
            path: relPath || path.basename(fullPath),
            name: path.basename(fullPath),
            size: raw.length,
            language: detectLanguage(fullPath),
            content,
            truncated,
          };
        })
      );

      const validFiles = fetched.filter((f) => f.content.length > 0);
      const languages = Array.from(new Set(validFiles.map((f) => f.language))).filter(
        (l) => l !== 'text' && l !== 'markdown' && l !== 'dotenv'
      );
      const totalBytes = validFiles.reduce((sum, f) => sum + f.size, 0);

      res.json({
        owner: parsed.owner,
        repo: parsed.repo,
        branch,
        subpath: parsed.subpath,
        repoUrl: `https://github.com/${parsed.owner}/${parsed.repo}${
          parsed.subpath ? `/tree/${branch}/${parsed.subpath}` : ''
        }`,
        treePaths: scopedPaths.map((p) => (prefix ? p.slice(prefix.length) : p)),
        files: validFiles,
        stats: {
          totalFiles: scopedPaths.length,
          fetchedFiles: validFiles.length,
          totalBytes,
          languages,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'تعذر فحص المستودع.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const { projectName, repoUrl, subpath, files } = req.body as {
        projectName?: string;
        repoUrl?: string;
        subpath?: string;
        files?: Array<{ path: string; language: string; content: string }>;
      };

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'لا توجد ملفات مصدرية صالحة للتحليل.' });
      }

      const ai = getGeminiClient();
      const filesContext = files
        .slice(0, 14)
        .map((f) => `--- FILE: ${f.path} (${f.language}) ---\n${f.content.slice(0, 9000)}`)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `قم بتحليل المشروع التالي تحليلاً هندسياً ومعمارياً دقيقاً باللغة العربية مع الإبقاء على أسماء المكتبات والملفات والأدوات البرمجية باللغة الإنجليزية كما وردت في الكود الفعلي.
اسم المشروع: ${projectName || subpath || 'Unknown Project'}
الرابط: ${repoUrl || ''}

الملفات المصدرية للمشروع:
${filesContext}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          systemInstruction:
            'أنت مهندس معماري برمجي خبير في أنظمة الذكاء الاصطناعي والوكلاء (AI Agents, RAG, MCP, LLM Ops). حلل الكود المرفق فقط دون اختلاق ملفات أو مكتبات غير موجودة. اكتب الشروحات بلغة عربية تقنية واضحة وموجزة وعملية.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              problemSolved: { type: Type.STRING },
              architecturePattern: { type: Type.STRING },
              complexityLevel: { type: Type.STRING },
              techStack: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ['name', 'role', 'category'],
                },
              },
              pipelineSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    component: { type: Type.STRING },
                    input: { type: Type.STRING },
                    output: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['stepNumber', 'title', 'component', 'input', 'output', 'description'],
                },
              },
              keyComponents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    filePath: { type: Type.STRING },
                    responsibility: { type: Type.STRING },
                    criticalFunctions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['filePath', 'responsibility', 'criticalFunctions'],
                },
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              limitationsAndRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              envVariables: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    required: { type: Type.BOOLEAN },
                  },
                  required: ['key', 'purpose', 'required'],
                },
              },
              rebuildRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'executiveSummary',
              'problemSolved',
              'architecturePattern',
              'complexityLevel',
              'techStack',
              'pipelineSteps',
              'keyComponents',
              'strengths',
              'limitationsAndRisks',
              'envVariables',
              'rebuildRecommendations',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/rebuild', async (req, res) => {
    try {
      const {
        projectName,
        originalFiles,
        analysisSummary,
        targetStack,
        enhancements,
        customInstructions,
      } = req.body as {
        projectName?: string;
        originalFiles?: Array<{ path: string; language: string; content: string }>;
        analysisSummary?: string;
        targetStack?: string;
        enhancements?: string[];
        customInstructions?: string;
      };

      if (!originalFiles || originalFiles.length === 0) {
        return res.status(400).json({ error: 'لا توجد ملفات مصدرية لإعادة البناء.' });
      }

      const stackInstructions: Record<string, string> = {
        'typescript-genai':
          'TypeScript + Node.js (ESM) باستخدام حزمة @google/genai الرسمية وموديل gemini-4-hydrogen مع معالجة أخطاء احترافية وتصدير أنواع TypeScript كاملة.',
        'nextjs-fullstack':
          'Next.js App Router (TypeScript + Tailwind CSS) مع Route Handlers في /api/* لاستدعاء @google/genai من الخادم وواجهة مستخدم متكاملة.',
        'fastapi-clean':
          'Python 3.12 + FastAPI + Pydantic v2 بهيكلة نظيفة (routers, services, schemas, core/config.py) وملف pyproject.toml و Dockerfile.',
        'react-express':
          'منصة React + Express TypeScript متكاملة مع server.ts للخادم والذكاء الاصطناعي وواجهة src/App.tsx تفاعلية جاهزة للتشغيل.',
      };

      const ai = getGeminiClient();
      const filesContext = originalFiles
        .slice(0, 10)
        .map((f) => `--- ORIGINAL: ${f.path} ---\n${f.content.slice(0, 6500)}`)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `أعد بناء وتحديث المشروع التالي بالكامل إلى مشروع جديد نظيف وقابل للتشغيل الإنتاجي.

اسم المشروع الأصلي: ${projectName || 'AI Project'}
ملخص التحليل المعماري: ${analysisSummary || 'غير متوفر'}
المكدس المستهدف (Target Stack): ${stackInstructions[targetStack || 'typescript-genai'] || targetStack}
التحسينات المطلوبة: ${(enhancements || []).join('، ') || 'هيكلة نظيفة ومعالجة أخطاء'}
تعليمات إضافية من المستخدم: ${customInstructions || 'لا توجد'}

الكود الأصلي المرجعي:
${filesContext}

المطلوب:
توليد 5 إلى 8 ملفات حقيقية متكاملة وكاملة الكود (بدون TODO أو اختصارات وهمية) تشمل ملف الاعتماديات (package.json أو pyproject.toml/requirements.txt)، وملفات المنطق الأساسي، ونقطة الدخول، وملف .env.example، وملف README.md باللغة العربية يوضح خطوات التشغيل.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            'أنت كبير مهندسي إعادة الهيكلة البرمجية. اكتب كوداً نظيفاً وكاملاً وخالياً من العناصر الوهمية. عند استخدام Google Gemini استخدم دائماً الحزمة الحديثة @google/genai وموديل gemini-4-hydrogen. الشرح المعماري بالعربية والكود بالمعايير الإنتاجية.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rebuiltProjectName: { type: Type.STRING },
              targetStackLabel: { type: Type.STRING },
              architectureOverview: { type: Type.STRING },
              migrationDecisions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    from: { type: Type.STRING },
                    to: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                  },
                  required: ['from', 'to', 'rationale'],
                },
              },
              setupCommands: { type: Type.ARRAY, items: { type: Type.STRING } },
              envTemplate: { type: Type.STRING },
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    language: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    content: { type: Type.STRING },
                  },
                  required: ['path', 'language', 'summary', 'content'],
                },
              },
            },
            required: [
              'rebuiltProjectName',
              'targetStackLabel',
              'architectureOverview',
              'migrationDecisions',
              'setupCommands',
              'envTemplate',
              'files',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/refine-file', async (req, res) => {
    try {
      const { projectName, filePath, currentContent, instruction } = req.body as {
        projectName?: string;
        filePath?: string;
        currentContent?: string;
        instruction?: string;
      };

      if (!filePath || !currentContent || !instruction) {
        return res.status(400).json({ error: 'بيانات تعديل الملف غير مكتملة.' });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `المشروع: ${projectName || 'Rebuilt Project'}
المسار: ${filePath}
التعديل المطلوب: ${instruction}

المحتوى الحالي للملف:
${currentContent}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          systemInstruction:
            'قم بتطبيق التعديل المطلوب بدقة على الملف وأرجع المحتوى الكامل المحدث للملف مع ملخص عربي موجز للتعديل.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updatedContent: { type: Type.STRING },
              changeSummary: { type: Type.STRING },
            },
            required: ['updatedContent', 'changeSummary'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
