import { createSolidBrushTip } from '@/features/brush'
import type { Point, StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import type { BrushToolConfig, CursorConfig } from '../../types'
import { DEFAULT_BRUSH_WIDTH, DEFAULT_BRUSH_COLOR } from '../../constants'

/**
 * ブラシツールのビヘイビア定義
 * 将来的にはペンと異なるブラシ特性（テクスチャ、不透明度、フロー等）を持つ予定
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
  }),

  /**
   * ブラシストロークを作成
   * 現在はペンと同じ実装だが、将来的に異なるブラシ効果を適用予定
   * @param point - 開始点
   * @param config - ブラシツール設定
   * @returns 新しいStrokeDrawable
   */
  createStroke: (point: Point, config: BrushToolConfig): StrokeDrawable =>
    createStrokeDrawable([point], {
      color: config.color,
      brushTip: createSolidBrushTip(config.width),
      blendMode: 'normal',
    }),

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
