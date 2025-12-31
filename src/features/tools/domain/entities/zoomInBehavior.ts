import type { StrokeDrawable } from '@/features/drawable'
import type { ZoomInToolConfig, CursorConfig } from '../../types'

/**
 * ズームインツールのビヘイビア定義
 * ズームインツールはキャンバスの拡大に使用され、ストロークは作成しない
 */
export const zoomInBehavior = {
  type: 'zoom-in' as const,

  /**
   * ズームインツールのデフォルト設定を生成
   * @returns デフォルトのZoomInToolConfig
   */
  defaultConfig: (): ZoomInToolConfig => ({
    type: 'zoom-in',
  }),

  /**
   * ズームインツールはストロークを作成しない
   * この関数は呼び出されるべきではない
   */
  createStroke: (): StrokeDrawable => {
    throw new Error('Zoom-in tool does not create strokes')
  },

  /**
   * ズームインツールのカーソル設定を取得
   * zoom-in カーソルを使用
   */
  getCursor: (): CursorConfig => ({
    size: 0,
    color: 'transparent',
  }),
}
