
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Updated includeAssets to be more specific.
      // Assets in /public/assets and /public/icons will be picked up by workbox.globPatterns.
      includeAssets: ['favicon.ico'], 
      manifest: {
        name: 'AnimeBell',
        short_name: 'AnimeBell',
        description: 'Tu portal para ver anime online. Disfruta de los últimos episodios y descubre nuevas series.',
        theme_color: '#008080', // Teal - matches accent in light mode
        background_color: '#eeeeee', // Light Gray - matches background in light mode
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // This will scan the 'dist' directory (output of the build)
        // and include matched files with revisions in the precache manifest.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf,eot,otf}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://backend.animebell.peryloth.com' && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10, // Optional: timeout for network request
            },
          },
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'picsum-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          }
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA features in development for testing
        type: 'module', // Recommended for modern browsers
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9002, // Matches your previous Next.js dev port
    host: true, // Allow access from network
    strictPort: true, // Fail if port is already in use
  },
  build: {
    outDir: 'dist', // Output directory for build files
  },
  define: {
    // Vite uses import.meta.env for environment variables
    // 'process.env.NEXT_PUBLIC_ANIME_API_ENDPOINT': JSON.stringify(process.env.VITE_ANIME_API_ENDPOINT),
  }
});
