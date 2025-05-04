import { WavyLines } from '@/WavyLines'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

Object.assign(document.body.style, {
  margin: '0',
  padding: '0',
  overflow: 'hidden',
  background: '#F50',
})

Object.assign(canvas.style, {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
})

const wave = new WavyLines({
  canvas,
  xGap: 12, // 水平间距
  yGap: 36, // 垂直间距
  extraWidth: 250, // 额外宽度
  extraHeight: 40, // 额外高度
  mouseEffectRange: 200, // 鼠标效果范围
  strokeStyle: '#333', // 线条颜色
})

/** 在组件卸载时记得调用destroy方法清理事件监听 */
// wave.destroy()
