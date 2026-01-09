import type { Point, Bounds } from '@/lib/geometry'
import type { RectangleSelectionToolConfig, SelectionShape } from '../../types'
import type { CursorConfig } from '@/features/tools/types'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '../../constants'

/**
 * 矩形選択ツールのビヘイビア
 */
export const rectangleSelectionBehavior = {
  type: 'select-rectangle' as const,

  /**
   * デフォルト設定を生成
   */
  defaultConfig: (): RectangleSelectionToolConfig => ({
    type: 'select-rectangle',
    feather: DEFAULT_FEATHER,
    antiAlias: DEFAULT_ANTI_ALIAS,
  }),

  /**
   * 開始点と現在点から選択領域を計算
   */
  createShape: (startPoint: Point, currentPoint: Point): SelectionShape => {
    const x1 = startPoint.x
    const y1 = startPoint.y
    const x2 = currentPoint.x
    const y2 = currentPoint.y

    const bounds: Bounds = {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    }

    return { type: 'rectangle', bounds }
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
