/**
 * ツールの種類
 */
export type ToolType = 'pen' | 'eraser' | 'hand' | 'eyedropper'

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
}

/**
 * 消しゴムツールの設定
 */
export type EraserToolConfig = {
  readonly type: 'eraser'
  readonly width: number
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
 * ツール設定の判別ユニオン型
 */
export type ToolConfig = PenToolConfig | EraserToolConfig | HandToolConfig | EyedropperToolConfig
