import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { BrushToolConfig, CursorConfig } from '../../types'
import {
  DEFAULT_BRUSH_WIDTH,
  DEFAULT_BRUSH_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_HARDNESS,
} from '../../constants'

/**
 * ブラシツールのビヘイビア定義
 */
export const brushBehavior = {
  type: 'brush' as const,

  /**
   * ブラシツールのデフォルト設定を生成
   * @returns デフォルトのBrushToolConfig
   */
  defaultConfig: (): BrushToolConfig => ({
    type: 'brush',
    width: DEFAULT_BRUSH_WIDTH,
    color: DEFAULT_BRUSH_COLOR,
    opacity: DEFAULT_OPACITY,
    hardness: DEFAULT_HARDNESS,
    isBlurEnabled: true,
  }),

  /**
   * ブラシストロークを作成
   * @param point - 開始点
   * @param config - ブラシツール設定
   * @returns 新しいStrokeDrawable
   */
  createStroke: (point: Point, config: BrushToolConfig): StrokeDrawable => {
    // isBlurEnabledがfalseの場合はhardness 0（ぼかしなし）を使用
    const effectiveHardness = config.isBlurEnabled ? config.hardness : 0
    return createStrokeDrawable([point], {
      color: config.color,
      brushTip: createSolidBrushTip(config.width, config.opacity, effectiveHardness),
      blendMode: 'normal',
    })
  },

  /**
   * ブラシツールのカーソル設定を取得
   * @param config - ブラシツール設定
   * @returns カーソル設定
   */
  getCursor: (config: BrushToolConfig): CursorConfig => ({
    size: config.width,
    color: config.color,
  }),
}
