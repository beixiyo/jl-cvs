import { useBindWinEvent } from '@/hooks'
import { cn } from '@/utils'
import { ThemeToggle } from '../ThemeToggle'

const SEP = { path: '/', name: '' }

const pathArr = [
  { path: '/waterRipple', name: '🌊 水波纹效果' },
  { path: '/noteBoard', name: '🎨 图像编辑画板' },
  { path: '/firework', name: '🎆 烟花效果' },
  { path: '/starField', name: '⭐ 星空场景' },
  { path: '/halftoneWave', name: '🌀 半调波浪' },
  { path: '/globeSphere', name: '🌍 球体地球仪' },
  { path: '/wavyLines', name: '〰️ 波浪线条' },
  { path: '/grid', name: '📐 网格效果' },
  { path: '/imgToFade', name: '🖼️ 图像淡化' },
  { path: '/imgToTxt', name: '📝 图像转文字' },
  { path: '/scratch', name: '🎯 刮刮卡' },
  { path: '/techNum', name: '🔢 科技数字' },
]

export function Menu(
  {
    className,
    style,
  }: MenuProps,
) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useBindWinEvent('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.altKey) {
      setIsOpen(true)
    }
  })

  return (
    <div
      className={ cn(
        `flex min-h-screen flex-col gap-4
      bg-black text-white p-3 overflow-y-auto overflow-x-hidden`,
        className,
      ) }
      style={ style }
    >
      <ThemeToggle className="my-0" />

      { pathArr.map((item, index) => (
        <NavLink
          key={ index }
          to={ item.path }
          className="transition-all duration-300 !hover:text-fuchsia-300"
          style={ {
            color: location.pathname === item.path
              ? '#f0abfc'
              : 'white',
          } }
        >
          { item.name }
        </NavLink>
      )) }

    </div>
  )
}
Menu.displayName = 'Index'

export interface MenuProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
