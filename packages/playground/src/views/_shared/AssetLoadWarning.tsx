import { CloudOff, RotateCw } from 'lucide-react'
import { memo } from 'react'
import { retryProbe, useReleaseAssetsState } from './useReleaseAssetsState'

/**
 * Release 资源加载失败横幅
 *
 * 资源可达（或仍在探测）时渲染 null；探测失败时展示统一提示，
 * 告知用户示例内容不可用与替代方式。放在 AppShell 与官网画廊等入口处
 */
export const AssetLoadWarning = memo(function AssetLoadWarning() {
  const state = useReleaseAssetsState()
  if (state !== 'failed') return null

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3"
    >
      <div className="flex items-start gap-2.5 text-xs leading-relaxed text-text2">
        <CloudOff size={ 15 } className="mt-0.5 shrink-0 text-warning" />
        <span>
          GitHub 资源加载失败：当前网络可能无法直连 GitHub，示例图与预览图暂不可用 演示功能不受影响，可上传本地文件体验；资源也可从
          <a
            href="https://github.com/beixiyo/jl-cvs/releases/tag/assets"
            target="_blank"
            rel="noreferrer"
            className="mx-0.5 text-brand underline underline-offset-2"
          >
            Release 页
          </a>
          手动获取
        </span>
      </div>

      <button
        type="button"
        onClick={ retryProbe }
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-text2 transition-colors hover:bg-background3"
      >
        <RotateCw size={ 12 } />
        重试
      </button>
    </div>
  )
})

AssetLoadWarning.displayName = 'AssetLoadWarning'
