import { describe, test, expect } from 'vitest'
import { createLayerCreatedAction } from './createLayerCreatedAction'

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
