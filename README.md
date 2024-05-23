# 介绍
*Canvas* 的各种令人惊叹效果，以及辅助工具

支持 `ESM` | `iife`

**iife** 模式下，全局导出一个 `_jlCvs` 对象


## 安装
```bash
npm i @jl-org/cvs
```

### 所有配置都有中文的文档注释

## 全部函数
- [文本绘制 (图片 | 视频 | 文字)](#文本绘制-图片--视频--文字)
- [放烟花](#放烟花)
- [图片灰飞烟灭效果](#图片灰飞烟灭效果)
- [签名画板](#签名画板)
- [拖拽截图](#拖拽区域截图)
- [刮刮乐](#刮刮乐)
- [黑客科技数字墙](#黑客科技数字墙)
- [图像处理](#图像处理)
- [辅助函数](#canvas-辅助函数)
- [颜色处理](#颜色处理)
- [svg](#svg)


## 文本绘制 (图片 | 视频 | 文字)
```ts
import { imgToTxt } from '@/txtToImg'

const replaceText = '6';
/** 绘制文字 */
(function () {
    const cvs = document.createElement('canvas')
    document.body.appendChild(cvs)

    imgToTxt({
        canvas: cvs,
        opts: {
            txt: '哎呀你干嘛',
            txtStyle: {
                family: '楷体',
            }
        },
        replaceText,
    })
})();

/** 绘制图片 */
(function () {
    const cvs = document.createElement('canvas')
    document.body.appendChild(cvs)

    imgToTxt({
        canvas: cvs,
        gap: 8,
        isGray: false,
        opts: {
            img: './assets/ji_ni_tai_mei.png',
            height: 500,
        },
        replaceText
    })

})();

/** 绘制视频 */
(function () {
    const cvs = document.createElement('canvas')
    document.body.appendChild(cvs)

    imgToTxt({
        canvas: cvs,
        gap: 10,
        isGray: false,
        opts: {
            video: './assets/ji_ni_tai_mei.mp4',
            height: 500,
        },
        replaceText
    })

})()
```

**类型**
```ts
/**
 * 用文本来绘制图片或视频
 */
export declare function imgToTxt(options: TxtImgOpt): Promise<{
    start(): void;
    stop(): void;
}>;

export type TxtImgOpt = {
    canvas: HTMLCanvasElement;
    /** 用什么文本填充绘制区域 */
    replaceText?: string;
    /** 间隙，如果设置的太小，将耗费大量性能 */
    gap?: number;
    opts: {
        img?: HTMLImageElement | string;
        video?: HTMLVideoElement | string;
        txtStyle?: {
            family?: string;
            size?: number;
            color?: string;
        };
        /** 绘制的文本内容 */
        txt?: string;
        width?: number;
        height?: number;
    };
    /** 是否动态，视频默认动态 */
    isDynamic?: boolean;
    /** 开启灰度 */
    isGray?: boolean;
};
```


## 放烟花
```ts
/** demo */
import { createFirework } from '@jl-org/cvs'

const cvs = document.createElement('canvas')
document.body.appendChild(cvs);

/** 可以传递配置项 */
(window as any).cancel = createFirework(cvs, /** FireworkOpts */)

/** 可选配置项 */
export type FireworkOpts = {
    width?: number
    height?: number
    /** 
     * 烟花出现的范围，默认 50  
     * **这个 y 轴和 DOM 的 y 轴相反**  
     * 即高度以外 50 到可见范围内随机  
     */
    yRange?: number,
    /** 运动速度，默认 2.5 */
    speed?: number
    /** 烟花小球半径，默认 6 */
    r?: number
    /** 烟花小球数量，默认 150 */
    ballCount?: number
    /** 烟花间隔时间，默认 500 ms */
    gapTime?: number
    /** 同时存在最大的烟花数量（超过则爆炸）默认 2 */
    maxCount?: number
    /** 
     * 烟花的颜色，注意不是爆炸后小球的颜色  
     * 需要接收一个透明度，返回一个 rgba 颜色
     */
    getFireworkColor?: (opacity: number) => string
    /** 烟花爆炸小球的颜色，默认随机 */
    getBoomColor?: () => string
}
```


## 图片灰飞烟灭效果
```vue
<template>
    <div class="imgToFade-container" ref="refParent">
        <canvas ref="refCanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { getWinHeight, getWinWidth, imgToFade } from '@jl-org/cvs'


const refCanvas = ref<HTMLCanvasElement>()
onMounted(async () => {
    imgToFade(refCanvas.value!, {
        src: 'yourSrc',
        width: getWinWidth(),
        height: getWinHeight()
    })
})
</script>
```


## 签名画板
```ts
import { NoteBoard } from '@jl-org/cvs'


const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const board = new NoteBoard({
    canvas,
    bgColor: '#fff',
    storkeColor: '#409eff'
    // ...
})


genBtn('截图', async () => {
    const src = await board.shotImg('base64')
    const imgEl = new Image()
    imgEl.src = src
    document.body.appendChild(imgEl)
})
genBtn('清空', () => {
    board.clear()
})


function genBtn(txt: string, cb: Function) {
    const btn = document.createElement('button')
    btn.innerText = txt

    btn.onclick = cb as any
    document.body.appendChild(btn)
}

/** 完整配置 */
export type NoteBoardOptions = {
    /** 背景色，默认白色 */
    bgColor?: string;
    /** 边框颜色，默认黑色 */
    borderColor?: string;
    /** 宽度，默认 800 */
    width?: number;
    /** 高度，默认 600 */
    height?: number;
    /** 画笔粗细，默认 1 */
    storkeWidth?: number;
    /** 画笔颜色，默认黑色 */
    storkeColor?: string;
}
```


## 拖拽区域截图
```ts
/**
 * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
 * 或者创建实例后调用 `setImg` 设置图片
 */
import { ShotImg } from '@/ShotImg'
import { blobToBase64, downloadByData, getImg } from '@jl-org/tool'
import { genBtn } from './tools'


const input = document.createElement('input')
input.type = 'file'
document.body.appendChild(input)
document.body.appendChild(document.createElement('canvas'))

let si: ShotImg

input.onchange = async () => {
    const file = input.files[0]
    if (!file) return

    const base64 = await blobToBase64(file)
    const img = await getImg(base64) as HTMLImageElement

    /**
     * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
     * 或者创建实例后调用 `setImg` 设置图片
     */
    si = new ShotImg(document.querySelector('canvas'), img)
}

genBtn('下载图片', async () => {

    /** 
     * 获取图片的 blob 或者 base64
     * 如果图片设置过大小，可能会导致截图区域不准确
     */
    const blob = await si.getShotImg('blob')
    downloadByData(blob, 'shot.png')
})


function genBtn(txt: string, cb: Function) {
    const btn = document.createElement('button')
    btn.innerText = txt

    btn.onclick = cb as any
    document.body.appendChild(btn)
}


/** ============================= 类型 ============================= */
export declare class ShotImg {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /** 手指起始位置 */
    stPos: Point;
    /** 手指结束位置 */
    endPos: Point;
    /** 拖动截图区域大小 */
    shotWidth: number;
    /** 拖动截图区域大小 */
    shotHeight: number;
    /** 填充图片宽度 也是`canvas`宽度 */
    width: number;
    /** 填充图片高度 也是`canvas`高度 */
    height: number;
    /** 你传递的图片 */
    img: HTMLImageElement | undefined;
    /** 蒙层透明度 */
    opacity: number;

    /**
     * 把你传入的 Canvas 变成一个可拖动的截图区域
     * 传入一个 Canvas 元素，图片可选，你可以在后续调用 `setImg` 方法设置图片
     * @param cvs Canvas 元素
     * @param img 图片
     * @param opacity 蒙层透明度
     * @example new ShotImg(document.querySelector('canvas'), img)
     */
    constructor(cvs: HTMLCanvasElement, img?: HTMLImageElement, opacity?: number);

    /** 设置 Canvas 图片 */
    setImg(img: HTMLImageElement): void;

    /**
     * 获取选中区域的图片
     * 如果图片设置过大小，可能会导致截图区域不准确
     * @param resType 返回类型，默认 `base64`
     * @param mimeType 图片 MIME 类型
     * @param quality 图片质量
     */
    getShotImg<T extends TransferType>(resType?: T, mimeType?: string, quality?: number): HandleImgReturn<T> | void;
}

export type Point = [number, number];
```


## 刮刮乐
```vue
<template>
    <div class="scratch-container" ref="refParent">
        <div class="ticket">
            <span class="label">一等奖</span>
        </div>
        <canvas ref="refCvs"></canvas>
    </div>
</template>

<script setup lang="ts">
import { createScratch } from '@jl-org/cvs'


const refCvs = ref(),
    refParent = ref<HTMLElement>()

onMounted(() => {
    const { width, height } = refParent.value?.getBoundingClientRect() || {}
    createScratch(refCvs.value, {
        width,
        height,
        // ...
    })
})

</script>

<style lang="scss" scoped>
.scratch-container {
    position: relative;
    width: 300px;
    height: 250px;
    background-color: #fcc;
}

.ticket {
    display: flex;
    position: absolute;
    inset: 0;
}

.label {
    margin: auto;
    color: #fff;
    font-size: 66px;
    user-select: none;
}
</style>
```


## 黑客科技数字墙
```vue
<template>
    <div class="techNum-container" ref="refParent">
        <canvas ref="refCanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { getWinHeight, getWinWidth, createTechNum } from '@jl-org/cvs'


const refCanvas = ref<HTMLCanvasElement>()
onMounted(() => {
    const { start, stop, setSize } = createTechNum(refCanvas.value!, /** opts */)
    start()

    window.addEventListener('resize', () => {
        setSize(getWinWidth(), getWinHeight())
    })
})
</script>
```


## 图像处理
```ts
/**
 * 截取图片的一部分，返回 base64 | blob
 * @param img 图片
 * @param opts 配置
 * @param resType 需要返回的文件格式，默认 `base64`
 */
export declare function cutImg<T extends TransferType = 'base64'>(img: HTMLImageElement, opts?: CutImgOpts, resType?: T): HandleImgReturn<T>;

/**
 * 压缩图片
 * @param img 图片
 * @param resType 需要返回的文件格式，默认 `base64`
 * @param quality 压缩质量，默认 0.5
 * @param mimeType 图片类型，默认 `image/webp`。`image/jpeg | image/webp` 才能压缩，
 */
export declare function compressImg<T extends TransferType = 'base64'>(img: HTMLImageElement, resType?: T, quality?: number, mimeType?: 'image/jpeg' | 'image/webp'): HandleImgReturn<T>;

/**
 * 图片噪点化
 * @param img 图片
 * @param level 噪点等级，默认 100
 */
export declare function imgToNoise(img: HTMLImageElement, level?: number): HTMLCanvasElement;

/**
 * 添加水印
 * 返回 base64 和图片大小，你可以用 CSS 设置上
 * @example
 * background-image: url(${base64});
 * background-size: ${size}px ${size}px;
 */
export declare function waterMark({ fontSize, gap, text, color, rotate }: WaterMarkOpts): {
    base64: string;
    size: number;
};

/**
 * 把 canvas 上的图像转成 base64 | blob
 * @param cvs canvas
 * @param resType 需要返回的文件格式，默认 `base64`
 * @param type 图片的 MIME 格式
 * @param quality 压缩质量
 */
export declare function getCvsImg<T extends TransferType = 'base64'>(cvs: HTMLCanvasElement, resType?: T, mimeType?: string, quality?: number): HandleImgReturn<T>;

/** Blob 转 Base64 */
export declare function blobToBase64(blob: Blob): Promise<string>;

/** ======================= Type ========================= */
export type HandleImgReturn<T extends TransferType> = T extends 'blob' ? Promise<Blob> : Promise<string>;
export type WaterMarkOpts = {
    text?: string;
    fontSize?: number;
    gap?: number;
    color?: string;
    rotate?: number;
};
export type CvsToDataOpts = {
    type?: string;
    quality?: number;
};
export type CutImgOpts = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    /** 图片的 MIME 格式 */
    mimeType?: string;
    /** 图像质量，取值范围 0 ~ 1 */
    quality?: number;
};
```


## Canvas 辅助函数
```ts
/**
 * 根据半径和角度获取坐标
 * @param r 半径
 * @param deg 角度
 */
export declare function calcCoord(r: number, deg: number): number[];

/** 设置元素的 crossOrigin 为 anonymous */
export declare function setElCrossOrigin(el: HTMLElement): void;

/**
 * 创建一个指定宽高的画布
 * @param width 画布的宽度
 * @param height 画布的高度
 * @param options 上下文配置
 * @returns 包含画布和上下文的对象
 */
export declare function createCvs(width?: number, height?: number, options?: CanvasRenderingContext2DSettings): {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};

/**
 * 取出`canvas`用一维数组描述的颜色中，某个坐标的`RGBA`数组
 * 注意坐标从 0 开始
 * @param x 宽度中的第几列
 * @param y 高度中的第几行
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 * @returns `RGBA`数组
 */
export declare function getPixel(x: number, y: number, imgData: ImageData['data'], width: number): Pixel;

/**
 * 美化 ctx.getImageData.data 属性
 * 每一行为一个大数组，每个像素点为一个小数组
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 */
export declare function parseImgData(imgData: ImageData['data'], width: number, height: number): number[][][];

/** 给 canvas 某个像素点填充颜色的函数 */
export declare function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void;

/**
 * 设置字体，默认居中
 */
export declare function setFont(ctx: CanvasRenderingContext2D, { size, family, weight, textAlign, textBaseline, color }: CtxFontOpt): void;

/** 清除 canvas 整个画布的内容 */
export declare function clearAllCvs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;

/**
 * 获取随机范围整型数值 不包含最大值
 */
export declare function getRandomNum(min: number, max: number): number;

/**
 * 解决 Number.toFixed 计算错误
 * @example
 * 1.335.toFixed(2) => '1.33'
 * numFixed(1.335) => 1.34
 *
 * @param num 数值
 * @param precision 精度 默认 2
 */
export declare function numFixed(num: number, precision?: number): number;

/**
 * 判断图片的 src 是否可用，可用则返回图片
 * @param src 图片
 */
export declare const getImg: (src: string) => Promise<false | HTMLImageElement>;
```


## 颜色处理
```ts
/** 获取十六进制随机颜色 */
export declare function getColor(): string;
/** 随机十六进制颜色数组 */
export declare function getColorArr(size: number): string[];

/**
### 把十六进制颜色转成 原始长度的颜色
  - #000 => #000000
  - #000f => #000000ff
 */
export declare function hexColorToRaw(color: string): string;

/** 十六进制 转 RGB */
export declare function hexToRGB(color: string): string;

/** rgb转十六进制 */
export declare function rgbToHex(color: string): string;

/**
 * 淡化颜色透明度 支持`rgb`和十六进制
 * @param color rgba(0, 239, 255, 1)
 * @param strength 淡化的强度
 * @returns 返回 RGBA 类似如下格式的颜色 `rgba(0, 0, 0, 0.1)`
 */
export declare function lightenColor(color: string, strength?: number): string;

/**
 * 颜色添加透明度 支持`rgb`和十六进制
 * @param color 颜色
 * @param opacity 透明度
 * @returns 返回十六进制 类似如下格式的颜色 `#ffffff11`
 */
export declare function colorAddOpacity(color: string, opacity?: number): string;
```


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
    svg: SVGSVGElement;
    g: SVGGElement;
};

/** 生成棋盘的 path 和 text 元素 */
export declare function genBoard(width?: number, height?: number, gap?: number, opts?: Opts): SVGGElement;

/** 生成 svg */
export declare function genSvg(viewBox?: string, width?: number, height?: number): SVGSVGElement;

/** 生成 svg path 网格 */
export declare function genGrid(width?: number, height?: number, gap?: number, opts?: GridOpts): SVGPathElement;

/**
 * 生成网格路径
 * @param width 宽度
 * @param height 高度
 * @param gap 间隔
 * @param needHorizontal 需要水平线 默认 true
 * @param needVertical 需要垂直线 默认 true
 * @returns svg path 元素的路径 d
 */
export declare function genGridPath(width?: number, height?: number, gap?: number, needHorizontal?: boolean, needVertical?: boolean): string;

/** 生成 svg 文字数组 */
export declare function genTextArr(width?: number, height?: number, gap?: number, opts?: FontOpts): SVGTextElement[];
```
