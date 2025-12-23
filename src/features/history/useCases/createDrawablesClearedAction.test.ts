import { describe, test, expect } from 'vitest'
import { createDrawablesClearedAction } from './createDrawablesClearedAction'
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
