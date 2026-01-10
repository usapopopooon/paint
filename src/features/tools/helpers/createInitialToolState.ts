import type { PenToolConfig, BrushToolConfig, EraserToolConfig, ToolType } from '../types'
import { penBehavior, brushBehavior, eraserBehavior } from '../domain'

/** 描画ツールタイプ */
export type DrawingToolType = 'pen' | 'brush' | 'eraser'

/**
 * ツール状態の型
 */
export type ToolState = {
  readonly currentType: ToolType
  /** 最後に選択された描画ツールの種類（非描画ツール選択時にhardnessスライダーの値を保持するために使用） */
  readonly lastDrawingToolType: DrawingToolType | null
  readonly penConfig: PenToolConfig
  readonly brushConfig: BrushToolConfig
  readonly eraserConfig: EraserToolConfig
}

/**
 * 描画ツールかどうかを判定
 */
export const isDrawingToolType = (type: ToolType): type is DrawingToolType => {
  return type === 'pen' || type === 'brush' || type === 'eraser'
}

/**
 * ツールの初期状態を作成
 * @returns 初期ToolState
 */
export const createInitialToolState = (): ToolState => ({
  currentType: 'pen',
  lastDrawingToolType: 'pen',
  penConfig: penBehavior.defaultConfig(),
  brushConfig: brushBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})
