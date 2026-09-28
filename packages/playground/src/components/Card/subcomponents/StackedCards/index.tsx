import { cn } from '@/utils'
import { memo } from 'react'
import type { StackedCardsProps, StackedCardsVariant } from './types'

const variantLayerStyles: Record<
  StackedCardsVariant,
  (depth: number, isTop: boolean) => string
> = {
  border: (_depth, isTop) =>
    cn(
      'border border-border bg-background2',
      isTop 
		? 'shadow-xs' 
		: 'shadow-none pointer-events-none',
    ),
  shadow: (depth, isTop) =>
    cn(
      'bg-background2',
      isTop
        ? 'shadow-card'
        : depth === 1
        ? 'shadow-button pointer-events-none'
        : 'shadow-xs pointer-events-none',
    ),
  background: (depth) =>
    cn(
      depth === 0 && 'bg-background2',
      depth === 1 && 'bg-background3 pointer-events-none',
      depth === 2 && 'bg-background4 pointer-events-none',
    ),
}

function StackedCardsBase(props: StackedCardsProps) {
  const {
    variant = 'border',
    layers = 3,
    autoHeight = false,
    layersContent,
    offsetX = 0,
    offsetY = 8,
    scaleStep = 0.03,
    opacityStep = 0.08,
    zIndexBase = 0,
    className,
    layerClassName,
    topLayerClassName,
    layerClassNames,
    contentClassName,
    style,
    children,
    ...rest
  } = props

  const normalizedLayers = Math.min(Math.max(layers, 1), 3) as 1 | 2 | 3

  return (
    <div
      { ...rest }
      className={ cn('relative', className) }
      style={ style }
    >
      { Array.from({ length: normalizedLayers }).map((_, index) => {
        const depth = normalizedLayers - 1 - index
        const isTop = depth === 0
        const translateX = offsetX * depth
        const translateY = offsetY * depth
        const scale = 1 - scaleStep * depth
        const opacity = Math.max(0, 1 - opacityStep * depth)
        const isInFlow = autoHeight && isTop
        const layerContent = layersContent?.[depth]
        const resolvedContent = typeof layerContent === 'undefined'
          ? (isTop
            ? children
            : null)
          : layerContent

        return (
          <div
            key={ index }
            aria-hidden={ !isTop }
            className={ cn(
              isInFlow
                ? 'relative'
                : 'absolute inset-0',
              'overflow-hidden rounded-xl transition-all duration-300 ease-out',
              variantLayerStyles[variant](depth, isTop),
              layerClassName,
              layerClassNames?.[depth],
              isTop && topLayerClassName,
            ) }
            style={ {
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              opacity,
              zIndex: zIndexBase + index,
            } }
          >
            { resolvedContent !== null && resolvedContent !== undefined && resolvedContent !== false && (
              <div className={ cn('relative h-full w-full', contentClassName) }>
                { resolvedContent }
              </div>
            ) }
          </div>
        )
      }) }
    </div>
  )
}

export const StackedCards = memo(StackedCardsBase) as typeof StackedCardsBase
export type { StackedCardsProps, StackedCardsVariant } from './types'
