import { describe, test, expect } from 'vitest'
import { createInitialLayerState } from './createInitialLayerState'
import { BACKGROUND_LAYER_ID } from '../../constants'

describe('createInitialLayerState', () => {
  test('背景レイヤー1つと描画レイヤー1つを作成する', () => {
    const state = createInitialLayerState('レイヤー1')

    expect(state.layers).toHaveLength(2)
  })

  test('最初のレイヤーは非表示の背景レイヤーである', () => {
    const state = createInitialLayerState('レイヤー1')

    const backgroundLayer = state.layers[0]
    expect(backgroundLayer?.id).toBe(BACKGROUND_LAYER_ID)
    expect(backgroundLayer?.type).toBe('background')
    expect(backgroundLayer?.isVisible).toBe(false)
  })

  test('描画レイヤー（2番目）はdrawingタイプである', () => {
    const state = createInitialLayerState('レイヤー1')

    const drawingLayer = state.layers[1]
    expect(drawingLayer?.type).toBe('drawing')
  })

  test('描画レイヤーがアクティブである', () => {
    const state = createInitialLayerState('レイヤー1')

    // 背景レイヤーの次の描画レイヤーがアクティブ
    expect(state.activeLayerId).toBe(state.layers[1]?.id)
  })

  test('描画レイヤー名は引数で渡された名前になる', () => {
    const state = createInitialLayerState('Layer 1')

    expect(state.layers[1]?.name).toBe('Layer 1')
  })

  test('描画レイヤーは表示状態である', () => {
    const state = createInitialLayerState('レイヤー1')

    const drawingLayer = state.layers[1]
    expect(drawingLayer?.isVisible).toBe(true)
  })

  test('すべてのレイヤーが空のdrawables配列を持つ', () => {
    const state = createInitialLayerState('レイヤー1')

    for (const layer of state.layers) {
      expect(layer.drawables).toEqual([])
    }
  })
})
