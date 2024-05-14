import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'


const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const board = new NoteBoard({
    canvas,
    bgColor: '#fff',
    storkeColor: '#409eff'
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
