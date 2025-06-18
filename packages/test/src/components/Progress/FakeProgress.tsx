// import { LogoLoading } from "@/components/LogoLoading"
import { FakeProgress as Progress } from '@jl-org/tool'
import { cn } from '@/utils'
import { ProgressBar } from './ProgressBar'

export const FakeProgress = memo<FakeProgressProps>((
  {
    style,
    className,

    done,
    size = 150,
    onChange: _onChange,
    uniqueKey,

    showLogo = true,
    showText = true,
    showBar = true,
  },
) => {
  const [val, setVal] = useState(0)

  const progress = useMemo(() => new Progress({
    autoStart: false,
    timeConstant: 240000,
    initialProgress: uniqueKey
      ? +(localStorage.getItem(uniqueKey) || 0)
      : 0,

    onChange: (val) => {
      setVal(val)
      _onChange?.(val)
      uniqueKey && localStorage.setItem(uniqueKey, val.toString())

      val >= 0.95 && progress.stop()
    },
  }), [])

  function clear() {
    progress.end()
    progress.stop()
    uniqueKey && localStorage.removeItem(uniqueKey)
  }

  useEffect(() => {
    progress.start()
    return clear
  }, [])

  useEffect(() => {
    if (!done)
      return
    clear()
  }, [done])

  return (
    <div
      className={ cn(
        'absolute inset-0 bg-[#F9FAFC] flex justify-center items-center flex-col',
        className,
      ) }
      style={ style }
    >
      {/* {showLogo && <LogoLoading size={size} />} */ }

      { showText && (
        <p>
          <span>Estimated 2 minutes, please wait patiently... </span>
          <span className="ml-2 text-[#01D0BD]">
            { ' ' }
            { (val * 100).toString().slice(0, 5) }
            %
          </span>
        </p>
      ) }

      { showBar && (
        <ProgressBar
          className="absolute bottom-0 z-50 h-1 w-full"
          value={ val }
        >
        </ProgressBar>
      ) }
    </div>
  )
})
FakeProgress.displayName = 'FakeProgress'

export interface FakeProgressProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode

  size?: number | string
  done?: boolean
  onChange?: (val: number) => void

  showLogo?: boolean
  showText?: boolean
  showBar?: boolean

  /**
   * 唯一 ID，保持持久化进度用的
   */
  uniqueKey?: string
}
