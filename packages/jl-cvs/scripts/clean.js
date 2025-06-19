import { existsSync, unlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** 要清理的 README.md 文件路径 */
const readmeToClean = resolve(__dirname, '../README.md')

try {
  /** 检查文件是否存在 */
  if (existsSync(readmeToClean)) {
    unlinkSync(readmeToClean)
    console.log('✅ 已清理复制的 README.md 文件')
  }
  else {
    console.log('ℹ️  没有找到需要清理的 README.md 文件')
  }
}
catch (error) {
  console.error('❌ 清理 README.md 失败:', error.message)
  /** 清理失败不应该阻止其他流程，所以不退出进程 */
}
