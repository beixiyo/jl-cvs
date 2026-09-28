import { Button } from '@/components/Button'
import { LazyImg } from '@/components/LazyImg'
import type { UploaderRef } from '@/components/Uploader'
import { Uploader } from '@/components/Uploader'
import type { VideoFrame } from '@/components/VideoTimeline'
import { VideoTimeline } from '@/components/VideoTimeline'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { captureVideoFrame } from '@jl-org/cvs'
import { Camera, Download, Film, ImageIcon, RotateCcw } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_VIDEO_URL } from '../_shared/releaseAssets'

export default function CaptureVideoFramePage() {
  return (
    <DemoPage
      title="视频帧提取"
      desc="拖动时间轴精准定位视频画面，逐帧浏览并导出，支持批量截取与本地视频上传"
      icon={ Camera }
    >
      <CaptureVideoFrameDemo />
    </DemoPage>
  )
}

const CaptureVideoFrameDemo = memo(() => {
  const uploaderRef = useRef<UploaderRef>(null)

  const [videoUrl, setVideoUrl] = useState(DEMO_VIDEO_URL)
  const [duration, setDuration] = useState(0)
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState<VideoFrame | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  /** 有帧后仍可切回原片播放 */
  const [showSource, setShowSource] = useState(false)

  /** 读取视频时长（Web 无法直接从文件拿，靠 metadata 加载） */
  const getVideoDuration = useCallback((src: string | File) => {
    return new Promise<number>((resolve) => {
      const video = document.createElement('video')
      video.onloadedmetadata = () => resolve(video.duration)
      video.src = typeof src === 'string'
        ? src
        : URL.createObjectURL(src)
    })
  }, [])

  /** 从指定时间起，按剩余时长均匀截取一串帧 */
  const captureFrames = useCallback(async (startTime = 0, count = 8) => {
    if (!videoUrl || duration === 0) return []

    setLoading(true)

    /** 视频比预期短时按整秒数收缩截取数量 */
    const actualCount = Math.min(count, Math.floor(duration) - Math.floor(startTime))
    if (actualCount <= 0) {
      setLoading(false)
      return []
    }
    setProgress({ current: 0, total: actualCount })

    try {
      const interval = (duration - startTime) / actualCount
      const times: number[] = []
      for (let i = 0; i < actualCount; i++) {
        const time = startTime + i * interval
        if (time < duration) times.push(time)
      }
      if (times.length === 0) return []

      setProgress({ current: times.length, total: actualCount })

      const results = await captureVideoFrame(videoUrl, times, 'base64', {
        setSize: (video) => ({
          width: Math.min(video.videoWidth, 480),
          height: Math.min(video.videoHeight, 270),
        }),
        quality: 0.8,
      })

      const list = Array.isArray(results)
        ? results
        : [results]
      return list.map((src, index) => ({
        id: `frame-${startTime}-${index}`,
        src: src as string,
        timestamp: times[index],
      }))
    }
    catch (error) {
      console.error('截取视频帧失败:', error)
      return []
    }
    finally {
      setProgress(null)
      setLoading(false)
    }
  }, [videoUrl, duration])

  /** 加载初始帧序列，铺满整个轨道 */
  const loadInitialFrames = useCallback(async () => {
    const newFrames = await captureFrames(0, 8)
    setFrames(newFrames)
    if (newFrames.length > 0) {
      setCurrentFrame(newFrames[0])
      setShowSource(false)
    }
    setHasMore(newFrames.length < Math.floor(duration))
  }, [captureFrames, duration])

  /** 滚动到轨道末尾时，从最后一个时间点继续向后截取 */
  const loadMoreFrames = useCallback(async () => {
    if (!hasMore || loading) return

    const lastTime = frames.length > 0
      ? frames[frames.length - 1].timestamp
      : 0
    const newFrames = await captureFrames(lastTime + 1, 10)

    if (newFrames.length > 0) {
      setFrames((prev) => [...prev, ...newFrames])
      setHasMore(newFrames[newFrames.length - 1].timestamp < duration - 1)
    }
    else {
      setHasMore(false)
    }
  }, [captureFrames, duration, frames, hasMore, loading])

  /** 在随机时间点截取单帧，仅替换主预览、不进轨道 */
  const captureSingleFrame = useCallback(async () => {
    if (!videoUrl || duration === 0) return

    try {
      setLoading(true)
      const time = Math.random() * duration
      const result = await captureVideoFrame(videoUrl, time, 'base64', {
        setSize: (video) => ({
          width: Math.min(video.videoWidth, 480),
          height: Math.min(video.videoHeight, 270),
        }),
        quality: 0.8,
      })

      /** 类型标注为单值，但 Worker 与降级路径实际都返回数组 */
      const src = (Array.isArray(result)
        ? result[0]
        : result) as string
      setCurrentFrame({
        id: `single-frame-${Date.now()}`,
        src,
        timestamp: time,
      })
      setShowSource(false)
    }
    catch (error) {
      console.error('截取单帧失败:', error)
    }
    finally {
      setLoading(false)
    }
  }, [videoUrl, duration])

  /** 上传视频后清空轨道，时长就绪后由 effect 自动重截初始帧 */
  const handleVideoUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setVideoUrl(URL.createObjectURL(file))
    setFrames([])
    setCurrentFrame(null)
    setHasMore(true)
    setShowSource(false)
    setDuration(await getVideoDuration(file))
  }, [getVideoDuration])

  const resetToDefaultVideo = useCallback(async () => {
    uploaderRef.current?.clear()
    setVideoUrl(DEMO_VIDEO_URL)
    setFrames([])
    setCurrentFrame(null)
    setHasMore(true)
    setShowSource(false)
    setDuration(await getVideoDuration(DEMO_VIDEO_URL))
  }, [getVideoDuration])

  const downloadCurrentFrame = useCallback(() => {
    if (!currentFrame) return
    const link = document.createElement('a')
    link.href = currentFrame.src
    link.download = `frame-${currentFrame.timestamp.toFixed(2)}s.png`
    link.click()
  }, [currentFrame])

  /** 时长就绪且轨道为空时自动截取初始帧（首载与切换视频共用） */
  useEffect(() => {
    if (duration > 0 && frames.length === 0) {
      loadInitialFrames()
    }
  }, [duration, frames.length, loadInitialFrames])

  /** 初始化默认视频时长 */
  useEffect(() => {
    getVideoDuration(DEMO_VIDEO_URL)
      .then(setDuration)
      .catch((error) => {
        console.error('加载默认视频失败:', error)
      })
  }, [getVideoDuration])

  const hasFrames = frames.length > 0
  const displaySource = showSource || !hasFrames

  return (
    <>
      <Stage>
        <div className="flex size-full flex-col gap-4">
          { /* 主预览：原片或选中的帧 */ }
          <div className="group relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-black/90">
            { displaySource
              ? (
                <video
                  key={ videoUrl }
                  src={ videoUrl }
                  controls
                  className="size-full object-contain"
                >
                  您的浏览器不支持视频播放
                </video>
              )
              : (
                <LazyImg
                  key={ currentFrame?.id }
                  src={ currentFrame!.src }
                  alt={ `frame at ${currentFrame!.timestamp.toFixed(2)}s` }
                  className="size-full object-contain"
                />
              ) }

            { /* 角标信息与操作 */ }
            { hasFrames && (
              <button
                type="button"
                onClick={ () => setShowSource((prev) => !prev) }
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                { displaySource
                  ? <ImageIcon size={ 13 } />
                  : <Film size={ 13 } /> }
                { displaySource
                  ? '查看当前帧'
                  : '查看原片' }
              </button>
            ) }

            { !displaySource && currentFrame && (
              <>
                <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 font-mono text-xs text-white/90 tabular-nums backdrop-blur-sm">
                  { currentFrame.timestamp.toFixed(2) }s
                </span>
                <button
                  type="button"
                  onClick={ downloadCurrentFrame }
                  className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <Download size={ 13 } />
                  下载当前帧
                </button>
              </>
            ) }

            { loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                <div className="size-8 animate-spin rounded-full border-4 border-white/70 border-t-transparent" />
              </div>
            ) }
          </div>

          { /* 帧轨道：滚动到末尾自动加载更多 */ }
          { hasFrames && (
            <VideoTimeline
              data={ frames }
              loadData={ loadMoreFrames }
              hasMore={ hasMore }
              onFrameChange={ (frame) => setCurrentFrame(frame) }
              trackHeight={ 72 }
              previewHeight={ 104 }
              className="shrink-0 overflow-hidden rounded-xl border border-border"
            />
          ) }
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="视频来源">
          <Field label="上传视频" hint="替换后自动重新截取轨道帧">
            <Uploader
              ref={ uploaderRef }
              className="h-32"
              accept="video/*"
              previewImgs={ [] }
              maxCount={ 1 }
              onChange={ handleVideoUpload }
              placeholder="拖拽视频文件到这里"
            />
          </Field>
          <Button
            block
            size="sm"
            variant="secondary"
            rounded="lg"
            leftIcon={ <RotateCcw size={ 14 } /> }
            onClick={ resetToDefaultVideo }
          >
            使用默认视频
          </Button>
        </ConfigGroup>

        <ConfigGroup title="截帧操作">
          <Button
            block
            rounded="lg"
            loading={ loading }
            disabled={ duration === 0 }
            onClick={ loadInitialFrames }
          >
            重新截取轨道帧
          </Button>
          <Button
            block
            variant="secondary"
            rounded="lg"
            disabled={ loading || duration === 0 }
            onClick={ captureSingleFrame }
          >
            随机截取单帧
          </Button>

          { progress && (
            <Field label="截取进度" value={ `${progress.current} / ${progress.total}` }>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background2">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={ { width: `${(progress.current / progress.total) * 100}%` } }
                />
              </div>
            </Field>
          ) }
        </ConfigGroup>

        <ConfigGroup title="视频信息">
          <InfoRow label="时长" value={ `${duration.toFixed(2)}s` } />
          <InfoRow label="已截取帧数" value={ String(frames.length) } />
        </ConfigGroup>
      </ConfigPanel>
    </>
  )
})

CaptureVideoFrameDemo.displayName = 'CaptureVideoFrameDemo'

const InfoRow = memo(function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-text2">{ label }</span>
      <span className="font-mono text-text3 tabular-nums">{ value }</span>
    </div>
  )
})
