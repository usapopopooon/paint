import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useZoom } from './useZoom'
import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM, ZOOM_STEP } from '../constants'

describe('useZoom', () => {
  // テスト用のビューポートサイズ
  const viewportWidth = 800
  const viewportHeight = 600

  describe('初期状態', () => {
    test('ズームはDEFAULT_ZOOMで初期化される', () => {
      const { result } = renderHook(() => useZoom())

      expect(result.current.zoom).toBe(DEFAULT_ZOOM)
    })

    test('zoomPercentは正しく計算される（内部値の2倍）', () => {
      const { result } = renderHook(() => useZoom())

      // DEFAULT_ZOOM = 0.5 → UI表示は100%
      expect(result.current.zoomPercent).toBe(100)
    })
  })

  describe('zoomIn', () => {
    test('ズームイン時にZOOM_STEP分拡大する', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM + ZOOM_STEP)
    })

    test('MAX_ZOOMを超えない', () => {
      const { result } = renderHook(() => useZoom())

      // MAX_ZOOMまでズームイン
      act(() => {
        result.current.setZoomLevel(MAX_ZOOM)
      })
      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.zoom).toBe(MAX_ZOOM)
    })
  })

  describe('zoomOut', () => {
    test('ズームアウト時にZOOM_STEP分縮小する', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM - ZOOM_STEP)
    })

    test('MIN_ZOOMを下回らない', () => {
      const { result } = renderHook(() => useZoom())

      // MIN_ZOOMまでズームアウト
      act(() => {
        result.current.setZoomLevel(MIN_ZOOM)
      })
      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoom).toBe(MIN_ZOOM)
    })
  })

  describe('resetZoom', () => {
    test('ズームをDEFAULT_ZOOMにリセットする', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.zoomIn()
        result.current.zoomIn()
      })
      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM)
    })
  })

  describe('setZoomLevel', () => {
    test('任意のズーム倍率を設定できる', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.setZoomLevel(0.75)
      })

      expect(result.current.zoom).toBe(0.75)
    })

    test('MIN_ZOOMより小さい値はMIN_ZOOMにクランプされる', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.setZoomLevel(0.01)
      })

      expect(result.current.zoom).toBe(MIN_ZOOM)
    })

    test('MAX_ZOOMより大きい値はMAX_ZOOMにクランプされる', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.setZoomLevel(10)
      })

      expect(result.current.zoom).toBe(MAX_ZOOM)
    })
  })

  describe('handleWheel', () => {
    test('正のdeltaYでズームアウト', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.handleWheel(100)
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM - ZOOM_STEP)
    })

    test('負のdeltaYでズームイン', () => {
      const { result } = renderHook(() => useZoom())

      act(() => {
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM + ZOOM_STEP)
    })
  })

  describe('zoomAtPoint', () => {
    test('指定位置を基準にズームイン時のオフセットを計算する', () => {
      const { result } = renderHook(() => useZoom())
      const currentOffset = { x: 0, y: 0 }

      let newOffset: { x: number; y: number } | undefined
      act(() => {
        newOffset = result.current.zoomAtPoint(
          400, // centerX
          300, // centerY
          viewportWidth,
          viewportHeight,
          'in',
          currentOffset
        )
      })

      // ズームが変わった
      expect(result.current.zoom).toBe(DEFAULT_ZOOM + ZOOM_STEP)
      // オフセットが返される
      expect(newOffset).toBeDefined()
    })

    test('指定位置を基準にズームアウト時のオフセットを計算する', () => {
      const { result } = renderHook(() => useZoom())
      const currentOffset = { x: 0, y: 0 }

      let newOffset: { x: number; y: number } | undefined
      act(() => {
        newOffset = result.current.zoomAtPoint(
          400,
          300,
          viewportWidth,
          viewportHeight,
          'out',
          currentOffset
        )
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM - ZOOM_STEP)
      expect(newOffset).toBeDefined()
    })

    test('ズームが限界値の場合はオフセットを変更しない', () => {
      const { result } = renderHook(() => useZoom())
      const currentOffset = { x: 50, y: 50 }

      // MAX_ZOOMに設定
      act(() => {
        result.current.setZoomLevel(MAX_ZOOM)
      })

      let newOffset: { x: number; y: number } | undefined
      act(() => {
        newOffset = result.current.zoomAtPoint(
          400,
          300,
          viewportWidth,
          viewportHeight,
          'in',
          currentOffset
        )
      })

      // オフセットは変わらない
      expect(newOffset).toEqual(currentOffset)
    })
  })

  describe('handleWheelAtPoint', () => {
    test('正のdeltaYでズームアウトし、directionを返す', () => {
      const { result } = renderHook(() => useZoom())
      const currentOffset = { x: 0, y: 0 }

      let returnValue: { offset: { x: number; y: number }; direction: 'in' | 'out' } | undefined
      act(() => {
        returnValue = result.current.handleWheelAtPoint(
          100,
          400,
          300,
          viewportWidth,
          viewportHeight,
          currentOffset
        )
      })

      expect(returnValue?.direction).toBe('out')
      expect(result.current.zoom).toBe(DEFAULT_ZOOM - ZOOM_STEP)
    })

    test('負のdeltaYでズームインし、directionを返す', () => {
      const { result } = renderHook(() => useZoom())
      const currentOffset = { x: 0, y: 0 }

      let returnValue: { offset: { x: number; y: number }; direction: 'in' | 'out' } | undefined
      act(() => {
        returnValue = result.current.handleWheelAtPoint(
          -100,
          400,
          300,
          viewportWidth,
          viewportHeight,
          currentOffset
        )
      })

      expect(returnValue?.direction).toBe('in')
      expect(result.current.zoom).toBe(DEFAULT_ZOOM + ZOOM_STEP)
    })
  })
})
