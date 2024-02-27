# 介绍
*Canvas* 的各种令人惊叹效果，以及辅助工具

支持 `ESM` | `iife`

**iife** 模式下，全局导出一个 `_jlCvs` 对象


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
