import { useBindWinEvent } from '@/hooks'
import { cn } from '@/utils'
import { ThemeToggle } from '../ThemeToggle'

const SEP = { path: '/', name: '' }

const pathArr = [
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
        `flex h-full flex-col gap-4
      bg-black text-white p-3 overflow-y-auto overflow-x-hidden`,
        className,
      ) }
      style={ style }
    >
      <ThemeToggle />

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
