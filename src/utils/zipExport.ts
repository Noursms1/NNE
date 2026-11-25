import JSZip from 'jszip';
import type { RebuiltProject } from '../types';

export async function downloadRebuiltProjectZip(rebuild: RebuiltProject): Promise<void> {
  const zip = new JSZip();
  const folderName =
    rebuild.rebuiltProjectName
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'rebuilt-ai-project';

  const root = zip.folder(folderName);
  if (!root) {
    throw new Error('تعذر إنشاء أرشيف المشروع.');
  }

  for (const file of rebuild.files) {
    const cleanPath = file.path.replace(/^\/+/, '');
    root.file(cleanPath, file.content);
  }

  const hasEnvExample = rebuild.files.some(
    (f) => f.path.replace(/^\/+/, '').toLowerCase() === '.env.example'
  );
  if (!hasEnvExample && rebuild.envTemplate.trim()) {
    root.file('.env.example', rebuild.envTemplate.trim() + '\n');
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
