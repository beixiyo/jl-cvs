/**
 * 获取一个圆形的光标
 * @param size 光标大小，默认 30
 * @param color 光标颜色，默认 `#409eff55`
 */
export const getCircleCursor = (
  size = 30,
  color = '#409eff55'
) => {
  const circle = `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='${size}'
      height='${size}'
      fill='${color}'
      viewBox='0 0 ${size} ${size}'
    >
      <circle
        r='${size / 2}'
        cy='50%'
        cx='50%'
      />
    </svg>`

  const cursorData = `data:image/svg+xml;base64,${window.btoa(circle)}`

  return `url(${cursorData}) ${size / 2} ${size / 2}, crosshair`
}