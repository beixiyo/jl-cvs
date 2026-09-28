'use client'

import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SafePortalProps } from './types'

export const SafePortal = memo<SafePortalProps>((props) => {
  const {
    children,
    target,
  } = props
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const portalTarget = target ?? (mounted
    ? document.body
    : null)

  if (!mounted || !portalTarget) return null

  return createPortal(children, portalTarget)
})

SafePortal.displayName = 'SafePortal'
