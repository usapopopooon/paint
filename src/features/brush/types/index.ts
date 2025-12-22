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

/**
 * デフォルト設定でソリッドブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @returns hardness=1, opacity=1のソリッドブラシチップ
 */
export const createSolidBrushTip = (size: number): BrushTip => ({
  type: 'solid',
  size,
  hardness: 1,
  opacity: 1,
})

/**
 * 設定可能なハードネスでソフトブラシチップを作成
 * @param size - ブラシのサイズ（ピクセル）
 * @param hardness - エッジの硬さ（0-1、デフォルト: 0.5）
 * @param opacity - 不透明度（0-1、デフォルト: 1）
 * @returns 指定されたパラメータのソフトブラシチップ
 */
export const createSoftBrushTip = (
  size: number,
  hardness: number = 0.5,
  opacity: number = 1
): BrushTip => ({
  type: 'soft',
  size,
  hardness,
  opacity,
})
