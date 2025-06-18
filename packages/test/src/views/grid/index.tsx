import { DotGrid, Grid } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Slider } from '@/components/Slider'
import { useGetState } from '@/hooks'

type GridType = 'grid' | 'dotGrid'

export default function GridTest() {
  const [gridType, setGridType] = useState<GridType>('grid')
  const [isActive, setIsActive] = useState(false)

  // Grid 配置
  const [gridConfig, setGridConfig] = useGetState({
    width: 800,
    height: 600,
    cellWidth: 35,
    cellHeight: 35,
    dashedLines: false,
    dashPattern: [2, 2],
    backgroundColor: '#1a1a1a',
    borderColor: '#666666',
    borderWidth: 0.3,
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
    dotSpacingX: 20,
    dotSpacingY: 20,
    dotRadius: 1,
    dotColor: '#333333',
    backgroundColor: '#000000',
    highlightGradientColors: ['#ffffff44', 'transparent'] as [string, string],
    highlightRange: 2,
    transitionTime: 50,
    glowIntensity: 10,
  }, true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridInstanceRef = useRef<Grid | DotGrid | null>(null)

  /** 预设配置 */
  const gridPresets = [
    {
      name: '默认网格',
      config: {
        cellWidth: 35,
        cellHeight: 35,
        backgroundColor: '#1a1a1a',
        borderColor: '#666666',
        borderWidth: 0.3,
        dashedLines: false,
      },
    },
    {
      name: '大网格',
      config: {
        cellWidth: 50,
        cellHeight: 50,
        backgroundColor: '#0a0a0a',
        borderColor: '#888888',
        borderWidth: 0.5,
        dashedLines: false,
      },
    },
    {
      name: '虚线网格',
      config: {
        cellWidth: 30,
        cellHeight: 30,
        backgroundColor: '#2a2a2a',
        borderColor: '#999999',
        borderWidth: 0.4,
        dashedLines: true,
        dashPattern: [5, 5],
      },
    },
    {
      name: '密集网格',
      config: {
        cellWidth: 20,
        cellHeight: 20,
        backgroundColor: '#1a1a1a',
        borderColor: '#555555',
        borderWidth: 0.2,
        dashedLines: false,
      },
    },
  ]

  const dotGridPresets = [
    {
      name: '默认点阵',
      config: {
        dotSpacingX: 20,
        dotSpacingY: 20,
        dotRadius: 1,
        dotColor: '#333333',
        backgroundColor: '#000000',
      },
    },
    {
      name: '密集点阵',
      config: {
        dotSpacingX: 15,
        dotSpacingY: 15,
        dotRadius: 0.8,
        dotColor: '#444444',
        backgroundColor: '#000000',
      },
    },
    {
      name: '稀疏点阵',
      config: {
        dotSpacingX: 30,
        dotSpacingY: 30,
        dotRadius: 1.5,
        dotColor: '#555555',
        backgroundColor: '#111111',
      },
    },
    {
      name: '彩色点阵',
      config: {
        dotSpacingX: 25,
        dotSpacingY: 25,
        dotRadius: 1.2,
        dotColor: '#0066cc',
        backgroundColor: '#001122',
      },
    },
  ]

  /** 创建网格实例 */
  const createGridInstance = () => {
    if (!canvasRef.current)
      return

    /** 销毁旧实例 */
    if (gridInstanceRef.current) {
      // Grid 和 DotGrid 都没有 destroy 方法，但我们可以清空画布
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      gridInstanceRef.current = null
    }

    try {
      /** 使用 getLatest() 获取最新配置 */
      const latestGridConfig = setGridConfig.getLatest()
      const latestDotGridConfig = setDotGridConfig.getLatest()

      if (gridType === 'grid') {
        gridInstanceRef.current = new Grid(canvasRef.current, latestGridConfig)
      }
      else {
        gridInstanceRef.current = new DotGrid(canvasRef.current, latestDotGridConfig)
      }
      setIsActive(true)
    }
    catch (error) {
      console.error('创建网格实例失败:', error)
      alert('创建网格实例失败，请检查配置')
      setIsActive(false)
    }
  }

  /** 停止网格 */
  const stopGrid = () => {
    if (gridInstanceRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      gridInstanceRef.current = null
      setIsActive(false)
    }
  }

  /** 应用预设配置 */
  const applyGridPreset = (presetConfig: any) => {
    setGridConfig(prev => ({ ...prev, ...presetConfig }))
    if (isActive && gridType === 'grid') {
      setTimeout(createGridInstance, 100) // 延迟重新创建
    }
  }

  const applyDotGridPreset = (presetConfig: any) => {
    setDotGridConfig(prev => ({ ...prev, ...presetConfig }))
    if (isActive && gridType === 'dotGrid') {
      setTimeout(createGridInstance, 100) // 延迟重新创建
    }
  }

  /** 更新配置 */
  const updateGridConfig = (key: string, value: any) => {
    setGridConfig(prev => ({ ...prev, [key]: value }))
    if (isActive && gridType === 'grid') {
      setTimeout(createGridInstance, 100) // 延迟重新创建
    }
  }

  const updateDotGridConfig = (key: string, value: any) => {
    setDotGridConfig(prev => ({ ...prev, [key]: value }))
    if (isActive && gridType === 'dotGrid') {
      setTimeout(createGridInstance, 100) // 延迟重新创建
    }
  }

  /** 切换网格类型 */
  const switchGridType = (type: GridType) => {
    setGridType(type)
    stopGrid() // 先停止当前网格
  }

  /** 自动启动效果 */
  useEffect(() => {
    /** 延迟启动，确保组件完全加载 */
    setTimeout(() => {
      if (canvasRef.current) {
        createGridInstance()
      }
    }, 500)
  }, [])

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
      if (gridInstanceRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📐 网格效果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Canvas 网格和点阵效果，支持鼠标交互和多种自定义参数
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row gap-6 px-6">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1">
          <Card className="p-6 min-h-[600px]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              网格效果展示
            </h2>
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
              <div className="relative">
                <canvas
                  ref={ canvasRef }
                  className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl"
                  width={ gridType === 'grid'
                    ? gridConfig.width
                    : dotGridConfig.width }
                  height={ gridType === 'grid'
                    ? gridConfig.height
                    : dotGridConfig.height }
                  style={ { maxWidth: '100%', height: 'auto' } }
                />
                { !isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                    <p className="text-white text-sm">点击启动查看效果</p>
                  </div>
                ) }
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={ createGridInstance }
                  disabled={ isActive }
                  variant="default"
                >
                  { isActive
                    ? '网格运行中...'
                    : '🎬 启动网格' }
                </Button>
                <Button
                  onClick={ stopGrid }
                  disabled={ !isActive }
                  variant="primary"
                >
                  ⏹️ 停止网格
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>移动鼠标到画布上查看交互效果</p>
                <p>鼠标移动会产生高亮和发光效果</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96">
          <Card>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 网格类型选择 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  网格类型
                </h3>
                <div className="flex gap-2 mb-4">
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

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  { gridType === 'grid'
                    ? gridPresets.map((preset, index) => (
                        <Button
                          key={ `grid-preset-${preset.name}-${index}` }
                          onClick={ () => applyGridPreset(preset.config) }
                          size="sm"
                          className="text-xs"
                        >
                          { preset.name }
                        </Button>
                      ))
                    : dotGridPresets.map((preset, index) => (
                        <Button
                          key={ `dot-preset-${preset.name}-${index}` }
                          onClick={ () => applyDotGridPreset(preset.config) }
                          size="sm"
                          className="text-xs"
                        >
                          { preset.name }
                        </Button>
                      )) }
                </div>
              </div>

              {/* 基础参数配置 */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  基础参数
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布宽度
                  </label>
                  <Input
                    type="number"
                    value={ gridType === 'grid'
                      ? gridConfig.width
                      : dotGridConfig.width }
                    onChange={ (e) => {
                      const value = Number(e.target.value)
                      if (gridType === 'grid') {
                        updateGridConfig('width', value)
                      }
                      else {
                        updateDotGridConfig('width', value)
                      }
                    } }
                    min={ 400 }
                    max={ 1200 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布高度
                  </label>
                  <Input
                    type="number"
                    value={ gridType === 'grid'
                      ? gridConfig.height
                      : dotGridConfig.height }
                    onChange={ (e) => {
                      const value = Number(e.target.value)
                      if (gridType === 'grid') {
                        updateGridConfig('height', value)
                      }
                      else {
                        updateDotGridConfig('height', value)
                      }
                    } }
                    min={ 300 }
                    max={ 800 }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    背景颜色
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
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
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      type="text"
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
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* 网格特定配置 */}
              { gridType === 'grid' && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    线条网格配置
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      边框颜色
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={ gridConfig.borderColor }
                        onChange={ e => updateGridConfig('borderColor', e.target.value) }
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={ gridConfig.borderColor }
                        onChange={ e => updateGridConfig('borderColor', e.target.value) }
                        className="flex-1"
                      />
                    </div>
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

              {/* 点阵特定配置 */}
              { gridType === 'dotGrid' && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    点阵网格配置
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                      点颜色
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={ dotGridConfig.dotColor }
                        onChange={ e => updateDotGridConfig('dotColor', e.target.value) }
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={ dotGridConfig.dotColor }
                        onChange={ e => updateDotGridConfig('dotColor', e.target.value) }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
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

              {/* 使用说明 */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  使用说明
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
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
