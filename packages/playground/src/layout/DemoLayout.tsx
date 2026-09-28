import { cn } from '@/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'

/**
 * 演示页统一骨架：页头（标题 + 描述 + 操作）+ 主体网格（舞台 + 配置面板）
 *
 * 解决旧演示页的布局问题：
 * - 逼仄：统一 8 的倍数留白节奏，舞台最小高度保障
 * - 山寨感：去掉渐变底与 emoji 标题，使用全局语义色 token
 * - 配置面板滚动绑定全局：面板自身 sticky + 独立滚动
 */
export const DemoPage = memo(function DemoPage(
  {
    title,
    desc,
    icon: Icon,
    actions,
    children,
    className,
  }: DemoPageProps,
) {
  return (
    <div className={ cn('mx-auto w-full max-w-360 px-5 py-7 lg:px-8 lg:py-9', className) }>
      { /* 页头 */ }
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight lg:text-2xl">
            { Icon && (
              <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background2 text-brand">
                <Icon size={ 16 } />
              </span>
            ) }
            { title }
          </h1>
          { desc && (
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text2">
              { desc }
            </p>
          ) }
        </div>

        { actions && (
          <div className="flex shrink-0 items-center gap-2">
            { actions }
          </div>
        ) }
      </header>

      { /* 主体：舞台 + 配置面板 */ }
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        { children }
      </div>
    </div>
  )
})

/**
 * 效果舞台：画布 / 图像展示区
 */
export const Stage = memo(function Stage(
  {
    children,
    className,
    bare = false,
  }: StageProps,
) {
  return (
    <section
      className={ cn(
        !bare && 'rounded-2xl border border-border bg-background2/40 p-4 lg:p-5',
        'relative flex min-h-105 items-center justify-center overflow-hidden lg:min-h-130',
        className,
      ) }
    >
      { children }
    </section>
  )
})

/**
 * 配置面板：sticky 定位、自身滚动，不牵动页面
 */
export const ConfigPanel = memo(function ConfigPanel(
  {
    title = '参数配置',
    children,
    className,
  }: ConfigPanelProps,
) {
  return (
    <aside
      className={ cn(
        'rounded-2xl border border-border bg-background',
        'max-h-[calc(100svh-11rem)] overflow-y-auto overscroll-contain p-4',
        'xl:sticky xl:top-6',
        className,
      ) }
    >
      <h2 className="mb-3 px-1 text-xs font-medium tracking-widest text-text3 uppercase">
        { title }
      </h2>
      <div className="space-y-5 px-1 pb-1">
        { children }
      </div>
    </aside>
  )
})

/**
 * 配置分组标题
 */
export const ConfigGroup = memo(function ConfigGroup(
  { title, children }: { title: string; children: ReactNode },
) {
  return (
    <section>
      <h3 className="mb-2.5 text-[13px] font-medium text-text">
        { title }
      </h3>
      <div className="space-y-3">
        { children }
      </div>
    </section>
  )
})

/**
 * 单个配置字段：label + 值 + 控件
 */
export const Field = memo(function Field(
  {
    label,
    value,
    hint,
    children,
  }: FieldProps,
) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs text-text2">{ label }</span>
        { value !== undefined && <span className="font-mono text-xs text-text3 tabular-nums">{ value }</span> }
      </div>
      { children }
      { hint && <p className="mt-1 text-[11px] leading-relaxed text-text3">{ hint }</p> }
    </label>
  )
})

export type DemoPageProps = {
  title: string
  desc?: string
  icon?: LucideIcon
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export type StageProps = {
  children?: ReactNode
  className?: string
  /** 裸模式：不套卡片，适合全出血画布 */
  bare?: boolean
}

export type ConfigPanelProps = {
  title?: string
  children?: ReactNode
  className?: string
}

export type FieldProps = {
  label: string
  /** 右侧展示的当前值 */
  value?: ReactNode
  hint?: string
  children?: ReactNode
}
