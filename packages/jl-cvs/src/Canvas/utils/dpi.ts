export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined')
    return 1
  return Math.max(1, Math.min(window.devicePixelRatio || 1, 4))
}
