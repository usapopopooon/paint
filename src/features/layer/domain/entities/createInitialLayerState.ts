import type { LayerState } from '../../types'
import { createBackgroundLayer } from './createBackgroundLayer'
import { createDrawingLayer } from './createDrawingLayer'

const INITIAL_LAYER_COUNT = 3

/**
 * 初期レイヤー状態を作成
 * @returns 初期レイヤー構成（背景レイヤー + 描画レイヤー3枚、最下層描画レイヤーがアクティブ）
 */
export const createInitialLayerState = (): LayerState => {
  // 背景レイヤー（最背面、非表示）
  const backgroundLayer = createBackgroundLayer()

  // 描画レイヤー
  const drawingLayers = Array.from({ length: INITIAL_LAYER_COUNT }, (_, i) =>
    createDrawingLayer(`layer-${i + 1}`, `Layer ${i + 1}`)
  )

  return {
    layers: [backgroundLayer, ...drawingLayers],
    activeLayerId: drawingLayers[0]?.id ?? '',
  }
}
