import type { NoteBoard } from '@jl-org/cvs'
import { Arrow, Circle, Rect } from '@jl-org/cvs'
import { getColor, getRandomNum } from '@jl-org/tool'
import { type MutableRefObject, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { NumberInput } from '@/components/Input'
import { useGetState } from '@/hooks'

interface AddShapeSectionProps {
  noteBoardRef: MutableRefObject<NoteBoard | undefined>
}

interface ShapeCoordinates {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface ShapeStyle {
  strokeStyle: string
  lineWidth: number
  fillStyle?: string
}

export function AddShapeSection({ noteBoardRef }: AddShapeSectionProps) {
  const [coordinates, setCoordinates] = useGetState<ShapeCoordinates, true>({
    startX: 100,
    startY: 100,
    endX: 200,
    endY: 200,
  }, true)

  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    strokeStyle: '#ff0000',
    lineWidth: 2,
    fillStyle: '',
  })

  const handleCoordinateChange = (key: keyof ShapeCoordinates, value: number) => {
    setCoordinates(prev => ({ ...prev, [key]: value }))
  }

  const handleStyleChange = (key: keyof ShapeStyle, value: string | number) => {
    setShapeStyle(prev => ({ ...prev, [key]: value }))
  }

  const addShape = (shapeType: 'rect' | 'circle' | 'arrow') => {
    const noteBoard = noteBoardRef.current
    if (!noteBoard) {
      console.warn('NoteBoard instance not available')
      return
    }

    let shape
    const coord = setCoordinates.getLatest()
    const shapeOpts = {
      ...coord,
      ctx: noteBoard.ctx,
      shapeStyle: {
        strokeStyle: shapeStyle.strokeStyle,
        lineWidth: shapeStyle.lineWidth,
        ...(shapeStyle.fillStyle && { fillStyle: shapeStyle.fillStyle }),
      },
    }

    switch (shapeType) {
      case 'rect':
        shape = new Rect(shapeOpts)
        break
      case 'circle':
        shape = new Circle(shapeOpts)
        break
      case 'arrow':
        shape = new Arrow(shapeOpts)
        break
      default:
        console.warn('Unknown shape type:', shapeType)
        return
    }

    /** 使用 addShape 方法添加形状 */
    noteBoard.addShape(shape)

    console.log(`Added ${shapeType} shape:`, {
      coordinates,
      style: shapeStyle,
      shape,
    })
  }

  const addRandomShape = () => {
    const shapeTypes = ['rect', 'circle', 'arrow'] as const
    const randomType = shapeTypes[getRandomNum(0, shapeTypes.length - 1)]

    /** 生成随机坐标 */
    const randomCoords = {
      startX: getRandomNum(10, 400),
      startY: getRandomNum(10, 400),
      endX: getRandomNum(10, 400),
      endY: getRandomNum(10, 400),
    }

    const randomColor = getColor()
    const originalCoords = coordinates
    const originalStyle = shapeStyle

    setCoordinates(randomCoords)
    setShapeStyle(prev => ({ ...prev, strokeStyle: randomColor }))

    addShape(randomType)
    /** 恢复原始值 */
    setCoordinates(originalCoords)
    setShapeStyle(originalStyle)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          🎯 addShape 方法测试
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          通过编程方式添加形状到画板，测试 NoteBoard.addShape() 方法
        </p>
      </div>

      {/* 坐标设置 */ }
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">坐标设置</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              起点 X
            </label>
            <NumberInput
              value={ coordinates.startX }
              onChange={ e => handleCoordinateChange('startX', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              起点 Y
            </label>
            <NumberInput
              value={ coordinates.startY }
              onChange={ e => handleCoordinateChange('startY', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              终点 X
            </label>
            <NumberInput
              value={ coordinates.endX }
              onChange={ e => handleCoordinateChange('endX', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              终点 Y
            </label>
            <NumberInput
              value={ coordinates.endY }
              onChange={ e => handleCoordinateChange('endY', e) }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 样式设置 */ }
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">样式设置</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              边框颜色
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={ shapeStyle.strokeStyle }
                onChange={ e => handleStyleChange('strokeStyle', e.target.value) }
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <NumberInput
                value={ shapeStyle.strokeStyle }
                onChange={ e => handleStyleChange('strokeStyle', e) }
                className="flex-1"
                placeholder="#ff0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              线条宽度
            </label>
            <NumberInput
              min="1"
              max="20"
              value={ shapeStyle.lineWidth }
              onChange={ e => handleStyleChange('lineWidth', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              填充颜色 (可选)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={ shapeStyle.fillStyle || '#ffffff' }
                onChange={ e => handleStyleChange('fillStyle', e.target.value) }
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <NumberInput
                value={ shapeStyle.fillStyle || '' }
                onChange={ e => handleStyleChange('fillStyle', e) }
                className="flex-1"
                placeholder="留空表示无填充"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */ }
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">添加形状</h4>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={ () => addShape('rect') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-current"></div>
            添加矩形
          </Button>
          <Button
            onClick={ () => addShape('circle') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-current rounded-full"></div>
            添加圆形
          </Button>
          <Button
            onClick={ () => addShape('arrow') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">→</div>
            添加箭头
          </Button>
          <Button
            onClick={ addRandomShape }
            variant="primary"
            className="flex items-center gap-2"
          >
            🎲 随机添加
          </Button>
        </div>
      </div>

      {/* 使用说明 */ }
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 使用说明
        </h5>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• 设置起点和终点坐标来定义形状的位置和大小</li>
          <li>• 自定义边框颜色、线条宽度和填充颜色</li>
          <li>• 点击对应按钮添加不同类型的形状</li>
          <li>• 使用"随机添加"按钮快速测试多种形状</li>
          <li>• 添加的形状支持撤销/重做操作</li>
          <li>• 所有操作都会在控制台输出详细信息</li>
        </ul>
      </div>
    </Card>
  )
}
