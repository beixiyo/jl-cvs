import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/utils'
import { Github, Home } from 'lucide-react'
import { memo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AssetLoadWarning } from '../views/_shared/AssetLoadWarning'
import { ALL_NAV_ITEMS, NAV_GROUPS } from './nav'

/**
 * 演示站应用壳
 *
 * 布局要点（修复「侧栏滚动绑定全局」的 bug）：
 * - 外层 `h-svh overflow-hidden`，页面本身永不滚动
 * - 侧栏与内容区是两个独立滚动容器，各自 `overflow-y-auto`
 * - 侧栏 `sticky` 并以视口高度为上限，内容再多也不撑开页面
 */
export const AppShell = memo(function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const currentItem = ALL_NAV_ITEMS.find((i) => location.pathname.startsWith(i.path))

  return (
    <div className="flex h-svh overflow-hidden bg-background text-text">
      { /* ===== 侧栏（桌面） ===== */ }
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-background2/60 md:flex">
        <SidebarContent />
      </aside>

      { /* ===== 移动端抽屉 ===== */ }
      { mobileNavOpen && (
        <div className="fixed inset-0 z-overlay md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={ () => setMobileNavOpen(false) }
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-background shadow-2xl">
            <SidebarContent onNavigate={ () => setMobileNavOpen(false) } />
          </aside>
        </div>
      ) }

      { /* ===== 主内容区：独立滚动 ===== */ }
      <main className="relative flex min-w-0 flex-1 flex-col">
        { /* 移动端顶栏 */ }
        <header className="flex h-13 shrink-0 items-center gap-2 border-b border-border bg-background2/60 px-4 md:hidden">
          <button
            type="button"
            onClick={ () => setMobileNavOpen(true) }
            className="rounded-md p-1.5 text-text2 hover:bg-background3"
            aria-label="打开导航"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="truncate text-sm font-medium">
            { currentItem?.name ?? 'jl-cvs' }
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pt-4 lg:px-8">
            <AssetLoadWarning />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
})

/**
 * 侧栏内容（桌面与移动抽屉共用）
 */
const SidebarContent = memo(function SidebarContent(
  { onNavigate }: { onNavigate?: () => void },
) {
  return (
    <>
      { /* Logo 与返回官网 */ }
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <NavLink
          to="/"
          className="group flex items-center gap-2"
          onClick={ onNavigate }
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-text text-background font-bold">
            J
          </span>
          <span className="text-[15px] font-semibold tracking-tight">jl-cvs</span>
        </NavLink>

        <NavLink
          to="/"
          onClick={ onNavigate }
          title="返回官网首页"
          className="flex size-7 items-center justify-center rounded-md text-text3 transition-colors hover:bg-background3 hover:text-text"
        >
          <Home size={ 15 } />
        </NavLink>
      </div>

      { /* 分组导航 */ }
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        { NAV_GROUPS.map((group) => (
          <div key={ group.title } className="mb-5">
            <div className="mb-1.5 px-2 text-[11px] font-medium tracking-widest text-text3 uppercase">
              { group.title }
            </div>
            { group.items.map((item) => (
              <NavLink
                key={ item.path }
                to={ item.path }
                onClick={ onNavigate }
                className={ ({ isActive }) =>
                  cn(
                    'group relative mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.75 text-[13px] text-text2 transition-colors',
                    'hover:bg-background3 hover:text-text',
                    isActive && 'bg-background3 font-medium text-text',
                  ) }
              >
                { ({ isActive }) => (
                  <>
                    <span
                      className={ cn(
                        'absolute left-0 h-4 w-[2.5px] rounded-full bg-brand transition-opacity',
                        isActive
                          ? 'opacity-100'
                          : 'opacity-0',
                      ) }
                    />
                    <item.icon
                      size={ 15 }
                      className={ cn(
                        'shrink-0 text-text3 transition-colors',
                        'group-hover:text-text2',
                        isActive && 'text-brand',
                      ) }
                    />
                    { item.name }
                  </>
                ) }
              </NavLink>
            )) }
          </div>
        )) }
      </nav>

      { /* 底部：GitHub + 主题切换 */ }
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <a
          href="https://github.com/beixiyo/jl-cvs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-text3 transition-colors hover:text-text"
        >
          <Github size={ 14 } />
          GitHub
        </a>
        <ThemeToggle size={ 42 } />
      </div>
    </>
  )
})
