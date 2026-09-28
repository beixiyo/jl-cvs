/**
 * 平台探测：区分 Apple 平台与其它平台，用于选择快捷键的主修饰键
 */

/**
 * 当前是否运行在 Apple 平台（macOS / iOS / iPadOS）
 *
 * 探测顺序：`navigator.userAgentData.platform` → 已废弃但仍最通用的 `navigator.platform`
 * → `navigator.userAgent` → Electron 主进程 / Node 的 `process.platform`
 *
 * navigator 优先于 process：键盘事件发生在渲染进程，按渲染进程看到的平台判定；
 * process 只作为无 navigator 环境（主进程、Node 脚本）的兜底
 */
export function isApplePlatform(): boolean {
  const nav = (globalThis as PlatformGlobal).navigator

  if (nav) {
    const uaPlatform = nav.userAgentData?.platform
    if (uaPlatform) return APPLE_PLATFORM_RE.test(uaPlatform)

    return APPLE_PLATFORM_RE.test(nav.platform ?? '')
      || APPLE_PLATFORM_RE.test(nav.userAgent ?? '')
  }

  return (globalThis as PlatformGlobal).process?.platform === 'darwin'
}

/**
 * 当前平台主修饰键对应的 `KeyboardEvent` 修饰键状态
 *
 * Apple 平台为 Command（`metaKey`），其它平台为 Ctrl（`ctrlKey`）；
 * 另一个修饰键显式返回 `false`，避免 `Ctrl + Cmd + K` 之类的组合被误判命中
 */
export function getPlatformModifier(): PlatformModifier {
  const apple = isApplePlatform()
  return {
    ctrl: !apple,
    meta: apple,
  }
}

const APPLE_PLATFORM_RE = /mac|iphone|ipod|ipad/i

/** 当前平台主修饰键的 `KeyboardEvent` 修饰键状态 */
export type PlatformModifier = {
  /** 是否要求按下 Ctrl */
  ctrl: boolean
  /** 是否要求按下 Meta（Command / Windows 键） */
  meta: boolean
}

type PlatformGlobal = typeof globalThis & {
  process?: { platform?: string }
  navigator?: {
    platform?: string
    userAgent?: string
    userAgentData?: { platform?: string }
  }
}
