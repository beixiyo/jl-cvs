import type { NoteBoardOptions } from './type'


export function mergeOpts(
  opts: NoteBoardOptions,
) {
  return {
    ... {
      width: 800,
      height: 600,
      minScale: 0.5,
      maxScale: 8,

      lineWidth: 1,
      strokeStyle: '#000',
      lineCap: 'round' as CanvasLineCap,
      drawGlobalCompositeOperation: 'source-over'
    } as NoteBoardOptions,
    ...opts,
  }
}

export function setCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  canvas.width = width
  canvas.height = height
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
}

/**
 * 获取一个圆形的光标
 */
export const getCursor = (
  size = 30,
  color = '#409eff55'
) => {
  const circle = `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='${size}'
      height='${size}'
      fill='${color}'
      viewBox='0 0 ${size} ${size}'
    >
      <circle
        r='${size / 2}'
        cy='50%'
        cx='50%'
      />
    </svg>`

  const cursorData = `data:image/svg+xml;base64,${window.btoa(circle)}`

  return `url(${cursorData}) ${size / 2} ${size / 2}, crosshair`
}