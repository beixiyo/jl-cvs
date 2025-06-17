/**
 * 生成 svg 棋盘
 * @param width 宽度
 * @param height 高度
 * @param gap 间隔
 * @param opts 文字配置选项
 */
export function genSvgBoard(width = 100, height = 100, gap = 10, opts: Opts = {}) {
  const svg = genSvg()
  const g = genBoard(width, height, gap, opts)

  return { svg, g }
}

/** 生成棋盘的 path 和 text 元素 */
export function genBoard(width = 100, height = 100, gap = 10, opts: Opts = {}) {
  const textArr = genTextArr(width, height, gap, opts.fontOpts)
  const grid = genGrid(width, height, gap, opts.gridOpts)
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  textArr.forEach(text => g.appendChild(text))
  g.appendChild(grid)

  return g
}

/** 生成 svg */
export function genSvg(viewBox = '0 0 100 100', width = 300, height = 300) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', viewBox)
  svg.setAttribute('width', `${width}`)
  svg.setAttribute('width', `${height}`)

  return svg
}

/** 生成 svg path 网格 */
export function genGrid(width = 100, height = 100, gap = 10, opts: GridOpts = {}) {
  const {
    stroke = '#ddd',
    strokeWidth = 0.3,
    needHorizontal,
    needVertical,
  } = opts
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  setGrid()

  function setGrid() {
    path.setAttribute('d', genGridPath(
      width,
      height,
      gap,
      needHorizontal,
      needVertical,
    ))
    path.setAttribute('stroke', stroke)
    path.setAttribute('stroke-width', `${strokeWidth}`)
    path.setAttribute('fill', 'none')
  }

  return path
}

/**
 * 生成网格路径
 * @param width 宽度
 * @param height 高度
 * @param gap 间隔
 * @param needHorizontal 需要水平线 默认 true
 * @param needVertical 需要垂直线 默认 true
 * @returns svg path 元素的路径 d
 */
export function genGridPath(
  width = 100,
  height = 100,
  gap = 10,
  needHorizontal = true,
  needVertical = true,
) {
  let d = ''

  if (needHorizontal) {
    for (let i = 0; i <= height; i += gap) {
      const space = i === height
        ? ''
        : ' '
      d += `M0 ${i} H${width} ${i}${space}`
    }
  }

  if (needVertical) {
    for (let i = 0; i <= width; i += gap) {
      const space = i === width
        ? ''
        : ' '
      d += `M${i} 0 V${i} ${height}${space}`
    }
  }

  return d
}

/** 生成 svg 文字数组 */
export function genTextArr(width = 100, height = 100, gap = 10, opts: FontOpts = {}) {
  const {
    fontSize = 3,
    fill = '#000',
    offsetX = 1.5,
    offsetY = 1.8,
    position = ['left', 'top'],
  } = opts
  const textArr: SVGTextElement[] = []

  /** 设置横坐标的文字 */
  if (position.includes('top')) {
    for (let i = 0; i <= width; i += gap) {
      textArr.push(genText(i + offsetX, offsetY, i))
    }
  }
  else if (position.includes('bottom')) {
    for (let i = 0; i <= width; i += gap) {
      textArr.push(genText(i + offsetX, height - offsetY, i))
    }
  }

  /** 设置纵坐标的文字 */
  if (position.includes('left')) {
    for (let i = 0; i <= height; i += gap) {
      textArr.push(genText(offsetX, i + offsetY, i))
    }
  }
  else if (position.includes('right')) {
    for (let i = 0; i <= height; i += gap) {
      textArr.push(genText(width - offsetX, i + offsetY, i))
    }
  }

  function genText(x: number, y: number, content: string | number) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', `${x}`)
    text.setAttribute('y', `${y}`)
    text.setAttribute('font-size', `${fontSize}`)
    text.setAttribute('fill', fill)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('alignment-baseline', 'middle')

    text.textContent = `${content}`
    return text
  }

  return textArr
}

type PositionStr = 'top' | 'bottom' | 'left' | 'right'

type FontOpts = {
  /** 文字大小 默认 3 */
  fontSize?: number
  fill?: string
  /** 文字左偏移 默认 1.5 */
  offsetX?: number
  /** 文字上偏移 默认 1.8 */
  offsetY?: number
  /** 位置，默认 ['left', 'top'] */
  position?: PositionStr[]
}

type GridOpts = {
  stroke?: string
  strokeWidth?: number
  /** 需要水平线 默认 true */
  needHorizontal?: boolean
  /** 需要垂直线 默认 true */
  needVertical?: boolean
}

type Opts = {
  fontOpts?: FontOpts
  gridOpts?: GridOpts
}
