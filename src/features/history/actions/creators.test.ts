import { describe, it, expect } from 'vitest'
import {
  createDrawableAddedAction,
  createDrawablesClearedAction,
  createLayerCreatedAction,
  createLayerDeletedAction,
  createLayerReorderedAction,
} from './creators'
import { createSolidBrushTip } from '@/features/brush'
import { createStrokeDrawable } from '@/features/drawable'

const testDrawable = createStrokeDrawable(
  [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
  ],
  {
    color: '#ff0000',
    brushTip: createSolidBrushTip(5),
    blendMode: 'normal',
  }
)

describe('createDrawableAddedAction', () => {
  it('creates a drawable:added action', () => {
    const action = createDrawableAddedAction(testDrawable)

    expect(action.type).toBe('drawable:added')
    expect(action.drawable).toBe(testDrawable)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
    expect(action.layerId).toBeUndefined()
  })

  it('includes layerId when provided', () => {
    const action = createDrawableAddedAction(testDrawable, 'layer-1')

    expect(action.layerId).toBe('layer-1')
  })
})

describe('createDrawablesClearedAction', () => {
  it('creates a drawables:cleared action', () => {
    const drawables = [testDrawable]
    const action = createDrawablesClearedAction(drawables)

    expect(action.type).toBe('drawables:cleared')
    expect(action.previousDrawables).toBe(drawables)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  it('includes layerId when provided', () => {
    const action = createDrawablesClearedAction([], 'layer-2')

    expect(action.layerId).toBe('layer-2')
  })
})

describe('createLayerCreatedAction', () => {
  it('creates a layer:created action', () => {
    const action = createLayerCreatedAction('layer-1', 'Background', 0)

    expect(action.type).toBe('layer:created')
    expect(action.layerId).toBe('layer-1')
    expect(action.name).toBe('Background')
    expect(action.index).toBe(0)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })
})

describe('createLayerDeletedAction', () => {
  it('creates a layer:deleted action', () => {
    const snapshot = {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal' as const,
      drawables: [testDrawable],
    }

    const action = createLayerDeletedAction('layer-1', snapshot)

    expect(action.type).toBe('layer:deleted')
    expect(action.layerId).toBe('layer-1')
    expect(action.layerSnapshot).toBe(snapshot)
  })
})

describe('createLayerReorderedAction', () => {
  it('creates a layer:reordered action', () => {
    const action = createLayerReorderedAction('layer-1', 0, 2)

    expect(action.type).toBe('layer:reordered')
    expect(action.layerId).toBe('layer-1')
    expect(action.fromIndex).toBe(0)
    expect(action.toIndex).toBe(2)
  })
})

describe('action ID uniqueness', () => {
  it('generates unique IDs for each action', () => {
    const action1 = createDrawableAddedAction(testDrawable)
    const action2 = createDrawableAddedAction(testDrawable)

    expect(action1.id).not.toBe(action2.id)
  })
})
