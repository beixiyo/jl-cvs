import { DotGrid } from '@/Grid'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

Object.assign(document.body.style, {
  overflow: 'hidden',
  margin: '0',
  padding: '0',
  background: '#000',
})

const grid = new DotGrid(canvas)

window.addEventListener('resize', () => {
  grid.onResize(window.innerWidth, window.innerHeight)
})