import type { NoteBoardMode } from '@jl-org/cvs'
import {
  ArrowUpRight,
  Ban,
  Circle,
  Eraser,
  Move,
  PaintbrushVertical,
  Square,
} from 'lucide-react'

export const ToolbarIconMap: Record<NoteBoardMode, React.ElementType> = {
  brush: PaintbrushVertical,
  erase: Eraser,
  drag: Move,
  rect: Square,
  circle: Circle,
  arrow: ArrowUpRight,
  none: Ban,
}
