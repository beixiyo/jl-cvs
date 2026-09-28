import type { FloatingAlign, FloatingPlacement, FloatingSide } from './types'

export type Rect = {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export function parsePlacement(placement: FloatingPlacement): { side: FloatingSide; align: FloatingAlign } {
  const [sideRaw, alignRaw] = placement.split('-') as [FloatingSide, FloatingAlign | undefined]
  return {
    side: sideRaw,
    align: alignRaw || 'center',
  }
}

export function oppositeSide(side: FloatingSide): FloatingSide {
  switch (side) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

export function buildPlacement(side: FloatingSide, align: FloatingAlign): FloatingPlacement {
  return align === 'center'
    ? side
    : `${side}-${align}`
}

export function calcCoords(
  reference: Rect,
  floating: Rect,
  placement: FloatingPlacement,
  offset: number,
) {
  const { side, align } = parsePlacement(placement)

  let x = 0
  let y = 0

  if (side === 'top') {
    y = reference.top - floating.height - offset
  }
  else if (side === 'bottom') {
    y = reference.bottom + offset
  }
  else if (side === 'left') {
    x = reference.left - floating.width - offset
  }
  else if (side === 'right') {
    x = reference.right + offset
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'start') {
      x = reference.left
    }
    else if (align === 'end') {
      x = reference.right - floating.width
    }
    else {
      x = reference.left + (reference.width - floating.width) / 2
    }
  }
  else {
    if (align === 'start') {
      y = reference.top
    }
    else if (align === 'end') {
      y = reference.bottom - floating.height
    }
    else {
      y = reference.top + (reference.height - floating.height) / 2
    }
  }

  return { x, y }
}

export function calcOverflow(
  x: number,
  y: number,
  floating: Rect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
) {
  const left = padding - x
  const right = (x + floating.width) - (viewportWidth - padding)
  const top = padding - y
  const bottom = (y + floating.height) - (viewportHeight - padding)

  return {
    left: Math.max(0, left),
    right: Math.max(0, right),
    top: Math.max(0, top),
    bottom: Math.max(0, bottom),
    total: Math.max(0, left) + Math.max(0, right) + Math.max(0, top) + Math.max(0, bottom),
  }
}
