import { describe, test, expect } from 'vitest'
import { createCanvasFlippedAction } from './createCanvasFlippedAction'

describe('createCanvasFlippedAction', () => {
  const mockLayerSnapshots = [
    {
      layerId: 'layer-1',
      previousDrawables: [
        {
          id: 'stroke-1',
          createdAt: Date.now(),
          type: 'stroke' as const,
          points: [{ x: 100, y: 100 }],
          style: {
            color: '#000000',
            brushTip: { type: 'solid' as const, diameter: 3 },
            blendMode: 'normal' as const,
          },
        },
      ],
    },
  ]

  test('水平反転アクションを作成する', () => {
    const action = createCanvasFlippedAction('horizontal', 800, mockLayerSnapshots)

    expect(action.type).toBe('canvas:flipped')
    expect(action.direction).toBe('horizontal')
    expect(action.canvasSize).toBe(800)
    expect(action.layerSnapshots).toEqual(mockLayerSnapshots)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('垂直反転アクションを作成する', () => {
    const action = createCanvasFlippedAction('vertical', 600, mockLayerSnapshots)

    expect(action.type).toBe('canvas:flipped')
    expect(action.direction).toBe('vertical')
    expect(action.canvasSize).toBe(600)
    expect(action.layerSnapshots).toEqual(mockLayerSnapshots)
    expect(action.id).toBeTruthy()
    expect(action.timestamp).toBeGreaterThan(0)
  })

  test('複数レイヤーのスナップショットを保存できる', () => {
    const multiLayerSnapshots = [
      { layerId: 'layer-1', previousDrawables: [] },
      { layerId: 'layer-2', previousDrawables: [] },
      { layerId: 'layer-3', previousDrawables: [] },
    ]

    const action = createCanvasFlippedAction('horizontal', 800, multiLayerSnapshots)

    expect(action.layerSnapshots).toHaveLength(3)
    expect(action.layerSnapshots[0]?.layerId).toBe('layer-1')
    expect(action.layerSnapshots[1]?.layerId).toBe('layer-2')
    expect(action.layerSnapshots[2]?.layerId).toBe('layer-3')
  })

  test('空のレイヤースナップショットでも作成できる', () => {
    const action = createCanvasFlippedAction('vertical', 600, [])

    expect(action.layerSnapshots).toEqual([])
  })
})
