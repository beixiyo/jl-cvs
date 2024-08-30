import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'


const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const board = new NoteBoard({
    canvas,
    fillStyle: '#fff',
    strokeStyle: '#409eff',
    lineWidth: 30,
    // ...
})


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
