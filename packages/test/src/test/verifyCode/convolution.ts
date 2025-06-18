import { CODE_TEMPLATES, tplEffectPoints } from './tempStr'
import type { BinaryRow } from './type'


/**
 * ### 卷积比对
 * 返回是否匹配，匹配个数，匹配位置
 * @param binData
 * @param threshold
 * @returns
 */
export function convolution(binData: BinaryRow[], threshold = 1) {
  const codes = Object.keys(CODE_TEMPLATES)
  const h = binData.length
  const w = binData[0].length
  const matches: any[] = []

  let code: string,
    tplData: BinaryRow[],
    tplH: number,
    tplW: number

  function doConvolution() {
    // 返回1的个数，重合个数，重合百分比(相似度)
    const compare = (x: number, y: number, code: string) => {
      let effectivePointNum = 0
      for (let i = 0; i < tplH; i++) {
        for (let j = 0; j < tplW; j++) {
          if (tplData[i][j] == '1') {
            if (tplData[i][j] == binData[i + y][j + x]) {
              effectivePointNum++
            }
          }
        }
      }
      // 相似度 = 重合点数/字符模板有效点数
      const similarity = effectivePointNum / tplEffectPoints[code]
      return { x, y, similarity }
    }

    // 卷积方向：从左往右，从上往下
    for (let y = 0, rowLastIdx = h - tplH; y <= rowLastIdx; y++) {
      for (let x = 0, colLastIdx = w - tplW; x <= colLastIdx; x++) {
        const result = compare(x, y, code)
        if (result.similarity >= threshold) {
          matches.push({ ...result, code })
        }
      }
    }
  }

  for (let i = 0; i < codes.length; i++) {
    code = codes[i]
    // 将模板转成二维数组
    tplData = CODE_TEMPLATES[code].split(' ').map(row => row.split(''))
    tplH = tplData.length
    tplW = tplData[0].length
    doConvolution()
  }

  // 按位置(x轴)排序
  matches.sort((a, b) => a.x - b.x)
  return matches
}
