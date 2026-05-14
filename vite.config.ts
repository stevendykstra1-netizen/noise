import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Chicago Marine',
        short_name: 'Marine',
        description: 'Chicago marine forecast for Belmont Harbor',
        theme_color: '#0d1b2a',
        background_color: '#0d1b2a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.weather\.gov\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'noaa-api-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^\/ndbc\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ndbc-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 30 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/coastwatch\.glerl\.noaa\.gov\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'glerl-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
})
