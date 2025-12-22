// ツールの種類
export type ToolType = 'pen' | 'eraser'

// カーソル設定
export type CursorConfig = {
  readonly size: number
  readonly color: string
  readonly outline?: string // 視認性のためのオプションのアウトライン色
}

// ツール設定（判別ユニオン）
export type PenToolConfig = {
  readonly type: 'pen'
  readonly width: number
  readonly color: string
}

export type EraserToolConfig = {
  readonly type: 'eraser'
  readonly width: number
}

export type ToolConfig = PenToolConfig | EraserToolConfig
