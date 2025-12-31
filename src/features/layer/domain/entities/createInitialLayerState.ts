import type { LayerState } from '../../types'
import { createBackgroundLayer } from './createBackgroundLayer'
import { createDrawingLayer } from './createDrawingLayer'

/**
 * 初期レイヤー状態を作成
 * @param layerName - 初期レイヤーの名前
 * @returns 初期レイヤー構成（背景レイヤー + レイヤー1、レイヤー1がアクティブ）
 */
export const createInitialLayerState = (layerName: string): LayerState => {
  // 背景レイヤー（最背面、非表示）
  const backgroundLayer = createBackgroundLayer()

  // 描画レイヤー（初期は1枚のみ）
  const layer1 = createDrawingLayer('layer-1', layerName)

  return {
    layers: [backgroundLayer, layer1],
    activeLayerId: layer1.id,
  }
}
