import { imgToTxt } from '@/txtToImg'


const cvs = document.createElement('canvas')
document.body.appendChild(cvs)

imgToTxt({
    canvas: cvs,
    opts: {
        txt: 'CJL',
        fontFamily: '楷体',
    },
    replaceText: '666666666',
})
