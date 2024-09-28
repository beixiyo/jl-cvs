/**
 * 从数组删除某一项
 * @param arr 
 * @param target 
 */
export const delFromItem = <T>(arr: T[], target: T) => {
    const index = arr.indexOf(target)
    index !== -1 && arr.splice(index, 1)
}

/**
 * 获取随机范围数值，不包含最大值
 * @param min 最小值
 * @param max 最大值
 * @param enableFloat 是否返回浮点数，默认 false
 */
export function getRandomNum(min: number, max: number, enableFloat = false) {
    const r = Math.random()

    if (!enableFloat) {
        return Math.floor(r * (max - min) + min)
    }

    if (r < .01) return min
    return r * (max - min) + min
}

/**
 * 解决 Number.toFixed 计算错误
 * @example
 * 1.335.toFixed(2) => '1.33'
 * numFixed(1.335) => 1.34
 *
 * @param num 数值
 * @param precision 精度 默认 2
 */
export function numFixed(num: number, precision = 2) {
    const scale = 10 ** precision
    return Math.round(num * scale) / scale
}

/** 获取一个随机字符串 */
export function getRandomStr() {
    return Math.random().toString(36)[2]
}