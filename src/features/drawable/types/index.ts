import type { StrokeStyle } from '@/features/brush'

/**
 * Point coordinates
 */
export type Point = {
  readonly x: number
  readonly y: number
}

/**
 * Unique identifier for drawable elements
 */
export type DrawableId = string

/**
 * Common metadata for all drawable elements
 */
export type DrawableMetadata = {
  readonly id: DrawableId
  readonly createdAt: number
}

/**
 * Stroke drawable - freehand drawing
 */
export type StrokeDrawable = DrawableMetadata & {
  readonly type: 'stroke'
  readonly points: readonly Point[]
  readonly style: StrokeStyle
}

// Future drawable types (commented for documentation)
// export type FillDrawable = DrawableMetadata & {
//   readonly type: 'fill'
//   readonly region: readonly Point[]
//   readonly color: string
// }
//
// export type BezierDrawable = DrawableMetadata & {
//   readonly type: 'bezier'
//   readonly controlPoints: readonly Point[]
//   readonly style: StrokeStyle
// }
//
// export type ShapeDrawable = DrawableMetadata & {
//   readonly type: 'shape'
//   readonly shapeType: 'rect' | 'ellipse' | 'line' | 'polygon'
//   readonly bounds: { x: number; y: number; width: number; height: number }
//   readonly style: ShapeStyle
// }
//
// export type ImageDrawable = DrawableMetadata & {
//   readonly type: 'image'
//   readonly src: string
//   readonly bounds: { x: number; y: number; width: number; height: number }
// }

/**
 * Union type for all drawable elements
 * Currently only StrokeDrawable, but designed for future extension
 */
export type Drawable = StrokeDrawable
// Future: | FillDrawable | BezierDrawable | ShapeDrawable | ImageDrawable

/**
 * Type guard for StrokeDrawable
 */
export const isStrokeDrawable = (drawable: Drawable): drawable is StrokeDrawable =>
  drawable.type === 'stroke'

/**
 * Generate unique drawable ID
 */
export const generateDrawableId = (): DrawableId =>
  `drawable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/**
 * Create a StrokeDrawable
 */
export const createStrokeDrawable = (
  points: readonly Point[],
  style: StrokeStyle,
  id?: DrawableId
): StrokeDrawable => ({
  id: id ?? generateDrawableId(),
  createdAt: Date.now(),
  type: 'stroke',
  points,
  style,
})
