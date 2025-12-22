import type { Layer } from '../types'

/**
 * レンダラー抽象インターフェース
 * Canvas 2DとPixiJSの両方で実装可能
 */
export interface LayerRenderer {
  /**
   * レイヤーをレンダリング
   */
  readonly render: (
    layers: readonly Layer[],
    width: number,
    height: number,
    backgroundColor: string
  ) => void

  /**
   * リソースを解放
   */
  readonly dispose: () => void

  /**
   * キャンバス要素を取得（DOM接続用）
   */
  readonly getCanvas: () => HTMLCanvasElement
}

/**
 * レンダラーファクトリ型
 */
export type LayerRendererFactory = () => LayerRenderer
