import { memo, Suspense } from 'react'
import { Loading } from '..'
import type { CusotmSuspenseProps } from './types'

/**
 * lazy 加载的才有过渡效果
 */
export const CusotmSuspense = memo(({
  children,
}: CusotmSuspenseProps) => {
  return (
    <Suspense fallback={ <Loading loading /> }>
      { children }
    </Suspense>
  )
})
