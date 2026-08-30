import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { buildSeoTags, renderTagsToHtml } from './src/config/seo.js'

/**
 * Bake the SEO tags into index.html at build time.
 *
 * Without this, every og:*, twitter:*, canonical and JSON-LD tag existed only after
 * React mounted — so social scrapers, which do not run JavaScript, saw a bare
 * `<div id="root">` and rendered every shared link with no title and no image.
 * See docs/AUDIT.md §3.1 and the header comment in src/config/seo.js.
 *
 * The tags come from src/config/seo.js, which SEO.jsx also reads, so the static HTML
 * and the runtime Helmet output cannot drift apart.
 *
 * Runs in dev too (transformIndexHtml fires on both), so `npm run dev` shows exactly
 * what production serves — you can verify with View Source rather than DevTools.
 */
function seoMetaPlugin() {
  return {
    name: 'inject-seo-meta',
    transformIndexHtml: {
      // `pre` so the injected tags land before the PWA plugin appends its own.
      order: 'pre',
      handler(html) {
        const rendered = renderTagsToHtml(buildSeoTags())
        if (!html.includes('<!--%SEO_META%-->')) {
          throw new Error(
            'index.html is missing the <!--%SEO_META%--> placeholder; SEO tags would ' +
              'silently not be injected and every social share would break again.'
          )
        }
        return html.replace('<!--%SEO_META%-->', rendered)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    seoMetaPlugin(),
    visualizer({
      open: false, // Don't auto-open in browser
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Ngowa Karisa - Software Engineer',
        short_name: 'Karisa Portfolio',
        description: 'Portfolio website showcasing software engineering projects and skills',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache configuration
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false, // Disable PWA in dev mode
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Source maps for production debugging (can disable for smaller builds)
    sourcemap: false,
    
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 600,
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.* calls in production
        drop_console: true,
        drop_debugger: true,
        // Remove unreachable code
        dead_code: true,
        // Reduce function names
        keep_fnames: false,
      },
      mangle: {
        // Mangle variable names for smaller output
        safari10: true,
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation': ['framer-motion'],
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers', '@emailjs/browser'],
          'ui': ['sonner'],
        },
        // Optimize chunk file naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
})
