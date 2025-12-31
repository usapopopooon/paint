import type { StrokeDrawable } from '@/features/drawable'
import type { ZoomOutToolConfig, CursorConfig } from '../../types'

/**
 * ズームアウトツールのビヘイビア定義
 * ズームアウトツールはキャンバスの縮小に使用され、ストロークは作成しない
 */
export const zoomOutBehavior = {
  type: 'zoom-out' as const,

  /**
   * ズームアウトツールのデフォルト設定を生成
   * @returns デフォルトのZoomOutToolConfig
   */
  defaultConfig: (): ZoomOutToolConfig => ({
    type: 'zoom-out',
  }),

  /**
   * ズームアウトツールはストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (): StrokeDrawable => {
    throw new Error('Zoom-out tool does not create strokes')
  },

  /**
   * ズームアウトツールのカーソル設定を取得
   * zoom-out カーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
