import { Grid } from '@/Grid'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
Object.assign(document.body.style, {
  overflow: 'hidden',
  margin: 0,
  padding: 0,
})

const grid = new Grid(canvas, {
  dashedLines: true,          // 启用虚线网格
})

window.addEventListener('resize', () => {
  grid.onResize(window.innerWidth, window.innerHeight)
})
