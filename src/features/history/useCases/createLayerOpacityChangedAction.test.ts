import { describe, test, expect } from 'vitest'
import { createLayerOpacityChangedAction } from './createLayerOpacityChangedAction'

describe('createLayerOpacityChangedAction', () => {
  test('layer:opacity-changedアクションを作成する', () => {
    const action = createLayerOpacityChangedAction('layer-1', 1.0, 0.5)

    expect(action.type).toBe('layer:opacity-changed')
    expect(action.layerId).toBe('layer-1')
    expect(action.previousValue).toBe(1.0)
    expect(action.newValue).toBe(0.5)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('不透明度を下げる変更を記録できる', () => {
    const action = createLayerOpacityChangedAction('layer-2', 0.8, 0.3)

    expect(action.previousValue).toBe(0.8)
    expect(action.newValue).toBe(0.3)
  })

  test('不透明度を上げる変更を記録できる', () => {
    const action = createLayerOpacityChangedAction('layer-3', 0.2, 0.9)

    expect(action.previousValue).toBe(0.2)
    expect(action.newValue).toBe(0.9)
  })
})
