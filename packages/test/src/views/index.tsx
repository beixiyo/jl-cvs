import { Menu } from '@/components/Menu'

export default function Gallery() {
  return (
    <div className="flex size-full">
      <Menu></Menu>
      <Outlet></Outlet>
    </div>
  )
}
