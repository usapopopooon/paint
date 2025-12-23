import { describe, test, expect } from 'vitest'
import { createDrawableAddedAction } from './createDrawableAddedAction'
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

  test('各アクションに対してユニークなIDを生成する', () => {
    const action1 = createDrawableAddedAction(testDrawable)
    const action2 = createDrawableAddedAction(testDrawable)

    expect(action1.id).not.toBe(action2.id)
  })
})
