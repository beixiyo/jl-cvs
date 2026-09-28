import { useSyncExternalStore } from 'react'
import { DEMO_IMAGE_URL } from './releaseAssets'

/**
 * Release 资产可达性探测
 *
 * 所有外链资源同域（GitHub Release），可达性一致，因此模块加载时
 * 用一张小图探测一次，全站共享结果；失败后可手动重试
 */
export type AssetsState = 'pending' | 'ok' | 'failed'

const PROBE_TIMEOUT_MS = 8000

let state: AssetsState = 'pending'
const listeners = new Set<() => void>()

function setState(next: AssetsState) {
  if (state === next) return
  state = next
  listeners.forEach((listener) => listener())
}

function probe(bustCache = false) {
  state = 'pending'
  listeners.forEach((listener) => listener())

  const img = new Image()
  const timer = setTimeout(() => {
    /** 超时视为不可达，取消加载；真实结果晚到时可被重试覆盖 */
    img.src = ''
    setState('failed')
  }, PROBE_TIMEOUT_MS)

  img.onload = () => {
    clearTimeout(timer)
    setState('ok')
  }
  img.onerror = () => {
    clearTimeout(timer)
    setState('failed')
  }
  img.src = bustCache
    ? `${DEMO_IMAGE_URL}?retry=${Date.now()}`
    : DEMO_IMAGE_URL
}

/** 模块加载即开始首次探测 */
probe()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

/** 响应式读取资源可达性状态 */
export function useReleaseAssetsState(): AssetsState {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** 手动重试探测（绕过缓存） */
export function retryProbe() {
  probe(true)
}
