import { numFixed } from '@/utils'


const Reg = {
    /** rgb 颜色正则 */
    rgb: /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+))?\s*\)/,
}


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
export function getColorInfo(color: string) {
    if (color.startsWith('#')) {
        color = hexToRGB(color)
    }

    let rgbColor: RegExpMatchArray
    if ((rgbColor = color.match(Reg.rgb))) {
        const r = parseInt(rgbColor[1])
        const g = parseInt(rgbColor[2])
        const b = parseInt(rgbColor[3])
        const alpha = rgbColor[4] !== undefined
            ? parseFloat(rgbColor[4])
            : 1

        return {
            r,
            g,
            b,
            a: alpha
        }
    }

    return {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    }
}

/** 获取十六进制随机颜色 */
export function getColor() {
    return '#' + Math.random().toString(16).slice(2, 8).padEnd(6, '0')
}

/** 随机十六进制颜色数组 */
export function getColorArr(size: number) {
    return Array
        .from({ length: size })
        .map(() => getColor())
}

/**
### 把十六进制颜色转成 原始长度的颜色
  - #000 => #000000
  - #000f => #000000ff
 */
export function hexColorToRaw(color: string) {
    if (!color.startsWith('#')) {
        console.warn('the color is invalidate')
        return genDefaultColor()
    }

    /** 排除类似 #000000 | #000000ff 正常长度的颜色 */
    if (color.length > '#000f'.length) {
        return color
    }

    let c = '#'
    for (let i = 1; i < color.length; i++) {
        const s = color[i]
        c += s + s
    }
    return c
}

/** 十六进制 转 RGB */
export function hexToRGB(color: string) {
    if (color.startsWith('#')) {
        const
            _color = hexColorToRaw(color) as string,
            colorArr = []

        for (let i = 1; i < _color.length; i += 2) {
            const str = _color.slice(i, i + 2)
            colorArr.push(parseInt(str, 16))
        }
        if (colorArr.length === 4) {
            colorArr[3] = numFixed(colorArr[3] / 255, 2)
        }

        return colorArr.length >= 4
            ? `rgba(${colorArr.join(', ')})`
            : `rgb(${colorArr.join(', ')})`
    }

    console.warn('the color is invalidate')
    return genDefaultColor()
}

/** rgb转十六进制 */
export function rgbToHex(color: string) {
    let rgbColor: RegExpMatchArray

    if ((rgbColor = color.match(Reg.rgb))) {
        const r = parseInt(rgbColor[1])
        const g = parseInt(rgbColor[2])
        const b = parseInt(rgbColor[3])
        const alpha = rgbColor[4] !== undefined
            ? parseFloat(rgbColor[4])
            : 1

        // 将 alpha 转换为十六进制 并乘以255 然后转换为两位的十六进制
        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')

        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}${alphaHex}`
    }

    const _color = hexColorToRaw(color)
    if (_color) return _color
}

/**
 * 淡化颜色透明度 支持`rgb`和十六进制
 * @param color rgba(0, 239, 255, 1)
 * @param strength 淡化的强度
 * @returns 返回 RGBA 类似如下格式的颜色 `rgba(0, 0, 0, 0.1)`
 */
export function lightenColor(color: string, strength = 0) {
    if (color.startsWith('#')) {
        color = hexToRGB(color)
        if (!color) {
            console.warn('the color is invalidate')
            return genDefaultColor()
        }
    }

    const match = color.match(Reg.rgb)
    if (!match) {
        console.warn('the color is invalidate')
        return genDefaultColor()
    }

    const [_prev, r, g, b, a = 1] = match
    let alpha = +a - strength
    if (alpha < 0) {
        alpha = 0
    }
    else if (alpha > 1) {
        alpha = 1
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 颜色添加透明度 支持`rgb`和十六进制
 * @param color 颜色
 * @param opacity 透明度
 * @returns 返回十六进制 类似如下格式的颜色 `#ffffff11`
 */
export function colorAddOpacity(color: string, opacity = .1) {
    color = rgbToHex(color)
    color = color.slice(0, 7)

    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0')
    return color + alphaHex
}

function genDefaultColor() {
    return 'rgba(0, 0, 0, 0)'
}