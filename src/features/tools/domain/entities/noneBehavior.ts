import type { StrokeDrawable } from '@/features/drawable'
import type { NoneToolConfig, CursorConfig } from '../../types'

/**
 * 未選択状態のビヘイビア定義
 * 初期状態でツールが選択されていない場合に使用
 */
export const noneBehavior = {
  type: 'none' as const,

  /**
   * 未選択状態のデフォルト設定を生成
   * @returns デフォルトのNoneToolConfig
   */
  defaultConfig: (): NoneToolConfig => ({
    type: 'none',
  }),

  /**
   * 未選択状態はストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (): StrokeDrawable => {
    throw new Error('None tool does not create strokes')
  },

  /**
   * 未選択状態のカーソル設定を取得
   * デフォルトカーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
