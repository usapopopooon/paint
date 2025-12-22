import type { Stroke, Point } from '../../canvas/types'
import type { EraserToolConfig, CursorConfig } from '../types'

export const eraserBehavior = {
  type: 'eraser' as const,

  defaultConfig: (): EraserToolConfig => ({
    type: 'eraser',
    width: 20,
  }),

  createStroke: (point: Point, config: EraserToolConfig): Stroke => ({
    points: [point],
    width: config.width,
    color: 'transparent',
    isEraser: true,
  }),

  getCursor: (config: EraserToolConfig, backgroundColor: string): CursorConfig => ({
    size: config.width,
    color: backgroundColor,
  }),
}
