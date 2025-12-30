import { describe, test, expect } from 'vitest'
import { isCanvasAction } from './isCanvasAction'
import type { HistoryAction } from '../../types'

describe('isCanvasAction', () => {
  test('canvas:resizedアクションに対してtrueを返す', () => {
    const action: HistoryAction = {
      id: 'action-1',
      timestamp: Date.now(),
      type: 'canvas:resized',
      previousWidth: 800,
      previousHeight: 600,
      newWidth: 1024,
      newHeight: 768,
      offsetX: 112,
      offsetY: 84,
    }

    expect(isCanvasAction(action)).toBe(true)
  })

  test('drawable:addedアクションに対してfalseを返す', () => {
    const action: HistoryAction = {
      id: 'action-1',
      timestamp: Date.now(),
      type: 'drawable:added',
      layerId: 'layer-1',
      drawable: {
        id: 'drawable-1',
        createdAt: Date.now(),
        type: 'stroke',
        points: [],
        style: {
          color: '#000000',
          brushTip: {
            type: 'solid',
            size: 1,
            hardness: 1,
            opacity: 1,
          },
          blendMode: 'normal',
        },
      },
    }

    expect(isCanvasAction(action)).toBe(false)
  })

  test('layer:visibility-changedアクションに対してfalseを返す', () => {
    const action: HistoryAction = {
      id: 'action-1',
      timestamp: Date.now(),
      type: 'layer:visibility-changed',
      layerId: 'layer-1',
      previousValue: true,
      newValue: false,
    }

    expect(isCanvasAction(action)).toBe(false)
  })
})
