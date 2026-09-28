import { ThemeToggle } from '@/components/ThemeToggle'
import { ALL_NAV_ITEMS, NAV_GROUPS } from '@/layout/nav'
import { cn } from '@/utils'
import { StarField } from '@jl-org/cvs'
import { ArrowRight, Copy, Github, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AssetLoadWarning } from './_shared/AssetLoadWarning'

const HERO_BG = '#05070d'

/**
 * 官网首页 —— 打包后对外展示的门面
 *
 * 第一屏用本库的 StarField 做活体背景：官网本身就是效果的演示场
 */
export default function Index() {
  return (
    <div className="min-h-svh bg-background text-text">
      { /* ===== 顶栏 ===== */ }
      <header className="fixed inset-x-0 top-0 z-sticky border-b border-white/6 bg-[#05070d]/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-white text-[13px] font-bold text-black">
              J
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">jl-cvs</span>
          </a>

          <nav className="flex items-center gap-1.5">
            <a
              href="https://github.com/beixiyo/jl-cvs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/25 hover:text-white"
            >
              <Github size={ 13 } />
              GitHub
            </a>
            <div className="[&_button]:border-white/10!">
              <ThemeToggle size={ 38 } />
            </div>
          </nav>
        </div>
      </header>

      { /* ===== Hero ===== */ }
      <Hero />

      { /* ===== 效果画廊 ===== */ }
      <main className="mx-auto max-w-6xl px-5 pb-10">
        <div className="mb-5">
          <AssetLoadWarning />
        </div>
        <SectionHeading
          eyebrow="Gallery"
          title="开箱即用的效果画廊"
          desc="每一个演示页都是可交互的沙盒，参数实时可调，感受每个 API 的能力边界"
        />

        { NAV_GROUPS.map((group, gi) => (
          <section key={ group.title } className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-sm font-medium tracking-wide text-text2">{ group.title }</h3>
              <span className="font-mono text-xs text-text3">{ group.items.length }</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              { group.items.map((item, i) => (
                <GalleryCard
                  key={ item.path }
                  item={ item }
                  delay={ gi * 0.04 + i * 0.03 }
                />
              )) }
            </div>
          </section>
        )) }

        { /* ===== 快速开始 ===== */ }
        <section className="rounded-2xl border border-border bg-background2/50 p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">快速开始</h3>
              <p className="mt-1 text-[13px] text-text2">
                纯 Canvas 实现，无运行时依赖，支持 HiDPI 与自适应尺寸
              </p>
            </div>
            <InstallCommand />
          </div>
        </section>
      </main>

      { /* ===== 页脚 ===== */ }
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-[13px] text-text3 sm:flex-row">
          <p>jl-cvs —— 用 Canvas 创造令人惊叹的效果</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/beixiyo/jl-cvs"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-text"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@jl-org/cvs"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-text"
            >
              npm
            </a>
            <span className="font-mono text-xs">MIT</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * Hero：活体星空背景 + 主标语
 */
function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let starField: StarField | null = null
    const raf = requestAnimationFrame(() => {
      starField = new StarField(canvas, {
        starCount: 420,
        sizeRange: [0.4, 1.8],
        speedRange: 0.16,
        backgroundColor: HERO_BG,
        flickerSpeed: 0.008,
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      })
    })

    /** 星域跟随容器尺寸 */
    const observer = new ResizeObserver(() => {
      starField?.onResize(canvas.clientWidth, canvas.clientHeight)
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      starField?.stop()
    }
  }, [])

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-[#05070d]">
      { /* 活体星空 */ }
      <canvas
        ref={ canvasRef }
        className="absolute inset-0 size-full"
        aria-hidden
      />

      { /* 氛围层：径向收光 + 底部融入主题背景 */ }
      <div
        className="absolute inset-0"
        style={ {
          background: 'radial-gradient(ellipse 70% 55% at 50% 38%, transparent 0%, rgba(5,7,13,0.5) 78%, rgba(5,7,13,0.9) 100%)',
        } }
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center">
        { /* 版本徽标 */ }
        <motion.div
          initial={ { opacity: 0, y: 16 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.55 } }
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-3.5 py-1.5 text-xs text-white/60 backdrop-blur-sm"
        >
          <Sparkles size={ 12 } className="text-brand" />
          <span className="font-mono">v3.0</span>
          <span className="h-2.5 w-px bg-white/15" />
          <span>MIT 开源 · 零依赖</span>
        </motion.div>

        { /* 主标语 */ }
        <motion.h1
          initial={ { opacity: 0, y: 22 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.65, delay: 0.08 } }
          className="text-[2.6rem] leading-[1.15] font-semibold tracking-tight text-white sm:text-6xl"
        >
          用 Canvas 创造
          <br />
          <span className="bg-linear-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            令人惊叹的效果
          </span>
        </motion.h1>

        <motion.p
          initial={ { opacity: 0, y: 22 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.65, delay: 0.16 } }
          className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/55"
        >
          { ALL_NAV_ITEMS.length } 种粒子场景、图像处理与互动玩法， 纯 Canvas 实现、TypeScript 编写，即装即用
        </motion.p>

        { /* CTA */ }
        <motion.div
          initial={ { opacity: 0, y: 22 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.65, delay: 0.24 } }
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to={ ALL_NAV_ITEMS[0].path }
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85"
          >
            浏览全部效果
            <ArrowRight
              size={ 15 }
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="https://github.com/beixiyo/jl-cvs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            <Github size={ 15 } />
            查看源码
          </a>
        </motion.div>

        { /* 特性指标 */ }
        <motion.dl
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { duration: 0.8, delay: 0.4 } }
          className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.07] pt-7"
        >
          { [
            { value: `${ALL_NAV_ITEMS.length}+`, label: '内置效果' },
            { value: '0', label: '运行时依赖' },
            { value: '100%', label: 'TypeScript' },
          ].map((stat) => (
            <div key={ stat.label } className="text-center">
              <dt className="sr-only">{ stat.label }</dt>
              <dd className="font-mono text-xl font-medium text-white/85 tabular-nums">
                { stat.value }
              </dd>
              <dd className="mt-1 text-xs text-white/40">{ stat.label }</dd>
            </div>
          )) }
        </motion.dl>
      </div>
    </section>
  )
}

/**
 * 画廊预览图：加载失败（如 GitHub 资源不可达）时退化为图标占位，
 * 与无预览图的卡片保持一致观感，避免破图
 */
function GalleryPreview(
  { src, alt, fallbackIcon }: { src: string; alt: string; fallbackIcon: ReactNode },
) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex size-full items-center justify-center text-text3">
        { fallbackIcon }
      </div>
    )
  }

  return (
    <img
      src={ src }
      alt={ alt }
      loading="lazy"
      decoding="async"
      onError={ () => setFailed(true) }
      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
    />
  )
}

/**
 * 画廊卡片
 */
function GalleryCard(
  { item, delay = 0 }: { item: (typeof ALL_NAV_ITEMS)[number]; delay?: number },
) {
  return (
    <motion.div
      initial={ { opacity: 0, y: 18 } }
      whileInView={ { opacity: 1, y: 0 } }
      viewport={ { once: true, margin: '-40px' } }
      transition={ { duration: 0.45, delay } }
    >
      <Link
        to={ item.path }
        className="group block overflow-hidden rounded-xl border border-border bg-background2/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-border2 hover:shadow-card"
      >
        { /* 预览图 */ }
        <div className="relative aspect-16/10 overflow-hidden bg-background3">
          { item.preview
            ? (
              <GalleryPreview
                src={ item.preview }
                alt={ item.name }
                fallbackIcon={ <item.icon size={ 28 } strokeWidth={ 1.25 } /> }
              />
            )
            : (
              <div className="flex size-full items-center justify-center text-text3">
                <item.icon size={ 28 } strokeWidth={ 1.25 } />
              </div>
            ) }

          { /* 悬浮箭头 */ }
          <div className="absolute right-3 bottom-3 flex size-7 translate-y-1.5 items-center justify-center rounded-full bg-background/90 text-text opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowRight size={ 13 } />
          </div>
        </div>

        { /* 信息 */ }
        <div className="p-4">
          <div className="flex items-center gap-2">
            <item.icon
              size={ 14 }
              className="shrink-0 text-text3 transition-colors group-hover:text-brand"
            />
            <h4 className="text-sm font-medium">{ item.name }</h4>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text3">
            { item.desc }
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

/**
 * 区块标题
 */
function SectionHeading(
  { eyebrow, title, desc, className }: {
    eyebrow: string
    title: string
    desc?: string
    className?: string
  },
) {
  return (
    <div className={ cn('mb-10 pt-16 text-center', className) }>
      <div className="mb-3 font-mono text-xs tracking-[0.2em] text-brand uppercase">
        { eyebrow }
      </div>
      <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">{ title }</h2>
      { desc && <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text2">{ desc }</p> }
    </div>
  )
}

/**
 * 安装命令 + 复制
 */
function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const command = 'npm i @jl-org/cvs'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
    catch { /* 剪贴板不可用时静默降级 */ }
  }

  return (
    <button
      type="button"
      onClick={ copy }
      className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-[13px] text-text2 transition-colors hover:border-border2 hover:text-text"
    >
      <span className="text-brand">$</span>
      { command }
      <span className="text-text3 transition-colors group-hover:text-text">
        { copied
          ? <Sparkles size={ 13 } className="text-success" />
          : <Copy size={ 13 } /> }
      </span>
    </button>
  )
}
