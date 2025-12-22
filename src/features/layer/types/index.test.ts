import { describe, test, expect } from 'vitest'
import {
  createBackgroundLayer,
  createDrawingLayer,
  createInitialLayerState,
} from './index'

describe('createBackgroundLayer', () => {
  test('デフォルト値で背景レイヤーを作成する', () => {
    const layer = createBackgroundLayer()

    expect(layer.id).toBe('background')
    expect(layer.name).toBe('Background')
    expect(layer.type).toBe('background')
    expect(layer.visible).toBe(true)
    expect(layer.locked).toBe(true)
    expect(layer.opacity).toBe(1)
    expect(layer.blendMode).toBe('normal')
    expect(layer.drawables).toEqual([])
  })
})

describe('createDrawingLayer', () => {
  test('デフォルト値で描画レイヤーを作成する', () => {
    const layer = createDrawingLayer()

    expect(layer.id).toMatch(/^layer-\d+-[a-z0-9]+$/)
    expect(layer.name).toBe('Layer 1')
    expect(layer.type).toBe('drawing')
    expect(layer.visible).toBe(true)
    expect(layer.locked).toBe(false)
    expect(layer.opacity).toBe(1)
    expect(layer.blendMode).toBe('normal')
    expect(layer.drawables).toEqual([])
  })

  test('指定されたIDと名前を使用する', () => {
    const layer = createDrawingLayer('my-layer', 'Custom Layer')

    expect(layer.id).toBe('my-layer')
    expect(layer.name).toBe('Custom Layer')
  })

  test('指定されたIDとデフォルトの名前を使用する', () => {
    const layer = createDrawingLayer('layer-custom')

    expect(layer.id).toBe('layer-custom')
    expect(layer.name).toBe('Layer 1')
  })
})

describe('createInitialLayerState', () => {
  test('背景レイヤーと描画レイヤーを持つ状態を作成する', () => {
    const state = createInitialLayerState()

    expect(state.layers).toHaveLength(2)
    expect(state.layers[0].type).toBe('background')
    expect(state.layers[1].type).toBe('drawing')
  })

  test('描画レイヤーをアクティブに設定する', () => {
    const state = createInitialLayerState()

    expect(state.activeLayerId).toBe('drawing')
  })

  test('背景レイヤーが最初（最背面）にある', () => {
    const state = createInitialLayerState()

    expect(state.layers[0].id).toBe('background')
    expect(state.layers[1].id).toBe('drawing')
  })
})
