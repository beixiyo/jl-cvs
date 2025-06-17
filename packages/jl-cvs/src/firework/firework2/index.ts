import { Firework2, type Firework2Opts } from './Firework2'
import { delFromItem } from '@/utils'

/**
 * 二段爆炸的烟花
 */
export function createFirework2(
  cvs: HTMLCanvasElement,
  opts: Options
) {
  let id: number
  const fireworkArr: Firework2[] = []
  const ctx = cvs.getContext('2d')!
  const {
    width = cvs.width,
    height = cvs.height
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
    resume: draw
  }


  function addFirework() {
    const firework = new Firework2(opts)
    firework.launch()
    fireworkArr.push(firework)
  }

  /**
   * 绘制烟花
   */
  function draw() {
    // 使用半透明清空画布，形成拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height)

    const list = [...fireworkArr]
    list.forEach(firework => {
      firework.update()
      if (firework.isEnd()) {
        delFromItem(fireworkArr, firework)
      }
    })

    id = requestAnimationFrame(draw)
  }

  function stop() {
    cancelAnimationFrame(id)
  }

  function setOpts() {
    cvs.width = width
    cvs.height = height

    // 修改坐标系
    ctx.translate(0, height)
    ctx.scale(1, -1)
  }
}


export type Options = {
  width?: number
  height?: number
}
  & Firework2Opts