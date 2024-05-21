export type TechNumOpts = {
    width?: number
    height?: number
    /** 列宽，默认 20 */
    colWidth?: number
    /** 字体大小，默认 20 */
    fontSize?: number
    /** 字体 */
    font?: string
    /** 每次绘制时，遮罩的颜色，默认 rgba(12, 12, 12, .1) */
    maskColor?: string
    /** 0 ~ 1 的概率值，影响 y 轴数字间隔，默认 0.85 */
    gapRate?: number
    /** 绘制的字符串 */
    getStr?: () => string
    /** 文字颜色函数 */
    getColor?: () => string
    /** 绘制间隔，默认 30 */
    durationMS?: number
}