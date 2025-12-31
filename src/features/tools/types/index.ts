/**
 * ツールの種類
 */
export type ToolType = 'pen' | 'brush' | 'eraser' | 'hand' | 'eyedropper' | 'zoom-in' | 'zoom-out'

/**
 * カーソル設定
 */
export type CursorConfig = {
  /** カーソルのサイズ（ピクセル） */
  readonly size: number
  /** カーソルの色 */
  readonly color: string
  /** 視認性のためのオプションのアウトライン色 */
  readonly outline?: string
}

/**
 * ペンツールの設定
 */
export type PenToolConfig = {
  readonly type: 'pen'
  readonly width: number
  readonly color: string
  readonly opacity: number
  readonly hardness: number
  readonly isBlurEnabled: boolean
}

/**
 * ブラシツールの設定
 */
export type BrushToolConfig = {
  readonly type: 'brush'
  readonly width: number
  readonly color: string
  readonly opacity: number
  readonly hardness: number
  readonly isBlurEnabled: boolean
}

/**
 * 消しゴムツールの設定
 */
export type EraserToolConfig = {
  readonly type: 'eraser'
  readonly width: number
  readonly opacity: number
  readonly hardness: number
  readonly isBlurEnabled: boolean
}

/**
 * ハンドツールの設定
 */
export type HandToolConfig = {
  readonly type: 'hand'
}

/**
 * スポイトツールの設定
 */
export type EyedropperToolConfig = {
  readonly type: 'eyedropper'
}

/**
 * ズームインツールの設定
 */
export type ZoomInToolConfig = {
  readonly type: 'zoom-in'
}

/**
 * ズームアウトツールの設定
 */
export type ZoomOutToolConfig = {
  readonly type: 'zoom-out'
}

/**
 * ツール設定の判別ユニオン型
 */
export type ToolConfig =
  | PenToolConfig
  | BrushToolConfig
  | EraserToolConfig
  | HandToolConfig
  | EyedropperToolConfig
  | ZoomInToolConfig
  | ZoomOutToolConfig
