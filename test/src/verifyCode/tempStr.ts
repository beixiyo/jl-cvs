export const CODE_TEMPLATES = {
  9: `000000000111111111000000 000000000111111111000000 000000000111111111000000 000001111111111111110000 000001111111111111110000 000111111000000011111100 000111111000000011111100 000111100000000000111111 000111100000000000111111 111111100000000000001111 111111100000000000001111 111110000000000000001111 111110000000000000001111 111110000000000000001111 111110000000000000001111 111110000000000000001111 111110000000000000001111 111110000000000000001111 111111100000000000111111 111111100000000000111111 000111100000000011111100 000111100000000011111100 000111111111111111111100 000111111111111111111100 000111111111111111111100 000001111111110000111100 000001111111110000111100 000000000000000011110000 000000000000000011110000 000000000000000011110000 000000000000000011110000 000000000000001111000000 000000000000001111000000 000000000111111100000000 000000000111111100000000 000000000111111100000000 000111111111110000000000 000111111111110000000000 000111111000000000000000 000111111000000000000000`,
  e: `000000000111111111110000 000000000111111111110000 000000000111111111110000 000000011111111111111100 000000011111111111111100 000001111000000000111111 000001111000000000111111 000111100000000000001111 000111100000000000001111 000111100000000000001111 000111100000000000001111 111111111111111111111111 111111111111111111111111 111111111111111111111111 111111111111111111111111 111111111111111111111111 111110000000000000000000 111110000000000000000000 111110000000000000000000 111110000000000000000000 111111100000000000000000 111111100000000000000000 000111111000000000111100 000111111000000000111100 000111111111111111110000 000111111111111111110000 000111111111111111110000 000000011111111111000000 000000011111111111000000`
}

/**
 * 统计每个字符模板中1的个数
 */
export const tplEffectPoints = Object.keys(CODE_TEMPLATES).reduce((calc, code) => {
  calc[code] = CODE_TEMPLATES[code].split('').filter(c => c == '1').length
  return calc
}, {})