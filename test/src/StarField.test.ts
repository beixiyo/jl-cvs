import { StarField } from '@/StarField'

Object.assign(document.body.style, {
  overflow: 'hidden',
  margin: 0,
  padding: 0,
})

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const starField = new StarField(canvas, {
  flickerSpeed: 0.02,
  speedRange: 0.1
  // backgroundColor: 'transparent'
})

window.addEventListener('resize', () => {
  starField.onResize(window.innerWidth, window.innerHeight)
})