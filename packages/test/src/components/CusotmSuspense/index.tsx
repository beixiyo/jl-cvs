import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { Loading } from '@/components/Loading'

/**
 * lazy 加载的才有过渡效果
 */
export const CusotmSuspense = memo(({
  children,
}: CusotmSuspenseProps) => {
  return (
    <Suspense fallback={ <Loading loading /> }>
      {children}
    </Suspense>
  )
})

export interface CusotmSuspenseProps {
  children?: ReactNode
}
