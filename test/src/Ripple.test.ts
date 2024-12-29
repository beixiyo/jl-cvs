import { getColor } from '@/canvasTool'
import { WaterRipple } from '@/Ripple'


const ripple = new WaterRipple({
  onResize() {
    ripple.setSize(window.innerWidth, window.innerHeight)
  },
  /** 圈数 */
  circleCount: 25,
  /** 波纹激烈程度 */
  intensity: 1,
  /** 随机颜色，癫痫患者慎选 */
  // strokeStyle: getColor
  // ...
})
ripple.canvas.style.position = 'fixed'
ripple.canvas.style.top = '0'
ripple.canvas.style.left = '0'

document.body.appendChild(ripple.canvas)