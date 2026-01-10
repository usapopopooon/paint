import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { BlurToolConfig, CursorConfig } from '../../types'
import { DEFAULT_BLUR_WIDTH, DEFAULT_BLUR_HARDNESS, DEFAULT_OPACITY } from '../../constants'

/**
 * ぼかしツールのビヘイビア定義
 * 既存のレイヤーピクセルにぼかし効果を適用するツール
 */
export const blurBehavior = {
  type: 'blur' as const,

  /**
   * ぼかしツールのデフォルト設定を生成
   * @returns デフォルトのBlurToolConfig
   */
  defaultConfig: (): BlurToolConfig => ({
    type: 'blur',
    width: DEFAULT_BLUR_WIDTH,
    opacity: DEFAULT_OPACITY,
    hardness: DEFAULT_BLUR_HARDNESS,
  }),

  /**
   * ぼかしストロークを作成
   * blendMode: 'blur' により、ストローク領域の既存ピクセルがぼかされる
   * @param point - 開始点
   * @param config - ぼかしツール設定
   * @returns 新しいStrokeDrawable
   */
  createStroke: (point: Point, config: BlurToolConfig): StrokeDrawable => {
    return createStrokeDrawable([point], {
      color: 'transparent',
      brushTip: createSolidBrushTip(config.width, config.opacity, config.hardness),
      blendMode: 'blur',
    })
  },

  /**
   * ぼかしツールのカーソル設定を取得
   * @param config - ぼかしツール設定
   * @returns カーソル設定
   */
  getCursor: (config: BlurToolConfig): CursorConfig => ({
    size: config.width,
    color: '#66ccff',
    outline: '#ffffff',
  }),
}
