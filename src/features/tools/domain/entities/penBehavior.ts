import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { PenToolConfig, CursorConfig } from '../../types'

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
    width: 3,
    color: '#000000',
  }),

  /**
   * ペンストロークを作成
   * @param point - 開始点
   * @param config - ペンツール設定
   * @returns 新しいStrokeDrawable
   */
  createStroke: (point: Point, config: PenToolConfig): StrokeDrawable =>
    createStrokeDrawable([point], {
      color: config.color,
      brushTip: createSolidBrushTip(config.width),
      blendMode: 'normal',
    }),

  /**
   * ペンツールのカーソル設定を取得
   * @param config - ペンツール設定
   * @returns カーソル設定
   */
  getCursor: (config: PenToolConfig): CursorConfig => ({
    size: config.width,
    color: config.color,
  }),
}
