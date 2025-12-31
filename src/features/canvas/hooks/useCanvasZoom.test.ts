import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasZoom, MIN_ZOOM, MAX_ZOOM } from './useCanvasZoom'

describe('useCanvasZoom', () => {
  describe('初期状態', () => {
    test('初期ズームは1（100%）', () => {
      const { result } = renderHook(() => useCanvasZoom())

      expect(result.current.zoom).toBe(1)
      expect(result.current.zoomPercent).toBe(100)
    })
  })

  describe('zoomIn', () => {
    test('ズームインで拡大する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.zoom).toBe(1.1)
      expect(result.current.zoomPercent).toBe(110)
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

      expect(result.current.zoom).toBe(0.9)
      expect(result.current.zoomPercent).toBe(90)
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
    test('ズームを100%にリセットする', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.zoomIn()
        result.current.zoomIn()
        result.current.zoomIn()
      })

      expect(result.current.zoom).not.toBe(1)

      act(() => {
        result.current.resetZoom()
      })

      expect(result.current.zoom).toBe(1)
      expect(result.current.zoomPercent).toBe(100)
    })
  })

  describe('setZoomLevel', () => {
    test('任意のズームレベルを設定する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(2)
      })

      expect(result.current.zoom).toBe(2)
      expect(result.current.zoomPercent).toBe(200)
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

      expect(result.current.zoom).toBe(0.9)
    })

    test('上スクロール（負のdeltaY）でズームイン', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBe(1.1)
    })

    test('連続スクロールで累積される', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.handleWheel(-100)
        result.current.handleWheel(-100)
        result.current.handleWheel(-100)
      })

      expect(result.current.zoom).toBeCloseTo(1.3, 5)
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
    test('ズーム値をパーセントに変換する', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(0.5)
      })

      expect(result.current.zoomPercent).toBe(50)
    })

    test('パーセントは整数に丸められる', () => {
      const { result } = renderHook(() => useCanvasZoom())

      act(() => {
        result.current.setZoomLevel(0.333)
      })

      expect(result.current.zoomPercent).toBe(33)
    })
  })
})
