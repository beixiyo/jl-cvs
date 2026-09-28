import { Button } from '@/components/Button'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useDebounceFn, useGetState } from '@/hooks'
import { ConfigGroup, ConfigPanel, DemoPage, Field, Stage } from '@/layout/DemoLayout'
import { DotGrid, Grid } from '@jl-org/cvs'
import { Grid3x3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type GridType = 'grid' | 'dotGrid'

const gridPresets = [
  {
    name: '默认网格',
    cellWidth: 35,
    cellHeight: 35,
    backgroundColor: '#1a1a1a',
    borderColor: '#666666',
    borderWidth: 0.3,
    dashedLines: false,
  },
  {
    name: '大网格',
    cellWidth: 50,
    cellHeight: 50,
    backgroundColor: '#0a0a0a',
    borderColor: '#888888',
    borderWidth: 0.5,
    dashedLines: false,
  },
  {
    name: '虚线网格',
    cellWidth: 30,
    cellHeight: 30,
    backgroundColor: '#2a2a2a',
    borderColor: '#999999',
    borderWidth: 0.4,
    dashedLines: true,
    dashPattern: [5, 5],
  },
  {
    name: '密集网格',
    cellWidth: 20,
    cellHeight: 20,
    backgroundColor: '#1a1a1a',
    borderColor: '#555555',
    borderWidth: 0.2,
    dashedLines: false,
  },
]

const dotGridPresets = [
  {
    name: '默认点阵',
    dotSpacingX: 20,
    dotSpacingY: 20,
    dotRadius: 1,
    dotColor: '#333333',
    backgroundColor: '#000000',
  },
  {
    name: '密集点阵',
    dotSpacingX: 15,
    dotSpacingY: 15,
    dotRadius: 0.8,
    dotColor: '#444444',
    backgroundColor: '#000000',
  },
  {
    name: '稀疏点阵',
    dotSpacingX: 30,
    dotSpacingY: 30,
    dotRadius: 1.5,
    dotColor: '#555555',
    backgroundColor: '#111111',
  },
  {
    name: '彩色点阵',
    dotSpacingX: 25,
    dotSpacingY: 25,
    dotRadius: 1.2,
    dotColor: '#0066cc',
    backgroundColor: '#001122',
  },
]

export default function GridTest() {
  const [gridType, setGridType] = useState<GridType>('grid')

  /** Grid 配置 */
  const [gridConfig, setGridConfig] = useGetState({
    width: 800,
    height: 600,
    ...gridPresets[0],
    highlightGradientColors: ['#fefefe55', 'transparent'] as [string, string],
    highlightRange: 1,
    transitionTime: 200,
    glowIntensity: 10,
    highlightBorderWidth: 0.5,
  }, true)

  /** DotGrid 配置 */
  const [dotGridConfig, setDotGridConfig] = useGetState({
    width: 800,
    height: 600,
    ...dotGridPresets[0],
    highlightGradientColors: ['#ffffff44', 'transparent'] as [string, string],
    highlightRange: 2,
    transitionTime: 50,
    glowIntensity: 10,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridInstanceRef = useRef<Grid | DotGrid | null>(null)

  const createGridInstance = useDebounceFn(
    () => {
      if (!canvasRef.current) {
        console.warn('画布未准备好')
        return
      }

      try {
        const latestGridConfig = setGridConfig.getLatest()
        const latestDotGridConfig = setDotGridConfig.getLatest()

        const config = gridType === 'grid'
          ? latestGridConfig
          : latestDotGridConfig
        canvasRef.current.width = config.width
        canvasRef.current.height = config.height

        gridInstanceRef.current?.dispose()

        if (gridType === 'grid') {
          gridInstanceRef.current = new Grid(canvasRef.current, latestGridConfig)
        }
        else {
          gridInstanceRef.current = new DotGrid(canvasRef.current, latestDotGridConfig)
        }
      }
      catch (error) {
        console.error('创建网格实例失败:', error)
      }
    },
    { delay: 80 },
  )

  /** 应用预设 */
  const applyGridPreset = (preset: Record<string, any>) => {
    setGridConfig((prev) => ({ ...prev, ...preset }))
  }

  const applyDotGridPreset = (preset: Record<string, any>) => {
    setDotGridConfig((prev) => ({ ...prev, ...preset }))
  }

  /** 更新配置 */
  const updateGridConfig = (key: string, value: any) => {
    setGridConfig({ [key]: value } as any)
  }

  const updateDotGridConfig = (key: string, value: any) => {
    setDotGridConfig({ [key]: value } as any)
  }

  /** 类型 / 配置变化时重建 */
  useEffect(() => {
    createGridInstance()
  }, [gridType, gridConfig, dotGridConfig, createGridInstance])

  /** 窗口尺寸变化 */
  useEffect(() => {
    const handleResize = () => {
      if (gridInstanceRef.current) {
        const config = gridType === 'grid'
          ? setGridConfig.getLatest()
          : setDotGridConfig.getLatest()
        gridInstanceRef.current.onResize(config.width, config.height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gridType, setDotGridConfig, setGridConfig])

  /** 卸载清理 */
  useEffect(() => {
    return () => {
      gridInstanceRef.current?.dispose()
    }
  }, [])

  return (
    <DemoPage
      title="网格"
      desc="线框网格与点阵网格两种模式，鼠标悬停可见高亮与辉光交互"
      icon={ Grid3x3 }
    >
      <Stage>
        <canvas
          ref={ canvasRef }
          className="max-h-[68svh] max-w-full rounded-lg"
        />
      </Stage>

      <ConfigPanel>
        <ConfigGroup title="网格类型">
          <div className="flex gap-2">
            <Button
              size="sm"
              rounded="lg"
              variant={ gridType === 'grid'
                ? 'primary'
                : 'secondary' }
              onClick={ () => setGridType('grid') }
            >
              线框网格
            </Button>
            <Button
              size="sm"
              rounded="lg"
              variant={ gridType === 'dotGrid'
                ? 'primary'
                : 'secondary' }
              onClick={ () => setGridType('dotGrid') }
            >
              点阵网格
            </Button>
          </div>
        </ConfigGroup>

        { gridType === 'grid'
          ? (
            <>
              <ConfigGroup title="预设方案">
                <div className="flex flex-wrap gap-2">
                  { gridPresets.map((preset) => (
                    <Button
                      key={ preset.name }
                      size="sm"
                      rounded="lg"
                      variant={ gridConfig.name === preset.name
                        ? 'primary'
                        : 'secondary' }
                      onClick={ () => applyGridPreset(preset) }
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </ConfigGroup>

              <ConfigGroup title="单元格">
                <Field label="单元格宽度" value={ gridConfig.cellWidth }>
                  <Slider
                    value={ gridConfig.cellWidth }
                    onChange={ (v) => updateGridConfig('cellWidth', v) }
                    min={ 10 }
                    max={ 80 }
                  />
                </Field>

                <Field label="单元格高度" value={ gridConfig.cellHeight }>
                  <Slider
                    value={ gridConfig.cellHeight }
                    onChange={ (v) => updateGridConfig('cellHeight', v) }
                    min={ 10 }
                    max={ 80 }
                  />
                </Field>

                <Field label="边框宽度" value={ gridConfig.borderWidth }>
                  <Slider
                    value={ gridConfig.borderWidth }
                    onChange={ (v) => updateGridConfig('borderWidth', v) }
                    min={ 0.1 }
                    max={ 2 }
                    step={ 0.1 }
                  />
                </Field>

                <Field label="高亮边框宽度" value={ gridConfig.highlightBorderWidth }>
                  <Slider
                    value={ gridConfig.highlightBorderWidth }
                    onChange={ (v) => updateGridConfig('highlightBorderWidth', v) }
                    min={ 0.1 }
                    max={ 3 }
                    step={ 0.1 }
                  />
                </Field>
              </ConfigGroup>
            </>
          )
          : (
            <>
              <ConfigGroup title="预设方案">
                <div className="flex flex-wrap gap-2">
                  { dotGridPresets.map((preset) => (
                    <Button
                      key={ preset.name }
                      size="sm"
                      rounded="lg"
                      variant={ dotGridConfig.name === preset.name
                        ? 'primary'
                        : 'secondary' }
                      onClick={ () => applyDotGridPreset(preset) }
                    >
                      { preset.name }
                    </Button>
                  )) }
                </div>
              </ConfigGroup>

              <ConfigGroup title="点阵">
                <Field label="横向间距" value={ dotGridConfig.dotSpacingX }>
                  <Slider
                    value={ dotGridConfig.dotSpacingX }
                    onChange={ (v) => updateDotGridConfig('dotSpacingX', v) }
                    min={ 5 }
                    max={ 60 }
                  />
                </Field>

                <Field label="纵向间距" value={ dotGridConfig.dotSpacingY }>
                  <Slider
                    value={ dotGridConfig.dotSpacingY }
                    onChange={ (v) => updateDotGridConfig('dotSpacingY', v) }
                    min={ 5 }
                    max={ 60 }
                  />
                </Field>

                <Field label="点半径" value={ dotGridConfig.dotRadius }>
                  <Slider
                    value={ dotGridConfig.dotRadius }
                    onChange={ (v) => updateDotGridConfig('dotRadius', v) }
                    min={ 0.5 }
                    max={ 4 }
                    step={ 0.1 }
                  />
                </Field>
              </ConfigGroup>
            </>
          ) }

        <ConfigGroup title="交互与画布">
          <Field
            label="高亮范围"
            value={ gridType === 'grid'
              ? gridConfig.highlightRange
              : dotGridConfig.highlightRange }
          >
            <Slider
              value={ gridType === 'grid'
                ? gridConfig.highlightRange
                : dotGridConfig.highlightRange }
              onChange={ (v) => (gridType === 'grid'
                ? updateGridConfig('highlightRange', v)
                : updateDotGridConfig('highlightRange', v)) }
              min={ 1 }
              max={ 6 }
            />
          </Field>

          <Field
            label="辉光强度"
            value={ gridType === 'grid'
              ? gridConfig.glowIntensity
              : dotGridConfig.glowIntensity }
          >
            <Slider
              value={ gridType === 'grid'
                ? gridConfig.glowIntensity
                : dotGridConfig.glowIntensity }
              onChange={ (v) => (gridType === 'grid'
                ? updateGridConfig('glowIntensity', v)
                : updateDotGridConfig('glowIntensity', v)) }
              min={ 1 }
              max={ 30 }
            />
          </Field>

          <Field
            label="画布宽度"
            value={ gridType === 'grid'
              ? gridConfig.width
              : dotGridConfig.width }
          >
            <NumberInput
              value={ gridType === 'grid'
                ? gridConfig.width
                : dotGridConfig.width }
              onChange={ (v) => (gridType === 'grid'
                ? updateGridConfig('width', v)
                : updateDotGridConfig('width', v)) }
              min={ 400 }
              max={ 1200 }
            />
          </Field>

          <Field
            label="画布高度"
            value={ gridType === 'grid'
              ? gridConfig.height
              : dotGridConfig.height }
          >
            <NumberInput
              value={ gridType === 'grid'
                ? gridConfig.height
                : dotGridConfig.height }
              onChange={ (v) => (gridType === 'grid'
                ? updateGridConfig('height', v)
                : updateDotGridConfig('height', v)) }
              min={ 300 }
              max={ 800 }
            />
          </Field>
        </ConfigGroup>
      </ConfigPanel>
    </DemoPage>
  )
}
