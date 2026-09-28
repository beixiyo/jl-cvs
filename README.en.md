<div align="center">
  <h1>jl-cvs</h1>

<p><strong>Canvas Effects & Image Toolkit</strong></p>

<p>
    Visual effects like fireworks, water ripples and starfields, plus practical tools for screenshots, image cutout and video frame extraction. Built on raw Canvas, framework-agnostic.
  </p>

<p>
    <a href="https://jl-cvs.pages.dev"><strong>Live Demo</strong></a>
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

English | [中文](./README.md)

## Preview

<div align="center">
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/firework.webp" width="240" alt="Firework" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/starField.webp" width="240" alt="Starfield" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/waterRipple.webp" width="240" alt="Water Ripple" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/noteBoard.webp" width="240" alt="Infinite Canvas" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/cutoutImg.webp" width="240" alt="Cutout" />
  <img src="https://github.com/beixiyo/jl-cvs/releases/download/assets/halftoneWave.gif" width="240" alt="Halftone Wave" />
</div>

See the [live demo](https://jl-cvs.pages.dev) for more.

## Installation

```bash
npm i @jl-org/cvs
```

### Quick Start

All animation classes share the same usage: pass an optional `canvas` to the constructor; the instance exposes `canvas`, `stop`, `dispose` and more.

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

Image tools are standalone functions:

```ts
import { captureVideoFrame } from '@jl-org/cvs'

/** Capture frames at 1s, 2s and 8s */
const frames = await captureVideoFrame(file, [1, 2, 8], 'base64', { quality: 0.6 })
```

## Features

- **Framework-agnostic**: pure TypeScript + raw Canvas API, works in React, Vue and vanilla projects
- **Effects and tools in one package**: visual animations, image processing, pixel algorithms, video frame extraction and interactive boards
- **Worker-accelerated**: frame extraction prefers ImageCapture + Worker threads with automatic fallback on older browsers
- **Fully typed**: every API ships with TypeScript types and Chinese JSDoc
- **Interactive demo site**: every effect has a live playground with adjustable parameters, light and dark themes

## Effects

Grouped the same way as the [live demo](https://jl-cvs.pages.dev):

| Category           | Effect                                                         | Description                                                  | Source                                                                                     |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Scenes & Particles | [Water Ripple](https://jl-cvs.pages.dev/waterRipple)           | Interactive concentric ripples with adjustable speed         | [src/views/waterRipple](./packages/playground/src/views/waterRipple/index.tsx)             |
|                    | [Star Field](https://jl-cvs.pages.dev/starField)               | Particle stream flying through a perspective starfield       | [src/views/starField](./packages/playground/src/views/starField/index.tsx)                 |
|                    | [Firework](https://jl-cvs.pages.dev/firework)                  | Classic launch-and-burst and two-stage chain explosions      | [src/views/firework](./packages/playground/src/views/firework/index.tsx)                   |
|                    | [Halftone Wave](https://jl-cvs.pages.dev/halftoneWave)         | Halftone dots rolling along a wave field                     | [src/views/halftoneWave](./packages/playground/src/views/halftoneWave/index.tsx)           |
|                    | [Globe Sphere](https://jl-cvs.pages.dev/globeSphere)           | Rotating dot-matrix globe with drag and shading              | [src/views/globeSphere](./packages/playground/src/views/globeSphere/index.tsx)             |
|                    | [Wavy Lines](https://jl-cvs.pages.dev/wavyLines)               | Layered sine waves flowing together, great for backgrounds   | [src/views/wavyLines](./packages/playground/src/views/wavyLines/index.tsx)                 |
|                    | [Grid](https://jl-cvs.pages.dev/grid)                          | Line grid and dot grid with adjustable spacing               | [src/views/grid](./packages/playground/src/views/grid/index.tsx)                           |
|                    | [Tech Numbers](https://jl-cvs.pages.dev/techNum)               | Matrix-style digital rain with customizable glyphs           | [src/views/techNum](./packages/playground/src/views/techNum/index.tsx)                     |
| Image Tools        | [Cutout](https://jl-cvs.pages.dev/cutoutImg)                   | Brush foreground/background marks, split subject instantly   | [src/views/cutoutImg](./packages/playground/src/views/cutoutImg/index.tsx)                 |
|                    | [Smart Selection](https://jl-cvs.pages.dev/smartSelection)     | Auto region detection, click to select masks                 | [src/views/smartSelection](./packages/playground/src/views/smartSelection/index.tsx)       |
|                    | [Image to Text](https://jl-cvs.pages.dev/imgToTxt)             | Turn images or video frames into ASCII art                   | [src/views/imgToTxt](./packages/playground/src/views/imgToTxt/index.tsx)                   |
|                    | [Image Fade](https://jl-cvs.pages.dev/imgToFade)               | Particle dissolve exit animation                             | [src/views/imgToFade](./packages/playground/src/views/imgToFade/index.tsx)                 |
|                    | [Edge Detection](https://jl-cvs.pages.dev/imgEdgeDetection)    | Sobel operator with live threshold control                   | [src/views/imgEdgeDetection](./packages/playground/src/views/imgEdgeDetection/index.tsx)   |
|                    | [Image Processing](https://jl-cvs.pages.dev/imgProcessing)     | Common pixel-level processing: noise, watermark and more     | [src/views/imgProcessing](./packages/playground/src/views/imgProcessing/index.tsx)         |
|                    | [Pixel Data](https://jl-cvs.pages.dev/imgDataProcessing)       | Grayscale, contrast, binarization and color replacement      | [src/views/imgDataProcessing](./packages/playground/src/views/imgDataProcessing/index.tsx) |
|                    | [Screenshot](https://jl-cvs.pages.dev/shotImg)                 | Pixel-accurate region screenshot                             | [src/views/shotImg](./packages/playground/src/views/shotImg/index.tsx)                     |
|                    | [Frame Extraction](https://jl-cvs.pages.dev/captureVideoFrame) | Timeline seeking with batch capture and export               | [src/views/captureVideoFrame](./packages/playground/src/views/captureVideoFrame/index.tsx) |
| Interactive        | [Infinite Canvas](https://jl-cvs.pages.dev/noteBoard)          | World-coordinate board with viewport transform, zoom and pan | [src/views/noteBoard](./packages/playground/src/views/noteBoard/index.tsx)                 |
|                    | [Scratch Card](https://jl-cvs.pages.dev/scratch)               | Scratch-to-reveal interaction with progress tracking         | [src/views/scratch](./packages/playground/src/views/scratch/index.tsx)                     |

## API Overview

| Category             | Exports                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Animation & Visuals  | `WaterRipple` `StarField` `Grid` `DotGrid` `HalftoneWave` `WavyLines` `GlobeSphere` `NoteBoard` `NoteBoardWithBase64` `ShotImg` `createFirework` `createFirework2` `createTechNum` `createScratch` `imgToFade` `imgToTxt` |
| Image Processing     | `imgToNoise` `waterMark` `composeImg` `cutImg` `compressImg` `getCvsImg`                                                                                                                                                  |
| Cutout & Edges       | `cutoutImg` `cutoutImgToMask` `cutoutImgSmoothed` `getImgEdge`                                                                                                                                                            |
| Video Frames         | `captureVideoFrame` (ImageCapture + Worker first, Canvas fallback)                                                                                                                                                        |
| ImageData Algorithms | `adaptiveGrayscale` `enhanceContrast` `adaptiveBinarize` `changeImgColor` `getGrayscaleArray`                                                                                                                             |
| Export & Convert     | `downloadByData` `downloadByUrl` `blobToBase64` `base64ToBlob` `urlToBlob` `getImg`                                                                                                                                       |
| Canvas Basics        | `createCvs` `applyHiDPI` `setFont` `clearAllCvs` `getDPR` `getImgData` `eachPixel` `scaleImgData`                                                                                                                         |
| Color                | `getColorInfo` `hexToRGB` `rgbToHex` `lightenColor` `colorAddOpacity`                                                                                                                                                     |
| Utilities            | `debounce` `throttle` `deepClone` `UnRedoLinkedList`                                                                                                                                                                      |
| SVG                  | `genSvgBoard` `genBoard` `genGrid` `genGridPath` `genTextArr`                                                                                                                                                             |

See the TypeScript declarations and Chinese JSDoc for parameters and usage.

## Local Development

```bash
git clone https://github.com/beixiyo/jl-cvs.git
cd jl-cvs
pnpm install
```

Common scripts:

```bash
pnpm build        # Build the core package @jl-org/cvs
pnpm build:dev    # Build in development mode (unminified)
pnpm test         # Start the demo site
pnpm lint         # oxlint for both packages
pnpm format       # dprint formatting
```

Repository layout:

```text
jl-cvs/
├── packages/
│   ├── jl-cvs/     # Core library @jl-org/cvs, published to npm
│   └── playground/ # Demo site, React 19 + Tailwind CSS 4 + motion
└── oxlint.config.ts
```

Binary assets like previews live in a [GitHub Release](https://github.com/beixiyo/jl-cvs/releases/tag/assets) instead of the repository.

The demo site is built with React 19 + Vite 8 + Tailwind CSS 4 (semantic tokens, dual themes) + motion, routes generated from the file tree by `@jl-org/vite-auto-route`, with components and hooks reused from [react-tool](https://github.com/beixiyo/react-tool).
