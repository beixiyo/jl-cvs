import { getRandomNum } from '@jl-org/tool'

/**
 * 调色主题数组
 */
export const ToningTheme = [
  'toning-green',
  'toning-blue',
  'toning-purple',
  'toning-orange',
  'toning-red',
  'toning-yellow',
  'toning-gray',
  'toning-slate',
]

export function getToningThemeByIndex(index: number) {
  const i = index % ToningTheme.length
  return ToningTheme[i]
}

export function getRandomToningTheme() {
  const i = getRandomNum(0, ToningTheme.length - 1)
  return ToningTheme[i]
}
