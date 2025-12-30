import { describe, it, expect } from 'vitest'
import { createInitialLayerState } from './createInitialLayerState'

describe('createInitialLayerState', () => {
  it('3つのレイヤーを作成する', () => {
    const state = createInitialLayerState()

    expect(state.layers).toHaveLength(3)
  })

  it('すべてのレイヤーがdrawingタイプである', () => {
    const state = createInitialLayerState()

    for (const layer of state.layers) {
      expect(layer.type).toBe('drawing')
    }
  })

  it('最初のレイヤーがアクティブである', () => {
    const state = createInitialLayerState()

    expect(state.activeLayerId).toBe(state.layers[0]?.id)
  })

  it('レイヤー名にはLayer 1、Layer 2、Layer 3が含まれる', () => {
    const state = createInitialLayerState()

    expect(state.layers[0]?.name).toContain('1')
    expect(state.layers[1]?.name).toContain('2')
    expect(state.layers[2]?.name).toContain('3')
  })

  it('すべてのレイヤーが表示状態である', () => {
    const state = createInitialLayerState()

    for (const layer of state.layers) {
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
