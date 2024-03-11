# 介绍
*Canvas* 的各种令人惊叹效果，以及辅助工具

支持 `ESM` | `iife`

**iife** 模式下，全局导出一个 `_jlCvs` 对象


## 安装
```bash
npm i @jl-org/cvs
```

## 全部函数
- [文本绘制 (图片 | 视频 | 文字)](#文本绘制-图片--视频--文字)
- [拖拽截图](#拖拽区域截图)
- [图像处理](#图像处理)
- [辅助函数](#canvas-辅助函数)
- [svg](#svg)


## 文本绘制 (图片 | 视频 | 文字)

示例如下，所有配置都有文档注释
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
export declare function imgToTxt(options: TxtImgOpt): Promise<void | {
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


## 拖拽区域截图
```ts
/**
 * 示例如下，您只需传入 Canvas 和 一张图片 即可使用
 * 或者创建实例后调用 `setImg` 设置图片
 */
const si = new ShotImg(document.querySelector('canvas'), img)

/** 
 * 获取图片的 blob 或者 base64
 * 如果图片设置过大小，可能会导致截图区域不准确
 */
const blob = await si.getShotImg('blob')

/** 接着你可以用我另一个包下载图片 */
import { downloadByData } from '@jl-org/tool'
downloadByData(blob, 'shot.png')


/** ============================= 类型 ============================= */
export declare class ShotImg {
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
     */
    getShotImg(type?: 'blob' | 'base64'): Promise<string | void | Blob>;
}
```


## 图像处理
```ts
/**
 * 截取图片的一部分，返回 base64 | blob
 */
export declare function cutImg<T extends TransferType>(img: HTMLImageElement, resType: T, x?: number, y?: number, width?: number, height?: number, opts?: {
    type?: ImgMIME | string;
    quality?: number;
}): HandleImgReturn<T>;

/**
 * 压缩图片
 * @param img 图片
 * @param resType 需要返回的文件格式
 * @param quality 压缩质量，默认 0.5
 * @param mimeType 图片类型，默认 `image/webp`。`image/jpeg | image/webp` 才能压缩，
 * @returns base64 | blob
 */
export declare function compressImg<T extends TransferType>(img: HTMLImageElement, resType: T, quality?: number, mimeType?: 'image/jpeg' | 'image/webp'): HandleImgReturn<T>;

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
```


## Canvas 辅助函数
```ts
/**
 * 根据半径和角度获取坐标
 * @param r 半径
 * @param deg 角度
 */
export declare function calcCoord(r: number, deg: number): number[];

/**
 * 创建一个指定宽高的画布
 * @param width 画布的宽度
 * @param height 画布的高度
 * @returns 包含画布和上下文的对象
 */
export declare function createCvs(width: number, height: number): {
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

/**
 * 获取随机范围整型数值 不包含最大值
 */
export declare function getRandomNum(min: number, max: number): number;

/**
 * 判断图片的 src 是否可用，可用则返回图片
 * @param src 图片
 */
export declare const getImg: (src: string) => Promise<false | HTMLImageElement>;
```


## 颜色
```ts
/** 获取十六进制随机颜色 */
export declare function getColor(): string;

/** 随机十六进制颜色数组 */
export declare function getColorArr(size: number): string[];
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
