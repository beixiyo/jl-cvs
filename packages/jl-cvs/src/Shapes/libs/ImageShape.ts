import type { ShapeType } from './type'
import { isStr } from '@jl-org/tool'
import { BaseShape } from './BaseShape'

/**
 * 图片加载状态
 */
export type ImageLoadState = 'loading' | 'loaded' | 'error'

/**
 * 绘制图片形状
 */
export class ImageShape extends BaseShape {
  name: ShapeType = 'imageShape'

  private image: HTMLImageElement | null = null
  loadState: ImageLoadState = 'loading'
  loadPromise: Promise<HTMLImageElement> | null = null
  onLoadCallback?: (img: HTMLImageElement) => void
  onErrorCallback?: (err: Error) => void

  load(
    src?: string,
    onLoad?: (img: HTMLImageElement) => void,
    onError?: (err: Error) => void,
  ) {
    if (!this.meta.imgSrc && !src) {
      throw new Error('ImageShape meta.src or src param is required')
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (isStr(this.meta.imgSrc)) {
        this.image = new Image()
        this.image.src = this.meta.imgSrc
      }
      else {
        this.image = this.meta.imgSrc as HTMLImageElement
      }

      this.image.onload = () => {
        this.loadState = 'loaded'
        /** 图片加载完成后触发回调 */
        this.onLoadCallback?.(this.image as HTMLImageElement)
        onLoad?.(this.image as HTMLImageElement)
        resolve(this.image as HTMLImageElement)
      }
      this.image.onerror = () => {
        this.loadState = 'error'
        const err = new Error('ImageShape load failed')
        /** 图片加载失败后触发回调 */
        this.onErrorCallback?.(err)
        onError?.(err)
        reject(err)
      }
    })
  }

  /**
   * 绘制图片
   * @param ctx - Canvas 渲染上下文
   */
  draw(ctx = this.ctx) {
    if (!ctx) {
      throw new Error('Canvas context is required')
    }
    this.ctx = ctx

    if (!this.meta.imgSrc) {
      throw new Error('ImageShape meta.src is required')
    }

    switch (this.loadState) {
      case 'loading':
        this.drawPlaceholder(ctx)
        break
      case 'loaded':
        this.drawImage(ctx)
        break
      case 'error':
        this.drawErrorPlaceholder(ctx)
        break
    }
  }

  /**
   * 绘制已加载的图片
   */
  private drawImage(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    if (!this.image) {
      return
    }

    ctx.save()
    try {
      /** 计算绘制区域 */
      const { x, y, width, height } = this.getBounds()

      /** 设置图片绘制的混合模式为正常模式，避免受到当前模式（如 xor）的影响 */
      ctx.globalCompositeOperation = 'source-over'

      /** 绘制图片 */
      ctx.drawImage(this.image, x, y, width, height)
    }
    catch (error) {
      console.warn('Failed to draw image:', error)
      this.drawErrorPlaceholder(ctx)
    }
    finally {
      /** 恢复原始的上下文状态 */
      ctx.restore()
    }
  }

  /**
   * 绘制加载中占位符
   */
  private drawPlaceholder(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    ctx.save()
    try {
      /** 设置正常绘制模式 */
      ctx.globalCompositeOperation = 'source-over'

      const { x, y, width, height } = this.getBounds()

      /** 绘制加载文字 */
      ctx.fillStyle = '#666'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Loading...', x + width / 2, y + height / 2)
    }
    finally {
      /** 恢复原始的上下文状态 */
      ctx.restore()
    }
  }

  /**
   * 绘制错误占位符
   */
  private drawErrorPlaceholder(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    ctx.save()
    try {
      /** 设置正常绘制模式 */
      ctx.globalCompositeOperation = 'source-over'

      const { x, y, width, height } = this.getBounds()

      /** 绘制错误图标和文字 */
      ctx.fillStyle = '#cc0000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('❌ Load Failed', x + width / 2, y + height / 2)
    }
    finally {
      /** 恢复原始的上下文状态 */
      ctx.restore()
    }
  }

  /**
   * 重写 getBounds 方法，支持使用图片原始尺寸或 meta 中指定的尺寸
   */
  getBounds() {
    let width: number
    let height: number

    /** 获取图片的原始尺寸 */
    const getOriginalSize = () => {
      if (this.image && this.loadState === 'loaded') {
        return {
          width: this.image.naturalWidth || this.image.width,
          height: this.image.naturalHeight || this.image.height,
        }
      }
      return null
    }

    /** 如果 meta 中同时指定了宽度和高度，直接使用 */
    if (this.meta.width && this.meta.height) {
      width = this.meta.width
      height = this.meta.height
    }
    /** 如果只指定了宽度，根据原始比例计算高度 */
    else if (this.meta.width && !this.meta.height) {
      const originalSize = getOriginalSize()
      if (originalSize && originalSize.width > 0) {
        const aspectRatio = originalSize.height / originalSize.width
        width = this.meta.width
        height = this.meta.width * aspectRatio
      }
      else {
        /** 如果图片还没加载，使用默认比例 (4:3) */
        width = this.meta.width
        height = this.meta.width * 0.75
      }
    }
    /** 如果只指定了高度，根据原始比例计算宽度 */
    else if (!this.meta.width && this.meta.height) {
      const originalSize = getOriginalSize()
      if (originalSize && originalSize.height > 0) {
        const aspectRatio = originalSize.width / originalSize.height
        height = this.meta.height
        width = this.meta.height * aspectRatio
      }
      else {
        /** 如果图片还没加载，使用默认比例 (4:3) */
        height = this.meta.height
        width = this.meta.height * (4 / 3)
      }
    }
    /** 如果图片已加载，使用图片的原始尺寸 */
    else if (this.image && this.loadState === 'loaded') {
      const originalSize = getOriginalSize()
      if (originalSize) {
        width = originalSize.width
        height = originalSize.height
      }
      else {
        width = 100
        height = 100
      }
    }
    /** 否则使用坐标计算的尺寸 */
    else {
      const baseBounds = super.getBounds()
      width = baseBounds.width || 100 // 默认宽度
      height = baseBounds.height || 100 // 默认高度
    }

    /** 计算位置 */
    const x = Math.min(this.startX, this.endX)
    const y = Math.min(this.startY, this.endY)

    return {
      x,
      y,
      width,
      height,
    }
  }

  /**
   * 检查点是否在图片区域内
   */
  isInPath(x: number, y: number): boolean {
    const bounds = this.getBounds()
    return (
      x >= bounds.x
      && x <= bounds.x + bounds.width
      && y >= bounds.y
      && y <= bounds.y + bounds.height
    )
  }

  /**
   * 重写克隆方法，以保留加载状态和图片数据
   */
  override clone(): BaseShape {
    const newShape = super.clone() as ImageShape

    /** 复制图片相关的特定属性 */
    newShape.loadState = this.loadState
    newShape.image = this.image
    newShape.loadPromise = this.loadPromise

    return newShape
  }
}
