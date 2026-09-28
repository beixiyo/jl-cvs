import type { LucideIcon } from 'lucide-react'
import { Camera, Crop, Eraser, Flame, Globe2, Grid3x3, Layers, Map, PenTool, ScanSearch, Sparkles, SquareDashed, Type, Wand2, Waves } from 'lucide-react'
import { RELEASE_ASSETS_BASE } from '../views/_shared/releaseAssets'

export interface NavItem {
  path: string
  name: string
  desc: string
  icon: LucideIcon
  /** 画廊预览图（GitHub Release 资产，见根 README），部分效果无截图则用渐变占位 */
  preview?: string
}

/** 演示站预览图统一走 GitHub Release 资产，仓库不收二进制图片 */
const PREVIEW_BASE = RELEASE_ASSETS_BASE

export interface NavGroup {
  title: string
  items: NavItem[]
}

/**
 * 演示站导航：分组 + 元信息（官网画廊与侧栏共用一份数据源）
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: '场景与粒子',
    items: [
      {
        path: '/waterRipple',
        name: '水波纹',
        desc: '随鼠标漾开的同心涟漪，线条粗细与扩散速度可调',
        icon: Waves,
        preview: `${PREVIEW_BASE}/waterRipple.webp`,
      },
      {
        path: '/starField',
        name: '星际穿梭',
        desc: '透视星域中持续穿行的粒子流，速度与密度自由控制',
        icon: Sparkles,
        preview: `${PREVIEW_BASE}/starField.webp`,
      },
      {
        path: '/firework',
        name: '烟花',
        desc: '经典升空爆炸与二段连锁爆炸两种物理模拟',
        icon: Flame,
        preview: `${PREVIEW_BASE}/firework.webp`,
      },
      {
        path: '/halftoneWave',
        name: '半调波浪',
        desc: '半调网点沿波场起伏，印刷质感与流动感的结合',
        icon: SquareDashed,
        preview: `${PREVIEW_BASE}/halftoneWave.gif`,
      },
      {
        path: '/globeSphere',
        name: '球体地球仪',
        desc: '点阵球体自转，支持拖拽交互与光照着色',
        icon: Globe2,
        preview: `${PREVIEW_BASE}/globesphere.webp`,
      },
      {
        path: '/wavyLines',
        name: '波浪线条',
        desc: '多组正弦线条叠加流动，适合背景与封面装饰',
        icon: Waves,
        preview: `${PREVIEW_BASE}/wavyLines.webp`,
      },
      {
        path: '/grid',
        name: '网格',
        desc: '普通网格与点阵网格两种绘制模式，间距颜色可调',
        icon: Grid3x3,
        preview: `${PREVIEW_BASE}/grid.webp`,
      },
      {
        path: '/techNum',
        name: '科技数字',
        desc: '黑客帝国风格数字雨，字符、颜色与下落节奏可调',
        icon: Layers,
        preview: `${PREVIEW_BASE}/techNum.gif`,
      },
    ],
  },
  {
    title: '图像工具',
    items: [
      {
        path: '/cutoutImg',
        name: '智能抠图',
        desc: '画笔涂抹标记前景背景，一键分离主体',
        icon: Crop,
        preview: `${PREVIEW_BASE}/cutoutImg.webp`,
      },
      {
        path: '/smartSelection',
        name: '智能选区',
        desc: '框选后自动识别主体轮廓，快速得到精确蒙版',
        icon: ScanSearch,
        preview: `${PREVIEW_BASE}/smartSelectImg.webp`,
      },
      {
        path: '/imgToTxt',
        name: '图像转字符',
        desc: '将图像或视频帧转成 ASCII 字符画，支持自定义字符集',
        icon: Type,
        preview: `${PREVIEW_BASE}/imgToTxt.webp`,
      },
      {
        path: '/imgToFade',
        name: '灰飞烟灭',
        desc: '图像粒子化后随风飘散的退场动画',
        icon: Eraser,
        preview: `${PREVIEW_BASE}/imgFade.gif`,
      },
      {
        path: '/imgEdgeDetection',
        name: '边缘检测',
        desc: 'Sobel 等卷积算子提取图像边缘，阈值实时可调',
        icon: ScanSearch,
        preview: `${PREVIEW_BASE}/imgEdge.webp`,
      },
      {
        path: '/imgProcessing',
        name: '图像处理',
        desc: '灰度、反色、马赛克、亮度等常用像素级处理',
        icon: Wand2,
        preview: `${PREVIEW_BASE}/imgToTxt.webp`,
      },
      {
        path: '/imgDataProcessing',
        name: '像素数据操作',
        desc: '直接读写 ImageData，演示通道分离与位运算',
        icon: Layers,
        preview: `${PREVIEW_BASE}/imgToTxt.webp`,
      },
      {
        path: '/shotImg',
        name: '截图取帧',
        desc: '框选截图与视频逐帧截取，所见即所得',
        icon: Camera,
        preview: `${PREVIEW_BASE}/shotImg.webp`,
      },
      {
        path: '/captureVideoFrame',
        name: '视频帧提取',
        desc: '拖动时间轴精准截取视频任意帧并导出',
        icon: Camera,
      },
    ],
  },
  {
    title: '互动玩法',
    items: [
      {
        path: '/noteBoard',
        name: '无限画布',
        desc: '自由缩放平移的便签白板，支持图形、文字与导出',
        icon: Map,
        preview: `${PREVIEW_BASE}/noteBoard.webp`,
      },
      {
        path: '/scratch',
        name: '刮刮卡',
        desc: '覆盖层刮开显奖的交互组件，刮开比例可感知',
        icon: PenTool,
        preview: `${PREVIEW_BASE}/scratch.webp`,
      },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)
