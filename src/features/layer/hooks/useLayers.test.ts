import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayers } from './useLayers'
import { createStrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip } from '@/features/brush'

const createTestStroke = (points: { x: number; y: number }[]) =>
  createStrokeDrawable(points, {
    color: '#000000',
    brushTip: createSolidBrushTip(3),
    blendMode: 'normal',
  })

describe('useLayers', () => {
  describe('translateAllLayers', () => {
    test('全レイヤーのDrawableの座標をオフセット分移動する', () => {
      const { result } = renderHook(() => useLayers())

      // Drawableを追加
      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      // 座標を移動
      act(() => {
        result.current.translateAllLayers(50, 25)
      })

      const drawables = result.current.activeLayer.drawables
      expect(drawables[0]?.points).toEqual([
        { x: 150, y: 125 },
        { x: 250, y: 225 },
      ])
    })

    test('負のオフセットで座標を移動する', () => {
      const { result } = renderHook(() => useLayers())

      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      act(() => {
        result.current.translateAllLayers(-30, -20)
      })

      const drawables = result.current.activeLayer.drawables
      expect(drawables[0]?.points).toEqual([
        { x: 70, y: 80 },
        { x: 170, y: 180 },
      ])
    })

    test('オフセット0の場合は何も変更しない', () => {
      const { result } = renderHook(() => useLayers())

      act(() => {
        result.current.addDrawable(
          createTestStroke([
            { x: 100, y: 100 },
            { x: 200, y: 200 },
          ])
        )
      })

      const drawablesBefore = result.current.activeLayer.drawables

      act(() => {
        result.current.translateAllLayers(0, 0)
      })

      // 同じ参照のまま（stateが更新されていない）
      expect(result.current.activeLayer.drawables).toBe(drawablesBefore)
    })

    test('複数のDrawableを移動する', () => {
      const { result } = renderHook(() => useLayers())

      act(() => {
        result.current.addDrawable(createTestStroke([{ x: 100, y: 100 }]))
        result.current.addDrawable(createTestStroke([{ x: 200, y: 200 }]))
      })

      act(() => {
        result.current.translateAllLayers(10, 20)
      })

      const drawables = result.current.activeLayer.drawables
      expect(drawables[0]?.points).toEqual([{ x: 110, y: 120 }])
      expect(drawables[1]?.points).toEqual([{ x: 210, y: 220 }])
    })

    test('Drawableがない場合でもエラーにならない', () => {
      const { result } = renderHook(() => useLayers())

      expect(() => {
        act(() => {
          result.current.translateAllLayers(10, 20)
        })
      }).not.toThrow()

      expect(result.current.activeLayer.drawables).toEqual([])
    })
  })
})
