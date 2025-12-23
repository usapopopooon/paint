import { describe, test, expect } from 'vitest'
import { createLayerDeletedAction } from './createLayerDeletedAction'
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
