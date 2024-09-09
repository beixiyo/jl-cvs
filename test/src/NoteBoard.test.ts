import { NoteBoard, getCursor } from '@/NoteBoard'
import { genBtn } from './tools'


const canvas = document.createElement('canvas')
canvas.style.border = '1px solid'
canvas.style.cursor = getCursor()
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
        console.log('鼠标按下', e)
    },
    onMouseMove(e) {
        // console.log('鼠标移动', e)
    },
    onMouseUp(e) {
        console.log('鼠标抬起', e)
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

genBtn('关闭/ 打开绘制', () => {
    board.enableDrawing = !board.enableDrawing
})