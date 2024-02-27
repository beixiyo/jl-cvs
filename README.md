# 介绍
*Canvas* 的各种令人惊叹效果，以及辅助工具

支持 `ESM` | `iife`

**iife** 模式下，全局导出一个 `_jlCvs` 对象


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
 * 取出`canvas`用一维数组描述的颜色中 某个坐标的`RGBA`数组
 * 注意坐标从 0 开始
 * @param x 宽度中的第几列
 * @param y 高度中的第几行
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 * @returns `RGBA`数组
 */
export declare function getPixel(x: number, y: number, imgData: ImageData['data'], width: number): number[];

/**
 * 美化 ctx.getImageData.data 属性
 * 每一行为一个大数组，每个像素点为一个小数组
 * @param imgData ctx.getImageData 方法获取的 ImageData 对象的 data 属性
 * @param width 图像区域宽度
 */
export declare function parseImgData(imgData: ImageData['data'], width: number, height: number): number[][][];

/** 给 canvas 某个像素点填充颜色的函数 */
export declare function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void;
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

type PositionStr = 'top' | 'bottom' | 'left' | 'right';
type FontOpts = {
    /** 文字大小 默认 3 */
    fontSize?: number;
    fill?: string;
    /** 文字左偏移 默认 1.5 */
    offsetX?: number;
    /** 文字上偏移 默认 1.8 */
    offsetY?: number;
    /** 位置，默认 ['left', 'top'] */
    position?: PositionStr[];
};
type GridOpts = {
    stroke?: string;
    strokeWidth?: number;
    /** 需要水平线 默认 true */
    needHorizontal?: boolean;
    /** 需要垂直线 默认 true */
    needVertical?: boolean;
};
type Opts = {
    fontOpts?: FontOpts;
    gridOpts?: GridOpts;
};
```
