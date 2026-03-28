const DEFAULT_FILE = 'src/daodejing.ts';

function safeOwnerRepo(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(t)) return null;
  return t;
}

function safeFilePath(raw: string | undefined): string {
  const f = (raw ?? DEFAULT_FILE).trim() || DEFAULT_FILE;
  if (f.includes('..') || f.startsWith('/')) return DEFAULT_FILE;
  return f;
}

function buildGithubEditUrl(ownerRepo: string, branch: string, file: string): string {
  return `https://github.com/${ownerRepo}/edit/${branch}/${file}`;
}

/**
 * GitHub 网页编辑器地址：修改 `src/daodejing.ts` 后合并到默认分支（默认 `main`），合并后 GitHub Actions 会更新 Pages。
 *
 * 解析顺序：`VITE_GITHUB_REPO` → `*.github.io/<repo>/` 路径 → `package.json` repository（本地 dev 可见编辑按钮）。
 */
export function getGithubEditDaodejingUrl(): string | null {
  const branch = (import.meta.env.VITE_GITHUB_BRANCH ?? 'main').trim() || 'main';
  const file = safeFilePath(import.meta.env.VITE_GITHUB_FILE);

  const fromEnv = safeOwnerRepo(import.meta.env.VITE_GITHUB_REPO);
  if (fromEnv) {
    return buildGithubEditUrl(fromEnv, branch, file);
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const m = /^([a-z0-9-]+)\.github\.io$/.exec(host);
    if (m) {
      const owner = m[1];
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const repoSeg = path.split('/').filter(Boolean)[0];
      if (repoSeg) {
        const repo = decodeURIComponent(repoSeg);
        if (/^[\w.-]+$/i.test(repo)) {
          return buildGithubEditUrl(`${owner}/${repo}`, branch, file);
        }
      }
    }
  }

  const fromPkg = safeOwnerRepo(__GITHUB_REPO_DEFAULT__);
  if (fromPkg) {
    return buildGithubEditUrl(fromPkg, branch, file);
  }

  return null;
}
