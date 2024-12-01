export {
  getRandomNum,
  numFixed,
  randomStr,
  throttle,
  debounce,
  deepClone,
  excludeKeys,
} from '@jl-org/tool'

/**
 * 从数组删除某一项
 * @param arr 
 * @param target 要删除的目标
 */
export const delFromItem = <T>(arr: T[], target: T) => {
  const index = arr.indexOf(target)
  index !== -1 && arr.splice(index, 1)
}
