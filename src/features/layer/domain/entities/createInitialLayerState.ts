import type { LayerState } from '../../types'
import { createBackgroundLayer } from './createBackgroundLayer'
import { createDrawingLayer } from './createDrawingLayer'

/**
 * 背景＋描画レイヤー1つの初期レイヤー状態を作成
 * @returns 背景レイヤーとアクティブな描画レイヤーを含む初期状態
 */
export const createInitialLayerState = (): LayerState => ({
  layers: [createBackgroundLayer(), createDrawingLayer('drawing', 'Layer 1')],
  activeLayerId: 'drawing',
})
