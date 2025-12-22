import type { Drawable } from '@/features/drawable'
import { renderDrawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { blendModeToCompositeOp } from '@/features/layer'

/**
 * Render drawables to canvas
 */
export const renderDrawables = (
  ctx: CanvasRenderingContext2D,
  drawables: readonly Drawable[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // Clear the main canvas and fill with background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Create offscreen canvas for drawables (so eraser doesn't erase background)
  const offscreen = new OffscreenCanvas(width, height)
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  // Draw all drawables on offscreen canvas (transparent background)
  offCtx.clearRect(0, 0, width, height)
  drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

  // Composite the drawables onto the main canvas
  ctx.drawImage(offscreen, 0, 0)
}

/**
 * Render layers to canvas
 * Each layer is rendered with its own blend mode and opacity
 */
export const renderLayers = (
  ctx: CanvasRenderingContext2D,
  layers: readonly Layer[],
  width: number,
  height: number,
  backgroundColor: string
): void => {
  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Render each layer
  for (const layer of layers) {
    if (!layer.visible || layer.drawables.length === 0) continue

    // Create offscreen canvas for layer
    const offscreen = new OffscreenCanvas(width, height)
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) continue

    // Draw drawables on offscreen canvas
    layer.drawables.forEach((drawable) => renderDrawable(offCtx, drawable))

    // Apply blend mode and opacity
    ctx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode)
    ctx.globalAlpha = layer.opacity
    ctx.drawImage(offscreen, 0, 0)

    // Reset composite operation and alpha
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
}
