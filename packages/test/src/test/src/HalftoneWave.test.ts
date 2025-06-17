import { HalftoneWave } from '@/HalftoneWave'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
Object.assign(document.body.style, {
  overflow: 'hidden',
  margin: 0,
  padding: 0,
})

const halftoneWave = new HalftoneWave(canvas)

window.addEventListener('resize', () => {
  halftoneWave.onResize(window.innerWidth, window.innerHeight)
})
