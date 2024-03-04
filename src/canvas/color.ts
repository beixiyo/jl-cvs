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
