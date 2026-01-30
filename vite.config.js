import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'models/**/*.glb'],
      // Usando manifest.json manual em public/
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

        // Ignorar arquivos muito grandes do precache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

        runtimeCaching: [
          // Cache de tiles do mapa
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          },
          // Cache de modelos 3D GLB
          {
            urlPattern: /\.glb$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: '3d-models',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 dias
              }
            }
          },
          // Cache de imagens
          {
            urlPattern: /\.(png|jpg|jpeg|webp|svg|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 dias
              }
            }
          },
          // Cache de fontes
          {
            urlPattern: /\.(woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              }
            }
          },
          // Cache de APIs (se houver)
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    https: false
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
