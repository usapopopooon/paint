import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDrawing } from './useDrawing'
import type { ToolConfig } from '../../tools/types'

describe('useDrawing', () => {
  // requestAnimationFrameをモック
  let rafCallback: FrameRequestCallback | null = null

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallback = callback
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      rafCallback = null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rafCallback = null
  })

  /** rAFコールバックを実行してポイントをフラッシュ */
  const flushRAF = () => {
    if (rafCallback) {
      const cb = rafCallback
      rafCallback = null
      act(() => {
        cb(performance.now())
      })
    }
  }

  const createPenConfig = (): ToolConfig => ({
    type: 'pen',
    width: 5,
    color: '#000000',
    opacity: 1,
    hardness: 0,
    isBlurEnabled: true,
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

    test('rAF前にendStrokeしてもペンディング中のポイントが含まれる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      // ポイントを追加（rAFはまだ実行されていない）
      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
        result.current.addPoint({ x: 20, y: 20 })
      })

      // rAFをフラッシュせずにストロークを終了
      act(() => {
        result.current.endStroke()
      })

      // ペンディング中のポイントも含まれていることを確認
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          points: expect.arrayContaining([
            expect.objectContaining({ x: 0, y: 0 }),
            expect.objectContaining({ x: 10, y: 10 }),
            expect.objectContaining({ x: 20, y: 20 }),
          ]),
        })
      )
    })

    test('endStroke時にペンディング中のrAFがキャンセルされる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
        result.current.addPoint({ x: 10, y: 10 })
      })

      // rAFがスケジュールされている
      expect(rafCallback).not.toBeNull()

      act(() => {
        result.current.endStroke()
      })

      // rAFがキャンセルされている
      expect(rafCallback).toBeNull()
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

    test('startStroke時にペンディング中のポイントとrAFがクリアされる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      // 最初のストロークを開始してポイントを追加
      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
        result.current.addPoint({ x: 10, y: 10 })
      })

      // rAFがスケジュールされている
      expect(rafCallback).not.toBeNull()

      // 新しいストロークを開始（前のペンディングをクリア）
      act(() => {
        result.current.startStroke({ x: 100, y: 100 }, createPenConfig())
      })

      // rAFがキャンセルされている
      expect(rafCallback).toBeNull()

      // 新しいストロークには前のペンディングポイントが含まれない
      expect(result.current.currentStroke?.points.length).toBe(1)
      expect(result.current.currentStroke?.points[0]).toEqual(
        expect.objectContaining({ x: 100, y: 100 })
      )
    })
  })

  describe('addPoint', () => {
    test('ポイントを追加するとcurrentStrokeのpointsに追加される（rAF後）', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      expect(result.current.currentStroke?.points.length).toBe(1)

      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
      })

      // rAFがスケジュールされているが、まだ反映されていない
      expect(result.current.currentStroke?.points.length).toBe(1)

      // rAFをフラッシュしてポイントを反映
      flushRAF()

      expect(result.current.currentStroke?.points.length).toBe(2)

      act(() => {
        result.current.addPoint({ x: 20, y: 20 })
      })

      flushRAF()

      expect(result.current.currentStroke?.points.length).toBe(3)
    })

    test('複数のポイントがバッチ処理される', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.startStroke({ x: 0, y: 0 }, createPenConfig())
      })

      // 複数のポイントを追加（同じフレーム内）
      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
        result.current.addPoint({ x: 20, y: 20 })
        result.current.addPoint({ x: 30, y: 30 })
      })

      // まだ反映されていない
      expect(result.current.currentStroke?.points.length).toBe(1)

      // rAFをフラッシュして全ポイントを一度に反映
      flushRAF()

      expect(result.current.currentStroke?.points.length).toBe(4)
    })

    test('currentStrokeがnullの場合はポイントが追加されない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useDrawing(onComplete))

      act(() => {
        result.current.addPoint({ x: 10, y: 10 })
      })

      flushRAF()

      expect(result.current.currentStroke).toBeNull()
    })
  })
})
