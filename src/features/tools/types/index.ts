/**
 * ツールの種類
 */
export type ToolType = 'pen' | 'eraser' | 'hand'

/** ペンの最小幅（ピクセル） */
export const MIN_PEN_WIDTH = 1
/** ペンの最大幅（ピクセル） */
export const MAX_PEN_WIDTH = 300
/** 消しゴムの最小幅（ピクセル） */
export const MIN_ERASER_WIDTH = 5
/** 消しゴムの最大幅（ピクセル） */
export const MAX_ERASER_WIDTH = 300

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
 * ツール設定の判別ユニオン型
 */
export type ToolConfig = PenToolConfig | EraserToolConfig | HandToolConfig
