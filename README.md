<div align="center">
  <h1>jl-cvs</h1>

<p><strong>Canvas 特效与图像工具库</strong></p>

<p>
    烟花、水波纹、星空等视觉效果，配合截图、抠图、视频帧提取等实用工具，原生 Canvas 实现，不依赖任何 UI 框架
  </p>

<p>
    <a href="https://jl-cvs.pages.dev"><strong>在线体验</strong></a>
    ·
    <a href="https://github.com/beixiyo/jl-cvs">GitHub</a>
  </p>

<p>
    <img src="https://img.shields.io/npm/v/%40jl-org/cvs?logo=npm" alt="npm" />
    <img src="https://img.shields.io/npm/dm/%40jl-org/cvs?logo=npm" alt="downloads" />
    <img src="https://img.shields.io/npm/l/%40jl-org/cvs" alt="license" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Oxc-333333?logo=oxc&logoColor=white" alt="Oxc" />
  </p>
</div>

[English](./README.en.md) | 中文

## 效果预览

<div align="center">
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/firework.webp" width="240" alt="烟花" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/starField.webp" width="240" alt="星空" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/waterRipple.webp" width="240" alt="水波纹" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/noteBoard.webp" width="240" alt="无限画布" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/cutoutImg.webp" width="240" alt="智能抠图" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/halftoneWave.gif" width="240" alt="半调波浪" />
</div>

更多效果请访问[在线演示](https://jl-cvs.pages.dev)

## 安装

```bash
npm i @jl-org/cvs
```

### 快速上手

所有动画类共享同一套使用方式：构造时传入 `canvas`（可选），实例暴露 `canvas`、`stop`、`dispose` 等成员

```tsx
import { WaterRipple } from '@jl-org/cvs'

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ripple = new WaterRipple({ canvas: ref.current!, circleCount: 10 })
    return () => ripple.dispose()
  }, [])

  return <canvas ref={ ref } />
}
```

图像工具为独立函数，直接调用：

```ts
import { captureVideoFrame } from '@jl-org/cvs'

/** 批量截取 1s、2s、8s 处的视频帧 */
const frames = await captureVideoFrame(file, [1, 2, 8], 'base64', { quality: 0.6 })
```

## 特性

- **框架无关**：纯 TypeScript + 原生 Canvas API，React、Vue、原生项目均可直接使用
- **效果与工具并重**：视觉动画、图像处理、像素算法、视频截帧、画板交互，一个包覆盖
- **Worker 加速**：视频截帧优先走 ImageCapture + Worker 线程，不阻塞主线程，旧浏览器自动降级
- **完整类型**：全部 API 附带 TypeScript 类型与中文 JSDoc，IDE 内即可查阅用法
- **演示站**：所有效果均配可交互演示页，参数实时可调，支持亮暗主题

## 效果一览

与[在线演示](https://jl-cvs.pages.dev)一致，按场景分组：

| 分类       | 效果                                                       | 说明                                      | 源码                                                                                       |
| ---------- | ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| 场景与粒子 | [水波纹](https://jl-cvs.pages.dev/waterRipple)             | 鼠标交互的同心涟漪，线宽与速度可调        | [src/views/waterRipple](./packages/playground/src/views/waterRipple/index.tsx)             |
|            | [星际穿梭](https://jl-cvs.pages.dev/starField)             | 透视星域中持续穿行的粒子流                | [src/views/starField](./packages/playground/src/views/starField/index.tsx)                 |
|            | [烟花](https://jl-cvs.pages.dev/firework)                  | 经典升空爆炸与二段连锁爆炸两种物理模拟    | [src/views/firework](./packages/playground/src/views/firework/index.tsx)                   |
|            | [半调波浪](https://jl-cvs.pages.dev/halftoneWave)          | 半调网点沿波场起伏，印刷质感              | [src/views/halftoneWave](./packages/playground/src/views/halftoneWave/index.tsx)           |
|            | [球体地球仪](https://jl-cvs.pages.dev/globeSphere)         | 点阵球体自转，支持拖拽与光照              | [src/views/globeSphere](./packages/playground/src/views/globeSphere/index.tsx)             |
|            | [波浪线条](https://jl-cvs.pages.dev/wavyLines)             | 多组正弦线条叠加流动，适合背景装饰        | [src/views/wavyLines](./packages/playground/src/views/wavyLines/index.tsx)                 |
|            | [网格](https://jl-cvs.pages.dev/grid)                      | 普通网格与点阵网格，间距颜色可调          | [src/views/grid](./packages/playground/src/views/grid/index.tsx)                           |
|            | [科技数字](https://jl-cvs.pages.dev/techNum)               | 黑客帝国风格数字雨，字符与颜色可定制      | [src/views/techNum](./packages/playground/src/views/techNum/index.tsx)                     |
| 图像工具   | [智能抠图](https://jl-cvs.pages.dev/cutoutImg)             | 画笔涂抹标记前景背景，一键分离主体        | [src/views/cutoutImg](./packages/playground/src/views/cutoutImg/index.tsx)                 |
|            | [智能选区](https://jl-cvs.pages.dev/smartSelection)        | 自动识别区域轮廓，点击即可选中蒙版        | [src/views/smartSelection](./packages/playground/src/views/smartSelection/index.tsx)       |
|            | [图像转字符](https://jl-cvs.pages.dev/imgToTxt)            | 图像或视频帧转 ASCII 字符画               | [src/views/imgToTxt](./packages/playground/src/views/imgToTxt/index.tsx)                   |
|            | [灰飞烟灭](https://jl-cvs.pages.dev/imgToFade)             | 图像粒子化后随风飘散的退场动画            | [src/views/imgToFade](./packages/playground/src/views/imgToFade/index.tsx)                 |
|            | [边缘检测](https://jl-cvs.pages.dev/imgEdgeDetection)      | Sobel 算子提取边缘，阈值实时可调          | [src/views/imgEdgeDetection](./packages/playground/src/views/imgEdgeDetection/index.tsx)   |
|            | [图像处理](https://jl-cvs.pages.dev/imgProcessing)         | 噪点、水印等常用像素级图像处理            | [src/views/imgProcessing](./packages/playground/src/views/imgProcessing/index.tsx)         |
|            | [像素数据操作](https://jl-cvs.pages.dev/imgDataProcessing) | 灰度、对比度、二值化与颜色替换            | [src/views/imgDataProcessing](./packages/playground/src/views/imgDataProcessing/index.tsx) |
|            | [截图取帧](https://jl-cvs.pages.dev/shotImg)               | 框选截图，精确到像素                      | [src/views/shotImg](./packages/playground/src/views/shotImg/index.tsx)                     |
|            | [视频帧提取](https://jl-cvs.pages.dev/captureVideoFrame)   | 时间轴定位，批量截取与导出                | [src/views/captureVideoFrame](./packages/playground/src/views/captureVideoFrame/index.tsx) |
| 互动玩法   | [无限画布](https://jl-cvs.pages.dev/noteBoard)             | 世界坐标系 + 视口变换的画板，支持缩放平移 | [src/views/noteBoard](./packages/playground/src/views/noteBoard/index.tsx)                 |
|            | [刮刮卡](https://jl-cvs.pages.dev/scratch)                 | 刮开显奖交互，可感知刮开比例              | [src/views/scratch](./packages/playground/src/views/scratch/index.tsx)                     |

## API 概览

| 分类           | 导出                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 动画与视觉     | `WaterRipple` `StarField` `Grid` `DotGrid` `HalftoneWave` `WavyLines` `GlobeSphere` `NoteBoard` `NoteBoardWithBase64` `ShotImg` `createFirework` `createFirework2` `createTechNum` `createScratch` `imgToFade` `imgToTxt` |
| 图像处理       | `imgToNoise` `waterMark` `composeImg` `cutImg` `compressImg` `getCvsImg`                                                                                                                                                  |
| 抠图与边缘     | `cutoutImg` `cutoutImgToMask` `cutoutImgSmoothed` `getImgEdge`                                                                                                                                                            |
| 视频截帧       | `captureVideoFrame`（ImageCapture + Worker 优先，Canvas 自动降级）                                                                                                                                                        |
| ImageData 算法 | `adaptiveGrayscale` `enhanceContrast` `adaptiveBinarize` `changeImgColor` `getGrayscaleArray`                                                                                                                             |
| 导出与转换     | `downloadByData` `downloadByUrl` `blobToBase64` `base64ToBlob` `urlToBlob` `getImg`                                                                                                                                       |
| Canvas 基础    | `createCvs` `applyHiDPI` `setFont` `clearAllCvs` `getDPR` `getImgData` `eachPixel` `scaleImgData`                                                                                                                         |
| 颜色           | `getColorInfo` `hexToRGB` `rgbToHex` `lightenColor` `colorAddOpacity`                                                                                                                                                     |
| 通用工具       | `debounce` `throttle` `deepClone` `UnRedoLinkedList`                                                                                                                                                                      |
| SVG            | `genSvgBoard` `genBoard` `genGrid` `genGridPath` `genTextArr`                                                                                                                                                             |

参数与用法详见各 API 的类型声明与中文 JSDoc

## 本地开发

```bash
git clone https://github.com/beixiyo/jl-cvs.git
cd jl-cvs
pnpm install
```

常用命令：

```bash
pnpm build        # 构建核心包 @jl-org/cvs
pnpm build:dev    # 构建开发模式（未压缩）
pnpm test         # 启动演示站
pnpm lint         # oxlint 检查双包
pnpm format       # dprint 格式化
```

仓库结构：

```text
jl-cvs/
├── packages/
│   ├── jl-cvs/     # 核心库 @jl-org/cvs，发布到 npm
│   └── playground/ # 演示站，React 19 + Tailwind CSS 4 + motion
└── oxlint.config.ts
```

画廊预览图等大体积资源不纳入仓库，统一托管在 [GitHub Release](https://github.com/beixiyo/jl-cvs/releases/tag/assets)；会被 canvas 处理的演示功能资源（示例图、演示视频）随仓库打包以保证 CORS 可靠

演示站技术栈：React 19 + Vite 8 + Tailwind CSS 4（语义化 Token 双主题）+ motion，路由由 `@jl-org/vite-auto-route` 按目录生成，组件与 Hooks 复用自 [react-tool](https://github.com/beixiyo/react-tool)
