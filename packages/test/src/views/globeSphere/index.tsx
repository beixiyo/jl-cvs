import { GlobeSphere } from '@jl-org/cvs'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { cn } from '@/utils'

export default function GlobeSphereTest() {
  const [globeSphere, setGlobeSphere] = useState<GlobeSphere | null>(null)
  const [config, setConfig] = useState({
    width: 400,
    height: 400,
    pointCount: 1000,
    radius: 120,
    rotationSpeed: 0.001,
    pointSize: 1,
    pointColor: 'rgb(100, 150, 255)',
    pointOpacity: 0.8,
    perspectiveDistance: 400,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 预设配置
  const presets = [
    {
      name: '默认地球仪',
      config: {
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
    },
    {
      name: '密集星球',
      config: {
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
    },
    {
      name: '大型行星',
      config: {
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
    },
    {
      name: '快速旋转',
      config: {
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
    },
  ]

  // 颜色主题
  const colorThemes = [
    { name: '蓝色地球', color: 'rgb(100, 150, 255)' },
    { name: '金色星球', color: 'rgb(255, 200, 100)' },
    { name: '红色火星', color: 'rgb(255, 100, 100)' },
    { name: '绿色星球', color: 'rgb(100, 255, 150)' },
    { name: '紫色星云', color: 'rgb(200, 100, 255)' },
    { name: '白色月球', color: 'rgb(255, 255, 255)' },
  ]

  // 初始化球体
  const initGlobeSphere = () => {
    if (!canvasRef.current) return

    // 停止之前的动画
    if (globeSphere) {
      globeSphere.stopAnimation()
    }

    const globeSphereInstance = new GlobeSphere(canvasRef.current, config)
    setGlobeSphere(globeSphereInstance)
  }

  // 应用预设
  const applyPreset = (presetConfig: any) => {
    setConfig(presetConfig)
    setTimeout(() => {
      initGlobeSphere()
    }, 100)
  }

  // 更新配置
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)

    if (globeSphere) {
      if (key === 'width' || key === 'height') {
        // 尺寸变化需要重新初始化
        setTimeout(() => {
          initGlobeSphere()
        }, 100)
      } else {
        // 其他配置可以直接更新
        globeSphere.updateOptions({ [key]: value })
      }
    }
  }

  // 切换颜色主题
  const changeColorTheme = (color: string) => {
    updateConfig('pointColor', color)
  }

  // 初始化
  useEffect(() => {
    initGlobeSphere()

    return () => {
      if (globeSphere) {
        globeSphere.stopAnimation()
      }
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 h-screen overflow-auto">
      {/* 页面标题 - 全宽显示 */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🌍 球体地球仪
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          3D 球体点阵动画效果，使用透视投影和深度排序创建立体旋转效果
        </p>
      </div>

      {/* 响应式布局容器 */}
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-120px)]">
        {/* 左侧：效果展示区域 */}
        <div className="flex-1 p-6 lg:pr-3">
          <Card className="h-full p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              球体效果展示
            </h2>
            <div className="flex justify-center items-center h-full">
              <div className="bg-gray-900 rounded-lg p-8">
                <canvas
                  ref={canvasRef}
                  className="rounded-lg shadow-xl"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-full lg:w-96 p-6 lg:pl-3">
          <Card className="h-full">
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                控制面板
              </h2>

              {/* 预设配置 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  预设效果
                </h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      onClick={() => applyPreset(preset.config)}
                      size="sm"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 颜色主题 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                  颜色主题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorThemes.map((theme, index) => (
                    <Button
                      key={index}
                      onClick={() => changeColorTheme(theme.color)}
                      variant={config.pointColor === theme.color ? 'primary' : 'default'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 参数配置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  参数配置
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布宽度
                  </label>
                  <Input
                    type="number"
                    value={config.width}
                    onChange={(e) => updateConfig('width', Number(e.target.value))}
                    min={200}
                    max={800}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    画布高度
                  </label>
                  <Input
                    type="number"
                    value={config.height}
                    onChange={(e) => updateConfig('height', Number(e.target.value))}
                    min={200}
                    max={800}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    点数量
                  </label>
                  <Input
                    type="number"
                    value={config.pointCount}
                    onChange={(e) => updateConfig('pointCount', Number(e.target.value))}
                    min={100}
                    max={5000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    球体半径
                  </label>
                  <Input
                    type="number"
                    value={config.radius}
                    onChange={(e) => updateConfig('radius', Number(e.target.value))}
                    min={50}
                    max={300}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    旋转速度
                  </label>
                  <Input
                    type="number"
                    value={config.rotationSpeed}
                    onChange={(e) => updateConfig('rotationSpeed', Number(e.target.value))}
                    min={0}
                    max={0.02}
                    step={0.0001}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    点大小
                  </label>
                  <Input
                    type="number"
                    value={config.pointSize}
                    onChange={(e) => updateConfig('pointSize', Number(e.target.value))}
                    min={0.5}
                    max={5}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    点透明度
                  </label>
                  <Input
                    type="number"
                    value={config.pointOpacity}
                    onChange={(e) => updateConfig('pointOpacity', Number(e.target.value))}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    透视距离
                  </label>
                  <Input
                    type="number"
                    value={config.perspectiveDistance}
                    onChange={(e) => updateConfig('perspectiveDistance', Number(e.target.value))}
                    min={200}
                    max={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                    点颜色
                  </label>
                  <Input
                    type="text"
                    value={config.pointColor}
                    onChange={(e) => updateConfig('pointColor', e.target.value)}
                    placeholder="rgb(100, 150, 255)"
                  />
                </div>

                {/* 技术说明 */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-200">
                    技术说明
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <strong>球面分布：</strong>
                      使用黄金比例螺旋均匀分布点
                    </div>
                    <div>
                      <strong>透视投影：</strong>
                      3D 坐标转换为 2D 屏幕坐标
                    </div>
                    <div>
                      <strong>深度排序：</strong>
                      根据 Z 坐标排序实现遮挡
                    </div>
                    <div>
                      <strong>透明度映射：</strong>
                      距离越远透明度越低
                    </div>
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
