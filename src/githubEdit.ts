function safeOwnerRepo(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(t)) return null;
  return t;
}

function safeRepoRelativeFile(raw: string): string | null {
  const f = raw.trim();
  if (!f || f.includes('..') || f.startsWith('/')) return null;
  return f;
}

function buildGithubEditUrl(ownerRepo: string, branch: string, file: string): string {
  return `https://github.com/${ownerRepo}/edit/${branch}/${file}`;
}

function resolveGithubEditUrlForFile(file: string): string | null {
  const safeFile = safeRepoRelativeFile(file);
  if (!safeFile) return null;

  const branch = (import.meta.env.VITE_GITHUB_BRANCH ?? 'main').trim() || 'main';

  const fromEnv = safeOwnerRepo(import.meta.env.VITE_GITHUB_REPO);
  if (fromEnv) {
    return buildGithubEditUrl(fromEnv, branch, safeFile);
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
          return buildGithubEditUrl(`${owner}/${repo}`, branch, safeFile);
        }
      }
    }
  }

  const fromPkg = safeOwnerRepo(__GITHUB_REPO_DEFAULT__);
  if (fromPkg) {
    return buildGithubEditUrl(fromPkg, branch, safeFile);
  }

  return null;
}

/** 仅在此域名展示「释义」旁的 GitHub 编辑入口（避免 fork / 镜像站误链到上游仓库）。 */
const EXPLANATION_EDIT_HOST = 'vv13.github.io';

function isExplanationEditHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.toLowerCase() === EXPLANATION_EDIT_HOST;
}

/**
 * GitHub 网页编辑器地址：修改对应经书 `src/books/<slug>/chapters.json` 后合并到默认分支，合并后 GitHub Actions 会更新 Pages。
 *
 * 仅在 `vv13.github.io` 托管时返回链接；其余环境为 `null`。
 *
 * 解析顺序：`VITE_GITHUB_REPO` → `*.github.io/<repo>/` 路径 → `package.json` repository。
 */
export function getGithubEditBookChaptersUrl(bookSlug: string): string | null {
  if (!isExplanationEditHost()) return null;
  const slug = bookSlug.trim();
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = `src/books/${slug}/chapters.json`;
  return resolveGithubEditUrlForFile(file);
}
