import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { HalftoneWave, type HalftoneWaveOptions } from '@jl-org/cvs'
import { SquareDashed } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/** 颜色主题 */
const colorThemes = [
  {
    name: '经典黑白',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    waveColor: 'rgba(255, 255, 255, 0.5)',
  },
  {
    name: '静谧蓝',
    backgroundColor: 'rgba(0, 20, 40, 0.2)',
    waveColor: 'rgba(100, 200, 255, 0.6)',
  },
  {
    name: '暖红',
    backgroundColor: 'rgba(40, 0, 0, 0.2)',
    waveColor: 'rgba(255, 100, 100, 0.7)',
  },
  {
    name: '薄荷绿',
    backgroundColor: 'rgba(0, 40, 20, 0.2)',
    waveColor: 'rgba(100, 255, 150, 0.6)',
  },
  {
    name: '梦幻紫',
    backgroundColor: 'rgba(20, 0, 40, 0.2)',
    waveColor: 'rgba(200, 100, 255, 0.6)',
  },
] as const

export default function HalftoneWaveTest() {
  const halftoneWaveRef = useRef<HalftoneWave | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [config, setConfig] = useGetState<HalftoneWaveOptions, true>({
    width: 800,
    height: 600,
    gridSize: 20,
    backgroundColor: colorThemes[0].backgroundColor,
    waveColor: colorThemes[0].waveColor,
    waveSpeed: 0.05,
    waveAmplitude: 0.8,
  }, true)

  const [selectedColorTheme, setSelectedColorTheme] = useState(0)

  /** 初始化 / 重建星空 */
  const initHalftoneWave = useCallback(() => {
    if (!canvasRef.current) return

    halftoneWaveRef.current?.dispose()
    halftoneWaveRef.current = new HalftoneWave(
      canvasRef.current,
      setConfig.getLatest(),
    )
  }, [setConfig])

  /** 切换颜色主题 */
  const changeColorTheme = (index: number) => {
    const theme = colorThemes[index]
    setSelectedColorTheme(index)
    updateConfig({
      backgroundColor: theme.backgroundColor,
      waveColor: theme.waveColor,
    })
  }

  /** 更新配置：实例支持 updateOptions 原地更新（内部重建网格，动画不中断），无需 dispose 重建 */
  const updateConfig = (patch: Partial<HalftoneWaveOptions>) => {
    setConfig({
      ...setConfig.getLatest(),
      ...patch,
    })
    halftoneWaveRef.current?.updateOptions(patch)
  }

  useEffect(() => {
    initHalftoneWave()

    return () => {
      halftoneWaveRef.current?.dispose()
      halftoneWaveRef.current = null
    }
  }, [initHalftoneWave])

  return (
    <DemoPage
      title="半调波浪"
      desc="半调网点沿波场起伏流动，印刷质感与动态波浪的结合"
      icon={ SquareDashed }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg bg-[#101418]"
        />
      </Stage>

      <ConfigPanel>
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
        </ConfigGroup>

        <ConfigGroup title="波形参数">
          <Field label="网格尺寸" value={ config.gridSize as number }>
            <Slider
              value={ config.gridSize as number }
              onChange={ (v) => updateConfig({ gridSize: v }) }
              min={ 5 }
              max={ 60 }
            />
          </Field>

          <Field label="波浪速度" value={ config.waveSpeed as number }>
            <Slider
              value={ config.waveSpeed as number }
              onChange={ (v) => updateConfig({ waveSpeed: v }) }
              min={ 0.01 }
              max={ 0.3 }
              step={ 0.01 }
            />
          </Field>

          <Field label="波浪振幅" value={ config.waveAmplitude as number }>
            <Slider
              value={ config.waveAmplitude as number }
              onChange={ (v) => updateConfig({ waveAmplitude: v }) }
              min={ 0.1 }
              max={ 2 }
              step={ 0.1 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="画布">
          <Field label="宽度" value={ config.width as number }>
            <NumberInput
              value={ config.width as number }
              onChange={ (v) => updateConfig({ width: v }) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field label="高度" value={ config.height as number }>
            <NumberInput
              value={ config.height as number }
              onChange={ (v) => updateConfig({ height: v }) }
              min={ 300 }
              max={ 800 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
