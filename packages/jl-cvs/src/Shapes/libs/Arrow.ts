import type { BaseShape } from '../BaseShape'
import type { ShapeStyle } from '../type'

/**
 * 绘制箭头
 */
export class Arrow implements BaseShape {
  ctx: CanvasRenderingContext2D

  startX: number
  startY: number
  endX: number
  endY: number

  shapeStyle: ShapeStyle = {}

  // Arrowhead properties (can be adjusted)
  private headLength: number = 10 // Logical length of the arrowhead sides
  private headAngle: number = Math.PI / 6 // Angle of arrowhead sides relative to the line (30 degrees)

  constructor(opts: ArrowOpts) {
    this.ctx = opts.ctx
    // Default line cap for arrows is usually 'round' or 'butt'
    this.ctx.lineCap = 'round' // Or 'butt', 'square' depending on desired look

    this.startX = opts.startX
    this.startY = opts.startY
    this.endX = opts.startX // Initially, end is same as start
    this.endY = opts.startY

    // Initialize with provided styles, applying defaults if necessary
    this.setShapeStyle(opts.shapeStyle)
  }

  draw(): void {
    const { ctx, startX, startY, endX, endY } = this

    // Use logical coordinates directly - ctx is already scaled by DPR
    const angle = Math.atan2(endY - startY, endX - startX)

    // Apply styles from shapeStyle (ensure these are logical values)
    ctx.lineWidth = this.shapeStyle.lineWidth || 1
    ctx.strokeStyle = this.shapeStyle.strokeStyle || '#000000'
    ctx.fillStyle = this.shapeStyle.fillStyle || ctx.strokeStyle // Arrowhead fill defaults to stroke color

    // Draw the main line segment
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke() // Stroke the line

    // Draw the arrowhead (filled triangle)
    ctx.beginPath()
    ctx.moveTo(endX, endY) // Tip of the arrow

    // Calculate points for the base of the arrowhead using logical headLength
    const point1X = endX - this.headLength * Math.cos(angle - this.headAngle)
    const point1Y = endY - this.headLength * Math.sin(angle - this.headAngle)
    const point2X = endX - this.headLength * Math.cos(angle + this.headAngle)
    const point2Y = endY - this.headLength * Math.sin(angle + this.headAngle)

    ctx.lineTo(point1X, point1Y)
    ctx.lineTo(point2X, point2Y)
    ctx.closePath() // Close the triangle path
    ctx.fill() // Fill the arrowhead
  }

  isInPath(x: number, y: number): boolean {
    // Hit detection for an arrow is more complex than a rectangle.
    // A simple approach is to check the bounding box, but this isn't very accurate for thin lines.
    // A slightly better approach: check distance to the line segment.

    const { startX, startY, endX, endY } = this
    const lineWidth = (this.shapeStyle.lineWidth || 1) + 5 // Add a buffer for easier clicking

    // Bounding box check (quick elimination) - uses logical coordinates
    const minX = Math.min(startX, endX) - lineWidth / 2
    const minY = Math.min(startY, endY) - lineWidth / 2
    const maxX = Math.max(startX, endX) + lineWidth / 2
    const maxY = Math.max(startY, endY) + lineWidth / 2

    if (x < minX || x > maxX || y < minY || y > maxY) {
      return false // Point is outside the rough bounding box
    }

    // Check distance from point (x, y) to the line segment (startX, startY) -> (endX, endY)
    // Using perpendicular distance formula + segment check
    const dx = endX - startX
    const dy = endY - startY
    const lenSq = dx * dx + dy * dy // Squared length of the segment

    if (lenSq === 0) { // Start and end points are the same
      return Math.sqrt((x - startX) ** 2 + (y - startY) ** 2) < lineWidth / 2
    }

    // Project point (x,y) onto the line containing the segment
    // t = [(x - startX) * dx + (y - startY) * dy] / lenSq
    const t = ((x - startX) * dx + (y - startY) * dy) / lenSq

    let closestX, closestY
    if (t < 0) { // Closest point is startX, startY
      closestX = startX
      closestY = startY
    }
    else if (t > 1) { // Closest point is endX, endY
      closestX = endX
      closestY = endY
    }
    else { // Closest point is on the segment
      closestX = startX + t * dx
      closestY = startY + t * dy
    }

    // Calculate distance from (x, y) to the closest point on the segment
    const distSq = (x - closestX) ** 2 + (y - closestY) ** 2

    // Check if the distance is within the line width buffer
    return distSq < (lineWidth / 2) ** 2
  }

  setShapeStyle(shapeStyle: ShapeStyle = {}): void {
    // You might want default arrow styles here
    const defaultArrowStyle: ShapeStyle = {
      lineWidth: 2,
      strokeStyle: '#000000',
      fillStyle: '#000000', // Default arrowhead fill
    }
    Object.assign(this.shapeStyle, defaultArrowStyle, shapeStyle)

    // Optionally adjust arrowhead size based on line width
    this.headLength = Math.max(8, (this.shapeStyle.lineWidth || 2) * 4)
  }

  // No need for minX/Y/maxX/Y getters like Rect unless specifically needed elsewhere.
  // They don't need DPR multiplication here because all internal coordinates and drawing
  // use logical CSS pixels, compatible with the scaled context.
}

export type ArrowOpts = {
  startX: number
  startY: number
  ctx: CanvasRenderingContext2D
  shapeStyle?: ShapeStyle
}
