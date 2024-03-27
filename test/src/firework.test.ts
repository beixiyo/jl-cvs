import { initFirework } from '@/index'


const cvs = document.createElement('canvas')
document.body.appendChild(cvs);

(window as any).cancel = initFirework(cvs)
