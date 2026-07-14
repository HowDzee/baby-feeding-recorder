import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
 // Default API base: point at the same origin (Express serves both API + dist)
 // Can be overridden with VITE_API_BASE=... env var (.env file or shell)
 const env = loadEnv(mode, process.cwd(), '')
 const API_BASE = env.VITE_API_BASE ?? ''

 return {
  server: {
   host: '0.0.0.0',
   proxy: {
    // In dev, forward /api/* to Express backend
    '/api': {
     target: `http://${API_BASE ? new URL(API_BASE).host : 'localhost:3000'}`,
     changeOrigin: true,
    },
   },
  },
  define: {
   // Hardcode VITE_API_BASE so the bundle has it at build time
   'import.meta.env.VITE_API_BASE': JSON.stringify(API_BASE),
  },
  plugins: [
   react(),
   VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon-192.png', 'icon-512.png'],
    manifest: {
     name: '宝宝记录',
     short_name: 'BabyRec',
     description: '新生儿吃奶排便记录',
     start_url: '/',
     display: 'standalone',
     orientation: 'portrait-primary',
     theme_color: '#FFF5F5',
     background_color: '#FFF5F0',
     icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
     ],
    },
    workbox: {
     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
     runtimeCaching: [
      {
      urlPattern: /\.wasm$/,
       handler: 'CacheFirst',
       options: {
        cacheName: 'wasm-assets',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
       },
      },
     ],
    },
   }),
  ],
 }
})
