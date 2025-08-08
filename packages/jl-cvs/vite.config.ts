import { readdirSync, rmSync, statSync } from 'node:fs'
import { parse, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const distDir = fileURLToPath(new URL('./dist', import.meta.url))
const distWorkerDir = fileURLToPath(new URL('./dist/worker', import.meta.url))

export default defineConfig(({ mode }) => {
  console.log(`build mode: ${mode}`)

  return {
    plugins: [
      dts({
        root: srcDir,
      }),
      cleanupPlugin(distWorkerDir, ['.cjs', '.d.ts']),
    ],
    resolve: {
      alias: {
        '@': srcDir,
      },
    },

    build: {
      minify: true,
      sourcemap: mode === 'development',
      outDir: distDir,
      emptyOutDir: true, // 在构建前清空输出目录

      // lib 模式通常用于构建单一入口的库。对于多个自定义命名的入口（如这里的 index 和 workers）
      // lib: {
      //   entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      //   fileName: 'index',
      //   formats: ['es', 'cjs'],
      // },

      rollupOptions: {
        /**
         * 对于所有在 input 中定义的入口点，严格保留它们原始的、完整的导出签名
         * 不要进行任何基于使用情况的 tree-shaking 来移除这些入口点自身的导出
         */
        preserveEntrySignatures: 'strict',
        input: {
          index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
          ...getDirEntries('./src/worker'),
        },
        output: [
          // ESM 格式输出（主入口 + Worker）
          {
            format: 'es',
            entryFileNames: '[name].js',
          },
          // CJS 格式输出（仅主入口）
          {
            format: 'cjs',
            entryFileNames: '[name].cjs',
          },
        ],

        external: ['@jl-org/tool'],
      },
    },
  }
})

/**
 * 清理多余的文件
 */
function cleanupPlugin(targetDir: string, exts: string[]): Plugin {
  return {
    name: 'cleanup-cjs-workers',
    apply: 'build',

    closeBundle() {
      if (!statSync(targetDir, { throwIfNoEntry: false })?.isDirectory()) {
        return
      }

      const files = readdirSync(targetDir)

      for (const file of files) {
        const needRm = exts.some(ext => file.endsWith(ext))
        const filePath = resolve(targetDir, file)

        if (needRm) {
          rmSync(filePath)
        }
      }
    },
  }
}

function getDirEntries(dirPath: string) {
  const workerAbsolutePath = fileURLToPath(new URL(dirPath, import.meta.url))
  const entries = {}

  /**
   * 从 dirPath 中提取出用作输出子目录的部分
   * 例如，如果 dirPath 是 './src/worker', outputSubDir 会是 'worker'
   * 如果 dirPath 是 './src/other/workers', outputSubDir 会是 'other/workers'
   */
  let outputSubDir = dirPath
  if (outputSubDir.startsWith('./src/')) {
    outputSubDir = outputSubDir.substring('./src/'.length)
  }
  else if (outputSubDir.startsWith('src/')) {
    outputSubDir = outputSubDir.substring('src/'.length)
  }
  /** 清理可能存在的前后斜杠 */
  outputSubDir = outputSubDir.replace(/^\/+|\/+$/g, '')

  try {
    const files = readdirSync(workerAbsolutePath)

    for (const file of files) {
      const fullPathToWorkerFile = resolve(workerAbsolutePath, file)

      /** 确保是文件而不是子目录，并且是 .ts 或 .js 文件 */
      if (statSync(fullPathToWorkerFile).isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
        const { name } = parse(file) // 'my-worker' 提取 'my-worker.ts'

        const entryKey = `${outputSubDir}/${name}`
        entries[entryKey] = fullPathToWorkerFile
      }
    }
  }
  catch (error) {
    /** 如果目录不存在或无法读取，可以打印警告或忽略 */
    console.warn(`Could not read worker directory: ${workerAbsolutePath}`, error.message)
  }
  return entries
}
