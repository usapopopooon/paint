import { describe, test, expect } from 'vitest'
import { createLayerVisibilityChangedAction } from './createLayerVisibilityChangedAction'

describe('createLayerVisibilityChangedAction', () => {
  test('layer:visibility-changedアクションを作成する', () => {
    const action = createLayerVisibilityChangedAction('layer-1', true, false)

    expect(action.type).toBe('layer:visibility-changed')
    expect(action.layerId).toBe('layer-1')
    expect(action.previousValue).toBe(true)
    expect(action.newValue).toBe(false)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('可視から不可視への変更を記録できる', () => {
    const action = createLayerVisibilityChangedAction('layer-2', true, false)

    expect(action.previousValue).toBe(true)
    expect(action.newValue).toBe(false)
  })

  test('不可視から可視への変更を記録できる', () => {
    const action = createLayerVisibilityChangedAction('layer-3', false, true)

    expect(action.previousValue).toBe(false)
    expect(action.newValue).toBe(true)
  })
})
