import { createFirework2 } from '@/firework'
import { genBtn } from './tools'


const cvs = document.createElement('canvas'),
    ctx = cvs.getContext('2d')!

const width = 500,
    height = 600

document.body.appendChild(cvs)

const { addFirework, stop, resume } = createFirework2(cvs, {
    ctx,
    height,
    width,
});

(window as any).stop = stop;
(window as any).resume = resume;


genBtn('发射烟花', () => {
    addFirework()
})