import { GlobeSphere } from '@/GlobeSphere'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

Object.assign(document.body.style, {
  overflow: 'hidden',
  margin: '0',
  padding: '0',
  background: '#181818',
})

const globe = new GlobeSphere(canvas)

window.addEventListener('resize', () => {
  globe.onResize(window.innerWidth, window.innerHeight)
})