import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useCanvasSize,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  MIN_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
  DEFAULT_RESIZE_ANCHOR,
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

    test('デフォルトのアンカーはcenter', () => {
      const { result } = renderHook(() => useCanvasSize())

      expect(result.current.anchor).toBe(DEFAULT_RESIZE_ANCHOR)
      expect(result.current.anchor).toBe('center')
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

  describe('onSizeChange コールバック', () => {
    test('幅変更時に中央基準のオフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setWidth(900) // 800 -> 900 = +100, offset = 50
      })

      expect(onSizeChange).toHaveBeenCalledWith(50, 0)
    })

    test('高さ変更時に中央基準のオフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setHeight(700) // 600 -> 700 = +100, offset = 50
      })

      expect(onSizeChange).toHaveBeenCalledWith(0, 50)
    })

    test('幅縮小時に負のオフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setWidth(600) // 800 -> 600 = -200, offset = -100
      })

      expect(onSizeChange).toHaveBeenCalledWith(-100, 0)
    })

    test('高さ縮小時に負のオフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setHeight(400) // 600 -> 400 = -200, offset = -100
      })

      expect(onSizeChange).toHaveBeenCalledWith(0, -100)
    })

    test('同じ幅を設定した場合はコールバックが呼ばれない', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setWidth(DEFAULT_CANVAS_WIDTH)
      })

      expect(onSizeChange).not.toHaveBeenCalled()
    })

    test('同じ高さを設定した場合はコールバックが呼ばれない', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize(onSizeChange))

      act(() => {
        result.current.setHeight(DEFAULT_CANVAS_HEIGHT)
      })

      expect(onSizeChange).not.toHaveBeenCalled()
    })

    test('コールバック未指定でもエラーにならない', () => {
      const { result } = renderHook(() => useCanvasSize())

      expect(() => {
        act(() => {
          result.current.setWidth(1000)
          result.current.setHeight(800)
        })
      }).not.toThrow()
    })
  })

  describe('onSizeChangeForHistory コールバック', () => {
    test('幅変更時に履歴記録用コールバックが呼ばれる', () => {
      const onSizeChangeForHistory = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChangeForHistory }))

      act(() => {
        result.current.setWidth(900) // 800 -> 900
      })

      expect(onSizeChangeForHistory).toHaveBeenCalledWith(
        800, // previousWidth
        600, // previousHeight
        900, // newWidth
        600, // newHeight (unchanged)
        50, // offsetX
        0 // offsetY
      )
    })

    test('高さ変更時に履歴記録用コールバックが呼ばれる', () => {
      const onSizeChangeForHistory = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChangeForHistory }))

      act(() => {
        result.current.setHeight(700) // 600 -> 700
      })

      expect(onSizeChangeForHistory).toHaveBeenCalledWith(
        800, // previousWidth (unchanged)
        600, // previousHeight
        800, // newWidth (unchanged)
        700, // newHeight
        0, // offsetX
        50 // offsetY
      )
    })

    test('オプション形式でonSizeChangeとonSizeChangeForHistoryの両方を指定できる', () => {
      const onSizeChange = vi.fn()
      const onSizeChangeForHistory = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChange, onSizeChangeForHistory }))

      act(() => {
        result.current.setWidth(1000)
      })

      expect(onSizeChange).toHaveBeenCalledWith(100, 0)
      expect(onSizeChangeForHistory).toHaveBeenCalledWith(800, 600, 1000, 600, 100, 0)
    })

    test('同じ幅を設定した場合は履歴記録用コールバックが呼ばれない', () => {
      const onSizeChangeForHistory = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChangeForHistory }))

      act(() => {
        result.current.setWidth(DEFAULT_CANVAS_WIDTH)
      })

      expect(onSizeChangeForHistory).not.toHaveBeenCalled()
    })
  })

  describe('setSizeDirectly', () => {
    test('サイズを直接設定できる', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setSizeDirectly(1024, 768)
      })

      expect(result.current.width).toBe(1024)
      expect(result.current.height).toBe(768)
    })

    test('コールバックを呼ばずにサイズを設定する', () => {
      const onSizeChange = vi.fn()
      const onSizeChangeForHistory = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChange, onSizeChangeForHistory }))

      act(() => {
        result.current.setSizeDirectly(1024, 768)
      })

      expect(onSizeChange).not.toHaveBeenCalled()
      expect(onSizeChangeForHistory).not.toHaveBeenCalled()
    })

    test('最小値を下回らない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setSizeDirectly(50, 50)
      })

      expect(result.current.width).toBe(MIN_CANVAS_SIZE)
      expect(result.current.height).toBe(MIN_CANVAS_SIZE)
    })

    test('最大値を超えない', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setSizeDirectly(5000, 5000)
      })

      expect(result.current.width).toBe(MAX_CANVAS_SIZE)
      expect(result.current.height).toBe(MAX_CANVAS_SIZE)
    })
  })

  describe('アンカー', () => {
    test('setAnchorでアンカーを変更できる', () => {
      const { result } = renderHook(() => useCanvasSize())

      act(() => {
        result.current.setAnchor('top-left')
      })

      expect(result.current.anchor).toBe('top-left')
    })

    test('左上アンカーで幅拡大時にオフセット0でコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChange }))

      act(() => {
        result.current.setAnchor('top-left')
      })

      act(() => {
        result.current.setWidth(900) // 800 -> 900 = +100
      })

      expect(onSizeChange).toHaveBeenCalledWith(0, 0)
    })

    test('右下アンカーで幅拡大時に全体オフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChange }))

      act(() => {
        result.current.setAnchor('bottom-right')
      })

      act(() => {
        result.current.setWidth(900) // 800 -> 900 = +100
      })

      expect(onSizeChange).toHaveBeenCalledWith(100, 0)
    })

    test('左アンカーで高さ拡大時に半分のY方向オフセットでコールバックが呼ばれる', () => {
      const onSizeChange = vi.fn()
      const { result } = renderHook(() => useCanvasSize({ onSizeChange }))

      act(() => {
        result.current.setAnchor('left')
      })

      act(() => {
        result.current.setHeight(700) // 600 -> 700 = +100
      })

      expect(onSizeChange).toHaveBeenCalledWith(0, 50)
    })
  })
})
