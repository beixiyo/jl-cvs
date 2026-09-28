/**
 * dpr 边界统一管理
 *
 * 全库约定：
 * - 配置尺寸一律 CSS 逻辑像素
 * - backing store 只在 {@link applyHiDPI} 里乘一次 dpr
 * - 之后所有绘制都在逻辑坐标系进行，不再出现 dpr 换算
 * - 需要按物理像素回放（如 base64 历史快照）时，
 *   用 `setTransform(1, 0, 0, 1, 0, 0)` 临时切换，画完恢复
 */
import { getDPR } from '@/canvasTool'

/**
 * dpr 边界统一入口：设置画布物理尺寸 + CSS 尺寸 + 逻辑坐标系变换
 *
 * 全库唯一允许乘 dpr 的地方；修改画布尺寸必须走这里，
 * 否则 canvas.width 赋值会把 ctx 变换重置回物理像素坐标
 *
 * @param canvas 目标画布
 * @param ctx 画布上下文（传 canvas.getContext('2d') 的结果即可，重复获取返回同一实例）
 * @param width CSS 逻辑宽度
 * @param height CSS 逻辑高度
 * @param dpr 设备像素比，默认 getDPR()（上限 2）
 */
export function applyHiDPI(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number = getDPR(),
) {
  canvas.width = width * dpr
  canvas.height = height * dpr

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
