import { getDPR } from '@/canvasTool'

/**
 * 获取一个圆形的光标
 * @param size 光标大小，默认 30
 * @param color 光标颜色，默认 `#409eff55`
 */
export function getCircleCursor(size = 30, color = '#409eff55') {
  /**
   * 高 DPI 下自定义光标位图会按 dpr 光栅化后再以 CSS 像素显示，
   * 相当于视觉尺寸 ×dpr，这里除以 dpr 补偿，使光标与笔迹粗细一致
   */
  const cursorSize = size / getDPR()
  const circle = `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='${cursorSize}'
      height='${cursorSize}'
      fill='${color}'
      viewBox='0 0 ${cursorSize} ${cursorSize}'
    >
      <circle
        r='${cursorSize / 2}'
        cy='50%'
        cx='50%'
      />
    </svg>`

  const cursorData = `data:image/svg+xml;base64,${window.btoa(circle)}`

  return `url(${cursorData}) ${cursorSize / 2} ${cursorSize / 2}, crosshair`
}
