import { NoteBoard } from '@/NoteBoard'
import { genBtn } from './tools'
import { cutImg } from '@/canvasTool'

const WIDTH = 400
const HEIGHT = 300


/**
 * 图片画板 =========================================
 */
const imgCanvas = genCanvas(false, canvas => {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.top = '40px'
    div.style.left = '0'
    div.style.overflow = 'hidden'

    div.style.width = WIDTH + 'px'
    div.style.height = HEIGHT + 'px'

    document.body.appendChild(div)
    div.appendChild(canvas)
})
const imgBoard = new NoteBoard({
    canvas: imgCanvas,
    width: WIDTH,
    height: HEIGHT,
})

/**
 * 居中绘制图片，并自动拉伸大小
 */
imgBoard.drawImg(
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
            console.log({ drawHeight, drawWidth, minScale, rawWidth, rawHeight })
            console.log(`图片原始宽度: ${rawWidth}, ${drawWidth / minScale}`)
            console.log(`图片原始高度: ${rawHeight}, ${drawHeight / minScale}`)

            /**
             * 还原原始尺寸图片
             */
            const mask = await cutImg(img, {
                x,
                y,
                width: drawWidth,
                height: drawHeight,
                scaleX: 1 / minScale,
                scaleY: 1 / minScale,
            })

            console.log(mask)
        },
    },
)


/**
 * 画板 =========================================
 */
const canvas = genCanvas()
canvas.style.top = '40px'

let scaleX = 1,
    scaleY = 1,
    translateX = 0,
    translateY = 0

const board = new NoteBoard({
    canvas,
    width: WIDTH,
    height: HEIGHT,
    fillStyle: '#409eff33',
    strokeStyle: '#409eff33',
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
    },

    /**
     * 同步缩放
     */
    onWheel(zoomX, zoomY, offsetX, offsetY) {
        scaleX = zoomX
        scaleY = zoomY

        imgCanvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
        imgCanvas.style.transformOrigin = `${offsetX}px ${offsetY}px`
    },
    /**
     * @bug
     */
    // onDrag(dx, dy) {
    //     translateX = dx
    //     translateY = dy

    //     imgCanvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    // }
    // ...
})

/**
 * 开启绘制和缩放
 */
board.setMode('draw')
board.isEnableZoom = true


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
    imgCanvas.style.transform = 'none'
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


function genCanvas(needBorder = true, appendFn?: (canvas: HTMLCanvasElement) => void) {
    const canvas = document.createElement('canvas')
    needBorder && (canvas.style.border = '1px solid')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'

    if (appendFn) {
        appendFn(canvas)
    }
    else {
        document.body.appendChild(canvas)
    }

    return canvas
}