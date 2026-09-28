import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { useDebounceFn } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { cn } from '@/utils'
import { createScratch } from '@jl-org/cvs'
import { PenTool, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const prizes = [
  { text: '🎉 恭喜中奖！', subtitle: '获得 100 元现金红包' },
  { text: '🎁 幸运奖！', subtitle: '获得精美礼品一份' },
  { text: '🌟 特等奖！', subtitle: '获得 iPhone 15 Pro' },
  { text: '💰 大奖！', subtitle: '获得 1000 元购物券' },
  { text: '🎊 中奖了！', subtitle: '获得免费旅游机会' },
]

const presets = [
  {
    name: '默认刮刮卡',
    width: 400,
    height: 300,
    bg: '#999999',
    lineWidth: 15,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '细笔触',
    width: 400,
    height: 300,
    bg: '#666666',
    lineWidth: 1,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '粗笔触',
    width: 400,
    height: 300,
    bg: '#333333',
    lineWidth: 25,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  {
    name: '银色涂层',
    width: 400,
    height: 300,
    bg: '#C0C0C0',
    lineWidth: 15,
    lineCap: 'square' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  },
]

export default function ScratchTest() {
  const [config, setConfig] = useGetState({ ...presets[0] }, true)

  const [scratchProgress, setScratchProgress] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [currentPrize] = useState(() => prizes[Math.floor(Math.random() * prizes.length)])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  /** useDebounceFn 保证实例稳定且闭包始终最新，避免每次渲染重建导致画布被反复重置 */
  const initScratch = useDebounceFn(() => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }

    cleanupRef.current?.()

    setScratchProgress(0)
    setIsRevealed(false)

    const latestConfig = setConfig.getLatest()

    canvasRef.current.width = latestConfig.width
    canvasRef.current.height = latestConfig.height

    const cleanup = createScratch(
      canvasRef.current,
      {
        ...latestConfig,
        ctxOpts: { willReadFrequently: true },
        /** 计算刮开的进度 */
        onScratch: () => {
          const canvas = canvasRef.current!
          const ctx = canvas.getContext('2d')!
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data

          let transparentPixels = 0
          for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
              transparentPixels++
            }
          }

          const progress = (transparentPixels / (pixels.length / 4)) * 100
          setScratchProgress(Math.round(progress))

          /** 刮开超过 30% 时揭示完整内容 */
          if (progress > 30) {
            setIsRevealed(true)
          }
        },
      },
    )

    cleanupRef.current = cleanup
  }, { delay: 80 })

  /** 重置刮刮卡 */
  const resetScratch = () => {
    initScratch()
  }

  /** 应用预设 */
  const applyPreset = (preset: Record<string, any>) => {
    setConfig((prev) => ({ ...prev, ...preset }))
  }

  /** 更新单项配置 */
  const updateConfig = (key: string, value: any) => {
    setConfig({ [key]: value })
  }

  useEffect(() => {
    initScratch()
  }, [config, initScratch])
  // initScratch 引用稳定，effect 只在 config 变化时重跑

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return (
    <DemoPage
      title="刮刮卡"
      desc="按住鼠标刮开涂层，刮开超过 30% 自动揭示奖品，试试你的手气"
      icon={ PenTool }
    >
      <Stage>
        <div className="flex flex-col items-center gap-5">
          { /* 奖品层 */ }
          <div className="relative">
            <div
              className={ cn(
                'flex flex-col items-center justify-center rounded-xl border border-border bg-linear-to-br from-background3 to-background2 px-10 py-8 transition-opacity duration-500',
                isRevealed
                  ? 'opacity-100'
                  : 'opacity-0',
              ) }
              style={ { width: config.width, height: config.height } }
            >
              <p className="text-2xl font-semibold">{ currentPrize.text }</p>
              <p className="mt-1.5 text-sm text-text2">{ currentPrize.subtitle }</p>
            </div>

            { /* 涂层画布 */ }
            <canvas
              ref={ canvasRef }
              className="absolute inset-0 cursor-grab rounded-xl active:cursor-grabbing"
            />
          </div>

          { /* 进度条 */ }
          <div className="w-[min(320px,80vw)]">
            <div className="mb-1.5 flex justify-between text-xs text-text3">
              <span>刮开进度</span>
              <span className="font-mono tabular-nums">{ scratchProgress }%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background3">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-150"
                style={ { width: `${scratchProgress}%` } }
              />
            </div>
          </div>
        </div>
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="操作">
          <Button
            block
            size="sm"
            rounded="lg"
            leftIcon={ <RotateCcw size={ 14 } /> }
            onClick={ resetScratch }
          >
            重置刮刮卡
          </Button>
        </ConfigGroup>

        <ConfigGroup title="预设方案">
          <div className="flex flex-wrap gap-2">
            { presets.map((preset) => (
              <Button
                key={ preset.name }
                size="sm"
                rounded="lg"
                variant={ config.name === preset.name
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => applyPreset(preset) }
              >
                { preset.name }
              </Button>
            )) }
          </div>
        </ConfigGroup>

        <ConfigGroup title="笔刷与涂层">
          <Field label="笔刷宽度" value={ config.lineWidth }>
            <Slider
              value={ config.lineWidth }
              onChange={ (v) => updateConfig('lineWidth', v) }
              min={ 5 }
              max={ 50 }
            />
          </Field>

          <Field label="涂层颜色">
            <input
              type="color"
              value={ config.bg }
              onChange={ (e) => updateConfig('bg', e.target.value) }
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
          </Field>

          <Field label="线条端点">
            <Select
              options={ [
                { value: 'round', label: '圆形' },
                { value: 'square', label: '方形' },
                { value: 'butt', label: '平直' },
              ] }
              value={ config.lineCap }
              onChange={ (v) => updateConfig('lineCap', v) }
            />
          </Field>

          <Field label="线条连接">
            <Select
              options={ [
                { value: 'round', label: '圆形' },
                { value: 'bevel', label: '斜角' },
                { value: 'miter', label: '尖角' },
              ] }
              value={ config.lineJoin }
              onChange={ (v) => updateConfig('lineJoin', v) }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="卡片尺寸">
          <Field label="宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig('width', v) }
              min={ 200 }
              max={ 800 }
            />
          </Field>

          <Field label="高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig('height', v) }
              min={ 150 }
              max={ 600 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
