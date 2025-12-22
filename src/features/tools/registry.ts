import type { ToolType, ToolConfig, CursorConfig } from './types'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { penBehavior, eraserBehavior } from './behaviors'

export type ToolBehavior = {
  readonly type: ToolType
  readonly createStroke: (point: Point, config: ToolConfig) => StrokeDrawable
  readonly getCursor: (config: ToolConfig, backgroundColor?: string) => CursorConfig
}

const behaviors: Record<ToolType, ToolBehavior> = {
  pen: penBehavior as ToolBehavior,
  eraser: eraserBehavior as ToolBehavior,
}

export const getToolBehavior = (type: ToolType): ToolBehavior => behaviors[type]
