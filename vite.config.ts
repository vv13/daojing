import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages 项目站为 /<仓库名>/；用户站 username.github.io 为 / */
function normalizeBase(raw: string | undefined): string {
  if (raw == null || raw === '' || raw === '/') return '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`
}

/** 供本地 dev / 未设 VITE_GITHUB_REPO 时解析编辑链接（fork 请改 package.json repository） */
function githubOwnerRepoFromPackageJson(): string {
  try {
    const path = fileURLToPath(new URL('./package.json', import.meta.url))
    const pkg = JSON.parse(readFileSync(path, 'utf-8')) as {
      repository?: string | { url?: string }
    }
    const r = pkg.repository
    if (!r) return ''
    const url = typeof r === 'string' ? r : (r.url ?? '')
    const m = String(url).match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i)
    return m ? `${m[1]}/${m[2]}` : ''
  } catch {
    return ''
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss()],
  define: {
    __GITHUB_REPO_DEFAULT__: JSON.stringify(githubOwnerRepoFromPackageJson()),
  },
})
