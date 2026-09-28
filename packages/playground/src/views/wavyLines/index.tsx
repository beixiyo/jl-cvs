import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { WavyLines } from '@jl-org/cvs'
import { Waves } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface WavyConfig {
  name: string
  width: number
  height: number
  xGap: number
  yGap: number
  extraWidth: number
  extraHeight: number
  mouseEffectRange: number
  strokeStyle: string
}

const presets = [
  {
    name: '默认效果',
    xGap: 10,
    yGap: 32,
    extraWidth: 200,
    extraHeight: 30,
    mouseEffectRange: 175,
    strokeStyle: '#333333',
  },
  {
    name: '密集线条',
    xGap: 6,
    yGap: 20,
    extraWidth: 150,
    extraHeight: 20,
    mouseEffectRange: 120,
    strokeStyle: '#666666',
  },
  {
    name: '稀疏线条',
    xGap: 20,
    yGap: 50,
    extraWidth: 300,
    extraHeight: 50,
    mouseEffectRange: 250,
    strokeStyle: '#999999',
  },
  {
    name: '强交互',
    xGap: 12,
    yGap: 36,
    extraWidth: 250,
    extraHeight: 40,
    mouseEffectRange: 300,
    strokeStyle: '#444444',
  },
  {
    name: '彩色线条',
    xGap: 8,
    yGap: 28,
    extraWidth: 180,
    extraHeight: 25,
    mouseEffectRange: 150,
    strokeStyle: '#0066cc',
  },
  {
    name: '细腻效果',
    xGap: 4,
    yGap: 16,
    extraWidth: 100,
    extraHeight: 15,
    mouseEffectRange: 80,
    strokeStyle: '#888888',
  },
]

const colorPresets = [
  { name: '深灰', color: '#333333' },
  { name: '中灰', color: '#666666' },
  { name: '浅灰', color: '#999999' },
  { name: '蓝色', color: '#0066cc' },
  { name: '绿色', color: '#00cc66' },
  { name: '红色', color: '#cc0066' },
  { name: '紫色', color: '#6600cc' },
  { name: '橙色', color: '#cc6600' },
]

export default function WavyLinesTest() {
  const [config, setConfig] = useGetState({
    width: 800,
    height: 600,
    ...presets[0],
  } as WavyConfig, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wavyLinesRef = useRef<WavyLines | null>(null)

  const createWavyLines = useDebounceFn(
    () => {
      if (!canvasRef.current) {
        console.warn('画布未准备好')
        return
      }
      if (wavyLinesRef.current) {
        wavyLinesRef.current.dispose()
        wavyLinesRef.current = null
      }

      const latestConfig = setConfig.getLatest()

      canvasRef.current.width = latestConfig.width
      canvasRef.current.height = latestConfig.height

      wavyLinesRef.current = new WavyLines({
        canvas: canvasRef.current,
        ...latestConfig,
      } as any)
    },
    { delay: 50 },
  )

  /** 应用预设配置 */
  const applyPreset = (preset: Omit<WavyConfig, 'width' | 'height'>) => {
    setConfig((prev) => ({ ...prev, ...preset }))
  }

  /** 更新配置 */
  const updateConfig = (key: keyof WavyConfig, value: any) => {
    setConfig({ [key]: value } as Partial<WavyConfig>)
  }

  /** 监听配置变化，自动重新创建实例 */
  useEffect(() => {
    createWavyLines()

    return () => {
      wavyLinesRef.current?.dispose()
    }
  }, [config, createWavyLines])

  return (
    <DemoPage
      title="波浪线条"
      desc="跟随鼠标的动态波浪线条，基于噪声算法与物理模拟，移动鼠标感受扰动"
      icon={ Waves }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full cursor-crosshair rounded-lg"
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

        <ConfigGroup title="线条参数">
          <Field label="横向间距" value={ config.xGap }>
            <Slider
              value={ config.xGap }
              onChange={ (v) => updateConfig('xGap', v) }
              min={ 2 }
              max={ 40 }
            />
          </Field>

          <Field label="纵向间距" value={ config.yGap }>
            <Slider
              value={ config.yGap }
              onChange={ (v) => updateConfig('yGap', v) }
              min={ 10 }
              max={ 80 }
            />
          </Field>

          <Field label="额外宽度" value={ config.extraWidth }>
            <Slider
              value={ config.extraWidth }
              onChange={ (v) => updateConfig('extraWidth', v) }
              min={ 0 }
              max={ 400 }
            />
          </Field>

          <Field label="额外高度" value={ config.extraHeight }>
            <Slider
              value={ config.extraHeight }
              onChange={ (v) => updateConfig('extraHeight', v) }
              min={ 0 }
              max={ 100 }
            />
          </Field>

          <Field label="鼠标影响范围" value={ config.mouseEffectRange }>
            <Slider
              value={ config.mouseEffectRange }
              onChange={ (v) => updateConfig('mouseEffectRange', v) }
              min={ 20 }
              max={ 400 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="颜色">
          <div className="flex flex-wrap gap-2">
            { colorPresets.map((preset) => (
              <button
                key={ preset.name }
                type="button"
                title={ preset.name }
                onClick={ () => updateConfig('strokeStyle', preset.color) }
                className={ `size-6 rounded-md border transition-transform hover:scale-110 ${
                  config.strokeStyle === preset.color
                    ? 'border-brand ring-1 ring-brand'
                    : 'border-border'
                }` }
                style={ { backgroundColor: preset.color } }
              />
            )) }
          </div>
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
