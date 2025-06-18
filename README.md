# Canvas 的各种令人惊叹效果，以及辅助工具

## 安装

```bash
npm i @jl-org/cvs
```

**所有配置都有中文的文档注释**

**配置详见 TS 类型文件和文档注释**

## 全部函数

- [拖拽区域截图](#拖拽区域截图)
- [图像处理](#图像处理)
- [抠图](#抠图)
- [提取图像边缘](#提取图像边缘)
- [截取视频某一帧](#截取视频某一帧)
- [ImageData 处理，灰度、对比度、二值化等](#ImageData-处理)
<br />

- [辅助函数](#canvas-辅助函数)
- [颜色处理](#颜色处理)
- [svg](#svg)

---

## 拖拽区域截图
```ts
/**
 * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
 * 或者创建实例后调用 `setImg` 设置图片
 */
import { ShotImg } from '@jl-org/cvs'
/**
 * 这个库自行下载，或者你手动实现功能函数也行
 */
import { blobToBase64, downloadByData, getImg } from '@jl-org/tool'

const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)
document.body.appendChild(document.createElement('canvas'))

let si: ShotImg

input.onchange = async () => {
  const file = input!.files![0]
  if (!file)
    return

  const base64 = await blobToBase64(file)
  const img = await getImg(base64) as HTMLImageElement

  /**
   * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
   * 或者创建实例后调用 `setImg` 设置图片
   */
  si = new ShotImg(document.querySelector('canvas')!, img)
}

genBtn('下载图片', async () => {
  /**
   * 获取图片的 blob 或者 base64
   * 如果图片设置过大小，可能会导致截图区域不准确
   */
  const blob = await si.getShotImg('blob')
  downloadByData(blob, 'shot.png')
})
```

---

## 图像处理

```ts
/**
 * 图片噪点化
 * @param img 图片
 * @param level 噪点等级，默认 100
 */
export declare function imgToNoise(img: HTMLImageElement, level?: number): HTMLCanvasElement

/**
 * 添加水印
 * 返回 base64 和图片大小，你可以用 CSS 设置上
 * @example
 * background-image: url(${base64});
 * background-size: ${size}px ${size}px;
 */
export declare function waterMark({ fontSize, gap, text, color, rotate }: WaterMarkOpts): {
  base64: string
  size: number
}

/**
 * 用 Canvas 层层叠加图片，支持 base64 | blob
 */
export declare function composeImg(srcs: Array<{
  src: string | Blob
  left?: number
  top?: number
  setImg?: (img: HTMLImageElement) => void
}>, width: number, height: number): Promise<string>

/**
 * 裁剪图片指定区域，可设置缩放，返回 base64 | blob
 * @param img 图片
 * @param opts 配置
 * @param resType 需要返回的文件格式，默认 `base64`
 */
export declare function cutImg<T extends TransferType = 'base64'>(img: HTMLImageElement, opts?: CutImgOpts, resType?: T): Promise<HandleImgReturn<T>>

/**
 * 压缩图片
 * @param img 图片
 * @param resType 需要返回的文件格式，默认 `base64`
 * @param quality 压缩质量，默认 0.5
 * @param mimeType 图片类型，默认 `image/webp`。`image/jpeg | image/webp` 才能压缩
 * @returns base64 | blob
 */
export declare function compressImg<T extends TransferType = 'base64'>(img: HTMLImageElement, resType?: T, quality?: number, mimeType?: 'image/jpeg' | 'image/webp'): Promise<HandleImgReturn<T>>

/**
 * 把 canvas 上的图像转成 base64 | blob
 * @param cvs canvas
 * @param resType 需要返回的文件格式，默认 `base64`
 * @param mimeType 图片的 MIME 格式
 * @param quality 压缩质量
 */
export declare function getCvsImg<T extends TransferType = 'base64'>(cvs: HTMLCanvasElement, resType?: T, mimeType?: string, quality?: number): Promise<HandleImgReturn<T>>

/**
 * Blob 转 Base64
 */
export declare function blobToBase64(blob: Blob): Promise<string>

/**
 * Base64 转 Blob
 * @param base64Str base64
 * @param mimeType 文件类型，默认 application/octet-stream
 */
export declare function base64ToBlob(base64Str: string, mimeType?: string): Blob

/**
 * 把 http url 转 blob
 */
export declare function urlToBlob(url: string): Promise<Blob>

/**
 * 判断图片的 src 是否可用，可用则返回图片
 * @param src 图片
 * @param setImg 图片加载前执行的回调函数
 */
export declare const getImg: (src: string, setImg?: ((img: HTMLImageElement) => void) | undefined) => Promise<false | HTMLImageElement>
```

---

# 抠图
```ts
/**
 * 抠图转遮罩（把图片的非透明区域，换成指定颜色）
 * @param imgUrl 图片
 * @param replaceColor 替换的颜色
 */
export declare function cutoutImgToMask(imgUrl: string, replaceColor: string, { smoothEdge, smoothRadius, alphaThreshold, ignoreAlpha }?: CutImgToMaskOpts): Promise<{
  base64: string
  imgData: ImageData
}>

/**
 * 传入一张原始图片和一张遮罩图片，将遮罩图不透明的区域提取出来。
 * 使用 **globalCompositeOperation** 实现
 *
 * @param originalImageSource 原图
 * @param maskImageSource 遮罩图
 */
export declare function cutoutImg(originalImageSource: string | HTMLImageElement, maskImageSource: string | HTMLImageElement): Promise<string>

/**
 * 传入一张原始图片和一张遮罩图片，将遮罩图不透明的区域提取出来，并对提取出的区域进行平滑处理。
 * 遍历处理每个像素实现
 *
 * @param originalImg 原图
 * @param maskImg 遮罩图
 */
export declare function cutoutImgSmoothed(originalImg: string, maskImg: string, { blurRadius, featherAmount, }?: CutoutImgOpts): Promise<ImageData>
```

---

# 提取图像边缘
```ts
/**
 * 提取图片边缘
 * @param source 图片URL或ImageData对象
 * @param options 配置项
 */
export declare function getImgEdge(source: string | ImageData, options?: {
  threshold?: number
}): Promise<ImageData>
```

---

## 截取视频某一帧

```ts
/**
 * 示例，使用 Web Worker 截取视频 1、2、100 秒的图片
 */
const srcs = await captureVideoFrame(file, [1, 2, 100], 'base64', {
  quality: 0.5,
})

/**
 * 截取视频某一帧图片，大于总时长则用最后一秒。
 * 如果浏览器支持 ImageCapture，则使用 Worker 截取帧，否则降级为截取 Canvas。
 * @param fileOrUrl 文件或者链接
 * @param time 时间，可以是数组
 * @param resType 返回类型
 */
export declare function captureVideoFrame<N extends number | number[], T extends TransferType = 'base64'>(fileOrUrl: File | string, time: N, resType?: T, options?: Options): Promise<N extends number ? HandleImgReturn<T> : HandleImgReturn<T>[]>
```

---

## ImageData 处理
```ts
/**
 * 灰度化算法：加权灰度化
 * @returns
 */
export declare const adaptiveGrayscale: (imageData: ImageData) => ImageData

/**
 * 对比度增强
 * @param factor 因数，默认 1.2
 * @returns
 */
export declare const enhanceContrast: (imageData: ImageData, factor?: number) => ImageData

/**
 * 二值化处理，请先调用
 * - adaptiveGrayscale
 * - enhanceContrast
 *
 * 最后再调用此函数，以获得最好的图像效果
 *
 * @param threshold 阈值边界，默认 128
 * @returns
 */
export declare const adaptiveBinarize: (imageData: ImageData, threshold?: number) => ImageData

/**
 * 传入一张参考图，返回另一张图片，其中参考图的非透明区域将被裁剪掉
 * @param rawImg 原图
 * @param referenceImg 参考图
 */
export declare function pickImgArea(rawImg: string, referenceImg: string): Promise<ImageData>

/**
 * 传入一张参考图，返回另一张图片，其中参考图的透明区域将被裁剪掉
 * @param rawImg 原图
 * @param referenceImg 参考图
 */
export declare function invertImgArea(rawImg: string, referenceImg: string): Promise<ImageData>
```

---

## Canvas 辅助函数
```ts
/**
 * 设置字体，默认居中
 */
export declare function setFont(ctx: CanvasRenderingContext2D, options: CtxFontOpt): void

/** 清除 canvas 整个画布的内容 */
export declare function clearAllCvs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void

/**
 * 根据半径和角度获取 DOM 坐标
 * @param r 半径
 * @param deg 角度
 */
export declare function calcCoord(r: number, deg: number): readonly [number, number]

/**
 * 创建一个指定宽高的画布
 * @param width 画布的宽度
 * @param height 画布的高度
 * @param options 上下文配置
 * @returns 包含画布和上下文的对象
 */
export declare function createCvs(width?: number, height?: number, options?: CanvasRenderingContext2DSettings): {
  cvs: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

/**
 * 取出 `canvas` 用一维数组描述的颜色中，某个坐标的`RGBA`数组
 * ## 注意坐标从 0 开始
 * @param x 宽度中的第几列
 * @param y 高度中的第几行
 * @param imgData ctx.getImageData 方法获取的 ImageData
 * @returns `RGBA`数组
 */
export declare function getPixel(x: number, y: number, imgData: ImageData): Pixel

/**
 * 美化 ctx.getImageData.data 属性
 * 每一行为一个大数组，每个像素点为一个小数组
 * @param imgData ctx.getImageData 方法获取的 ImageData
 */
export declare function parseImgData(imgData: ImageData): Pixel[][]

/** 给 canvas 某个像素点填充颜色的函数 */
export declare function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void
```

---

## 颜色处理
```ts
/**
 * 把颜色提取出 RGBA
 * @example
 * ```ts
 * getColorInfo('rgba(0, 0, 0, 1)')
 * getColorInfo('rgb(0, 0, 0)')
 *
 * getColorInfo('#fff')
 * getColorInfo('#fff1')
 * ```
 */
export declare function getColorInfo(color: string): {
  r: number
  g: number
  b: number
  a: number
}

/** 获取十六进制随机颜色 */
export declare function getColor(): string

/** 随机十六进制颜色数组 */
export declare function getColorArr(size: number): string[]

/**
## 把十六进制颜色转成 原始长度的颜色
  - #000 => #000000
  - #000f => #000000ff
 */
export declare function hexColorToRaw(color: string): string

/** 十六进制 转 RGB */
export declare function hexToRGB(color: string): string

/** RGB 转十六进制 */
export declare function rgbToHex(color: string): string | undefined

/**
 * 淡化颜色透明度，支持 `RGB` 和 `十六进制`
 * @param color rgba(0, 239, 255, 1)
 * @param strength 淡化的强度
 * @returns 返回 RGBA 类似如下格式的颜色 `rgba(0, 0, 0, 0.1)`
 */
export declare function lightenColor(color: string, strength?: number): string

/**
 * 颜色添加透明度，支持 `RGB` 和 `十六进制`
 * @param color 颜色
 * @param opacity 透明度
 * @returns 返回十六进制 类似如下格式的颜色 `#ffffff11`
 */
export declare function colorAddOpacity(color: string, opacity?: number): string
```

---

## svg
> 下面的函数，其实 *genSvgBoard* | *genBoard*，就够用了，其他暴露的函数，仅仅是他们内部的实现
```ts
/**
 * 生成 svg 棋盘
 * @param width 宽度
 * @param height 高度
 * @param gap 间隔
 * @param opts 文字配置选项
 */
export declare function genSvgBoard(width?: number, height?: number, gap?: number, opts?: Opts): {
  svg: SVGSVGElement
  g: SVGGElement
}

/** 生成棋盘的 path 和 text 元素 */
export declare function genBoard(width?: number, height?: number, gap?: number, opts?: Opts): SVGGElement

/** 生成 svg */
export declare function genSvg(viewBox?: string, width?: number, height?: number): SVGSVGElement

/** 生成 svg path 网格 */
export declare function genGrid(width?: number, height?: number, gap?: number, opts?: GridOpts): SVGPathElement

/**
 * 生成网格路径
 * @param width 宽度
 * @param height 高度
 * @param gap 间隔
 * @param needHorizontal 需要水平线 默认 true
 * @param needVertical 需要垂直线 默认 true
 * @returns svg path 元素的路径 d
 */
export declare function genGridPath(width?: number, height?: number, gap?: number, needHorizontal?: boolean, needVertical?: boolean): string

/** 生成 svg 文字数组 */
export declare function genTextArr(width?: number, height?: number, gap?: number, opts?: FontOpts): SVGTextElement[]
```

## 运行测试页面

```bash
# 安装依赖
pnpm install

# 启动测试页面
pnpm test
```

访问 `http://localhost:5173` 即可查看所有测试页面。

## 项目结构

```
packages/
├── jl-cvs/           # 主要组件库
└── test/             # 测试页面
    └── src/
        └── views/    # 所有测试页面
```

## 测试页面目录

## 🌊 水波纹效果 (WaterRipple)

**访问路径**: `/waterRipple`
**文件位置**: `packages/test/src/views/waterRipple/index.tsx`

![水波纹效果预览](./docs/images/water-ripple.png)

**功能特性**:
- Canvas 水波纹动画效果
- 支持多种配置参数调整
- 实时参数控制面板
- 多种预设效果模板
- 自定义颜色和动画强度

**主要配置项**:
- 画布尺寸 (width/height)
- 波纹中心偏移 (xOffset/yOffset)
- 线条宽度和样式
- 波纹圈数和动画强度
- 自定义描边颜色

## 🎨 图像编辑画板 (NoteBoard)

**访问路径**: `/noteBoard`
**文件位置**: `packages/test/src/views/noteBoard/index.tsx`

![图像编辑画板预览](./docs/images/note-board.png)

**功能特性**:
- 功能完整的 Canvas 画板组件
- 多种绘图模式：绘制、擦除、拖拽、图形绘制
- 支持撤销/重做操作
- 图片上传和背景设置
- 分层导出功能
- 画笔样式自定义

**绘图模式**:
- ✏️ 绘制：自由绘制线条
- 🧽 擦除：擦除已绘制内容
- ✋ 拖拽：拖拽移动画布
- ⬜ 矩形：绘制矩形图形
- ⭕ 圆形：绘制圆形图形
- ➡️ 箭头：绘制箭头图形

## 🎆 烟花效果 (Firework)

**访问路径**: `/firework`
**文件位置**: `packages/test/src/views/firework/index.tsx`

![烟花效果预览](./docs/images/firework.png)

**功能特性**:
- 两种烟花类型：经典烟花和二段爆炸烟花
- 多种颜色主题预设
- 实时参数调整
- 自动播放和手动控制
- 丰富的视觉效果

**烟花类型**:
- 🎆 经典烟花：传统的烟花爆炸效果
- 💥 二段爆炸烟花：更复杂的多层爆炸效果

## ⭐ 星空场景 (StarField)

**访问路径**: `/starField`
**文件位置**: `packages/test/src/views/starField/index.tsx`

![星空场景预览](./docs/images/star-field.png)

**功能特性**:
- 动态星空背景效果
- 星星闪烁和移动动画
- 多种颜色主题
- 可调节星星数量、大小、速度
- 自定义背景颜色

**配置选项**:
- 星星数量和尺寸范围
- 运动速度和闪烁频率
- 多种颜色主题搭配
- 背景颜色自定义

## 🎯 刮刮卡效果 (Scratch)

**访问路径**: `/scratch`
**文件位置**: `packages/test/src/views/scratch/index.tsx`

![刮刮卡效果预览](./docs/images/scratch.png)

**功能特性**:
- 真实的刮奖体验
- 实时进度检测
- 多种刮线样式
- 自动内容揭示
- 响应式设计

**技术特点**:
- 使用 Canvas destination-out 混合模式
- 实时计算刮开进度
- 支持触摸设备操作
- 自定义刮线样式和颜色

## 🌀 半调波浪 (HalftoneWave)

**访问路径**: `/halftoneWave`
**文件位置**: `packages/test/src/views/halftoneWave/index.tsx`

![半调波浪预览](./docs/images/halftone-wave.png)

**功能特性**:
- 半调风格的波浪动画
- 动态点阵效果
- 可调节波浪参数
- 多种视觉样式

## 🌍 球体地球仪 (GlobeSphere)

**访问路径**: `/globeSphere`
**文件位置**: `packages/test/src/views/globeSphere/index.tsx`

![球体地球仪预览](./docs/images/globe-sphere.png)

**功能特性**:
- 3D 球体旋转效果
- 地球仪样式渲染
- 交互式控制
- 平滑动画过渡

## 〰️ 波浪线条 (WavyLines)

**访问路径**: `/wavyLines`
**文件位置**: `packages/test/src/views/wavyLines/index.tsx`

![波浪线条预览](./docs/images/wavy-lines.png)

**功能特性**:
- 流动的波浪线条动画
- 多层波浪效果
- 颜色渐变支持
- 动画速度控制

## 📐 网格效果 (Grid)

**访问路径**: `/grid`
**文件位置**: `packages/test/src/views/grid/index.tsx`

![网格效果预览](./docs/images/grid.png)

**功能特性**:
- 动态网格背景
- 网格线条动画
- 可调节网格密度
- 多种样式选项

## 🖼️ 图像淡化 (ImgToFade)

**访问路径**: `/imgToFade`
**文件位置**: `packages/test/src/views/imgToFade/index.tsx`

![图像淡化预览](./docs/images/img-to-fade.png)

**功能特性**:
- 图像渐变淡化效果
- 多种淡化模式
- 实时预览
- 自定义淡化参数

## 📝 图像转文字 (ImgToTxt)

**访问路径**: `/imgToTxt`
**文件位置**: `packages/test/src/views/imgToTxt/index.tsx`

![图像转文字预览](./docs/images/img-to-txt.png)

**功能特性**:
- 将图像转换为 ASCII 字符
- 多种字符集选择
- 可调节转换精度
- 实时转换预览

## 🔢 科技数字 (TechNum)

**访问路径**: `/techNum`
**文件位置**: `packages/test/src/views/techNum/index.tsx`

![科技数字预览](./docs/images/tech-num.png)

**功能特性**:
- 科技风格数字显示
- 数字滚动动画
- LED 样式效果
- 自定义数字格式
