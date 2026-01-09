import type { StrokeDrawable } from '@/features/drawable'
import type { SelectRectangleToolConfig, CursorConfig } from '../../types'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '@/features/selection'

/**
 * 矩形選択ツールのビヘイビア定義
 * 選択ツールはストロークを作成せず、選択領域を定義する
 */
export const selectRectangleBehavior = {
  type: 'select-rectangle' as const,

  /**
   * 矩形選択ツールのデフォルト設定を生成
   * @returns デフォルトのSelectRectangleToolConfig
   */
  defaultConfig: (): SelectRectangleToolConfig => ({
    type: 'select-rectangle',
    feather: DEFAULT_FEATHER,
    antiAlias: DEFAULT_ANTI_ALIAS,
  }),

  /**
   * 選択ツールはストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (): StrokeDrawable => {
    throw new Error('Selection tool does not create strokes')
  },

  /**
   * 矩形選択ツールのカーソル設定を取得
   * crosshair カーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
