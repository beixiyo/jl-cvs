import { getColor } from '@/canvasTool'
import { Firework2 } from './Firework2'
import { ExplosiveDebris, type ExplosiveDebrisOpts } from './ExplosiveDebris'
import { getRandomNum, delFromItem } from '@/utils'


/**
 * 爆炸器
 */
export class Explosive {

    firework: Firework2
    x: number
    y: number
    color: string
    /** 爆炸碎片数量 */
    debrisNum: number

    debrisList: ExplosiveDebris[] = []
    /** 是否要二次爆炸 */
    needSecondBurst: boolean
    /** 是否是第一次爆炸 */
    isFirstBurst = true

    constructor(opts: ExplosiveOpts) {
        this.firework = opts.firework
        this.x = opts.x
        this.y = opts.y
        this.color = opts.color ?? getColor()

        this.debrisNum = opts.debrisNum ?? getRandomNum(50, 400)
        this.needSecondBurst = opts.needSecondBurst ?? this.debrisNum <= 100
    }

    start(
        debrisNum = this.debrisNum,
        opts: Partial<ExplosiveDebrisOpts> = {}
    ) {
        const params = {
            x: opts.x ?? this.x,
            y: opts.y ?? this.y,
            needSecondBurst: this.needSecondBurst && this.isFirstBurst,
            ...opts
        }

        for (let i = 0; i < debrisNum; i++) {
            const explosiveDebris = new ExplosiveDebris({
                firework: this.firework,
                color: this.color,
                ...params
            })
            explosiveDebris.start()
            this.debrisList.push(explosiveDebris)
        }
        this.isFirstBurst = false
    }

    update() {
        const list = [...this.debrisList]
        list.forEach(debris => {
            const res = debris.update()
            if (res.isEnd) {
                delFromItem(this.debrisList, debris)

                // 二次爆炸
                if (debris.needSecondBurst) {
                    this.start(5, {
                        x: res.x,
                        y: res.y,
                        speed: 1,
                        firework: this.firework,
                    })
                }
            }
        })

        return {
            isEnd: list.length <= 0
        }
    }

}

export type ExplosiveOpts = {
    firework: Firework2
    x: number
    y: number
    color?: string
    debrisNum?: number
    needSecondBurst?: boolean
}
