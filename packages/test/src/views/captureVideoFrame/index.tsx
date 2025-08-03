import type { UploaderRef } from '@/components/Uploader'
import type { VideoFrame, VideoTimelineRef } from '@/components/VideoTimeline'
import { captureVideoFrame } from '@jl-org/cvs'
import { useCallback, useEffect, useRef, useState } from 'react'
import videoSrc from '@/assets/video/video.mp4'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { LazyImg } from '@/components/LazyImg'
import { Uploader } from '@/components/Uploader'
import { VideoTimeline } from '@/components/VideoTimeline'

export default function CaptureVideoFramePage() {
  const uploaderRef = useRef<UploaderRef>(null)
  const timelineRef = useRef<VideoTimelineRef>(null)

  const [currentVideo, setCurrentVideo] = useState<string>(videoSrc)
  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState<VideoFrame | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [captureProgress, setCaptureProgress] = useState<{ current: number, total: number } | null>(null)

  /** 加载初始帧 */
  const loadInitialFrames = useCallback(async () => {
    const newFrames = await captureFrames(0, 8)
    setFrames(newFrames)
    if (newFrames.length > 0) {
      setCurrentFrame(newFrames[0])
    }

    /** 检查是否还有更多帧 */
    const totalPossibleFrames = Math.floor(videoDuration)
    setHasMore(newFrames.length < totalPossibleFrames)
  }, [videoDuration])

  /** 初始化默认视频 */
  useEffect(() => {
    const initDefaultVideo = async () => {
      try {
        const duration = await getVideoDuration(videoSrc)
        setVideoDuration(duration)
      }
      catch (error) {
        console.error('加载默认视频失败:', error)
      }
    }

    initDefaultVideo()
  }, [])

  /** 当视频时长变化时，自动加载初始帧 */
  useEffect(() => {
    if (videoDuration > 0 && frames.length === 0) {
      loadInitialFrames()
    }
  }, [videoDuration, loadInitialFrames, frames.length])

  /** 获取视频时长 */
  const getVideoDuration = (videoFile: string | File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
      if (typeof videoFile === 'string') {
        video.src = videoFile
      }
      else {
        video.src = URL.createObjectURL(videoFile)
      }
    })
  }

  /** 处理视频上传 */
  const handleVideoUpload = async (files: Array<{ file: File, base64: string }>) => {
    if (files.length > 0) {
      const file = files[0].file
      const videoUrl = URL.createObjectURL(file)
      setCurrentVideo(videoUrl)
      setFrames([])
      setCurrentFrame(null)
      setHasMore(true)

      const duration = await getVideoDuration(file)
      setVideoDuration(duration)
    }
  }

  /** 重置为默认视频 */
  const resetToDefaultVideo = async () => {
    setCurrentVideo(videoSrc)
    setFrames([])
    setCurrentFrame(null)
    setHasMore(true)
    uploaderRef.current?.clear()

    const duration = await getVideoDuration(videoSrc)
    setVideoDuration(duration)
  }

  /** 截取视频帧 */
  const captureFrames = async (startTime: number = 0, count: number = 8) => {
    if (!currentVideo || videoDuration === 0)
      return []

    setLoading(true)

    /** 根据视频时长调整帧数：如果视频时长小于8秒，则取最小值 */
    const actualCount = Math.min(count, Math.floor(videoDuration))
    setCaptureProgress({ current: 0, total: actualCount })

    try {
      const interval = videoDuration / actualCount
      const times: number[] = []

      for (let i = 0; i < actualCount; i++) {
        const time = startTime + (i * interval)
        if (time < videoDuration) {
          times.push(time)
        }
      }

      if (times.length === 0)
        return []

      /** 更新进度 */
      setCaptureProgress({ current: times.length, total: actualCount })

      const results = await captureVideoFrame(currentVideo, times, 'base64', {
        setSize: video => ({
          width: Math.min(video.videoWidth, 320),
          height: Math.min(video.videoHeight, 240),
        }),
        quality: 0.8,
      })

      const newFrames: VideoFrame[] = Array.isArray(results)
        ? results.map((result, index) => ({
            id: `frame-${startTime}-${index}`,
            src: result as string,
            timestamp: times[index],
            metadata: { duration: videoDuration },
          }))
        : [{
            id: `frame-${startTime}-0`,
            src: results as string,
            timestamp: times[0],
            metadata: { duration: videoDuration },
          }]

      setCaptureProgress(null)
      return newFrames
    }
    catch (error) {
      console.error('截取视频帧失败:', error)
      setCaptureProgress(null)
      return []
    }
    finally {
      setLoading(false)
    }
  }

  /** 加载更多帧 */
  const loadMoreFrames = async () => {
    if (!hasMore || loading)
      return

    const currentMaxTime = frames.length > 0
      ? Math.max(...frames.map(f => f.timestamp))
      : 0
    const newFrames = await captureFrames(currentMaxTime + 1, 10)

    if (newFrames.length > 0) {
      setFrames(prev => [...prev, ...newFrames])
    }

    /** 检查是否还有更多帧 */
    const maxTime = newFrames.length > 0
      ? Math.max(...newFrames.map(f => f.timestamp))
      : currentMaxTime
    setHasMore(maxTime < videoDuration - 1)
  }

  /** 帧变化处理 */
  const handleFrameChange = (frame: VideoFrame) => {
    setCurrentFrame(frame)
  }

  /** 截取单帧 */
  const captureSingleFrame = async () => {
    if (!currentVideo)
      return

    try {
      setLoading(true)
      const randomTime = Math.random() * videoDuration
      const result = await captureVideoFrame(currentVideo, randomTime, 'base64', {
        setSize: video => ({
          width: Math.min(video.videoWidth, 320),
          height: Math.min(video.videoHeight, 240),
        }),
        quality: 0.8,
      })

      const newFrame: VideoFrame = {
        id: `single-frame-${Date.now()}`,
        src: result as string,
        timestamp: randomTime,
        metadata: { duration: videoDuration, type: 'single' },
      }

      setCurrentFrame(newFrame)
    }
    catch (error) {
      console.error('截取单帧失败:', error)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-full mx-auto">
        {/* 主要内容区域：视频和轨道 */ }
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* 视频预览区域 */ }
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">视频预览</h3>
            { currentVideo && videoDuration > 0
              ? (
                  <div className="space-y-4">
                    <video
                      src={ currentVideo }
                      controls
                      className="w-full rounded border bg-black"
                      style={ { maxHeight: '300px' } }
                    >
                      您的浏览器不支持视频播放
                    </video>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <span className="font-medium">时长:</span>
                        { ' ' }
                        { videoDuration.toFixed(2) }
                        { ' ' }
                        秒
                      </div>
                      <div>
                        <span className="font-medium">已截取帧数:</span>
                        { ' ' }
                        { frames.length }
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                    <p className="text-gray-500">加载视频中...</p>
                  </div>
                ) }
          </Card>

          {/* 当前帧预览 */ }
          <Card className="">
            <h3 className="text-lg font-semibold mb-4">当前帧</h3>
            { currentFrame
              ? (
                  <div className="space-y-4">
                    <LazyImg
                      src={ currentFrame.src }
                      alt={ `Frame at ${currentFrame.timestamp}s` }
                      className="w-full rounded border"
                      style={ { maxHeight: '300px', objectFit: 'contain' } }
                    />
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium">时间戳:</span>
                        { ' ' }
                        { currentFrame.timestamp.toFixed(2) }
                        { ' ' }
                        秒
                      </div>
                      <div>
                        <span className="font-medium">帧ID:</span>
                        { ' ' }
                        { currentFrame.id }
                      </div>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                    <p className="text-gray-500">暂无选中帧</p>
                  </div>
                ) }
          </Card>
        </div>

        {/* 视频轨道区域 */ }
        { frames.length > 0 && (
          <Card className="">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">视频轨道</h3>
              <div className="text-sm text-gray-600">
                已加载
                { ' ' }
                { frames.length }
                { ' ' }
                帧
                { hasMore && ' • 滚动加载更多' }
              </div>
            </div>
            <VideoTimeline
              ref={ timelineRef }
              data={ frames }
              loadData={ loadMoreFrames }
              hasMore={ hasMore }
              onFrameChange={ handleFrameChange }
              trackHeight={ 80 }
              previewHeight={ 120 }
              className="border rounded"
            />
          </Card>
        ) }

        {/* 控制面板 */ }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 视频上传区域 */ }
          <Card className="">
            <h3 className="text-lg font-semibold mb-4">视频文件</h3>
            <div className="space-y-4">
              <Uploader
                className="h-32"
                ref={ uploaderRef }
                accept="video/*"
                maxCount={ 1 }
                onChange={ handleVideoUpload }
                placeholder="拖拽视频文件到这里"
              />
              <Button
                onClick={ resetToDefaultVideo }
                className="w-full"
              >
                使用默认视频
              </Button>
            </div>
          </Card>

          {/* 操作控制 */ }
          <Card className="">
            <h3 className="text-lg font-semibold mb-4">操作控制</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={ loadInitialFrames }
                  disabled={ loading || !currentVideo }
                  loading={ loading }
                  className="w-full"
                >
                  重新截取轨道帧
                </Button>
                <Button
                  onClick={ captureSingleFrame }
                  disabled={ loading || !currentVideo }
                  className="w-full"
                >
                  截取随机单帧
                </Button>
              </div>

              { captureProgress && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>截取进度</span>
                    <span>
                      { captureProgress.current }
                      { ' ' }
                      /
                      { ' ' }
                      { captureProgress.total }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={ {
                        width: `${(captureProgress.current / captureProgress.total) * 100}%`,
                      } }
                    />
                  </div>
                </div>
              ) }
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
