// oxlint-disable no-unused-vars
import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { GlobeSphere } from '@jl-org/cvs'
import { Globe2 } from 'lucide-react'
// oxlint-disable-next-line no-unused-vars
import { useEffect, useRef } from 'react'

interface GlobeConfig {
  name: string
  width: number
  height: number
  pointCount: number
  radius: number
  rotationSpeed: number
  pointSize: number
  pointColor: string
  pointOpacity: number
  perspectiveDistance: number
}

/** 预设方案 */
const presets = [
  {
    name: '默认地球仪',
    width: 400,
    height: 400,
    pointCount: 1000,
    radius: 120,
    rotationSpeed: 0.001,
    pointSize: 1,
    pointColor: 'rgb(100, 150, 255)',
    pointOpacity: 0.8,
    perspectiveDistance: 400,
  },
  {
    name: '密集星球',
    width: 400,
    height: 400,
    pointCount: 2000,
    radius: 100,
    rotationSpeed: 0.002,
    pointSize: 0.8,
    pointColor: 'rgb(255, 200, 100)',
    pointOpacity: 0.9,
    perspectiveDistance: 350,
  },
  {
    name: '大型行星',
    width: 500,
    height: 500,
    pointCount: 1500,
    radius: 180,
    rotationSpeed: 0.0005,
    pointSize: 2,
    pointColor: 'rgb(255, 100, 150)',
    pointOpacity: 0.7,
    perspectiveDistance: 500,
  },
  {
    name: '快速旋转',
    width: 400,
    height: 400,
    pointCount: 800,
    radius: 100,
    rotationSpeed: 0.005,
    pointSize: 1.5,
    pointColor: 'rgb(150, 255, 100)',
    pointOpacity: 0.8,
    perspectiveDistance: 300,
  },
] satisfies GlobeConfig[]

/** 颜色主题 */
const colorThemes = [
  { name: '蓝色地球', color: 'rgb(100, 150, 255)' },
  { name: '金色星球', color: 'rgb(255, 200, 100)' },
  { name: '红色火星', color: 'rgb(255, 100, 100)' },
  { name: '绿色星球', color: 'rgb(100, 255, 150)' },
  { name: '紫色星云', color: 'rgb(200, 100, 255)' },
  { name: '白色月球', color: 'rgb(255, 255, 255)' },
]

export default function GlobeSphereTest() {
  const globeRef = useRef<GlobeSphere | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useGetState(presets[0], true)

  const initGlobeSphere = () => {
    if (!canvasRef.current) return

    globeRef.current?.stopAnimation()
    globeRef.current = new GlobeSphere(canvasRef.current, setConfig.getLatest())
  }

  const applyPreset = (preset: GlobeConfig) => {
    setConfig(preset)
    initGlobeSphere()
  }

  const updateConfig = (key: keyof GlobeConfig, value: any) => {
    const next = { ...setConfig.getLatest(), [key]: value }
    setConfig(next)

    const globe = globeRef.current
    if (!globe) return

    if (key === 'width' || key === 'height') {
      initGlobeSphere()
    }
    else {
      globe.updateOptions({ [key]: value })
    }
  }

  useEffect(() => {
    initGlobeSphere()

    return () => {
      globeRef.current?.stopAnimation()
    }
  }, [])

  return (
    <DemoPage
      title="球体地球仪"
      desc="点阵球体持续自转，半径、密度与透视距离实时可调"
      icon={ Globe2 }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg bg-[#05070d]"
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

        <ConfigGroup title="球体参数">
          <Field label="点数量" value={ config.pointCount }>
            <Slider
              value={ config.pointCount }
              onChange={ (v) => updateConfig('pointCount', v) }
              min={ 200 }
              max={ 4000 }
              step={ 100 }
            />
          </Field>

          <Field label="球体半径" value={ config.radius }>
            <Slider
              value={ config.radius }
              onChange={ (v) => updateConfig('radius', v) }
              min={ 50 }
              max={ 220 }
            />
          </Field>

          <Field label="旋转速度" value={ config.rotationSpeed }>
            <Slider
              value={ config.rotationSpeed }
              onChange={ (v) => updateConfig('rotationSpeed', v) }
              min={ 0.0005 }
              max={ 0.01 }
              step={ 0.0005 }
            />
          </Field>

          <Field label="点大小" value={ config.pointSize }>
            <Slider
              value={ config.pointSize }
              onChange={ (v) => updateConfig('pointSize', v) }
              min={ 0.5 }
              max={ 4 }
              step={ 0.1 }
            />
          </Field>

          <Field label="点透明度" value={ config.pointOpacity }>
            <Slider
              value={ config.pointOpacity }
              onChange={ (v) => updateConfig('pointOpacity', v) }
              min={ 0.1 }
              max={ 1 }
              step={ 0.05 }
            />
          </Field>

          <Field label="透视距离" value={ config.perspectiveDistance }>
            <Slider
              value={ config.perspectiveDistance }
              onChange={ (v) => updateConfig('perspectiveDistance', v) }
              min={ 200 }
              max={ 800 }
            />
          </Field>
        </ConfigGroup>

        <ConfigGroup title="颜色主题">
          <div className="flex flex-wrap gap-2">
            { colorThemes.map((theme) => (
              <button
                key={ theme.name }
                type="button"
                title={ theme.name }
                onClick={ () => updateConfig('pointColor', theme.color) }
                className={ `size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  config.pointColor === theme.color
                    ? 'border-brand'
                    : 'border-transparent'
                }` }
                style={ { backgroundColor: theme.color } }
              />
            )) }
          </div>
        </ConfigGroup>

        <ConfigGroup title="画布">
          <Field label="宽度" value={ config.width }>
            <NumberInput
              value={ config.width }
              onChange={ (v) => updateConfig('width', v) }
              min={ 300 }
              max={ 800 }
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
