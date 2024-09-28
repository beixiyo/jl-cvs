import { imgToFade } from '@/imgToFade'
import { getWinHeight, getWinWidth } from '@jl-org/tool'


const cvs = document.createElement('canvas')
document.body.appendChild(cvs)

imgToFade(cvs, {
    src: new URL('../assets/umr.jpg', import.meta.url).href,
    width: getWinWidth(),
    height: getWinHeight()
})