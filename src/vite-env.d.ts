/// <reference types="vite/client" />

/** 构建时由 vite.config 注入（来自 package.json repository） */
declare const __GITHUB_REPO_DEFAULT__: string

interface ImportMetaEnv {
  readonly VITE_GITHUB_REPO?: string;
  readonly VITE_GITHUB_BRANCH?: string;
  readonly VITE_GITHUB_FILE?: string;
}
