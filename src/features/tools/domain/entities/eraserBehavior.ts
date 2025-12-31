import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { EraserToolConfig, CursorConfig } from '../../types'
import { DEFAULT_ERASER_WIDTH, DEFAULT_OPACITY, DEFAULT_HARDNESS } from '../../constants'

/**
 * 消しゴムツールのビヘイビア定義
 */
export const eraserBehavior = {
  type: 'eraser' as const,

  /**
   * 消しゴムツールのデフォルト設定を生成
   * @returns デフォルトのEraserToolConfig
   */
  defaultConfig: (): EraserToolConfig => ({
    type: 'eraser',
    width: DEFAULT_ERASER_WIDTH,
    opacity: DEFAULT_OPACITY,
    hardness: DEFAULT_HARDNESS,
  }),

  /**
   * 消しゴムストロークを作成
   * @param point - 開始点
   * @param config - 消しゴムツール設定
   * @returns 新しいStrokeDrawable（eraseブレンドモード）
   */
  createStroke: (point: Point, config: EraserToolConfig): StrokeDrawable =>
    createStrokeDrawable([point], {
      color: 'transparent',
      brushTip: createSolidBrushTip(config.width, config.opacity, config.hardness),
      blendMode: 'erase',
    }),

  /**
   * 消しゴムツールのカーソル設定を取得
   * @param config - 消しゴムツール設定
   * @returns アウトライン付きカーソル設定
   */
  getCursor: (config: EraserToolConfig): CursorConfig => ({
    size: config.width,
    color: '#888888',
    outline: '#ffffff',
  }),
}
