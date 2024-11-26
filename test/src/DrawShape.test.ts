import { DrawShape } from '@/Shapes'

const cvs = document.createElement('canvas')
cvs.width = 800
cvs.height = 800

document.body.appendChild(cvs)
cvs.style.border = '1px solid'
cvs.style.display = 'inline-block'
cvs.style.margin = '10px'

const ctx = cvs.getContext('2d')!

const drawShape = new DrawShape(cvs, ctx)