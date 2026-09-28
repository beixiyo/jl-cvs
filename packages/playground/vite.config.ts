import { autoParseStyles } from '@jl-org/js-to-style'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { envParse } from 'vite-plugin-env-parse'

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      envParse(),
      autoParseStyles({
        jsPath: fileURLToPath(new URL('./src/styles/variable.ts', import.meta.url)),
        cssPath: fileURLToPath(new URL('./src/styles/css/autoVariables.css', import.meta.url)),
      }),
      AutoImport({
        imports: ['react', 'react-router-dom'],
        dts: './src/auto-imports.d.ts',
      }),
      codeInspectorPlugin({
        bundler: 'vite',
        editor: 'cursor',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
    },
  }
})
