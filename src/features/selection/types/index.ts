import type { Point, Bounds } from '@/lib/geometry'
import type { LayerId } from '@/features/layer'

/**
 * 選択ツールの種類
 */
export type SelectionToolType = 'select-rectangle' | 'select-lasso'

/**
 * 選択状態のフェーズ
 */
export type SelectionPhase =
  | 'idle' // 選択なし
  | 'selecting' // 選択範囲を描画中
  | 'selected' // 選択済み（操作待ち）
  | 'moving' // 選択領域を移動中
  | 'transforming' // 変形中

/**
 * 変形モードの種類
 */
export type TransformMode =
  | 'free-transform' // 自由変形（スケール+回転）
  | 'scale' // 拡大縮小のみ
  | 'rotate' // 回転のみ

/**
 * 変形ハンドルの位置
 */
export type TransformHandlePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'rotation' // 回転ハンドル（上部中央の上）

/**
 * 変形状態
 */
export type TransformState = {
  /** 変形モード */
  readonly mode: TransformMode
  /** 変形の中心点 */
  readonly center: Point
  /** スケール（X/Y） */
  readonly scale: { readonly x: number; readonly y: number }
  /** 回転角度（ラジアン） */
  readonly rotation: number
  /** 元のバウンディングボックス */
  readonly originalBounds: Bounds
  /** 元のImageData */
  readonly originalImageData: ImageData | null
}

/**
 * 選択領域の形状
 */
export type SelectionShape =
  | { readonly type: 'rectangle'; readonly bounds: Bounds }
  | { readonly type: 'lasso'; readonly points: readonly Point[] }

/**
 * 選択領域の状態
 */
export type SelectionRegion = {
  readonly id: string
  readonly shape: SelectionShape
  readonly layerId: LayerId
  /** 選択領域の画像データ（移動/コピー用） */
  readonly imageData: ImageData | null
  /** オリジナル位置からのオフセット（移動中） */
  readonly offset: Point
}

/**
 * 選択ツールの設定
 */
export type SelectionToolConfig = {
  readonly type: SelectionToolType
  /** フェザー（ぼかし）の強さ 0-1 */
  readonly feather: number
  /** アンチエイリアス有効 */
  readonly antiAlias: boolean
}

/**
 * 矩形選択ツールの設定
 */
export type RectangleSelectionToolConfig = SelectionToolConfig & {
  readonly type: 'select-rectangle'
}

/**
 * フリーハンド選択ツールの設定
 */
export type LassoSelectionToolConfig = SelectionToolConfig & {
  readonly type: 'select-lasso'
}

/**
 * クリップボード内容
 */
export type SelectionClipboard = {
  readonly imageData: ImageData
  readonly bounds: Bounds
}

/**
 * 選択操作の種類
 */
export type SelectionOperation =
  | 'move'
  | 'delete'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'fill'
  | 'deselect'
  | 'select-all'

/**
 * 選択状態全体
 */
export type SelectionState = {
  readonly phase: SelectionPhase
  readonly region: SelectionRegion | null
  readonly clipboard: SelectionClipboard | null
  readonly toolConfig: SelectionToolConfig
}
