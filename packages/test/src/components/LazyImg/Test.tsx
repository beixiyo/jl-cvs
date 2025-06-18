import type { CSSProperties } from 'react'
import { useNotifyParentReady } from '@/hooks'
import { cn } from '@/utils'
import { LazyImg } from '.'

const srcArr = [
  new URL('/11.png', import.meta.url).href,
  'https://images.pexels.com/photos/15736980/pexels-photo-15736980.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  'https://images.pexels.com/videos/32321051/hare-like-pet-32321051.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  'https://images.pexels.com/photos/12018974/pexels-photo-12018974.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
]

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  return <div className="h-screen overflow-auto">
    <div
      className={ cn(
        'flex flex-col gap-48',
      ) }
    >
      {
        srcArr.map((item, index) => (
          <LazyImg
            key={ index }
            src={ item }
            className="w-xl"
          />
        ),
        )
      }
    </div>
  </div>
}

export interface TestProps {
  className?: string
  style?: CSSProperties
}
