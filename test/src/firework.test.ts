import { createFirework } from '@/firework'


const cvs = document.createElement('canvas')
document.body.appendChild(cvs);

(window as any).cancel = createFirework(cvs)
