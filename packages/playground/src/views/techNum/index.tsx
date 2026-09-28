import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { createTechNum } from '@jl-org/cvs'
import { Layers } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface TechNumConfig {
  name: string
  width: number
  height: number
  colWidth: number
  fontSize: number
  font: string
  maskColor: string
  gapRate: number
  durationMS: number
}

const presets = [
  {
    name: '经典黑客',
    colWidth: 20,
    fontSize: 20,
    font: 'Roboto Mono',
    maskColor: 'rgba(12, 12, 12, .1)',
    gapRate: 0.85,
    durationMS: 30,
  },
  {
    name: '密集数字雨',
    colWidth: 15,
    fontSize: 15,
    font: 'Courier New',
    maskColor: 'rgba(0, 0, 0, .15)',
    gapRate: 0.9,
    durationMS: 20,
  },
  {
    name: '大字体',
    colWidth: 30,
    fontSize: 30,
    font: 'Monaco',
    maskColor: 'rgba(5, 5, 5, .08)',
    gapRate: 0.8,
    durationMS: 50,
  },
  {
    name: '快速流动',
    colWidth: 18,
    fontSize: 18,
    font: 'Consolas',
    maskColor: 'rgba(0, 0, 0, .2)',
    gapRate: 0.95,
    durationMS: 15,
  },
]

const fontOptions = [
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Menlo', label: 'Menlo' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Fira Code', label: 'Fira Code' },
]

export default function TechNumTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    ...presets[0],
  } as TechNumConfig, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const techNumRef = useRef<{ start: () => void; stop: () => void; setSize: (w: number, h: number) => void } | null>(null)

  const initTechNum = useDebounceFn(
    () => {
      if (!canvasRef.current) {
        console.warn('画布未准备好')
        return
      }

      if (techNumRef.current) {
        techNumRef.current.stop()
      }

      const latestConfig = setConfig.getLatest()

      canvasRef.current.width = latestConfig.width
      canvasRef.current.height = latestConfig.height

      const techNum = createTechNum(canvasRef.current, {
        ...latestConfig,
        getStr: () => Math.random().toString(36).charAt(2) || '0',
        getColor: () => {
          const colors = ['#00ff00', '#00cc00', '#009900', '#00ff88', '#88ff00']
          return colors[Math.floor(Math.random() * colors.length)]
        },
      })

      techNumRef.current = techNum
      techNum.start()
    },
    { delay: 80 },
  )

  const applyPreset = (preset: Partial<TechNumConfig>) => {
    setConfig((prev) => ({ ...prev, ...preset }))
  }

  const updateConfig = (key: keyof TechNumConfig, value: any) => {
    setConfig({ [key]: value } as Partial<TechNumConfig>)
  }

  useEffect(() => {
    initTechNum()

    return () => {
      techNumRef.current?.stop()
    }
  }, [config, initTechNum])

  return (
    <DemoPage
      title="科技数字"
      desc="翻牌式滚动数字雨，常用于数据大屏、倒计时与黑客风格界面"
      icon={ Layers }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg bg-black"
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

        <ConfigGroup title="字体与列">
          <Field label="字体">
            <Select
              options={ fontOptions }
              value={ config.font }
              onChange={ (v) => updateConfig('font', v) }
            />
          </Field>

          <Field label="列宽 (px)" value={ config.colWidth }>
            <Slider
              value={ config.colWidth }
              onChange={ (v) => updateConfig('colWidth', v) }
              min={ 10 }
              max={ 40 }
            />
          </Field>

          <Field label="字号 (px)" value={ config.fontSize }>
            <Slider
              value={ config.fontSize }
              onChange={ (v) => updateConfig('fontSize', v) }
              min={ 10 }
              max={ 40 }
            />
          </Field>

          <Field label="刷新间隔 (ms)" value={ config.durationMS }>
            <Slider
              value={ config.durationMS }
              onChange={ (v) => updateConfig('durationMS', v) }
              min={ 10 }
              max={ 100 }
            />
          </Field>

          <Field label="间隔比率" value={ config.gapRate }>
            <Slider
              value={ config.gapRate }
              onChange={ (v) => updateConfig('gapRate', v) }
              min={ 0.5 }
              max={ 1 }
              step={ 0.05 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="画布">
          <Field label="宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig('width', v) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field label="高度" value={ config.height }>
            <NumberInput
              value={ config.height }
              onChange={ (v) => updateConfig('height', v) }
              min={ 300 }
              max={ 800 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
