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
            strokeStyle: '#000'
        },
        ...rawOpts,
        ...opts,
    }
}
