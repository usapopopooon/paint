import type { StrokeDrawable } from '@/features/drawable'
import type { EyedropperToolConfig, CursorConfig } from '../../types'

/**
 * スポイトツールのビヘイビア定義
 * スポイトツールはキャンバス上の色を取得するために使用され、ストロークは作成しない
 */
export const eyedropperBehavior = {
  type: 'eyedropper' as const,

  /**
   * スポイトツールのデフォルト設定を生成
   * @returns デフォルトのEyedropperToolConfig
   */
  defaultConfig: (): EyedropperToolConfig => ({
    type: 'eyedropper',
  }),

  /**
   * スポイトツールはストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (): StrokeDrawable => {
    throw new Error('Eyedropper tool does not create strokes')
  },

  /**
   * スポイトツールのカーソル設定を取得
   * crosshair カーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
    // CSSカーソルとして 'crosshair' を使用するためのマーカー
    // カーソルコンポーネント側で特別処理する
  }),
}
