/**
 * Brush tip type - determines how the brush renders
 */
export type BrushTipType = 'solid' | 'soft' | 'airbrush'

/**
 * Blend mode - determines how strokes composite with existing content
 */
export type BlendMode = 'normal' | 'erase'

/**
 * Brush tip configuration
 */
export type BrushTip = {
  readonly type: BrushTipType
  readonly size: number
  readonly hardness: number // 0-1, solid=1, soft edges=lower values
  readonly opacity: number // 0-1
}

/**
 * Complete stroke style including color, brush tip, and blend mode
 */
export type StrokeStyle = {
  readonly color: string
  readonly brushTip: BrushTip
  readonly blendMode: BlendMode
}

/**
 * Create a solid brush tip with default settings
 */
export const createSolidBrushTip = (size: number): BrushTip => ({
  type: 'solid',
  size,
  hardness: 1,
  opacity: 1,
})

/**
 * Create a soft brush tip with configurable hardness
 */
export const createSoftBrushTip = (
  size: number,
  hardness: number = 0.5,
  opacity: number = 1
): BrushTip => ({
  type: 'soft',
  size,
  hardness,
  opacity,
})
