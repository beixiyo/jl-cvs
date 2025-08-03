import { DotGrid, Grid } from '@jl-org/cvs'
import { debounce } from '@jl-org/tool'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'

type GridType = 'grid' | 'dotGrid'

/** Grid 预设配置 */
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

/** DotGrid 预设配置 */
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

  // Grid 配置
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

  // DotGrid 配置
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

  /** 创建网格实例 */
  const createGridInstance = debounce(() => {
    if (!canvasRef.current) {
      console.warn('画布未准备好')
      return
    }

    /** 销毁旧实例 */
    if (gridInstanceRef.current) {
      gridInstanceRef.current.dispose()
      gridInstanceRef.current = null
    }

    try {
      /** 使用 getLatest() 获取最新配置 */
      const latestGridConfig = setGridConfig.getLatest()
      const latestDotGridConfig = setDotGridConfig.getLatest()

      /** 设置画布尺寸 */
      const config = gridType === 'grid'
        ? latestGridConfig
        : latestDotGridConfig
      canvasRef.current.width = config.width
      canvasRef.current.height = config.height

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
  }, 80)

  /** 应用预设配置 */
  const applyGridPreset = (presetConfig: any) => {
    setGridConfig(prev => ({ ...prev, ...presetConfig }))
  }

  const applyDotGridPreset = (presetConfig: any) => {
    setDotGridConfig(prev => ({ ...prev, ...presetConfig }))
  }

  /** 更新配置 */
  const updateGridConfig = (key: string, value: any) => {
    setGridConfig({ [key]: value })
  }

  const updateDotGridConfig = (key: string, value: any) => {
    setDotGridConfig({ [key]: value })
  }

  /** 切换网格类型 */
  const switchGridType = (type: GridType) => {
    setGridType(type)
  }

  /** 监听网格类型变化，自动重新创建 */
  useEffect(() => {
    createGridInstance()
  }, [gridType])

  /** 监听Grid配置变化，自动重新创建 */
  useEffect(() => {
    if (gridType === 'grid') {
      createGridInstance()
    }
  }, [gridConfig])

  /** 监听DotGrid配置变化，自动重新创建 */
  useEffect(() => {
    if (gridType === 'dotGrid') {
      createGridInstance()
    }
  }, [dotGridConfig])

  /** 处理窗口大小变化 */
  useEffect(() => {
    const handleResize = () => {
      if (gridInstanceRef.current) {
        const latestGridConfig = setGridConfig.getLatest()
        const latestDotGridConfig = setDotGridConfig.getLatest()
        const config = gridType === 'grid'
          ? latestGridConfig
          : latestDotGridConfig
        gridInstanceRef.current.onResize(config.width, config.height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gridType])

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      gridInstanceRef.current?.dispose()
    }
  }, [])

  return (
    <div className="min-h-screen from-gray-50 to-slate-50 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* 页面标题 - 全宽显示 */ }
      <div className="p-6 text-center">
        <h1 className="mb-2 text-3xl text-gray-800 font-bold dark:text-white">
          📐 网格效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 网格和点阵效果，支持鼠标交互和多种自定义参数
        </p>
      </div>

      {/* 响应式布局容器 */ }
      <div className="flex flex-col gap-6 px-6 lg:flex-row">
        {/* 左侧：效果展示区域 */ }
        <div className="flex-1 flex justify-center items-center relative">
          <canvas
            ref={ canvasRef }
            className="border border-gray-300 rounded-lg shadow-xl dark:border-gray-600"
            width={ gridType === 'grid'
              ? gridConfig.width
              : dotGridConfig.width }
            height={ gridType === 'grid'
              ? gridConfig.height
              : dotGridConfig.height }
            style={ { maxWidth: '100%', height: 'auto' } }
          />
        </div>

        {/* 右侧：控制面板 */ }
        <div className="w-full lg:w-96">
          <Card>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <h2 className="mb-4 text-xl text-gray-800 font-semibold dark:text-white">
                控制面板
              </h2>

              {/* 网格类型选择 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  网格类型
                </h3>
                <div className="mb-4 flex gap-2">
                  <Button
                    onClick={ () => switchGridType('grid') }
                    variant={ gridType === 'grid'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    🔲 线条网格
                  </Button>
                  <Button
                    onClick={ () => switchGridType('dotGrid') }
                    variant={ gridType === 'dotGrid'
                      ? 'primary'
                      : 'default' }
                    size="sm"
                  >
                    ⚫ 点阵网格
                  </Button>
                </div>
              </div>

              {/* 预设配置 */ }
              <div className="mb-6">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  预设效果
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  { gridType === 'grid'
                    ? gridPresets.map((preset, index) => (
                        <Button
                          key={ `grid-preset-${preset.name}-${index}` }
                          onClick={ () => applyGridPreset(preset) }
                          variant={ gridConfig.name === preset.name
                            ? 'primary'
                            : 'default' }
                          size="sm"
                          className="text-xs"
                        >
                          { preset.name }
                        </Button>
                      ))
                    : dotGridPresets.map((preset, index) => (
                        <Button
                          key={ `dot-preset-${preset.name}-${index}` }
                          onClick={ () => applyDotGridPreset(preset) }
                          variant={ dotGridConfig.name === preset.name
                            ? 'primary'
                            : 'default' }
                          size="sm"
                          className="text-xs"
                        >
                          { preset.name }
                        </Button>
                      )) }
                </div>
              </div>

              {/* 基础参数配置 */ }
              <div className="mb-6 space-y-4">
                <h3 className="text-lg text-gray-700 font-medium dark:text-gray-200">
                  基础参数
                </h3>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    画布宽度
                  </label>
                  <NumberInput
                    value={ gridType === 'grid'
                      ? gridConfig.width
                      : dotGridConfig.width }
                    onChange={ (v) => {
                      if (gridType === 'grid') {
                        updateGridConfig('width', v)
                      }
                      else {
                        updateDotGridConfig('width', v)
                      }
                    } }
                    min={ 400 }
                    max={ 1200 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    画布高度
                  </label>
                  <NumberInput
                    value={ gridType === 'grid'
                      ? gridConfig.height
                      : dotGridConfig.height }
                    onChange={ (v) => {
                      if (gridType === 'grid') {
                        updateGridConfig('height', v)
                      }
                      else {
                        updateDotGridConfig('height', v)
                      }
                    } }
                    min={ 300 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                    背景颜色
                  </label>
                  <input
                    type="color"
                    value={ gridType === 'grid'
                      ? gridConfig.backgroundColor
                      : dotGridConfig.backgroundColor }
                    onChange={ (e) => {
                      if (gridType === 'grid') {
                        updateGridConfig('backgroundColor', e.target.value)
                      }
                      else {
                        updateDotGridConfig('backgroundColor', e.target.value)
                      }
                    } }
                    className="h-8 w-12 border-0 p-0"
                  />
                </div>
              </div>

              {/* 网格特定配置 */ }
              { gridType === 'grid' && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg text-gray-700 font-medium dark:text-gray-200">
                    线条网格配置
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      单元格宽度 (
                      { gridConfig.cellWidth }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 10 }
                        max={ 100 }
                        value={ gridConfig.cellWidth }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateGridConfig('cellWidth', value)
                          }
                          else if (Array.isArray(value)) {
                            updateGridConfig('cellWidth', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      单元格高度 (
                      { gridConfig.cellHeight }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 10 }
                        max={ 100 }
                        value={ gridConfig.cellHeight }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateGridConfig('cellHeight', value)
                          }
                          else if (Array.isArray(value)) {
                            updateGridConfig('cellHeight', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      边框宽度 (
                      { gridConfig.borderWidth }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 0.1 }
                        max={ 2 }
                        step={ 0.1 }
                        value={ gridConfig.borderWidth }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateGridConfig('borderWidth', value)
                          }
                          else if (Array.isArray(value)) {
                            updateGridConfig('borderWidth', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      边框颜色
                    </label>
                    <input
                      type="color"
                      value={ gridConfig.borderColor }
                      onChange={ e => updateGridConfig('borderColor', e.target.value) }
                      className="h-8 w-12 border-0 p-0"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ gridConfig.dashedLines }
                        onChange={ e => updateGridConfig('dashedLines', e.target.checked) }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">虚线模式</span>
                    </label>
                  </div>
                </div>
              ) }

              {/* 点阵特定配置 */ }
              { gridType === 'dotGrid' && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg text-gray-700 font-medium dark:text-gray-200">
                    点阵网格配置
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      水平间距 (
                      { dotGridConfig.dotSpacingX }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 5 }
                        max={ 50 }
                        value={ dotGridConfig.dotSpacingX }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateDotGridConfig('dotSpacingX', value)
                          }
                          else if (Array.isArray(value)) {
                            updateDotGridConfig('dotSpacingX', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      垂直间距 (
                      { dotGridConfig.dotSpacingY }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 5 }
                        max={ 50 }
                        value={ dotGridConfig.dotSpacingY }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateDotGridConfig('dotSpacingY', value)
                          }
                          else if (Array.isArray(value)) {
                            updateDotGridConfig('dotSpacingY', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      点半径 (
                      { dotGridConfig.dotRadius }
                      px)
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 0.5 }
                        max={ 5 }
                        step={ 0.1 }
                        value={ dotGridConfig.dotRadius }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateDotGridConfig('dotRadius', value)
                          }
                          else if (Array.isArray(value)) {
                            updateDotGridConfig('dotRadius', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      点颜色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={ dotGridConfig.dotColor }
                        onChange={ e => updateDotGridConfig('dotColor', e.target.value) }
                        className="h-8 w-12 border-0 p-0"
                      />
                      <input
                        type="text"
                        value={ dotGridConfig.dotColor }
                        onChange={ e => updateDotGridConfig('dotColor', e.target.value) }
                        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-700 font-medium dark:text-gray-200">
                      高亮范围 (
                      { dotGridConfig.highlightRange }
                      )
                    </label>
                    <div className="px-2">
                      <Slider
                        min={ 1 }
                        max={ 5 }
                        value={ dotGridConfig.highlightRange }
                        onChange={ (value) => {
                          if (typeof value === 'number') {
                            updateDotGridConfig('highlightRange', value)
                          }
                          else if (Array.isArray(value)) {
                            updateDotGridConfig('highlightRange', value[0])
                          }
                        } }
                      />
                    </div>
                  </div>
                </div>
              ) }

              {/* 使用说明 */ }
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-600">
                <h3 className="mb-3 text-lg text-gray-700 font-medium dark:text-gray-200">
                  使用说明
                </h3>
                <div className="text-sm text-gray-600 space-y-3 dark:text-gray-300">
                  <div>
                    <strong>线条网格：</strong>
                    由线条构成的规则网格，支持虚线模式
                  </div>
                  <div>
                    <strong>点阵网格：</strong>
                    由点构成的网格，更适合科技感效果
                  </div>
                  <div>
                    <strong>交互效果：</strong>
                    鼠标悬停时会产生高亮或发光效果
                  </div>
                  <div>
                    <strong>参数调节：</strong>
                    实时调整参数查看效果变化
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
