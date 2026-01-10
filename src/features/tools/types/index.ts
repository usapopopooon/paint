/**
 * ツールの種類
 */
export type ToolType =
  | 'none'
  | 'pen'
  | 'brush'
  | 'blur'
  | 'eraser'
  | 'hand'
  | 'eyedropper'
  | 'zoom-in'
  | 'zoom-out'
  | 'select-rectangle'
  | 'select-lasso'

/**
 * 未選択ツールの設定
 */
export type NoneToolConfig = {
  readonly type: 'none'
}

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
 * ぼかしツールの設定
 * 既存のレイヤーピクセルにぼかし効果を適用するツール
 */
export type BlurToolConfig = {
  readonly type: 'blur'
  readonly width: number
  /** ぼかしの強さ（opacity として適用） */
  readonly opacity: number
  /** ぼかしの強度（hardness値をぼかし強度として使用） */
  readonly hardness: number
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
 * 矩形選択ツールの設定
 */
export type SelectRectangleToolConfig = {
  readonly type: 'select-rectangle'
  readonly feather: number
  readonly antiAlias: boolean
}

/**
 * 自由選択ツールの設定
 */
export type SelectLassoToolConfig = {
  readonly type: 'select-lasso'
  readonly feather: number
  readonly antiAlias: boolean
}

/**
 * ツール設定の判別ユニオン型
 */
export type ToolConfig =
  | NoneToolConfig
  | PenToolConfig
  | BrushToolConfig
  | BlurToolConfig
  | EraserToolConfig
  | HandToolConfig
  | EyedropperToolConfig
  | ZoomInToolConfig
  | ZoomOutToolConfig
  | SelectRectangleToolConfig
  | SelectLassoToolConfig
