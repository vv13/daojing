/**
 * GitHub Pages has no SPA fallback: refreshing /repo/jing requests a real file and 404s.
 * Serving the same shell as index.html for unknown paths fixes client-side routes.
 */
import { copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))
