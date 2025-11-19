import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    headers: {
      // Required for FFmpeg.wasm SharedArrayBuffer support
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  build: {
    target: 'esnext', // Enable top-level await support
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // Enable top-level await support in dev
      loader: {
        '.js': 'jsx',
      },
    },
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
}) 