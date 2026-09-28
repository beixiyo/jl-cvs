import { getDPR } from '@/canvasTool'
import { delFromItem } from '@/utils'
import { Firework2, type Firework2Opts } from './Firework2'

/**
 * 二段爆炸的烟花
 */
export function createFirework2(
  cvs: HTMLCanvasElement,
  opts: Options = {},
) {
  let id: number | null = null
  const fireworkArr: Firework2[] = []
  const ctx = opts.ctx ?? cvs.getContext('2d')!
  const dpr = opts.dpr ?? getDPR()
  const {
    width = cvs.clientWidth || cvs.width,
    height = cvs.clientHeight || cvs.height,
  } = opts

  setOpts()
  draw()

  return {
    /**
     * 添加一个烟花
     */
    addFirework,
    /**
     * 停止所有
     */
    stop,
    /**
     * 恢复烟花
     */
    resume: draw,
  }

  function addFirework() {
    const firework = new Firework2({
      ...opts,
      ctx,
      dpr,
      width,
      height,
    })
    firework.launch()
    fireworkArr.push(firework)
  }

  /**
   * 绘制烟花
   */
  function draw() {
    if (id !== null) return

    const update = () => {
      /** 使用半透明清空画布，形成拖尾效果 */
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, width, height)

      const list = [...fireworkArr]
      list.forEach((firework) => {
        firework.update()
        if (firework.isEnd()) {
          delFromItem(fireworkArr, firework)
        }
      })

      id = requestAnimationFrame(update)
    }

    update()
  }

  function stop() {
    if (id === null) return

    cancelAnimationFrame(id)
    id = null
  }

  function setOpts() {
    cvs.width = width * dpr
    cvs.height = height * dpr
    cvs.style.width = `${width}px`
    cvs.style.height = `${height}px`

    /** dpr 边界：一次性进入逻辑坐标系（含 y 轴翻转，无法走 applyHiDPI，见 utils/dpr 约定） */
    ctx.setTransform(dpr, 0, 0, -dpr, 0, height * dpr)
  }
}

export type Options = Omit<Firework2Opts, 'ctx' | 'width' | 'height' | 'dpr'> & {
  width?: number
  height?: number
  dpr?: number
  ctx?: CanvasRenderingContext2D
}
