import { describe, test, expect } from 'vitest'
import { createLayerReorderedAction } from './createLayerReorderedAction'

describe('createLayerReorderedAction', () => {
  test('layer:reorderedアクションを作成する', () => {
    const action = createLayerReorderedAction('layer-1', 0, 2)

    expect(action.type).toBe('layer:reordered')
    expect(action.layerId).toBe('layer-1')
    expect(action.fromIndex).toBe(0)
    expect(action.toIndex).toBe(2)
  })
})
