import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasOffset } from './useCanvasOffset'

describe('useCanvasOffset', () => {
  describe('初期状態', () => {
    test('オフセットは(0, 0)で初期化される', () => {
      const { result } = renderHook(() => useCanvasOffset())

      expect(result.current.offset).toEqual({ x: 0, y: 0 })
    })
  })

  describe('pan', () => {
    test('オフセットを相対的に移動できる', () => {
      const { result } = renderHook(() => useCanvasOffset())

      act(() => {
        result.current.pan(10, 20)
      })

      expect(result.current.offset).toEqual({ x: 10, y: 20 })
    })

    test('連続してpanを呼ぶと累積する', () => {
      const { result } = renderHook(() => useCanvasOffset())

      act(() => {
        result.current.pan(10, 20)
      })
      act(() => {
        result.current.pan(5, -10)
      })

      expect(result.current.offset).toEqual({ x: 15, y: 10 })
    })

    test('負の値でも移動できる', () => {
      const { result } = renderHook(() => useCanvasOffset())

      act(() => {
        result.current.pan(-50, -100)
      })

      expect(result.current.offset).toEqual({ x: -50, y: -100 })
    })
  })

  describe('reset', () => {
    test('オフセットを(0, 0)にリセットできる', () => {
      const { result } = renderHook(() => useCanvasOffset())

      act(() => {
        result.current.pan(100, 200)
      })
      act(() => {
        result.current.reset()
      })

      expect(result.current.offset).toEqual({ x: 0, y: 0 })
    })
  })
})
