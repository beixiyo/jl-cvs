import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { fileURLToPath, URL } from 'node:url'


export default defineConfig({
  plugins: [
    dts({
      root: fileURLToPath(new URL('./src', import.meta.url)),
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    minify: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@jl-org/tool']
    }
  },
  // index.html 入口文件
  root: fileURLToPath(new URL('./test', import.meta.url)),
})
