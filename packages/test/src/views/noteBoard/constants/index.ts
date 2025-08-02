import type { Mode } from '@jl-org/cvs'
import type { ToolbarMode } from '@/components/Toolbar'

/** 画布尺寸配置 */
export const CANVAS_CONFIG = {
  width: 800,
  height: 600,
} as const

/** 模式选项配置 */
export const MODE_OPTIONS: ToolbarMode[] = [
  { value: 'draw', label: '绘制', hasBrushSlider: true },
  { value: 'erase', label: '擦除', hasBrushSlider: true },
  { value: 'drag', label: '拖拽' },
  { value: 'rect', label: '矩形' },
  { value: 'circle', label: '圆形' },
  { value: 'arrow', label: '箭头' },
  { value: 'none', label: '无操作' },
]

/** 模式映射 */
export const MODE_MAP: Record<string, Mode> = {
  1: 'draw',
  2: 'erase',
  3: 'drag',
  4: 'rect',
  5: 'circle',
  6: 'arrow',
  0: 'none',
}

/** 快捷键配置 */
export const SHORTCUT_KEYS = [
  { key: 'Ctrl + Z', desc: '撤销' },
  { key: 'Ctrl + Shift + Z', desc: '重做' },
  { key: 'Ctrl + 1', desc: '绘制模式' },
  { key: 'Ctrl + 2', desc: '擦除模式' },
  { key: 'Ctrl + 3', desc: '拖拽模式' },
  { key: 'Ctrl + 4', desc: '矩形模式' },
  { key: 'Ctrl + 5', desc: '圆形模式' },
  { key: 'Ctrl + 6', desc: '箭头模式' },
  { key: 'Ctrl + 0', desc: '无操作模式' },
  { key: 'Ctrl + E', desc: '导出图片' },
  { key: 'Ctrl + Shift + E', desc: '导出所有图层' },
  { key: 'Ctrl + R', desc: '重置大小' },
  { key: 'Ctrl + Delete', desc: '清空画布' },
] as const

/** 画板初始化配置 */
export const NOTE_BOARD_INIT_CONFIG = {
  globalCompositeOperation: 'xor' as GlobalCompositeOperation,
  drawGlobalCompositeOperation: 'xor' as GlobalCompositeOperation,
  shapeGlobalCompositeOperation: 'source-over' as GlobalCompositeOperation,
} as const

/** 默认图片路径 */
export const DEFAULT_IMAGE_URL = new URL('@/assets/img/umr.webp', import.meta.url).href
