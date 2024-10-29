import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'


const canvas = document.createElement('canvas')
canvas.style.border = '1px solid'
document.body.appendChild(canvas)


/**
 * 画板 =========================================
 */
const board = new NoteBoard({
    canvas,
    fillStyle: '#409eff55',
    strokeStyle: '#409eff55',
    lineWidth: 30,

    onMouseDown(e) {
        // console.log('鼠标按下', e)
    },
    onMouseMove(e) {
        // console.log('鼠标移动', e)
    },
    onMouseUp(e) {
        // console.log('鼠标抬起', e)
    },

    onRedo() {
        console.log('重做')
    },
    onUndo() {
        console.log('撤销')
    }
    // ...
})

/**
 * 开启绘制和缩放
 */
board.setMode('draw')
board.isEnableZoom = true

/**
 * 居中绘制图片，并自动拉伸大小
 */
board.drawImg(
    new URL('./PixPin_2024-10-29_14-27-44.png', import.meta.url).href,
    {
        center: true,
        autoFit: true
    }
)


/**
 * 按钮 =========================================
 */
genBtn('截图', async () => {
    const src = await board.shotImg('base64')
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