import type { Mode } from '@jl-org/cvs'
import {
  ArrowUpRight,
  Ban,
  Circle,
  Eraser,
  Move,
  PaintbrushVertical,
  Square,
} from 'lucide-react'

export const ToolbarIconMap: Record<Mode, React.ElementType> = {
  draw: PaintbrushVertical,
  erase: Eraser,
  drag: Move,
  rect: Square,
  circle: Circle,
  arrow: ArrowUpRight,
  none: Ban,
}
