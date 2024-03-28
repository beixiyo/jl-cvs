import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'


const board = new NoteBoard({
    bgColor: '#fff',
    storkeColor: '#409eff'
})
document.body.appendChild(board.cvs)


genBtn('截图', async () => {
    const src = await board.shotImg('base64')
    const imgEl = new Image()
    imgEl.src = src
    document.body.appendChild(imgEl)
})
genBtn('清空', () => {
    board.clear()
})


