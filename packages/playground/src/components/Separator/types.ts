/**
 * Separator 类型声明
 */

export type Orientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
  containerClassName?: string
}
