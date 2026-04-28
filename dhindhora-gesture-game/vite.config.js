import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/next-mocks/link.jsx'),
      'next/image': path.resolve(__dirname, './src/next-mocks/image.jsx'),
      'next/navigation': path.resolve(__dirname, './src/next-mocks/navigation.js'),
      'next/dynamic': path.resolve(__dirname, './src/next-mocks/dynamic.jsx'),
    },
  },
  server: {
    port: 3776,
    strictPort: true
  }
})
