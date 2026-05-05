import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        /* ... sem alterações ... */
      },
      workbox: {
        /* ✅ FIX 1 — aumenta o limite para 5 MB */
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        /* ✅ FIX 2 — exclui PNGs grandes do precache */
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        /*  ↑ removeu "png" daqui para evitar o erro */

        /* ✅ FIX 3 — lista explícita dos PNGs pequenos que devem */
        /*            entrar no precache (ícones PWA apenas)      */
        additionalManifestEntries: [
          { url: 'pwa-192x192.png', revision: null },
          { url: 'pwa-512x512.png', revision: null },
        ],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
            },
          },
        ],
      },
    }),
  ],
})
//g