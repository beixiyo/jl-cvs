/**
 * 检测元素的滚动父级容器
 */
export function getScrollParents(element: HTMLElement): HTMLElement[] {
  if (typeof document === 'undefined') return []

  const scrollParents: HTMLElement[] = []
  let parent = element.parentElement

  while (parent && parent !== document.body) {
    const { overflow, overflowX, overflowY } = getComputedStyle(parent)
    if (/(auto|scroll|overlay)/.test(overflow + overflowX + overflowY)) {
      scrollParents.push(parent)
    }
    parent = parent.parentElement
  }

  return scrollParents
}
