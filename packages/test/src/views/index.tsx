import { Menu } from '@/components/Menu'

export default function Index() {
  const menuWidth = 148

  return (
    <div className="min-h-screen flex dark:bg-black dark:text-gray-200">

      <Menu style={ { width: menuWidth } } />
      <div style={ {
        width: `calc(100% - ${menuWidth}px)`,
      } }>
        <Outlet></Outlet>
      </div>

    </div>
  )
}
