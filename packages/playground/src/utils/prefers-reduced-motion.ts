/**
 * 是否命中系统「减少动态效果」偏好（prefers-reduced-motion: reduce）
 *
 * 每次调用即时查询，不做模块级缓存——调用频率是切换级（人手速），
 * 且测试里常按用例 stub matchMedia，缓存会让 stub 失效
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
