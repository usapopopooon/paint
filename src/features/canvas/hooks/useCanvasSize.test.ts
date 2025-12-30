import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useCanvasSize,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  MIN_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
} from './useCanvasSize'

describe('useCanvasSize', () => {
  describe('初期状態', () => {
    test('デフォルトの幅を持つ', () => {
      const { result } = renderHook(() => useCanvasSize())

      expect(result.current.width).toBe(DEFAULT_CANVAS_WIDTH)
    })

    test('デフォルトの高さを持つ', () => {
      const { result } = renderHook(() => useCanvasSize())

      expect(result.current.height).toBe(DEFAULT_CANVAS_HEIGHT)
    })
  })

  describe('setWidth', () => {
    test('幅を変更する', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(1024)
      })

      expect(result.current.width).toBe(1024)
    })

    test('最小値を下回らない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(50)
      })

      expect(result.current.width).toBe(MIN_CANVAS_SIZE)
    })

    test('最大値を超えない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(5000)
      })

      expect(result.current.width).toBe(MAX_CANVAS_SIZE)
    })

    test('高さは変更されない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(1024)
      })

      expect(result.current.height).toBe(DEFAULT_CANVAS_HEIGHT)
    })
  })

  describe('setHeight', () => {
    test('高さを変更する', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setHeight(768)
      })

      expect(result.current.height).toBe(768)
    })

    test('最小値を下回らない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setHeight(50)
      })

      expect(result.current.height).toBe(MIN_CANVAS_SIZE)
    })

    test('最大値を超えない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setHeight(5000)
      })

      expect(result.current.height).toBe(MAX_CANVAS_SIZE)
    })

    test('幅は変更されない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setHeight(768)
      })

      expect(result.current.width).toBe(DEFAULT_CANVAS_WIDTH)
    })
  })

  describe('境界値', () => {
    test('最小値を設定できる', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(MIN_CANVAS_SIZE)
        result.current.setHeight(MIN_CANVAS_SIZE)
      })

      expect(result.current.width).toBe(MIN_CANVAS_SIZE)
      expect(result.current.height).toBe(MIN_CANVAS_SIZE)
    })

    test('最大値を設定できる', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setWidth(MAX_CANVAS_SIZE)
        result.current.setHeight(MAX_CANVAS_SIZE)
      })

      expect(result.current.width).toBe(MAX_CANVAS_SIZE)
      expect(result.current.height).toBe(MAX_CANVAS_SIZE)
    })
  })
})
