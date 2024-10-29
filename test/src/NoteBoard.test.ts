import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'
import { cutImg } from '@/canvasTool'

const WIDTH = 600
const HEIGHT = 600
document.body.style.padding = '40px'

/**
 * 图片画板 =========================================
 */
const el = document.createElement('div')
el.style.border = '1px solid'
document.body.appendChild(el)
const board = new NoteBoard({
    el,
    width: WIDTH,
    height: HEIGHT,
})

/**
 * 居中绘制图片，并自动拉伸大小
 */
board.drawImg(
    new URL('./PixPin_2024-10-29_14-27-44.png', import.meta.url).href,
    {
        center: true,
        autoFit: true,
        async afterDraw({
            minScale,
            img,

            x,
            y,
            drawWidth,
            drawHeight,
            rawWidth,
            rawHeight,
        }) {
            // console.log({ drawHeight, drawWidth, minScale, rawWidth, rawHeight })
            // console.log(`图片原始宽度: ${rawWidth}, ${drawWidth / minScale}`)
            // console.log(`图片原始高度: ${rawHeight}, ${drawHeight / minScale}`)

            // /**
            //  * 还原原始尺寸图片
            //  */
            // const mask = await cutImg(img, {
            //     x,
            //     y,
            //     width: drawWidth,
            //     height: drawHeight,
            //     scaleX: 1 / minScale,
            //     scaleY: 1 / minScale,
            // })

            // console.log(mask)
        },
    },
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
