/**
 * ブラシチップタイプ - ブラシのレンダリング方法を決定
 */
export type BrushTipType = 'solid' | 'soft' | 'airbrush'

/**
 * ブレンドモード - ストロークが既存コンテンツとどう合成されるかを決定
 */
export type BlendMode = 'normal' | 'erase'

/**
 * ブラシチップ設定
 */
export type BrushTip = {
  readonly type: BrushTipType
  readonly size: number
  readonly hardness: number // 0-1, solid=1, ソフトエッジ=低い値
  readonly opacity: number // 0-1
}

/**
 * 色、ブラシチップ、ブレンドモードを含む完全なストロークスタイル
 */
export type StrokeStyle = {
  readonly color: string
  readonly brushTip: BrushTip
  readonly blendMode: BlendMode
}
