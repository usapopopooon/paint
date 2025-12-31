import { describe, it, expect } from 'vitest'
import { createInitialLayerState } from './createInitialLayerState'
import { BACKGROUND_LAYER_ID } from '../../constants'

describe('createInitialLayerState', () => {
  it('背景レイヤー1つと描画レイヤー3つを作成する', () => {
    const state = createInitialLayerState()

    expect(state.layers).toHaveLength(4)
  })

  it('最初のレイヤーは非表示の背景レイヤーである', () => {
    const state = createInitialLayerState()

    const backgroundLayer = state.layers[0]
    expect(backgroundLayer?.id).toBe(BACKGROUND_LAYER_ID)
    expect(backgroundLayer?.type).toBe('background')
    expect(backgroundLayer?.isVisible).toBe(false)
  })

  it('描画レイヤー（2番目以降）はdrawingタイプである', () => {
    const state = createInitialLayerState()

    const drawingLayers = state.layers.slice(1)
    for (const layer of drawingLayers) {
      expect(layer.type).toBe('drawing')
    }
  })

  it('最初の描画レイヤーがアクティブである', () => {
    const state = createInitialLayerState()

    // 背景レイヤーの次の描画レイヤーがアクティブ
    expect(state.activeLayerId).toBe(state.layers[1]?.id)
  })

  it('描画レイヤー名にはLayer 1、Layer 2、Layer 3が含まれる', () => {
    const state = createInitialLayerState()

    expect(state.layers[1]?.name).toContain('1')
    expect(state.layers[2]?.name).toContain('2')
    expect(state.layers[3]?.name).toContain('3')
  })

  it('描画レイヤーはすべて表示状態である', () => {
    const state = createInitialLayerState()

    const drawingLayers = state.layers.slice(1)
    for (const layer of drawingLayers) {
      expect(layer.isVisible).toBe(true)
    }
  })

  it('すべてのレイヤーが空のdrawables配列を持つ', () => {
    const state = createInitialLayerState()

    for (const layer of state.layers) {
      expect(layer.drawables).toEqual([])
    }
  })
})
