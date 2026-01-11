import { describe, test, expect } from 'vitest'
import { createLayerMergedDownAction } from './createLayerMergedDownAction'
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

describe('createLayerMergedDownAction', () => {
  test('layer:merged-downアクションを作成する', () => {
    const upperSnapshot = {
      id: 'layer-2',
      name: 'Layer 2',
      isVisible: true,
      isLocked: false,
      opacity: 0.8,
      blendMode: 'multiply' as const,
      drawables: [testDrawable],
    }

    const lowerSnapshot = {
      id: 'layer-1',
      name: 'Layer 1',
      isVisible: true,
      isLocked: false,
      opacity: 1,
      blendMode: 'normal' as const,
      drawables: [],
    }

    const action = createLayerMergedDownAction('layer-1', upperSnapshot, 2, lowerSnapshot, 1)

    expect(action.type).toBe('layer:merged-down')
    expect(action.layerId).toBe('layer-1')
    expect(action.upperLayerSnapshot).toBe(upperSnapshot)
    expect(action.upperLayerIndex).toBe(2)
    expect(action.lowerLayerSnapshot).toBe(lowerSnapshot)
    expect(action.lowerLayerIndex).toBe(1)
  })

  test('ブレンドモードと不透明度を保持する', () => {
    const upperSnapshot = {
      id: 'layer-2',
      name: 'Layer 2',
      isVisible: true,
      isLocked: false,
      opacity: 0.5,
      blendMode: 'screen' as const,
      drawables: [testDrawable],
    }

    const lowerSnapshot = {
      id: 'layer-1',
      name: 'Layer 1',
      isVisible: true,
      isLocked: false,
      opacity: 1,
      blendMode: 'normal' as const,
      drawables: [],
    }

    const action = createLayerMergedDownAction('layer-1', upperSnapshot, 2, lowerSnapshot, 1)

    expect(action.upperLayerSnapshot.opacity).toBe(0.5)
    expect(action.upperLayerSnapshot.blendMode).toBe('screen')
    expect(action.lowerLayerSnapshot.opacity).toBe(1)
    expect(action.lowerLayerSnapshot.blendMode).toBe('normal')
  })
})
