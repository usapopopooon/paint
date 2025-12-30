import type { PenToolConfig, BrushToolConfig, EraserToolConfig, ToolType } from '../types'
import { penBehavior, brushBehavior, eraserBehavior } from '../domain'

/**
 * ツール状態の型
 */
export type ToolState = {
  readonly currentType: ToolType
  readonly penConfig: PenToolConfig
  readonly brushConfig: BrushToolConfig
  readonly eraserConfig: EraserToolConfig
}

/**
 * ツールの初期状態を作成
 * @returns 初期ToolState
 */
export const createInitialToolState = (): ToolState => ({
  currentType: 'hand',
  penConfig: penBehavior.defaultConfig(),
  brushConfig: brushBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})
