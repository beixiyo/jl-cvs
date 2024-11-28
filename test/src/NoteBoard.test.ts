import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'


const WIDTH = 600
const HEIGHT = 400
const LINE_WIDTH = 30

/**
 * 图片画板 =========================================
 */
const el = document.createElement('div')
el.style.border = '1px solid'
el.style.width = `${WIDTH * 1.05}px`
el.style.height = `${HEIGHT * 1.05}px`
el.style.display = 'flex'
el.style.justifyContent = 'center'
el.style.alignItems = 'center'
document.body.appendChild(el)


const board = new NoteBoard({
  el,
  width: WIDTH,
  height: HEIGHT,
  lineWidth: LINE_WIDTH,
  strokeStyle: '#409eff55',
  globalCompositeOperation: 'xor',

  onDrag() {
    console.log('onDrag')
  },
  onWheel({ scale }) {
    console.log('onWheel 同步笔刷大小')
    if (scale < 1) return

    board.setStyle({
      lineWidth: LINE_WIDTH / scale
    })
    board.setCursor()
  },

  // onMouseDown() {
  //   console.log('onMouseDown')
  // },
  // onMouseUp() {
  //   console.log('onMouseUp')
  // },
  // onMouseMove() {
  //   console.log('onMouseMove')
  // },
  // onMouseLeave() {
  //   console.log('onMouseLeave')
  // },

  // onRedo() {
  //   console.log('onRedo')
  // },
  // onUndo() {
  //   console.log('onUndo')
  // }
})

/**
 * 居中绘制图片，并自动拉伸大小
 */
board.drawImg(
  'http://localhost:8510/src/refactor/Photog/Workbench/assets/step2.webp',
  {
    center: true,
    autoFit: true,
  },
)


/**
 * 按钮 =========================================
 */
genBtn('截图', async () => {
  const src = await board.shotImg({ exportOnlyImgArea: true })
  const imgEl = new Image()
  imgEl.src = src

  const mask = await board.shotMask({ exportOnlyImgArea: true })
  const maskImgEl = new Image()
  maskImgEl.src = mask

  document.body.appendChild(imgEl)
  document.body.appendChild(maskImgEl)
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
  board.reset()
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
