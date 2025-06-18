import type { MotionProps } from 'framer-motion'
import type { CSSProperties } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { memo } from 'react'
import { useAsyncEffect } from '@/hooks'
import { cn } from '@/utils'
import { animateVariants, DURTAION } from './constants'

const InnerAnimateShow = forwardRef<HTMLDivElement, AnimateShowProps>((
  {
    style,
    className,
    children,

    show = true,
    display = 'block',
    visibilityMode = false,

    duration = DURTAION,
    variants,
    exitSetMode,
    ...rest
  },
  ref,
) => {
  const controller = useAnimationControls()
  const [isAnimating, setIsAnimating] = useState(true)

  useAsyncEffect(
    async () => {
      setIsAnimating(true)

      if (show) {
        await controller.start('initial')
        await controller.start('animate')
        return
      }

      if (exitSetMode) {
        controller.set('exit')
        setIsAnimating(false)
        return
      }

      await controller.start('exit')
      setIsAnimating(false)
    },
    [show, controller],
  )

  return (
    <motion.div
      ref={ ref }
      className={ cn(className) }

      variants={ variants || animateVariants }
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
                visibility: !show && !isAnimating
                  ? 'hidden'
                  : 'visible',
              }
            : {
                display: !show && !isAnimating
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

export const AnimateShow = memo<AnimateShowProps>(InnerAnimateShow) as typeof InnerAnimateShow
AnimateShow.displayName = 'AnimateShow'

export type AnimateShowProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode

  show?: boolean
  display?: string
  visibilityMode?: boolean
  duration?: number

  /**
   * 退出动画是否采用 set 同步模式
   * 这将关闭退出动画
   * ### 适用于路由动画，可以解决布局异常问题
   */
  exitSetMode?: boolean
}
& MotionProps
& React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
