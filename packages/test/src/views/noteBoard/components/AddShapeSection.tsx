import type { NoteBoard } from '@jl-org/cvs'
import { Arrow, Circle, ImageShape, Rect } from '@jl-org/cvs'
import { getColor, getRandomNum } from '@jl-org/tool'
import { type MutableRefObject, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input, NumberInput } from '@/components/Input'
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
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 100,
  }, true)

  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({
    strokeStyle: '#ff0000',
    lineWidth: 2,
    fillStyle: '',
  })

  const [imageSrc, setImageSrc] = useState<string>(() => new URL('@/assets/img/umr.webp', import.meta.url).href)
  const [imageSize, setImageSize] = useState<{ width?: number, height?: number }>({
    width: undefined,
    height: undefined,
  })

  const handleCoordinateChange = (key: keyof ShapeCoordinates, value: number) => {
    setCoordinates(prev => ({ ...prev, [key]: value }))
  }

  const handleStyleChange = (key: keyof ShapeStyle, value: string | number) => {
    setShapeStyle(prev => ({ ...prev, [key]: value }))
  }

  const handleImageSizeChange = (key: 'width' | 'height', value: number | undefined) => {
    setImageSize(prev => ({ ...prev, [key]: value }))
  }

  const addShape = (shapeType: 'rect' | 'circle' | 'arrow' | 'imageShape') => {
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
      case 'imageShape':
        shape = new ImageShape({
          ...shapeOpts,
          meta: {
            imgSrc: imageSrc,
            ...(imageSize.width && { width: imageSize.width }),
            ...(imageSize.height && { height: imageSize.height }),
          },
        })
        shape.load()
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
    const shapeTypes = ['rect', 'circle', 'arrow', 'imageShape'] as const
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
        <h3 className="text-lg text-gray-900 font-semibold dark:text-gray-100">
          🎯 addShape 方法测试
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          通过编程方式添加形状到画板，测试 NoteBoard.addShape() 方法
        </p>
      </div>

      {/* 坐标设置 */ }
      <div className="space-y-3">
        <h4 className="text-md text-gray-800 font-medium dark:text-gray-200">坐标设置</h4>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
              起点 X
            </label>
            <NumberInput
              value={ coordinates.startX }
              onChange={ e => handleCoordinateChange('startX', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
              起点 Y
            </label>
            <NumberInput
              value={ coordinates.startY }
              onChange={ e => handleCoordinateChange('startY', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
              终点 X
            </label>
            <NumberInput
              value={ coordinates.endX }
              onChange={ e => handleCoordinateChange('endX', e) }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
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

      {/* 图片设置 */ }
      <div className="space-y-3">
        <h4 className="text-md text-gray-800 font-medium dark:text-gray-200 mt-4">图片设置</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={ imageSrc }
              onChange={ setImageSrc }
              placeholder="输入图片 URL 或 base64"
              label="图片源"
            />

            <Button
              onClick={ () => setImageSrc(`https://picsum.photos/300/200?r=${Math.random()}`) }
              className="px-2 py-1 text-xs translate-y-6.5"
            >
              300x200
            </Button>
            <Button
              onClick={ () => setImageSrc(`https://picsum.photos/400/300?r=${Math.random()}`) }
              className="px-2 py-1 text-xs translate-y-6.5"
            >
              400x300
            </Button>
            <Button
              onClick={ () => setImageSrc(`https://picsum.photos/150/150?r=${Math.random()}`) }
              className="px-2 py-1 text-xs translate-y-6.5"
            >
              150x150
            </Button>
          </div>

          <div className="flex gap-3 mt-3 items-center">
            <NumberInput
              value={ imageSize.width || '' }
              onChange={ e => handleImageSizeChange('width', e || undefined) }
              className="w-full"
              placeholder="自动"
              label="图片宽度"
            />
            <NumberInput
              value={ imageSize.height || '' }
              onChange={ e => handleImageSizeChange('height', e || undefined) }
              className="w-full"
              placeholder="自动"
              label="图片高度"
            />

            <Button
              onClick={ () => setImageSize({ width: 200, height: undefined }) }
              className="px-2 py-1 text-xs translate-y-3.5"
            >
              宽度200
            </Button>
            <Button
              onClick={ () => setImageSize({ width: undefined, height: 150 }) }
              className="px-2 py-1 text-xs translate-y-3.5"
            >
              高度150
            </Button>
            <Button
              onClick={ () => setImageSize({ width: 300, height: 200 }) }
              className="px-2 py-1 text-xs translate-y-3.5"
            >
              300x200
            </Button>
            <Button
              onClick={ () => setImageSize({ width: undefined, height: undefined }) }
              className="px-2 py-1 text-xs translate-y-3.5"
            >
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* 样式设置 */ }
      <div className="space-y-3">
        <h4 className="text-md text-gray-800 font-medium dark:text-gray-200">样式设置</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
              边框颜色
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={ shapeStyle.strokeStyle }
                onChange={ e => handleStyleChange('strokeStyle', e.target.value) }
                className="h-8 w-12 border border-gray-300 rounded dark:border-gray-600"
              />
              <Input
                value={ shapeStyle.strokeStyle }
                onChange={ e => handleStyleChange('strokeStyle', e) }
                className="flex-1"
                placeholder="#ff0000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
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
            <label className="mb-1 block text-xs text-gray-700 font-medium dark:text-gray-300">
              填充颜色 (可选)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={ shapeStyle.fillStyle || '#ffffff' }
                onChange={ e => handleStyleChange('fillStyle', e.target.value) }
                className="h-8 w-12 border border-gray-300 rounded dark:border-gray-600"
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
        <h4 className="text-md text-gray-800 font-medium dark:text-gray-200">添加形状</h4>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={ () => addShape('rect') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 border-2 border-current"></div>
            添加矩形
          </Button>
          <Button
            onClick={ () => addShape('circle') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 border-2 border-current rounded-full"></div>
            添加圆形
          </Button>
          <Button
            onClick={ () => addShape('arrow') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 flex items-center justify-center">→</div>
            添加箭头
          </Button>
          <Button
            onClick={ () => addShape('imageShape') }
            variant="default"
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 flex items-center justify-center">🖼️</div>
            添加图片
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
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h5 className="mb-2 text-sm text-blue-900 font-medium dark:text-blue-100">
          💡 使用说明
        </h5>
        <ul className="text-xs text-blue-800 space-y-1 dark:text-blue-200">
          <li>• 设置起点和终点坐标来定义形状的位置和大小</li>
          <li>• 自定义边框颜色、线条宽度和填充颜色</li>
          <li>• 对于图片形状，可以设置图片源（URL 或 base64）和自定义尺寸</li>
          <li>• 图片尺寸留空时将使用原始图片尺寸，设置后将缩放到指定尺寸</li>
          <li>• 只设置宽度或高度时，会自动按原图比例计算另一项，保持图片不变形</li>
          <li>• 点击对应按钮添加不同类型的形状（矩形、圆形、箭头、图片）</li>
          <li>• 使用"随机添加"按钮快速测试多种形状</li>
          <li>• 图片支持异步加载，加载完成后自动重绘</li>
          <li>• 添加的形状支持撤销/重做操作</li>
          <li>• 所有操作都会在控制台输出详细信息</li>
        </ul>
      </div>
    </Card>
  )
}
