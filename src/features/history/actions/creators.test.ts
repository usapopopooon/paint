import { describe, test, expect } from 'vitest'
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
  test('drawable:addedアクションを作成する', () => {
    const action = createDrawableAddedAction(testDrawable)

    expect(action.type).toBe('drawable:added')
    expect(action.drawable).toBe(testDrawable)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
    expect(action.layerId).toBeUndefined()
  })

  test('layerIdが指定された場合は含める', () => {
    const action = createDrawableAddedAction(testDrawable, 'layer-1')

    expect(action.layerId).toBe('layer-1')
  })
})

describe('createDrawablesClearedAction', () => {
  test('drawables:clearedアクションを作成する', () => {
    const drawables = [testDrawable]
    const action = createDrawablesClearedAction(drawables)

    expect(action.type).toBe('drawables:cleared')
    expect(action.previousDrawables).toBe(drawables)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('layerIdが指定された場合は含める', () => {
    const action = createDrawablesClearedAction([], 'layer-2')

    expect(action.layerId).toBe('layer-2')
  })
})

describe('createLayerCreatedAction', () => {
  test('layer:createdアクションを作成する', () => {
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
  test('layer:deletedアクションを作成する', () => {
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
  test('layer:reorderedアクションを作成する', () => {
    const action = createLayerReorderedAction('layer-1', 0, 2)

    expect(action.type).toBe('layer:reordered')
    expect(action.layerId).toBe('layer-1')
    expect(action.fromIndex).toBe(0)
    expect(action.toIndex).toBe(2)
  })
})

describe('アクションIDのユニーク性', () => {
  test('各アクションに対してユニークなIDを生成する', () => {
    const action1 = createDrawableAddedAction(testDrawable)
    const action2 = createDrawableAddedAction(testDrawable)

    expect(action1.id).not.toBe(action2.id)
  })
})
