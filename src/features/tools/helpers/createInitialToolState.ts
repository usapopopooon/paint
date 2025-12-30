import type { PenToolConfig, EraserToolConfig, ToolType } from '../types'
import { penBehavior, eraserBehavior } from '../domain'

/**
 * ツール状態の型
 */
export type ToolState = {
  readonly currentType: ToolType
  readonly penConfig: PenToolConfig
  readonly eraserConfig: EraserToolConfig
}

/**
 * ツールの初期状態を作成
 * @returns 初期ToolState
 */
export const createInitialToolState = (): ToolState => ({
  currentType: 'hand',
  penConfig: penBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})
