import type { Point } from '@/lib/geometry'
import type { LassoSelectionToolConfig, SelectionShape } from '../../types'
import type { CursorConfig } from '@/features/tools/types'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS, MIN_LASSO_POINTS } from '../../constants'

/**
 * フリーハンド選択ツールのビヘイビア
 */
export const lassoSelectionBehavior = {
  type: 'select-lasso' as const,

  /**
   * デフォルト設定を生成
   */
  defaultConfig: (): LassoSelectionToolConfig => ({
    type: 'select-lasso',
    feather: DEFAULT_FEATHER,
    antiAlias: DEFAULT_ANTI_ALIAS,
  }),

  /**
   * ポイント配列から選択領域を作成
   * 自動的にパスを閉じる
   */
  createShape: (points: readonly Point[]): SelectionShape => {
    // 最低3点必要
    if (points.length < MIN_LASSO_POINTS) {
      return { type: 'lasso', points: [] }
    }
    return { type: 'lasso', points }
  },

  /**
   * カーソル設定を取得
   * CSSカーソルとして 'crosshair' を使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
