/** 
 * 贝塞尔曲线对象
 */
export const timeFunc = {
  linear: (progress: number) => progress,
  ease: (progress: number) => 0.5 - 0.5 * Math.cos(progress * Math.PI),
  easeIn: (progress: number) => progress * progress,
  easeOut: (progress: number) => 1 - Math.pow(1 - progress, 2),
  easeInOut: (progress: number) =>
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2,

  /** https://echarts.apache.org/examples/zh/editor.html?c=line-easing */
  quadraticIn(k: number) {
    return k * k
  },
  quadraticOut(k: number) {
    return k * (2 - k)
  },
  quadraticInOut(k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k
    }
    return -0.5 * (--k * (k - 2) - 1)
  },
  cubicIn(k: number) {
    return k * k * k
  },
  cubicOut(k: number) {
    return --k * k * k + 1
  },
  cubicInOut(k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k + 2)
  },
  quarticIn(k: number) {
    return k * k * k * k
  },
  quarticOut(k: number) {
    return 1 - --k * k * k * k
  },
  quarticInOut(k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k
    }
    return -0.5 * ((k -= 2) * k * k * k - 2)
  },
  quinticIn(k: number) {
    return k * k * k * k * k
  },
  quinticOut(k: number) {
    return --k * k * k * k * k + 1
  },
  quinticInOut(k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2)
  },
  sinusoidalIn(k: number) {
    return 1 - Math.cos((k * Math.PI) / 2)
  },
  sinusoidalOut(k: number) {
    return Math.sin((k * Math.PI) / 2)
  },
  sinusoidalInOut(k: number) {
    return 0.5 * (1 - Math.cos(Math.PI * k))
  },
  exponentialIn(k: number) {
    return k === 0 ? 0 : Math.pow(1024, k - 1)
  },
  exponentialOut(k: number) {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
  },
  exponentialInOut(k: number) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1)
    }
    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
  },
  circularIn(k: number) {
    return 1 - Math.sqrt(1 - k * k)
  },
  circularOut(k: number) {
    return Math.sqrt(1 - --k * k)
  },
  circularInOut(k: number) {
    if ((k *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - k * k) - 1)
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
  },
  elasticIn(k: number) {
    let s: number
    let a = 0.1
    let p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return -(
      a *
      Math.pow(2, 10 * (k -= 1)) *
      Math.sin(((k - s) * (2 * Math.PI)) / p)
    )
  },
  elasticOut(k: number) {
    let s: number
    let a = 0.1
    let p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return (
      a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1
    )
  },
  elasticInOut(k: number) {
    let s: number
    let a = 0.1
    let p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    if ((k *= 2) < 1) {
      return (
        -0.5 *
        (a *
          Math.pow(2, 10 * (k -= 1)) *
          Math.sin(((k - s) * (2 * Math.PI)) / p))
      )
    }
    return (
      a *
      Math.pow(2, -10 * (k -= 1)) *
      Math.sin(((k - s) * (2 * Math.PI)) / p) *
      0.5 +
      1
    )
  },
  /** 
   * 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
   */
  backIn(k: number) {
    let s = 1.70158
    return k * k * ((s + 1) * k - s)
  },
  backOut(k: number) {
    let s = 1.70158
    return --k * k * ((s + 1) * k + s) + 1
  },
  backInOut(k: number) {
    let s = 1.70158 * 1.525
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s))
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
  },
  /** 
   * 弹跳效果
   */
  bounceIn(k: number) {
    return 1 - timeFunc.bounceOut(1 - k)
  },
  bounceOut(k: number) {
    if (k < 1 / 2.75) {
      return 7.5625 * k * k
    } else if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75
    } else if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375
    } else {
      return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375
    }
  },
  bounceInOut(k: number) {
    if (k < 0.5) {
      return timeFunc.bounceIn(k * 2) * 0.5
    }
    return timeFunc.bounceOut(k * 2 - 1) * 0.5 + 0.5
  }
}

/**
 * 生成贝塞尔曲线函数
 * @param name 动画函数名称
 * @returns 一个接收`0 ~ 1`进度参数的函数
 */
export function genTimeFunc(name?: TimeFunc) {
  if (typeof name === 'function') {
    return name
  }

  const fn = timeFunc[name ?? 'linear']
  return fn
}


export type TimeFuncStr = keyof typeof timeFunc
/** 
 * ### 动画过渡函数
 * 支持内置函数和函数，函数需要返回一个 `0 ~ 1` 之间的值
 */
export type TimeFunc = TimeFuncStr | ((progress: number) => number)