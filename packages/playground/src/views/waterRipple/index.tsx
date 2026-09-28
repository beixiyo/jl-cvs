import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { WaterRipple } from '@jl-org/cvs'
import { Waves } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

interface RippleConfig {
  name: string
  width: number
  height: number
  yOffset: number
  xOffset: number
  lineWidth: number
  circleCount: number
  intensity: number
  strokeStyle: string
}

/** 预设方案 */
const presets = [
  {
    name: '默认效果',
    width: 800,
    height: 600,
    yOffset: 180,
    xOffset: 0,
    lineWidth: 2,
    circleCount: 13,
    intensity: 1,
    strokeStyle: 'rgba(99, 99, 99, 0.3)',
  },
  {
    name: '快速波纹',
    width: 800,
    height: 600,
    yOffset: 100,
    xOffset: 0,
    lineWidth: 1,
    circleCount: 20,
    intensity: 3,
    strokeStyle: 'rgba(0, 150, 255, 0.3)',
  },
  {
    name: '慢速大波纹',
    width: 800,
    height: 600,
    yOffset: 200,
    xOffset: 0,
    lineWidth: 4,
    circleCount: 8,
    intensity: 0.5,
    strokeStyle: 'rgba(255, 100, 100, 0.2)',
  },
] satisfies RippleConfig[]

export default function WaterRippleTest() {
  const [rippleInstance, setRippleInstance] = useState<WaterRipple | null>(null)
  const [config, setConfig] = useGetState(presets[0], true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  /** 创建水波纹实例 */
  const createRipple = useCallback((canvas: HTMLCanvasElement, customConfig?: RippleConfig) => {
    const rippleConfig = customConfig || config

    const ripple = new WaterRipple({
      canvas,
      width: rippleConfig.width,
      height: rippleConfig.height,
      yOffset: rippleConfig.yOffset,
      xOffset: rippleConfig.xOffset,
      lineWidth: rippleConfig.lineWidth,
      circleCount: rippleConfig.circleCount,
      intensity: rippleConfig.intensity,
      strokeStyle: rippleConfig.strokeStyle || undefined,
    })

    return ripple
  }, [config])

  /** 应用预设配置 */
  const applyPreset = (presetConfig: RippleConfig) => {
    setConfig(presetConfig)
    rebuild(presetConfig)
  }

  /** 更新单项配置并重建实例 */
  const updateConfig = (patch: Partial<RippleConfig>) => {
    const next = { ...config, ...patch }
    setConfig(next)
    rebuild(next)
  }

  const rebuild = (cfg: RippleConfig) => {
    rippleInstance?.stop()
    if (canvasRef.current) {
      setRippleInstance(createRipple(canvasRef.current, cfg))
    }
  }

  /** 初始化画布 */
  useEffect(() => {
    if (canvasRef.current) {
      const ripple = createRipple(canvasRef.current)
      setRippleInstance(ripple)

      return () => ripple.stop()
    }
  }, [createRipple])

  return (
    <DemoPage
      title="水波纹"
      desc="随鼠标漾开的同心涟漪，线条粗细、扩散速度与圈数均可实时调节"
      icon={ Waves }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg"
        />
      </Stage>

      <ConfigPanel>
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

        <ConfigGroup title="波纹参数">
          <Field label="画布宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig({ width: v }) }
              min={ 200 }
              max={ 1200 }
            />
          </Field>

          <Field label="画布高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig({ height: v }) }
              min={ 200 }
              max={ 800 }
            />
          </Field>

          <Field label="Y 轴偏移" value={ config.yOffset }>
            <Slider
              value={ config.yOffset }
              onChange={ (v) => updateConfig({ yOffset: v }) }
              min={ -200 }
              max={ 400 }
            />
          </Field>

          <Field label="X 轴偏移" value={ config.xOffset }>
            <Slider
              value={ config.xOffset }
              onChange={ (v) => updateConfig({ xOffset: v }) }
              min={ -200 }
              max={ 200 }
            />
          </Field>

          <Field label="线条宽度" value={ config.lineWidth }>
            <Slider
              value={ config.lineWidth }
              onChange={ (v) => updateConfig({ lineWidth: v }) }
              min={ 1 }
              max={ 10 }
              step={ 0.5 }
            />
          </Field>

          <Field label="波纹圈数" value={ config.circleCount }>
            <Slider
              value={ config.circleCount }
              onChange={ (v) => updateConfig({ circleCount: v }) }
              min={ 5 }
              max={ 30 }
            />
          </Field>

          <Field label="扩散强度" value={ config.intensity }>
            <Slider
              value={ config.intensity }
              onChange={ (v) => updateConfig({ intensity: v }) }
              min={ 0.1 }
              max={ 5 }
              step={ 0.1 }
            />
          </Field>

          <Field label="描边颜色" value={ config.strokeStyle.match(/\d+, \d+, \d+/)?.[0] ?? config.strokeStyle }>
            <input
              type="color"
              value={ config.strokeStyle.slice(1) }
              onChange={ (e) => updateConfig({ strokeStyle: `rgba(${hexToRgb(e.target.value)}, 0.3)` }) }
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}

/** #rrggbb → "r, g, b" */
function hexToRgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}
