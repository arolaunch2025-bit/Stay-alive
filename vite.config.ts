import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['leaf.svg'],
      manifest: {
        name: 'Stay-alive — Temple de la conscience',
        short_name: 'Stay-alive',
        description: 'Observer, comprendre et cultiver son équilibre intérieur.',
        lang: 'fr',
        theme_color: '#173d30',
        background_color: '#f7faf6',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        icons: [
          { src: '/leaf.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
})