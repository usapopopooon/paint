import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { EraserToolConfig, CursorConfig } from '../types'

export const eraserBehavior = {
  type: 'eraser' as const,

  defaultConfig: (): EraserToolConfig => ({
    type: 'eraser',
    width: 20,
  }),

  createStroke: (point: Point, config: EraserToolConfig): StrokeDrawable =>
    createStrokeDrawable([point], {
      color: 'transparent',
      brushTip: createSolidBrushTip(config.width),
      blendMode: 'erase',
    }),

  getCursor: (config: EraserToolConfig): CursorConfig => ({
    size: config.width,
    color: '#888888',
    outline: '#ffffff',
  }),
}
