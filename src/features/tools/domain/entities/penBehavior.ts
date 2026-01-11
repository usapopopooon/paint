import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { PenToolConfig, CursorConfig } from '../../types'
import {
  DEFAULT_PEN_WIDTH,
  DEFAULT_PEN_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_HARDNESS,
} from '../../constants'

/**
 * ペンツールのビヘイビア定義
 */
export const penBehavior = {
  type: 'pen' as const,

  /**
   * ペンツールのデフォルト設定を生成
   * @returns デフォルトのPenToolConfig
   */
  defaultConfig: (): PenToolConfig => ({
    type: 'pen',
    width: DEFAULT_PEN_WIDTH,
    color: DEFAULT_PEN_COLOR,
    opacity: DEFAULT_OPACITY,
    hardness: DEFAULT_HARDNESS,
    isBlurEnabled: true,
  }),

  /**
   * ペンストロークを作成
   * @param point - 開始点
   * @param config - ペンツール設定
   * @returns 新しいStrokeDrawable
   */
  createStroke: (point: Point, config: PenToolConfig): StrokeDrawable => {
    // isBlurEnabledがfalseの場合はhardness 0（ぼかしなし）を使用
    const effectiveHardness = config.isBlurEnabled ? config.hardness : 0
    return createStrokeDrawable([point], {
      color: config.color,
      brushTip: createSolidBrushTip(config.width, config.opacity, effectiveHardness),
      blendMode: 'normal',
    })
  },

  /**
   * ペンツールのカーソル設定を取得
   * @param config - ペンツール設定
   * @returns カーソル設定
   */
  getCursor: (config: PenToolConfig): CursorConfig => ({
    size: config.width,
    color: 'rgba(0,0,0,0.4)',
  }),
}
