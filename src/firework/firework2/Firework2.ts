import { getColor } from '@/canvasTool'
import { Launcher } from './Launcher'
import { Debris, type DebrisOpts } from './Debris'
import { Explosive } from './Explosive'
import { delFromItem } from '@/utils'


/**
 * 二段爆炸的烟花
 */
export class Firework2 {

    private color: string
    private status: Firework2Status = 'waiting'

    /** 烟花尾迹列表 */
    private debrisArr: Debris[] = []
    private launcher: Launcher
    private explosive?: Explosive

    ctx: CanvasRenderingContext2D

    constructor(opts: Firework2Opts) {
        const {
            color = getColor(),
            height,
            width,
            y,
            ctx
        } = opts

        this.color = color
        this.ctx = ctx
        this.launcher = new Launcher({
            color: this.color,
            firework: this,
            height,
            width,
            y
        })
    }

    /** 
     * 发射
     */
    launch() {
        this.launcher.start()
        this.status = 'launching'
    }

    /**
     * 更新
     */
    update() {
        if (this.status === 'launching') {
            const res = this.launcher.update()
            if (res.isEnd) {
                this.status = 'booming'
                this.boom(res)
            }
        }
        else if (this.status === 'booming') {
            const res = this.explosive.update()
            if (res.isEnd) {
                this.status = 'end'
            }
        }
        
        this.updateDebris()
    }

    /**
     * 更新烟花尾迹
     */
    updateDebris() {
        const list = [...this.debrisArr]
        list.forEach(debris => {
            const res = debris.update()
            if (res.isEnd) {
                delFromItem(this.debrisArr, debris)
            }
        })
    }

    /**
     * 爆炸
     */
    boom({ x, y }: Point) {
        this.explosive = new Explosive({
            firework: this,
            x,
            y,
            color: this.color
        })
        this.explosive.start()
    }

    /**
     * 添加烟花尾迹
     */
    addDebris(opts: DebrisOpts) {
        const debris = new Debris({
            ...opts,
            color: opts.color || this.color
        })
        debris.start()
        this.debrisArr.push(debris)
    }

    isEnd() {
        return this.status === 'end'
    }
}

export type Firework2Opts = {
    color?: string
    height: number
    width: number
    y?: number
    ctx: CanvasRenderingContext2D
}

type Firework2Status = 'waiting' | 'launching' | 'booming' | 'end'

type Point = {
    x: number
    y: number
}