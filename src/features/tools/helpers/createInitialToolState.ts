import type {
  PenToolConfig,
  BrushToolConfig,
  BlurToolConfig,
  EraserToolConfig,
  ToolType,
} from '../types'
import { penBehavior, brushBehavior, blurBehavior, eraserBehavior } from '../domain'

/** 描画ツールタイプ */
export type DrawingToolType = 'pen' | 'brush' | 'blur' | 'eraser'

/**
 * ツール状態の型
 */
export type ToolState = {
  readonly currentType: ToolType
  /** 最後に選択された描画ツールの種類（非描画ツール選択時にhardnessスライダーの値を保持するために使用） */
  readonly lastDrawingToolType: DrawingToolType | null
  readonly penConfig: PenToolConfig
  readonly brushConfig: BrushToolConfig
  readonly blurConfig: BlurToolConfig
  readonly eraserConfig: EraserToolConfig
}

/**
 * 描画ツールかどうかを判定
 */
export const isDrawingToolType = (type: ToolType): type is DrawingToolType => {
  return type === 'pen' || type === 'brush' || type === 'blur' || type === 'eraser'
}

/**
 * ツールの初期状態を作成
 * @returns 初期ToolState
 */
export const createInitialToolState = (): ToolState => ({
  currentType: 'none',
  lastDrawingToolType: null,
  penConfig: penBehavior.defaultConfig(),
  brushConfig: brushBehavior.defaultConfig(),
  blurConfig: blurBehavior.defaultConfig(),
  eraserConfig: eraserBehavior.defaultConfig(),
})
