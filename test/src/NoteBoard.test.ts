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
    fillStyle: '#fff',
    strokeStyle: '#000',
    lineWidth: 1,

    onMouseDown(e) {
        console.log('鼠标按下', e)
    },
    onMouseMove(e) {
        console.log('鼠标移动', e)
    },
    onMouseUp(e) {
        console.log('鼠标抬起', e)
    },
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
