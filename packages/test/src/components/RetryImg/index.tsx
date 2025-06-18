import { getImg, retryTask } from '@jl-org/tool'
import { clsx } from 'clsx'
import { memo } from 'react'
import { useAsyncEffect } from '@/hooks'

export const RetryImg = memo<RetryImgProps>((
  {
    style,
    className,
    src,
    retryCount = 3,
    ...rest
  },
) => {
  const [url, setUrl] = useState(src)
  const [key, setKey] = useState(0)

  useAsyncEffect(
    async () => {
      const newUrl = await retryTask(async () => {
        const img = await getImg(src)
        if (!img) {
          return Promise.reject('')
        }

        return src
      }, retryCount)

      setUrl(newUrl)
      setKey(prev => prev++)
    },
    [src],
  )

  return <img
    key={ key }
    className={ clsx(
      'RetryImgContainer',
      className,
    ) }
    style={ style }
    src={ url }
    { ...rest }
  ></img>
})

RetryImg.displayName = 'RetryImg'

export type RetryImgProps = {
  className?: string
  style?: React.CSSProperties
  src: string
  retryCount?: number
}
& Omit<
  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  'src'
>
