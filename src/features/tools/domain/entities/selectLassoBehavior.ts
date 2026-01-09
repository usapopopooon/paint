import type { StrokeDrawable } from '@/features/drawable'
import type { SelectLassoToolConfig, CursorConfig } from '../../types'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '@/features/selection'

/**
 * 自由選択（Lasso）ツールのビヘイビア定義
 * 選択ツールはストロークを作成せず、選択領域を定義する
 */
export const selectLassoBehavior = {
  type: 'select-lasso' as const,

  /**
   * 自由選択ツールのデフォルト設定を生成
   * @returns デフォルトのSelectLassoToolConfig
   */
  defaultConfig: (): SelectLassoToolConfig => ({
    type: 'select-lasso',
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
   * 自由選択ツールのカーソル設定を取得
   * crosshair カーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
