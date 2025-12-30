import type { LayerState } from '../../types'
import { createDrawingLayer } from './createDrawingLayer'

const INITIAL_LAYER_COUNT = 3

/**
 * 初期レイヤー状態を作成
 * @returns 初期レイヤー構成（最下層がアクティブ）
 */
export const createInitialLayerState = (): LayerState => {
  const layers = Array.from({ length: INITIAL_LAYER_COUNT }, (_, i) =>
    createDrawingLayer(`layer-${i + 1}`, `Layer ${i + 1}`)
  )

  return {
    layers,
    activeLayerId: layers[0]?.id ?? '',
  }
}
