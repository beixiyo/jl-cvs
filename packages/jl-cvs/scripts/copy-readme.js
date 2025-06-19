import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** 源文件路径（根目录的 README.md） */
const sourceReadme = resolve(__dirname, '../../../README.md')
/** 目标文件路径（包目录的 README.md） */
const targetReadme = resolve(__dirname, '../README.md')

try {
  /** 检查源文件是否存在 */
  if (!existsSync(sourceReadme)) {
    console.error('❌ 源 README.md 文件不存在:', sourceReadme)
    process.exit(1)
  }

  /** 确保目标目录存在 */
  const targetDir = dirname(targetReadme)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  /** 复制文件 */
  copyFileSync(sourceReadme, targetReadme)
  console.log('✅ README.md 复制成功!')
  console.log(`   源文件: ${sourceReadme}`)
  console.log(`   目标文件: ${targetReadme}`)
}
catch (error) {
  console.error('❌ 复制 README.md 失败:', error.message)
  process.exit(1)
}
