import { NoteBoardWithBase64 } from '@/NoteBoard'
import { genBtn } from './tools'


const WIDTH = 600
const HEIGHT = 400
const LINE_WIDTH = 30

/**
 * 图片画板 =========================================
 */
const el = document.createElement('div')
el.style.width = `${WIDTH}px`
el.style.height = `${HEIGHT}px`
el.style.border = '1px solid'
document.body.appendChild(el)

const board = new NoteBoardWithBase64({
  el,
  width: WIDTH,
  height: HEIGHT,
  lineWidth: LINE_WIDTH,
  strokeStyle: '#409eff55',
  globalCompositeOperation: 'xor',

  onWheel({ scale }) {
    console.log('onWheel 同步笔刷大小')
    if (scale < 1) return

    board.setStyle({
      lineWidth: LINE_WIDTH / scale
    })
    board.setCursor()
  },
})

/**
 * 居中绘制图片，并自动拉伸大小
 */
board.drawImg(
  'http://localhost:8510/src/refactor/Photog/LeftSider/assets/1.webp',
  {
    center: true,
    autoFit: true,
  },
)


/**
 * 按钮 =========================================
 */
genBtn('单独导出', async () => {
  const src = await board.exportImg({ exportOnlyImgArea: true })
  const imgEl = new Image()
  imgEl.src = src

  const mask = await board.exportMask({ exportOnlyImgArea: true })
  const maskImgEl = new Image()
  maskImgEl.src = mask

  document.body.appendChild(imgEl)
  document.body.appendChild(maskImgEl)
})

genBtn('导出所有', async () => {
  const src = await board.exportAllLayer({ exportOnlyImgArea: true })
  const imgEl = new Image()
  imgEl.src = src

  document.body.appendChild(imgEl)
})

genBtn('清空', () => {
  board.clear()
})

genBtn('撤销', () => {
  board.undo()
})
genBtn('重做', () => {
  board.redo()
})
genBtn('重置大小', () => {
  board.resetSize()
})

genBtn('关闭/ 打开绘制', () => {
  board.mode === 'draw'
    ? board.setMode('none')
    : board.setMode('draw')
})

genBtn('开启/ 关闭擦除模式', () => {
  board.mode === 'erase'
    ? board.setMode('none')
    : board.setMode('erase')
})

genBtn('开启/ 关闭拖拽模式', () => {
  board.mode === 'drag'
    ? board.setMode('none')
    : board.setMode('drag')
})