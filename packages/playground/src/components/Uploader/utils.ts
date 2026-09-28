export function getStrokeColor(params: {
  disabled?: boolean
  dragActive?: boolean
  dragInvalid?: boolean
  isHover?: boolean
}) {
  const { disabled, dragActive, dragInvalid, isHover } = params

  if (disabled) {
    return 'rgb(var(--border) / 1)'
  }

  if (dragActive) {
    return dragInvalid
      ? 'rgb(var(--danger) / 1)'
      : 'rgb(var(--brand) / 1)'
  }

  if (isHover) {
    return 'rgb(var(--brand) / 1)'
  }

  return 'rgb(var(--border3) / 1)'
}
