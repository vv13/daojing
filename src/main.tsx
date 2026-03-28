import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL
    const swUrl = `${base}sw.js`
    navigator.serviceWorker
      .register(swUrl, { scope: base })
      .then(async (registration) => {
        const shouldReloadForControl =
          !navigator.serviceWorker.controller &&
          !sessionStorage.getItem('sw_control_reloaded')

        if (shouldReloadForControl) {
          sessionStorage.setItem('sw_control_reloaded', '1')
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload()
          })
        }

        await navigator.serviceWorker.ready

        const assetUrls = Array.from(
          document.querySelectorAll('script[src],link[rel="stylesheet"][href]')
        )
          .map((el) => el.getAttribute('src') || el.getAttribute('href'))
          .filter((url): url is string => Boolean(url))
          .map((url) => new URL(url, window.location.origin).pathname)

        const precacheUrls = Array.from(new Set(assetUrls))
        registration.active?.postMessage({
          type: 'PRECACHE_URLS',
          payload: precacheUrls,
        })
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error)
      })
  })
}
