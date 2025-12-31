import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasZoom } from './useCanvasZoom'
import { MIN_ZOOM, MAX_ZOOM } from '../constants'

// デフォルトズームは0.5（内部値）、UI表示は100%（0.5 * 100 * DISPLAY_MULTIPLIER = 100）
const DEFAULT_ZOOM = 0.5

describe('useCanvasZoom', () => {
  describe('初期状態', () => {
    test('初期ズームは0.5（UI表示100%）', () => {
      const { result } = renderHook(() => useCanvasZoom())

      expect(result.current.zoom).toBe(DEFAULT_ZOOM)
      expect(result.current.zoomPercent).toBe(100) // 0.5 * 100 * 2 = 100
    })
  })

  describe('zoomIn', () => {
    test('ズームインで拡大する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.zoom).toBe(0.6) // 0.5 + 0.1 = 0.6
      expect(result.current.zoomPercent).toBe(120) // 0.6 * 100 * 2 = 120
    })

    test('最大ズームを超えない', () => {
      const { result } = renderHook(() => useCanvasZoom())

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
    test('ズームアウトで縮小する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.zoom).toBe(0.4) // 0.5 - 0.1 = 0.4
      expect(result.current.zoomPercent).toBe(80) // 0.4 * 100 * 2 = 80
    })

    test('最小ズームを下回らない', () => {
      const { result } = renderHook(() => useCanvasZoom())

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
    test('ズームをデフォルト（UI表示100%）にリセットする', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.zoomIn()
        result.current.zoomIn()
        result.current.zoomIn()
      })

      expect(result.current.zoom).not.toBe(DEFAULT_ZOOM)

      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.zoom).toBe(DEFAULT_ZOOM) // 0.5
      expect(result.current.zoomPercent).toBe(100) // 0.5 * 100 * 2 = 100
    })
  })

  describe('setZoomLevel', () => {
    test('任意のズームレベルを設定する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(2)
      })

      expect(result.current.zoom).toBe(2)
      expect(result.current.zoomPercent).toBe(400) // 2 * 100 * 2 = 400
    })

    test('最大値を超える値は最大値にクランプされる', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(100)
      })

      expect(result.current.zoom).toBe(MAX_ZOOM)
    })

    test('最小値を下回る値は最小値にクランプされる', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(0.01)
      })

      expect(result.current.zoom).toBe(MIN_ZOOM)
    })
  })

  describe('handleWheel', () => {
    test('下スクロール（正のdeltaY）でズームアウト', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.handleWheel(100)
      })

      expect(result.current.zoom).toBe(0.4) // 0.5 - 0.1 = 0.4
    })

    test('上スクロール（負のdeltaY）でズームイン', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBe(0.6) // 0.5 + 0.1 = 0.6
    })

    test('連続スクロールで累積される', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.handleWheel(-100)
        result.current.handleWheel(-100)
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBeCloseTo(0.8, 5) // 0.5 + 0.3 = 0.8
    })

    test('最大ズームを超えない', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(MAX_ZOOM)
      })

      act(() => {
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBe(MAX_ZOOM)
    })

    test('最小ズームを下回らない', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(MIN_ZOOM)
      })

      act(() => {
        result.current.handleWheel(100)
      })

      expect(result.current.zoom).toBe(MIN_ZOOM)
    })
  })

  describe('zoomPercent', () => {
    test('ズーム値をUI表示パーセントに変換する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(0.5)
      })

      expect(result.current.zoomPercent).toBe(100) // 0.5 * 100 * 2 = 100
    })

    test('パーセントは整数に丸められる', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(0.333)
      })

      expect(result.current.zoomPercent).toBe(67) // 0.333 * 100 * 2 = 66.6 -> 67
    })
  })
})
