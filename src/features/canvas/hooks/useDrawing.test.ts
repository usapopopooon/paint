import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrawing } from './useDrawing'
import type { ToolConfig } from '../../tools/types'

describe('useDrawing', () => {
  const createPenConfig = (): ToolConfig => ({
    type: 'pen',
    width: 5,
    color: '#000000',
    opacity: 1,
    hardness: 0,
  })

  describe('endStroke', () => {
    test('ストローク終了時にonDrawableCompleteが即座に呼ばれる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      // ストロークを開始
      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      // ポイントを追加（最低2点必要）
      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
      })

      // ストロークを終了
      act(() => {
        result.current.endStroke()
      })

      // onDrawableCompleteが呼ばれたことを確認
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          points: expect.arrayContaining([
            expect.objectContaining({ x: 0, y: 0 }),
            expect.objectContaining({ x: 10, y: 10 }),
          ]),
        })
      )
    })

    test('ストローク終了後にcurrentStrokeがnullになる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
        result.current.addPoint({ x: 10, y: 10 })
      })

      expect(result.current.currentStroke).not.toBeNull()

      act(() => {
        result.current.endStroke()
      })

      expect(result.current.currentStroke).toBeNull()
    })

    test('ポイントが1つだけの場合はonDrawableCompleteが呼ばれない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      act(() => {
        result.current.endStroke()
      })

      expect(onComplete).not.toHaveBeenCalled()
    })

    test('currentStrokeがnullの場合はonDrawableCompleteが呼ばれない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.endStroke()
      })

      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('startStroke', () => {
    test('ストローク開始時にcurrentStrokeが設定される', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      expect(result.current.currentStroke).toBeNull()

      act(() => {
        result.current.startStroke({ x: 5, y: 10 }, createPenConfig())
      })

      expect(result.current.currentStroke).not.toBeNull()
      expect(result.current.currentStroke?.points[0]).toEqual(
        expect.objectContaining({ x: 5, y: 10 })
      )
    })
  })

  describe('addPoint', () => {
    test('ポイントを追加するとcurrentStrokeのpointsに追加される', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      expect(result.current.currentStroke?.points.length).toBe(1)

      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
      })

      expect(result.current.currentStroke?.points.length).toBe(2)

      act(() => {
        result.current.addPoint({ x: 20, y: 20 })
      })

      expect(result.current.currentStroke?.points.length).toBe(3)
    })

    test('currentStrokeがnullの場合はポイントが追加されない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
      })

      expect(result.current.currentStroke).toBeNull()
    })
  })
})
