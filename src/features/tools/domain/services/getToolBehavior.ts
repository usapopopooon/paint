import type { ToolType, ToolConfig, CursorConfig } from '../../types'
import type { Point, StrokeDrawable } from '@/features/drawable'
import {
  penBehavior,
  brushBehavior,
  eraserBehavior,
  handBehavior,
  eyedropperBehavior,
} from '../entities'

/**
 * ツールの動作を定義するインターフェース
 */
export type ToolBehavior = {
  readonly type: ToolType
  readonly createStroke: (point: Point, config: ToolConfig) => StrokeDrawable
  readonly getCursor: (config: ToolConfig, backgroundColor?: string) => CursorConfig
}

/** ツールタイプとビヘイビアのマッピング */
const behaviors: Record<ToolType, ToolBehavior> = {
  pen: penBehavior as ToolBehavior,
  brush: brushBehavior as ToolBehavior,
  eraser: eraserBehavior as ToolBehavior,
  hand: handBehavior as ToolBehavior,
  eyedropper: eyedropperBehavior as ToolBehavior,
}

/**
 * ツールタイプに対応するビヘイビアを取得
 * @param type - ツールタイプ
 * @returns 対応するToolBehavior
 */
export const getToolBehavior = (type: ToolType): ToolBehavior => behaviors[type]
