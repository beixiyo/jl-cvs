import type { NoteBoardOptions } from '.'


export function mergeOpts(opts: NoteBoardOptions = {}) {
    return {
        ... {
            width: 800,
            height: 600,
            lineWidth: 1,
            storkeColor: '#000'
        },
        ...opts,
    }
}
