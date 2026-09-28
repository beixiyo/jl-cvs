import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { StarField } from '@jl-org/cvs'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface StarConfig {
  name: string
  starCount: number
  sizeRange: [number, number]
  speedRange: number
  backgroundColor: string
  flickerSpeed: number
  width: number
  height: number
}

/** 预设方案 */
const presets = [
  {
    name: '默认星空',
    starCount: 300,
    sizeRange: [0.5, 2] as [number, number],
    speedRange: 0.1,
    backgroundColor: '#001122',
    flickerSpeed: 0.01,
    width: 800,
    height: 600,
  },
  {
    name: '密集星空',
    starCount: 500,
    sizeRange: [0.3, 1.5] as [number, number],
    speedRange: 0.05,
    backgroundColor: '#000011',
    flickerSpeed: 0.02,
    width: 800,
    height: 600,
  },
  {
    name: '大星星',
    starCount: 150,
    sizeRange: [1, 4] as [number, number],
    speedRange: 0.2,
    backgroundColor: '#001133',
    flickerSpeed: 0.005,
    width: 800,
    height: 600,
  },
  {
    name: '快速移动',
    starCount: 200,
    sizeRange: [0.5, 2] as [number, number],
    speedRange: 0.5,
    backgroundColor: '#000022',
    flickerSpeed: 0.015,
    width: 800,
    height: 600,
  },
] satisfies StarConfig[]

/** 颜色主题 */
const colorThemes = [
  {
    name: '经典白',
    colors: ['#ffffff', '#ffe9c4', '#d4fbff'],
  },
  {
    name: '彩虹色',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
  },
  {
    name: '紫色系',
    colors: ['#a8e6cf', '#dda0dd', '#98d8c8', '#f7dc6f'],
  },
]

export default function StarFieldTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const starFieldRef = useRef<StarField | null>(null)

  const [config, setConfig] = useGetState(presets[0], true)
  const [selectedColorTheme, setSelectedColorTheme] = useGetState(0, true)

  /** 初始化 / 重建星空 */
  const initStarField = (cfg: StarConfig = setConfig.getLatest(), themeIndex = setSelectedColorTheme.getLatest()) => {
    const canvas = canvasRef.current
    if (!canvas) return

    starFieldRef.current?.stop()

    const theme = colorThemes[themeIndex]
    starFieldRef.current = new StarField(canvas, {
      ...cfg,
      colors: theme.colors,
    })
  }

  /** 应用预设 */
  const applyPreset = (preset: StarConfig) => {
    setConfig(preset)
    initStarField(preset)
  }

  /** 更新单项配置 */
  const updateConfig = (patch: Partial<StarConfig>) => {
    const next = { ...setConfig.getLatest(), ...patch }
    setConfig(next)
    initStarField(next)
  }

  /** 切换颜色主题 */
  const changeColorTheme = (index: number) => {
    setSelectedColorTheme(index)
    initStarField(setConfig.getLatest(), index)
  }

  /** 初始化 */
  useEffect(() => {
    initStarField()

    return () => {
      starFieldRef.current?.stop()
    }
  }, [])

  return (
    <DemoPage
      title="星际穿梭"
      desc="透视星域中持续穿行的粒子流，数量、大小、颜色与运动参数均可调节"
      icon={ Sparkles }
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

        <ConfigGroup title="颜色主题">
          <div className="flex flex-wrap gap-2">
            { colorThemes.map((theme, index) => (
              <Button
                key={ theme.name }
                size="sm"
                rounded="lg"
                variant={ selectedColorTheme === index
                  ? 'primary'
                  : 'secondary' }
                onClick={ () => changeColorTheme(index) }
              >
                { theme.name }
              </Button>
            )) }
          </div>
          <div className="flex gap-1.5">
            { colorThemes[selectedColorTheme].colors.map((color) => (
              <span
                key={ color }
                className="size-4 rounded border border-border"
                style={ { backgroundColor: color } }
              />
            )) }
          </div>
        </ConfigGroup>

        <ConfigGroup title="星体参数">
          <Field label="星星数量" value={ config.starCount }>
            <Slider
              value={ config.starCount }
              onChange={ (v) => updateConfig({ starCount: v }) }
              min={ 50 }
              max={ 1000 }
            />
          </Field>

          <Field label="星星最小尺寸" value={ config.sizeRange[0] }>
            <Slider
              value={ config.sizeRange[0] }
              onChange={ (v) => updateConfig({ sizeRange: [v, config.sizeRange[1]] }) }
              min={ 0.1 }
              max={ 3 }
              step={ 0.1 }
            />
          </Field>

          <Field label="星星最大尺寸" value={ config.sizeRange[1] }>
            <Slider
              value={ config.sizeRange[1] }
              onChange={ (v) => updateConfig({ sizeRange: [config.sizeRange[0], v] }) }
              min={ 0.5 }
              max={ 6 }
              step={ 0.1 }
            />
          </Field>

          <Field label="运动速度" value={ config.speedRange }>
            <Slider
              value={ config.speedRange }
              onChange={ (v) => updateConfig({ speedRange: v }) }
              min={ 0.01 }
              max={ 1 }
              step={ 0.01 }
            />
          </Field>

          <Field label="闪烁速度" value={ config.flickerSpeed }>
            <Slider
              value={ config.flickerSpeed }
              onChange={ (v) => updateConfig({ flickerSpeed: v }) }
              min={ 0.001 }
              max={ 0.05 }
              step={ 0.001 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="画布">
          <Field label="宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig({ width: v }) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field label="高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig({ height: v }) }
              min={ 300 }
              max={ 800 }
            />
          </Field>

          <Field label="背景颜色">
            <input
              type="color"
              value={ config.backgroundColor }
              onChange={ (e) => updateConfig({ backgroundColor: e.target.value }) }
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
