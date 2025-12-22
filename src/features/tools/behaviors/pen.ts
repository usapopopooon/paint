import type { Stroke, Point } from '../../canvas/types'
import type { PenToolConfig, CursorConfig } from '../types'

export const penBehavior = {
  type: 'pen' as const,

  defaultConfig: (): PenToolConfig => ({
    type: 'pen',
    width: 3,
    color: '#000000',
  }),

  createStroke: (point: Point, config: PenToolConfig): Stroke => ({
    points: [point],
    width: config.width,
    color: config.color,
    isEraser: false,
  }),

  getCursor: (config: PenToolConfig): CursorConfig => ({
    size: config.width,
    color: config.color,
  }),
}
