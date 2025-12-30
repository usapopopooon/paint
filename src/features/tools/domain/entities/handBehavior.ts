import type { Point, StrokeDrawable } from '@/features/drawable'
import type { HandToolConfig, CursorConfig } from '../../types'

/**
 * ハンドツールのビヘイビア定義
 * ハンドツールはキャンバスのパン操作に使用され、ストロークは作成しない
 */
export const handBehavior = {
  type: 'hand' as const,

  /**
   * ハンドツールのデフォルト設定を生成
   * @returns デフォルトのHandToolConfig
   */
  defaultConfig: (): HandToolConfig => ({
    type: 'hand',
  }),

  /**
   * ハンドツールはストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (_point: Point, _config: HandToolConfig): StrokeDrawable => {
    throw new Error('Hand tool does not create strokes')
  },

  /**
   * ハンドツールのカーソル設定を取得
   * grab カーソルを使用
   */
  getCursor: (_config: HandToolConfig): CursorConfig => ({
    size: 0,
    color: 'transparent',
    // CSSカーソルとして 'grab' を使用するためのマーカー
    // カーソルコンポーネント側で特別処理する
  }),
}
