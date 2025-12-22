import { describe, it, expect } from 'vitest'
import {
  createBackgroundLayer,
  createDrawingLayer,
  createInitialLayerState,
} from './index'

describe('createBackgroundLayer', () => {
  it('creates a background layer with default values', () => {
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
  it('creates a drawing layer with default values', () => {
    const layer = createDrawingLayer()

    expect(layer.id).toMatch(/^layer-\d+$/)
    expect(layer.name).toBe('Layer 1')
    expect(layer.type).toBe('drawing')
    expect(layer.visible).toBe(true)
    expect(layer.locked).toBe(false)
    expect(layer.opacity).toBe(1)
    expect(layer.blendMode).toBe('normal')
    expect(layer.drawables).toEqual([])
  })

  it('uses provided id and name', () => {
    const layer = createDrawingLayer('my-layer', 'Custom Layer')

    expect(layer.id).toBe('my-layer')
    expect(layer.name).toBe('Custom Layer')
  })

  it('uses provided id with default name', () => {
    const layer = createDrawingLayer('layer-custom')

    expect(layer.id).toBe('layer-custom')
    expect(layer.name).toBe('Layer 1')
  })
})

describe('createInitialLayerState', () => {
  it('creates state with background and drawing layers', () => {
    const state = createInitialLayerState()

    expect(state.layers).toHaveLength(2)
    expect(state.layers[0].type).toBe('background')
    expect(state.layers[1].type).toBe('drawing')
  })

  it('sets drawing layer as active', () => {
    const state = createInitialLayerState()

    expect(state.activeLayerId).toBe('drawing')
  })

  it('background layer is first (at the back)', () => {
    const state = createInitialLayerState()

    expect(state.layers[0].id).toBe('background')
    expect(state.layers[1].id).toBe('drawing')
  })
})
