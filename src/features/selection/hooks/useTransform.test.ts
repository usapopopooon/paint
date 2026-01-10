import { describe, test, expect, beforeAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransform } from './useTransform'
import type { TransformResult } from './useTransform'
import type { Bounds } from '@/lib/geometry'

/**
 * ImageDataのポリフィル（JSDOM環境用）
 */
class ImageDataPolyfill {
  readonly data: Uint8ClampedArray
  readonly width: number
  readonly height: number

  constructor(data: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
    if (typeof data === 'number') {
      this.width = data
      this.height = widthOrHeight!
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      this.data = data
      this.width = widthOrHeight!
      this.height = height ?? data.length / (widthOrHeight! * 4)
    }
  }
}

beforeAll(() => {
  if (typeof globalThis.ImageData === 'undefined') {
    // @ts-expect-error ポリフィル
    globalThis.ImageData = ImageDataPolyfill
  }
})

/**
 * テスト用のImageDataを作成
 */
const createTestImageData = (width: number, height: number): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = 100
    data[i * 4 + 1] = 150
    data[i * 4 + 2] = 200
    data[i * 4 + 3] = 255
  }
  return new ImageData(data, width, height)
}

describe('useTransform', () => {
  describe('初期状態', () => {
    test('初期状態はnull', () => {
      const { result } = renderHook(() => useTransform())

      expect(result.current.transformState).toBeNull()
      expect(result.current.previewImageData).toBeNull()
      expect(result.current.isTransforming).toBe(false)
      expect(result.current.isHandleOperating).toBe(false)
    })
  })

  describe('startTransform', () => {
    test('変形を開始する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 50, y: 50, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      expect(result.current.transformState).not.toBeNull()
      expect(result.current.transformState!.mode).toBe('free-transform')
      expect(result.current.transformState!.center).toEqual({ x: 100, y: 100 })
      expect(result.current.transformState!.scale).toEqual({ x: 1, y: 1 })
      expect(result.current.transformState!.rotation).toBe(0)
      expect(result.current.isTransforming).toBe(true)
    })

    test('プレビューImageDataが設定される', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('scale', imageData, bounds)
      })

      expect(result.current.previewImageData).not.toBeNull()
    })
  })

  describe('setTransformMode', () => {
    test('変形モードを変更する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      act(() => {
        result.current.setTransformMode('rotate')
      })

      expect(result.current.transformState!.mode).toBe('rotate')
    })

    test('変形中でない場合は何も起きない', () => {
      const { result } = renderHook(() => useTransform())

      act(() => {
        result.current.setTransformMode('rotate')
      })

      expect(result.current.transformState).toBeNull()
    })
  })

  describe('cycleTransformMode', () => {
    test('free-transform → scale', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      act(() => {
        result.current.cycleTransformMode()
      })

      expect(result.current.transformState!.mode).toBe('scale')
    })

    test('scale → rotate', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('scale', imageData, bounds)
      })

      act(() => {
        result.current.cycleTransformMode()
      })

      expect(result.current.transformState!.mode).toBe('rotate')
    })

    test('rotate → free-transform', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('rotate', imageData, bounds)
      })

      act(() => {
        result.current.cycleTransformMode()
      })

      expect(result.current.transformState!.mode).toBe('free-transform')
    })
  })

  describe('startHandleOperation', () => {
    test('ハンドル操作を開始する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      act(() => {
        result.current.startHandleOperation('bottom-right', { x: 100, y: 100 })
      })

      expect(result.current.isHandleOperating).toBe(true)
    })
  })

  describe('updateTransform', () => {
    test('スケール変形を更新する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('scale', imageData, bounds)
      })

      act(() => {
        result.current.startHandleOperation('bottom-right', { x: 100, y: 100 })
      })

      act(() => {
        result.current.updateTransform({ x: 150, y: 150 }, false, false)
      })

      // スケールが変化している
      expect(result.current.transformState!.scale.x).not.toBe(1)
      expect(result.current.transformState!.scale.y).not.toBe(1)
    })

    test('回転変形を更新する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('rotate', imageData, bounds)
      })

      act(() => {
        result.current.startHandleOperation('rotation', { x: 50, y: -20 })
      })

      act(() => {
        result.current.updateTransform({ x: 100, y: 50 }, false, false)
      })

      // 回転角度が変化している
      expect(result.current.transformState!.rotation).not.toBe(0)
    })
  })

  describe('endHandleOperation', () => {
    test('ハンドル操作を終了する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      act(() => {
        result.current.startHandleOperation('bottom-right', { x: 100, y: 100 })
      })

      expect(result.current.isHandleOperating).toBe(true)

      act(() => {
        result.current.endHandleOperation()
      })

      expect(result.current.isHandleOperating).toBe(false)
    })
  })

  describe('commitTransform', () => {
    test('変形を確定してImageDataを返す', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      let committedResult: TransformResult | null = null
      act(() => {
        committedResult = result.current.commitTransform()
      })

      expect(committedResult).not.toBeNull()
      expect(committedResult!.imageData).toBeDefined()
      expect(committedResult!.bounds).toBeDefined()
      expect(result.current.transformState).toBeNull()
      expect(result.current.previewImageData).toBeNull()
      expect(result.current.isTransforming).toBe(false)
    })

    test('変形中でない場合はnullを返す', () => {
      const { result } = renderHook(() => useTransform())

      let committedResult: TransformResult | null = null
      act(() => {
        committedResult = result.current.commitTransform()
      })

      expect(committedResult).toBeNull()
    })
  })

  describe('cancelTransform', () => {
    test('変形をキャンセルする', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      expect(result.current.isTransforming).toBe(true)

      act(() => {
        result.current.cancelTransform()
      })

      expect(result.current.transformState).toBeNull()
      expect(result.current.previewImageData).toBeNull()
      expect(result.current.isTransforming).toBe(false)
    })
  })

  describe('detectHandleAtPoint', () => {
    test('ハンドル位置を検出する', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      // bottom-rightハンドルの位置（100, 100）付近
      const handle = result.current.detectHandleAtPoint({ x: 100, y: 100 }, 10)
      expect(handle).toBe('bottom-right')
    })

    test('ハンドル外はnullを返す', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      // 中央付近（ハンドルがない場所）
      const handle = result.current.detectHandleAtPoint({ x: 50, y: 50 }, 10)
      expect(handle).toBeNull()
    })

    test('変形中でない場合はnullを返す', () => {
      const { result } = renderHook(() => useTransform())

      const handle = result.current.detectHandleAtPoint({ x: 100, y: 100 }, 10)
      expect(handle).toBeNull()
    })
  })

  describe('getHandlePositions', () => {
    test('すべてのハンドル位置を返す', () => {
      const { result } = renderHook(() => useTransform())
      const imageData = createTestImageData(100, 100)
      const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }

      act(() => {
        result.current.startTransform('free-transform', imageData, bounds)
      })

      const positions = result.current.getHandlePositions()
      expect(positions).not.toBeNull()
      expect(positions!['top-left']).toBeDefined()
      expect(positions!['bottom-right']).toBeDefined()
      expect(positions!['rotation']).toBeDefined()
    })

    test('変形中でない場合はnullを返す', () => {
      const { result } = renderHook(() => useTransform())

      const positions = result.current.getHandlePositions()
      expect(positions).toBeNull()
    })
  })
})
