import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { PenToolConfig, CursorConfig } from '../types'

export const penBehavior = {
  type: 'pen' as const,

  defaultConfig: (): PenToolConfig => ({
    type: 'pen',
    width: 3,
    color: '#000000',
  }),

  createStroke: (point: Point, config: PenToolConfig): StrokeDrawable =>
    createStrokeDrawable([point], {
      color: config.color,
      brushTip: createSolidBrushTip(config.width),
      blendMode: 'normal',
    }),

  getCursor: (config: PenToolConfig): CursorConfig => ({
    size: config.width,
    color: config.color,
  }),
}
