'use client'

import { useCustomEffect } from '@/hooks'
import { cn } from '@/utils'
import { motion, useAnimationControls } from 'motion/react'
import { forwardRef, memo, useRef, useState } from 'react'
import { animateVariants, DURATION, variantsMap } from '../constants'
import type { AnimateShowProps } from '../types'

const InnerAnimateShow = forwardRef<HTMLDivElement, AnimateShowProps>((
  {
    style,
    className,
    children,

    show = true,
    display = 'block',
    visibilityMode = false,

    duration = DURATION,
    variants = 'top-bottom',
    exitSetMode,
    animateOnMount = false,
    ...rest
  },
  ref,
) => {
  const controller = useAnimationControls()
  /**
   * 退出动画是否已结束——仅在 exit 真正播放完（或同步关闭 / 首帧即关闭）后才置 true
   *
   * 用它（而非滞后一帧的「是否动画中」）来决定 display:none 是关键：
   * 关闭全程保持 `exitDone=false`，元素在 exit 播放期间始终可见，
   * `controller.start('exit')` 作用在可见元素上才能正常播放、Promise 才会 resolve；
   * 旧实现用滞后状态算 display，会出现「先 display:none 一帧、exit 又调在隐藏元素上挂死」
   * 的闪烁 + 卡死（关闭后元素停在可见态、动画不播）
   *
   * 初值取 `!show`：首帧即关闭态时直接 display:none，避免 SSR/水合后整块闪现（如抽屉闪屏）
   */
  const [exitDone, setExitDone] = useState(!show)
  const isFirstMount = useRef(true)

  useCustomEffect(
    () => {
      let isCancelled = false

      const runAnimation = async () => {
        const isMount = isFirstMount.current

        if (isMount) isFirstMount.current = false

        if (show) {
          /** 进入前先解除隐藏，保证 enter 动画作用在可见元素上 */
          setExitDone(false)

          if (isMount && !animateOnMount) {
            controller.set('animate')
          }
          else {
            controller.set('initial')
            await controller.start('animate')
          }
          return
        }

        /** 同步关闭 / 首帧即关闭：直接定格 exit 终态并隐藏，无退出动画 */
        if (exitSetMode || (isMount && !animateOnMount)) {
          controller.set('exit')
          if (!isCancelled) setExitDone(true)
          return
        }

        /** 关闭：此刻元素仍可见（exitDone 仍为 false），exit 动画播完后再隐藏 */
        await controller.start('exit')
        if (!isCancelled) setExitDone(true)
      }

      runAnimation()

      return () => {
        isCancelled = true
      }
    },
    [show, controller, animateOnMount, exitSetMode],
  )

  return (
    <motion.div
      ref={ ref as any }
      className={ cn(className) }
      variants={ typeof variants === 'string'
        ? variantsMap[variants] || animateVariants
        : variants || animateVariants }
      animate={ controller }
      transition={ {
        duration,
        type: 'tween',
        ease: 'easeInOut',
      } }
      style={ {
        ...(
          visibilityMode
            ? {
              visibility: !show && exitDone
                ? 'hidden'
                : 'visible',
            }
            : {
              display: !show && exitDone
                ? 'none'
                : display,
            }
        ),
        ...style,
      } }
      { ...rest }
    >
      { children }
    </motion.div>
  )
})

export const AnimateShow = memo(InnerAnimateShow) as typeof InnerAnimateShow
AnimateShow.displayName = 'AnimateShow'
