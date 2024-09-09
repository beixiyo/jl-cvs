import type { NoteBoardOptions } from '.'


export function mergeOpts(
    opts: NoteBoardOptions = {},
    rawOpts: NoteBoardOptions = {}
) {
    return {
        ... {
            width: 800,
            height: 600,
            lineWidth: 1,
            strokeStyle: '#000',
            lineCap: 'round' as CanvasLineCap,
        },
        ...rawOpts,
        ...opts,
    }
}

/**
 * 获取一个圆形的光标
 */
export const getCursor = (
    size = 30,
    color = '#409eff55'
) => {
    const circle = `
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='${size}'
        height='${size}'
        fill='${color}'
        viewBox='0 0 ${size * 2} ${size * 2}'
    >
      <circle
        r='${size}'
        cy='50%'
        cx='50%'
      />
    </svg>`

    const cursorData = `data:image/svg+xml;base64,${window.btoa(circle)}`

    return `url(${cursorData}) ${size / 2} ${size / 2}, crosshair`
}