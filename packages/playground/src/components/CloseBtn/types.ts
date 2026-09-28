import type { IconSize } from '../icons/types'

export type CloseBtnProps =
  & {
    /**
     * 按钮外框尺寸，支持预设或数字（像素）
     * 预设 sm / md / lg / xl 分别为 16 / 24 / 32 / 40px，且不随 variant 变化
     * 默认值随 mode 变化：absolute 模式为 'sm'，其余模式为 'md'
     * @default 'sm' | 'md'
     */
    size?: IconSize
    /**
     * Icon 尺寸，会覆盖 size 的默认图标尺寸
     * 预设按钮默认对应 12 / 16 / 20 / 24px
     */
    iconSize?: number
    /**
     * 图标颜色（stroke）。不传时为 'currentColor'，跟随容器 text-* 自动适配主题
     */
    iconColor?: string
    /**
     * 图标自定义类名，便于用 text-* 等覆盖颜色
     */
    iconClassName?: string
    /**
     * SVG 图标原生属性；与同名快捷属性同时传入时，iconProps 优先
     */
    iconProps?: React.SVGProps<SVGSVGElement>
    /**
     * 描边宽度
     * @default 2.5
     */
    strokeWidth?: number
    /**
     * 按钮定位模式
     * @default 'absolute'
     */
    mode?: 'absolute' | 'fixed' | 'static'
    /**
     * 视觉变体：default 始终无背景，filled 使用 button 背景色并在 hover 时变化
     * @default 'default'
     */
    variant?: 'default' | 'filled'
    /**
     * 定位角落，仅在非 static 模式下生效
     * @default 'top-right'
     */
    corner?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    /**
     * 是否阻止事件冒泡
     * @default true
     */
    stopPropagation?: boolean
  }
  & React.PropsWithChildren<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>>
